import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ts-agent-lab — Week 4 Next stretch",
  description: "Research agent with Next.js App Router + AI SDK useChat",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
