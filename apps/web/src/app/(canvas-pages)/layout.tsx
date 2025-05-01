// src/app/(canvas-pages)/layout.tsx
import Link from "next/link";
import { Home, Users, Bot, MessageSquare, Workflow } from "lucide-react"; // Added Workflow icon

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

// Simple Sidebar Navigation
function SidebarNav() {
  // TODO: Add active state based on current path
  return (
    <nav className="grid items-start px-4 text-sm font-medium">
      <Link
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
        href="/"
      >
        <Home className="h-4 w-4" />
        Dashboard
      </Link>
      <Link
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
        href="/agents"
      >
        <Bot className="h-4 w-4" />
        Agents
      </Link>
      <Link
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
        href="/teams"
      >
        <Users className="h-4 w-4" />
        Teams
      </Link>
      <Link
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
        href="/conversations"
      >
        <MessageSquare className="h-4 w-4" />
        Conversations
      </Link>
      <Link
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
        href="/builder" // Added link to builder page
      >
        <Workflow className="h-4 w-4" /> {/* Added Workflow icon */}
        Builder
      </Link>
      {/* Add more links as needed */}
    </nav>
  );
}

export default function CanvasLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-gray-100/40 lg:block dark:bg-gray-800/40">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-[60px] items-center border-b px-6">
            <Link className="flex items-center gap-2 font-semibold" href="/">
              {/* <Package2 className="h-6 w-6" /> */}
              <span>AI Canvas</span>
            </Link>
            {/* Optional: Add notification/user button here */}
          </div>
          <div className="flex-1 overflow-auto py-2">
            <SidebarNav />
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        {/* Optional: Add Header for mobile nav toggle, search, user dropdown */}
        {/* <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-gray-100/40 px-6 dark:bg-gray-800/40">
          Mobile Nav Toggle, Search, User Dropdown
        </header> */}
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

