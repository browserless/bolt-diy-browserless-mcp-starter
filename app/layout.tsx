import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Browserless MCP Agent',
  description: 'A minimal agent wired to the Browserless MCP server.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
