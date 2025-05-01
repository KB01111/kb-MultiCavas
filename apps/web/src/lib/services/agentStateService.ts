// src/lib/services/agentStateService.ts
import { AgentStateCreateOrUpdate, AgentStateResponse } from "@/app/types"; // Assuming types are defined here

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const getAgentStates = async (filters: { conversationId: string; agentId?: string }): Promise<AgentStateResponse[]> => {
  const queryParams = new URLSearchParams();
  queryParams.append("conversation_id", filters.conversationId);
  if (filters.agentId) queryParams.append("agent_id", filters.agentId);

  const response = await fetch(`${API_BASE_URL}/states/?${queryParams.toString()}`);
  if (!response.ok) {
    throw new Error("Failed to fetch agent states");
  }
  return response.json();
};

export const getAgentState = async (stateId: string): Promise<AgentStateResponse> => {
  const response = await fetch(`${API_BASE_URL}/states/${stateId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch agent state ${stateId}`);
  }
  return response.json();
};

export const createOrUpdateAgentState = async (stateData: AgentStateCreateOrUpdate): Promise<AgentStateResponse> => {
  const response = await fetch(`${API_BASE_URL}/states/`, {
    method: "POST", // API uses POST for create or update
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(stateData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: "Failed to create or update agent state" }));
    throw new Error(errorData.detail || "Failed to create or update agent state");
  }
  return response.json();
};

export const deleteAgentState = async (stateId: string): Promise<AgentStateResponse> => {
  const response = await fetch(`${API_BASE_URL}/states/${stateId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`Failed to delete agent state ${stateId}`);
  }
  return response.json();
};

