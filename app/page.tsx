'use client';

import { useChat } from '@ai-sdk/react';

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit, status, error } = useChat({
    api: '/api/chat',
  });

  const isLoading = status === 'streaming' || status === 'submitted';

  return (
    <main
      style={{
        maxWidth: 760,
        margin: '0 auto',
        padding: '32px 20px 120px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <header style={{ marginBottom: 8 }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>Browserless MCP Agent</h1>
        <p style={{ opacity: 0.7, marginTop: 6, fontSize: 14 }}>
          Connected to <code>mcp.browserless.io</code>. Try:{' '}
          <em>&quot;screenshot example.com&quot;</em> or{' '}
          <em>&quot;scrape the pricing page at stripe.com&quot;</em>.
        </p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              padding: '12px 14px',
              borderRadius: 10,
              background: m.role === 'user' ? '#1b2735' : '#12151b',
              border: '1px solid #1f2a36',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 6 }}>
              {m.role === 'user' ? 'You' : 'Agent'}
            </div>
            {m.parts?.map((part, i) => {
              if (part.type === 'text') {
                return <div key={i}>{part.text}</div>;
              }
              if (part.type === 'tool-invocation') {
                const { toolName, state } = part.toolInvocation;
                return (
                  <div
                    key={i}
                    style={{
                      fontSize: 12,
                      opacity: 0.75,
                      fontFamily: 'ui-monospace, monospace',
                      marginTop: 6,
                    }}
                  >
                    tool: {toolName} [{state}]
                  </div>
                );
              }
              return null;
            }) ?? <div>{m.content}</div>}
          </div>
        ))}

        {error && (
          <div
            style={{
              padding: 12,
              borderRadius: 10,
              background: '#3a1d1d',
              border: '1px solid #6b2a2a',
              color: '#ffb4b4',
            }}
          >
            {error.message}
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: 16,
          background: 'linear-gradient(180deg, rgba(11,12,16,0) 0%, #0b0c10 40%)',
        }}
      >
        <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', gap: 8 }}>
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask the agent to browse, screenshot, or scrape something..."
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '12px 14px',
              borderRadius: 10,
              border: '1px solid #2a3544',
              background: '#0f141b',
              color: '#e9edf1',
              fontSize: 14,
            }}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            style={{
              padding: '12px 18px',
              borderRadius: 10,
              border: '1px solid #2a3544',
              background: isLoading ? '#1a2230' : '#2b6cff',
              color: '#fff',
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {isLoading ? '…' : 'Send'}
          </button>
        </div>
      </form>
    </main>
  );
}
