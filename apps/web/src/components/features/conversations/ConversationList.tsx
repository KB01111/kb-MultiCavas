// src/components/features/conversations/ConversationList.tsx
"use client";

import React, { useState, useEffect } from "react";
import { getConversations } from "@/lib/services/conversationService";
import { ConversationResponse } from "@/app/types"; // Assuming types are defined here
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

interface ConversationListProps {
  userId?: string; // Optional filter
  teamId?: string; // Optional filter
}

export function ConversationList({ userId, teamId }: ConversationListProps) {
  const [conversations, setConversations] = useState<ConversationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        setError(null);
        const filters = { userId, teamId };
        const fetchedConversations = await getConversations(filters);
        setConversations(fetchedConversations);
      } catch (err) {
        console.error("Error fetching conversations:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [userId, teamId]); // Refetch if filters change

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Conversations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-5/6" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversations</CardTitle>
        {/* Add Create Conversation Button Here Later */}
      </CardHeader>
      <CardContent>
        {conversations.length === 0 ? (
          <p className="text-sm text-muted-foreground">No conversations found.</p>
        ) : (
          <ul className="space-y-2">
            {conversations.map((conversation) => (
              <li key={conversation.id} className="p-2 border rounded hover:bg-accent cursor-pointer">
                <p className="font-medium">{conversation.title || `Conversation ${conversation.id.substring(0, 8)}`}</p>
                <p className="text-sm text-muted-foreground">
                  Started: {new Date(conversation.created_at).toLocaleString()}
                </p>
                {/* Add Link to conversation detail page later */}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

