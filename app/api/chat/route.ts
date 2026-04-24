import { openai } from '@ai-sdk/openai';
import { experimental_createMCPClient, streamText } from 'ai';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

export const runtime = 'nodejs';
export const maxDuration = 60;

const MCP_URL = process.env.BROWSERLESS_MCP_URL ?? 'https://mcp.browserless.io/mcp';

const SYSTEM_PROMPT = `You are a browser automation agent with access to Browserless MCP tools.
Use the available tools to accomplish the user's task (screenshot, scrape, crawl, search, run
JavaScript in a headless browser, etc.). Chain tools when needed. After you have the result,
summarize what you found in a short, human-readable reply. If a tool returns an image or URL,
include it in your response.`;

export async function POST(req: Request) {
  const apiKey = process.env.BROWSERLESS_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error: 'BROWSERLESS_API_KEY is not set. Get one at https://account.browserless.io',
      }),
      { status: 500, headers: { 'content-type': 'application/json' } },
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({
        error: 'OPENAI_API_KEY is not set. Get one at https://platform.openai.com/api-keys',
      }),
      { status: 500, headers: { 'content-type': 'application/json' } },
    );
  }

  const { messages } = await req.json();

  // Connect to Browserless MCP over Streamable HTTP with bearer auth.
  const transport = new StreamableHTTPClientTransport(new URL(MCP_URL), {
    requestInit: {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    },
  });

  const mcpClient = await experimental_createMCPClient({ transport });

  try {
    // Pull every tool the server advertises (agent, scrape, screenshot, search, ...).
    const tools = await mcpClient.tools();

    const result = streamText({
      model: openai('gpt-4o-mini'),
      system: SYSTEM_PROMPT,
      messages,
      tools,
      maxSteps: 8,
      onFinish: async () => {
        await mcpClient.close();
      },
    });

    return result.toDataStreamResponse();
  } catch (err) {
    await mcpClient.close().catch(() => {});
    const message = err instanceof Error ? err.message : 'Unknown MCP error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}
