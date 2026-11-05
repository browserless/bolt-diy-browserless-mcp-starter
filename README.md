# Browserless MCP Agent Starter

A minimal Next.js app that turns the [Browserless MCP server](https://mcp.browserless.io/mcp) into a chat-driven browser-automation agent. Ask it to screenshot a page, scrape content, crawl a site, or run a custom function in a headless browser — the LLM picks the right MCP tool and returns the result.

## What you get

- Next.js 15 (App Router) + React 19 + TypeScript
- [`@modelcontextprotocol/sdk`](https://www.npmjs.com/package/@modelcontextprotocol/sdk) Streamable-HTTP client
- [Vercel AI SDK](https://sdk.vercel.ai) (`experimental_createMCPClient` + `streamText`) orchestrating the tool loop
- A simple chat UI that streams responses and shows which MCP tool ran

## Prerequisites

For native local development, use Node.js **26.13.0** with
`nvm install 26.13.0 && nvm use 26.13.0`. On Linux, the official binary
requires `libatomic.so.1` (`libatomic1` on Debian/Ubuntu).

For Bolt/StackBlitz WebContainers, keep the platform's supported runtime.
As of November 2026, its default is Node.js 24 and Node.js 26 support is
[still planned](https://github.com/stackblitz/webcontainer-core/issues/560).
There is deliberately no `.nvmrc`: WebContainers and Netlify read that file,
so a native-local pin could also change their runtime selection.

Deployment runtimes must be checked separately. Vercel supports **26.x** but
manages minor/patch updates, so it cannot guarantee exactly 26.13.0. Netlify
selects build Node separately from its AWS Lambda-backed Functions runtime;
confirm both supported versions before changing a site's settings.

1. A Browserless API key — grab one at [account.browserless.io](https://account.browserless.io).
2. An OpenAI API key — [platform.openai.com/api-keys](https://platform.openai.com/api-keys). (Swap in any provider supported by the Vercel AI SDK by editing `app/api/chat/route.ts`.)

## Setup

```bash
npm install
cp .env.example .env.local
# edit .env.local and fill in BROWSERLESS_API_KEY and OPENAI_API_KEY
npm run dev
```

Open http://localhost:3000 and try:

> `search good python tutorials`
> `go to all recipes and find a good for eggplant ratatouille`
> `extract all links from browserless.io`

## How it works

`app/api/chat/route.ts` is the server-side bridge:

1. Opens a `StreamableHTTPClientTransport` to `https://mcp.browserless.io/mcp` with `Authorization: Bearer ${BROWSERLESS_API_KEY}`.
2. Calls `experimental_createMCPClient({ transport })` and `mcpClient.tools()` to discover every tool the Browserless MCP server exposes (agent, scrape, screenshot, crawl, search, function, …).
3. Passes those tools into `streamText({ model, messages, tools, maxSteps: 8 })` — the LLM decides when to call them.
4. Streams the result back to the React client via `useChat()`.

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `BROWSERLESS_API_KEY` | yes | Sent as `Authorization: Bearer …` to the MCP server |
| `OPENAI_API_KEY` | yes | Drives the agent loop. Replace with another provider in `route.ts` if you prefer |

## Customizing

- **Swap models / providers:** replace `openai('gpt-4o-mini')` with any `ai` SDK model (`@ai-sdk/anthropic`, `@ai-sdk/google`, etc.).
- **Narrow the tool surface:** filter `tools` before passing to `streamText` — e.g. `{ browserless_screenshot: tools.browserless_screenshot }`.
- **Persist sessions:** Browserless MCP supports session headers; add them in the `StreamableHTTPClientTransport` `requestInit.headers`.

## License

MIT
