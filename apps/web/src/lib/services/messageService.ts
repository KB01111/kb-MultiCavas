// src/lib/services/messageService.ts
import { MessageCreate, MessageResponse } from "@/app/types"; // Assuming types are defined here

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Note: Listing messages is typically done via the conversation endpoint
// GET /conversations/{conversationId}/messages

export const getMessage = async (messageId: string): Promise<MessageResponse> => {
  const response = await fetch(`${API_BASE_URL}/messages/${messageId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch message ${messageId}`);
  }
  return response.json();
};

export const createMessage = async (messageData: MessageCreate): Promise<MessageResponse> => {
  const response = await fetch(`${API_BASE_URL}/messages/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(messageData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: "Failed to create message" }));
    throw new Error(errorData.detail || "Failed to create message");
  }
  return response.json();
};

// Delete/Update for messages might be less common, add if needed
// export const deleteMessage = async (messageId: string): Promise<void> => { ... }

