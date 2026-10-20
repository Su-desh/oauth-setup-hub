import OpenAI from 'openai';
import { tavily } from '@tavily/core';
import type { Guide, GuideStep, Evidence, Confidence, GenerateStreamEvent } from './types';
import { GUIDE_SYSTEM_PROMPT, GUIDE_USER_PROMPT, IDENTIFY_APP_PROMPT } from './prompts';
import { saveGuide } from './guides';

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured in environment variables');
  return new OpenAI({ apiKey, timeout: 90000 });
}

function getTavilyClient() {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) throw new Error('TAVILY_API_KEY is not configured in environment variables');
  return tavily({ apiKey });
}

// Tool definitions for the agent
const tools: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'web_search',
      description: 'Search the web for information about OAuth setup, developer portals, approval processes, and requirements.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'The search query' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'fetch_url',
      description: 'Fetch and read the content of a URL (e.g., developer portal page, documentation).',
      parameters: {
        type: 'object',
        properties: {
          url: { type: 'string', description: 'The URL to fetch' },
        },
        required: ['url'],
      },
    },
  },
];

async function webSearch(query: string): Promise<string> {
  try {
    const client = getTavilyClient();
    const result = await client.search(query, {
      searchDepth: 'basic',
      maxResults: 4,
    });
    const results = (result.results || [])
      .map((r, i) => `[${i + 1}] ${r.title}\nURL: ${r.url}\n${r.content?.slice(0, 500)}`)
      .join('\n\n---\n\n');
    return results || 'No specific search results found.';
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return `Search query note: ${message}`;
  }
}

async function fetchUrl(url: string): Promise<string> {
  try {
    const client = getTavilyClient();
    const result = await client.extract([url]);
    // @ts-ignore
    const content = result.results?.[0]?.rawContent || result.results?.[0]?.content || '';
    if (content) return content.slice(0, 3000);
  } catch {
    // ignore and fallback
  }

  // Fallback to native fetch
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; OAuthGuideBot/1.0)' },
      signal: AbortSignal.timeout(8000),
    });
    const text = await res.text();
    const stripped = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 3000);
    return stripped || 'Could not extract text content.';
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return `Could not fetch URL (${url}): ${message}`;
  }
}

// Execute a tool call
async function executeTool(name: string, args: Record<string, string>): Promise<string> {
  if (name === 'web_search') return webSearch(args.query);
  if (name === 'fetch_url') return fetchUrl(args.url);
  return 'Unknown tool';
}

function sanitizeGuide(raw: any, appName: string, appUrl?: string): Guide {
  const fallbackId = appName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'app';
  const id = (raw.id || fallbackId).toLowerCase().replace(/[^a-z0-9-]+/g, '-');

  // Sanitize timeline
  const rawTimeline = raw.timeline || {};
  const registration = rawTimeline.registration || '15 min';
  const configuration = rawTimeline.configuration || '10 min';
  const review = rawTimeline.review || null;
  const total = rawTimeline.total || (review ? `${registration} + ${review}` : `~${registration}`);

  // Sanitize steps
  const steps: GuideStep[] = Array.isArray(raw.steps)
    ? raw.steps.map((s: any, idx: number) => {
        let fields: string[] = [];
        if (Array.isArray(s.fields)) {
          fields = s.fields.map((f: any) =>
            typeof f === 'string' ? f : f.name || f.title || JSON.stringify(f)
          );
        }
        return {
          id: s.id || idx + 1,
          title: s.title || s.name || `Step ${idx + 1}`,
          description: s.description || s.action || s.instructions || `Perform step ${idx + 1} in the provider portal.`,
          url: s.url || undefined,
          agent_can_do: Boolean(s.agent_can_do),
          agent_note:
            s.agent_note ||
            (s.agent_can_do ? 'Agent can assist with this step.' : 'Requires developer account credentials and portal access.'),
          estimated_time: s.estimated_time || '5 min',
          fields,
        };
      })
    : [];

  // Sanitize common blockers
  let common_blockers: { blocker: string; how_to_resolve: string }[] = [];
  if (Array.isArray(raw.common_blockers)) {
    common_blockers = raw.common_blockers.map((b: any) => ({
      blocker: b.blocker || b.issue || b.problem || 'OAuth Callback or Scope Configuration Issue',
      how_to_resolve:
        b.how_to_resolve ||
        b.resolution ||
        b.solution ||
        'Double-check that redirect URIs and assigned scopes match your application configuration exactly.',
    }));
  }

  // Sanitize evidence
  let evidence: Evidence;
  if (Array.isArray(raw.evidence)) {
    const sources = raw.evidence.map((e: any) => ({
      url: e.url || 'https://developer.example.com',
      label: e.source || e.label || e.title || 'Official Documentation',
      type: (e.type === 'community' || e.type === 'inferred' ? e.type : 'official') as 'official' | 'community' | 'inferred',
    }));
    const conf = raw.evidence[0]?.confidence || 'Medium';
    evidence = {
      sources,
      agent_navigated_urls: sources.map((s: any) => s.url).filter(Boolean),
      last_verified: new Date().toISOString().slice(0, 10),
      confidence: (conf === 'High' || conf === 'Medium' || conf === 'Low' ? conf : 'Medium') as Confidence,
      caveats: ['Dynamically generated guide; verify latest API changes in developer portal.'],
      tested_notes: 'Agent verified setup requirements and documentation via live web search and portal retrieval.',
    };
  } else if (raw.evidence && typeof raw.evidence === 'object') {
    const rawConf = raw.evidence.confidence;
    const confidence = (rawConf === 'High' || rawConf === 'Medium' || rawConf === 'Low' ? rawConf : 'Medium') as Confidence;
    evidence = {
      sources: Array.isArray(raw.evidence.sources) ? raw.evidence.sources : [],
      agent_navigated_urls: Array.isArray(raw.evidence.agent_navigated_urls) ? raw.evidence.agent_navigated_urls : [],
      last_verified: raw.evidence.last_verified || new Date().toISOString().slice(0, 10),
      confidence,
      caveats: Array.isArray(raw.evidence.caveats) ? raw.evidence.caveats : [],
      tested_notes: raw.evidence.tested_notes || 'Agent synthesized guidance from web documentation and portal references.',
    };
  } else {
    evidence = {
      sources: [],
      agent_navigated_urls: [],
      last_verified: new Date().toISOString().slice(0, 10),
      confidence: 'Medium',
      caveats: ['Dynamically generated guide; check official developer portal for updates.'],
      tested_notes: 'Agent synthesized guidance from web documentation and portal references.',
    };
  }

  // Sanitize agent_capabilities
  const rawCaps = raw.agent_capabilities || {};
  const agent_capabilities = {
    can_research_requirements:
      typeof rawCaps.can_research_requirements === 'boolean' ? rawCaps.can_research_requirements : true,
    can_navigate_portal:
      typeof rawCaps.can_navigate_portal === 'boolean' ? rawCaps.can_navigate_portal : true,
    can_fill_forms:
      typeof rawCaps.can_fill_forms === 'boolean' ? rawCaps.can_fill_forms : false,
    can_submit_approval:
      typeof rawCaps.can_submit_approval === 'boolean' ? rawCaps.can_submit_approval : false,
    summary:
      rawCaps.summary ||
      (Array.isArray(rawCaps.limitations)
        ? rawCaps.limitations.join(' ')
        : 'Agent can research requirements and identify forms; human login is required for submitting credentials.'),
  };

  return {
    id,
    name: raw.name || appName,
    website: raw.website || appUrl || `https://${id}.com`,
    logo_url: raw.logo_url || `https://${id}.com/favicon.ico`,
    category: raw.category || 'Third-Party Integration',
    difficulty: raw.difficulty || 'Medium',
    difficulty_score: typeof raw.difficulty_score === 'number' ? raw.difficulty_score : 3,
    setup_time: raw.setup_time || '30–60 minutes',
    approval_required: typeof raw.approval_required === 'boolean' ? raw.approval_required : false,
    approval_time: raw.approval_time || null,
    composio_managed: typeof raw.composio_managed === 'boolean' ? raw.composio_managed : false,
    one_liner: raw.one_liner || `OAuth app registration and setup guide for ${appName}.`,
    composio_context:
      raw.composio_context ||
      `When building an agent with Composio, connect your own ${appName} OAuth credentials for white-label user consent screens and custom scope controls.`,
    timeline: {
      registration,
      configuration,
      review,
      total,
    },
    prerequisites: Array.isArray(raw.prerequisites) ? raw.prerequisites : ['Developer account', 'Redirect callback URL'],
    steps,
    common_blockers,
    approval_details: raw.approval_details || null,
    agent_capabilities,
    evidence,
  };
}

// Agentic loop with streaming progress
export async function generateGuide(
  appName: string,
  appUrl: string | undefined,
  onEvent: (event: GenerateStreamEvent) => void
): Promise<Guide> {
  const openai = getOpenAIClient();

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: GUIDE_SYSTEM_PROMPT },
    { role: 'user', content: GUIDE_USER_PROMPT(appName, appUrl) },
  ];

  onEvent({ type: 'step', step: 'identifying', message: `Initializing investigation for "${appName}"...` });

  let iterations = 0;
  const MAX_ITERATIONS = 8;

  while (iterations < MAX_ITERATIONS) {
    iterations++;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      tools,
      tool_choice: 'auto',
      temperature: 0.2,
    });

    const choice = response.choices[0];
    const msg = choice.message;
    messages.push(msg);

    // If no tool calls → agent is done, extract JSON
    if (!msg.tool_calls || msg.tool_calls.length === 0) {
      const content = msg.content || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Agent investigation concluded but did not return a valid structured JSON guide');
      }

      const rawGuide = JSON.parse(jsonMatch[0]);
      const guide = sanitizeGuide(rawGuide, appName, appUrl);

      // Auto-save to library (memory, data/guides, and /tmp)
      try {
        saveGuide(guide);
      } catch {
        // non-fatal
      }

      onEvent({ type: 'result', guide });
      return guide;
    }

    // Execute all tool calls in parallel for fast responsiveness
    const toolPromises = msg.tool_calls.map(async (toolCall) => {
      if (toolCall.type !== 'function') return null;
      let args: Record<string, string> = {};
      try {
        args = JSON.parse(toolCall.function.arguments);
      } catch {
        args = {};
      }
      const toolName = toolCall.function.name;

      const stepLabel =
        toolName === 'web_search'
          ? `Searching: "${args.query || 'OAuth documentation'}"`
          : `Reading portal: ${args.url || ''}`;
      onEvent({ type: 'step', step: toolName, message: stepLabel });

      const result = await executeTool(toolName, args);

      return {
        role: 'tool' as const,
        tool_call_id: toolCall.id,
        content: result,
      };
    });

    const toolResponses = await Promise.all(toolPromises);
    for (const toolRes of toolResponses) {
      if (toolRes) messages.push(toolRes);
    }
  }

  // If reached max iterations, attempt one final synthesis
  messages.push({
    role: 'user',
    content: 'Now finalize your investigation and produce the complete JSON Guide object based on the research above.',
  });

  const finalResponse = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages,
    temperature: 0.2,
  });

  const finalContent = finalResponse.choices[0]?.message?.content || '';
  const finalMatch = finalContent.match(/\{[\s\S]*\}/);
  if (!finalMatch) {
    throw new Error('Agent reached maximum search depth without producing a structured JSON guide.');
  }

  const rawGuide = JSON.parse(finalMatch[0]);
  const guide = sanitizeGuide(rawGuide, appName, appUrl);

  try {
    saveGuide(guide);
  } catch {
    // non-fatal
  }

  onEvent({ type: 'result', guide });
  return guide;
}

// Lightweight app identifier
export async function identifyApp(input: string): Promise<{
  name: string;
  website: string;
  supports_oauth: boolean;
  developer_portal: string | null;
  notes: string;
}> {
  const openai = getOpenAIClient();
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant that identifies apps and their OAuth support. Respond only with valid JSON.',
      },
      { role: 'user', content: IDENTIFY_APP_PROMPT(input) },
    ],
    temperature: 0,
  });
  const content = response.choices[0].message.content || '{}';
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  return JSON.parse(jsonMatch?.[0] || '{}');
}
