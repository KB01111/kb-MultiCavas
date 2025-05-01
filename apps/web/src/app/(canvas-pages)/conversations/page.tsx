// src/app/(canvas-pages)/conversations/page.tsx
import { ConversationList } from "@/components/features/conversations/ConversationList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ConversationsPage() {
  // TODO: Add ability to start new conversation

  return (
    <div className="grid gap-4">
      {/* Maybe add a button to start a new conversation here */}
      {/* <div className="flex justify-end">
        <Button asChild>
          <Link href="/conversations/new">Start New Conversation</Link>
        </Button>
      </div> */}
      <ConversationList />
    </div>
  );
}

