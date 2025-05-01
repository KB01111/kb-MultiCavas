// src/lib/services/conversationService.ts
import { ConversationCreate, ConversationResponse, ConversationUpdate, MessageResponse } from "@/app/types"; // Assuming types are defined here

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const getConversations = async (filters: { userId?: string; teamId?: string } = {}): Promise<ConversationResponse[]> => {
  const queryParams = new URLSearchParams();
  if (filters.userId) queryParams.append("user_id", filters.userId);
  if (filters.teamId) queryParams.append("team_id", filters.teamId);

  const response = await fetch(`${API_BASE_URL}/conversations/?${queryParams.toString()}`);
  if (!response.ok) {
    throw new Error("Failed to fetch conversations");
  }
  return response.json();
};

export const getConversation = async (conversationId: string): Promise<ConversationResponse> => {
  const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch conversation ${conversationId}`);
  }
  return response.json();
};

export const createConversation = async (conversationData: ConversationCreate): Promise<ConversationResponse> => {
  const response = await fetch(`${API_BASE_URL}/conversations/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(conversationData),
  });
  if (!response.ok) {
    throw new Error("Failed to create conversation");
  }
  return response.json();
};

export const updateConversation = async (conversationId: string, conversationData: ConversationUpdate): Promise<ConversationResponse> => {
  const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(conversationData),
  });
  if (!response.ok) {
    throw new Error(`Failed to update conversation ${conversationId}`);
  }
  return response.json();
};

export const deleteConversation = async (conversationId: string): Promise<ConversationResponse> => {
  const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`Failed to delete conversation ${conversationId}`);
  }
  return response.json();
};

// Get messages for a specific conversation
export const getConversationMessages = async (conversationId: string): Promise<MessageResponse[]> => {
  const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`);
  if (!response.ok) {
    throw new Error(`Failed to fetch messages for conversation ${conversationId}`);
  }
  return response.json();
};

