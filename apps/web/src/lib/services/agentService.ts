// src/lib/services/agentService.ts
import { AgentCreate, AgentResponse, AgentUpdate } from "@/app/types"; // Assuming types are defined here

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const getAgents = async (): Promise<AgentResponse[]> => {
  const response = await fetch(`${API_BASE_URL}/agents/`);
  if (!response.ok) {
    throw new Error("Failed to fetch agents");
  }
  return response.json();
};

export const getAgent = async (agentId: string): Promise<AgentResponse> => {
  const response = await fetch(`${API_BASE_URL}/agents/${agentId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch agent ${agentId}`);
  }
  return response.json();
};

export const createAgent = async (agentData: AgentCreate): Promise<AgentResponse> => {
  const response = await fetch(`${API_BASE_URL}/agents/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(agentData),
  });
  if (!response.ok) {
    // Consider more specific error handling based on response status
    throw new Error("Failed to create agent");
  }
  return response.json();
};

export const updateAgent = async (agentId: string, agentData: AgentUpdate): Promise<AgentResponse> => {
  const response = await fetch(`${API_BASE_URL}/agents/${agentId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(agentData),
  });
  if (!response.ok) {
    throw new Error(`Failed to update agent ${agentId}`);
  }
  return response.json();
};

export const deleteAgent = async (agentId: string): Promise<AgentResponse> => {
  const response = await fetch(`${API_BASE_URL}/agents/${agentId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`Failed to delete agent ${agentId}`);
  }
  return response.json(); // Or handle potential empty response if API returns 204 No Content
};

