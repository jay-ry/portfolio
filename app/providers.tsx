"use client";
import { ThemeProvider } from "next-themes";
import { ChatProvider } from "@/components/chat/ChatProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
      <ChatProvider>{children}</ChatProvider>
    </ThemeProvider>
  );
}
