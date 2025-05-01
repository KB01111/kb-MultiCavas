// src/lib/services/teamService.ts
import { TeamCreate, TeamResponse, TeamUpdate, TeamAgentUpdate } from "@/app/types"; // Assuming types are defined here

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const getTeams = async (): Promise<TeamResponse[]> => {
  const response = await fetch(`${API_BASE_URL}/teams/`);
  if (!response.ok) {
    throw new Error("Failed to fetch teams");
  }
  return response.json();
};

export const getTeam = async (teamId: string): Promise<TeamResponse> => {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch team ${teamId}`);
  }
  return response.json();
};

export const createTeam = async (teamData: TeamCreate): Promise<TeamResponse> => {
  const response = await fetch(`${API_BASE_URL}/teams/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(teamData),
  });
  if (!response.ok) {
    throw new Error("Failed to create team");
  }
  return response.json();
};

export const updateTeam = async (teamId: string, teamData: TeamUpdate): Promise<TeamResponse> => {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(teamData),
  });
  if (!response.ok) {
    throw new Error(`Failed to update team ${teamId}`);
  }
  return response.json();
};

export const deleteTeam = async (teamId: string): Promise<TeamResponse> => {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`Failed to delete team ${teamId}`);
  }
  return response.json();
};

// Team Agent Management
export const addAgentToTeam = async (teamId: string, agentData: TeamAgentUpdate): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/agents`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(agentData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: "Failed to add agent to team" }));
    throw new Error(errorData.detail || "Failed to add agent to team");
  }
  return response.json();
};

export const removeAgentFromTeam = async (teamId: string, agentId: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/agents/${agentId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: "Failed to remove agent from team" }));
    throw new Error(errorData.detail || "Failed to remove agent from team");
  }
  return response.json();
};

