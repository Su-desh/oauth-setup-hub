import { generateGuide } from '@/lib/agent';
import type { GenerateStreamEvent } from '@/lib/types';

export const maxDuration = 120; // 2 min timeout for Vercel

export async function POST(req: Request) {
  const { app_name, app_url } = await req.json();

  if (!app_name?.trim()) {
    return new Response(JSON.stringify({ error: 'app_name is required' }), { status: 400 });
  }

  // Server-Sent Events stream
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: GenerateStreamEvent) => {
        const data = `data: ${JSON.stringify(event)}\n\n`;
        controller.enqueue(encoder.encode(data));
      };

      try {
        await generateGuide(app_name.trim(), app_url?.trim() || undefined, send);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        send({ type: 'error', error: message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
