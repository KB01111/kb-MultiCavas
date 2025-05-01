// src/components/features/conversations/ConversationView.tsx
"use client";

import React, { useState, useEffect } from "react";
import { getConversation, getConversationMessages } from "@/lib/services/conversationService";
import { createMessage } from "@/lib/services/messageService"; // For sending new messages
import { ConversationResponse, MessageResponse, MessageCreate } from "@/app/types";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal, Send, User, Bot } from "lucide-react";
import { cn } from "@/lib/utils"; // Assuming Shadcn/ui utils

interface ConversationViewProps {
  conversationId: string;
}

export function ConversationView({ conversationId }: ConversationViewProps) {
  const [conversation, setConversation] = useState<ConversationResponse | null>(null);
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const fetchConversationData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [fetchedConversation, fetchedMessages] = await Promise.all([
          getConversation(conversationId),
          getConversationMessages(conversationId),
        ]);
        setConversation(fetchedConversation);
        setMessages(fetchedMessages);
      } catch (err) {
        console.error("Error fetching conversation data:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchConversationData();
  }, [conversationId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversation) return;

    setIsSending(true);
    try {
      const messageData: MessageCreate = {
        conversation_id: conversation.id,
        content: newMessage,
        sender_type: "user", // Assuming message sent from UI is always 'user'
        // agent_id can be null for user messages
      };
      const sentMessage = await createMessage(messageData);
      setMessages((prevMessages) => [...prevMessages, sentMessage]);
      setNewMessage("");
      // TODO: Trigger agent response here? This might involve another API call
      // or a WebSocket connection for real-time updates.
    } catch (err) {
      console.error("Error sending message:", err);
      // Show toast or error message to user
      setError(err instanceof Error ? `Failed to send: ${err.message}` : "Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-5/6" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-full" />
        </CardFooter>
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

  if (!conversation) {
    return <p>Conversation not found.</p>; // Should ideally not happen if ID is valid
  }

  return (
    <Card className="flex flex-col h-[calc(100vh-200px)]"> {/* Adjust height as needed */}
      <CardHeader>
        <CardTitle>{conversation.title || `Conversation ${conversation.id.substring(0, 8)}`}</CardTitle>
        {/* Maybe add conversation settings/details button here */}
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex items-start gap-3",
                  message.sender_type === "user" ? "justify-end" : ""
                )}
              >
                {message.sender_type !== "user" && (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Bot className="h-5 w-5" />
                  </span>
                )}
                <div
                  className={cn(
                    "rounded-lg p-3 text-sm max-w-[75%]",
                    message.sender_type === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <p>{message.content}</p>
                  <p className="text-xs text-muted-foreground/80 mt-1 text-right">
                    {new Date(message.created_at).toLocaleTimeString()}
                  </p>
                </div>
                {message.sender_type === "user" && (
                   <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <User className="h-5 w-5" />
                  </span>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="pt-4 border-t">
        <div className="flex w-full items-center space-x-2">
          <Textarea
            placeholder="Type your message here..."
            className="flex-1 resize-none min-h-[60px]"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isSending}
          />
          <Button type="button" size="icon" onClick={handleSendMessage} disabled={!newMessage.trim() || isSending}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

