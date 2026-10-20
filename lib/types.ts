// Guide difficulty levels
export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Complex';
export type Confidence = 'High' | 'Medium' | 'Low';

export interface GuideStep {
  id: number;
  title: string;
  description: string;
  url?: string;
  agent_can_do: boolean;
  agent_note?: string;
  estimated_time: string;
  fields?: string[]; // actual form fields agent found at the portal
}

export interface Evidence {
  sources: { url: string; label: string; type: 'official' | 'community' | 'inferred' }[];
  agent_navigated_urls: string[];
  last_verified: string;
  confidence: Confidence;
  caveats: string[];
  tested_notes: string;
}

export interface Guide {
  id: string;
  name: string;
  website: string;
  logo_url: string;
  category: string;

  // At-a-glance
  difficulty: Difficulty;
  difficulty_score: number; // 1-5
  setup_time: string;
  approval_required: boolean;
  approval_time: string | null;
  composio_managed: boolean; // is this already in Composio's managed directory?

  // Summary
  one_liner: string;
  composio_context: string; // why a Composio developer would need this guide

  // Timeline breakdown
  timeline: {
    registration: string;
    configuration: string;
    review: string | null;
    total: string;
  };

  // What you need before you start
  prerequisites: string[];

  // Step by step
  steps: GuideStep[];

  // Blockers
  common_blockers: { blocker: string; how_to_resolve: string }[];

  // Approval details (if applicable)
  approval_details?: {
    is_required: boolean;
    who_reviews: string;
    typical_wait: string;
    rejection_reasons: string[];
    tips: string[];
  };

  // What the agent can vs can't do
  agent_capabilities: {
    can_research_requirements: boolean;
    can_navigate_portal: boolean;
    can_fill_forms: boolean;
    can_submit_approval: boolean;
    summary: string;
  };

  // Evidence & sourcing
  evidence: Evidence;
}

export interface GenerateRequest {
  app_name: string;
  app_url?: string;
}

export interface GenerateStreamEvent {
  type: 'step' | 'result' | 'error';
  step?: string;
  message?: string;
  guide?: Guide;
  error?: string;
}
