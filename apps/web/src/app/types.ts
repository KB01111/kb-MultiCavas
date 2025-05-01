// src/app/types.ts

// Basic UUID type
type UUID = string;

// Agent Types
export interface AgentCreate {
  name: string;
  description?: string | null;
  system_prompt?: string | null;
  // Add other fields based on your Agent model
}

export interface AgentUpdate {
  name?: string | null;
  description?: string | null;
  system_prompt?: string | null;
  // Add other fields based on your Agent model
}

export interface AgentResponse {
  id: UUID;
  name: string;
  description?: string | null;
  system_prompt?: string | null;
  created_at: string; // Assuming ISO string format
  updated_at: string; // Assuming ISO string format
  // Add other fields based on your Agent model
}

// Team Types
export interface TeamCreate {
  name: string;
  description?: string | null;
  // Add other fields based on your Team model
}

export interface TeamUpdate {
  name?: string | null;
  description?: string | null;
  // Add other fields based on your Team model
}

export interface TeamAgentUpdate { // For adding/updating agent in team
    agent_id: UUID;
    role?: string | null;
}

export interface TeamResponse {
  id: UUID;
  name: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
  agents?: AgentResponse[]; // Include if your API returns agents with teams
  // Add other fields based on your Team model
}

// Conversation Types
export interface ConversationCreate {
  user_id?: string | null; // Or appropriate user identifier type
  team_id?: UUID | null;
  title?: string | null;
}

export interface ConversationUpdate {
  title?: string | null;
  // Add other fields if conversations can be updated
}

export interface ConversationResponse {
  id: UUID;
  user_id?: string | null;
  team_id?: UUID | null;
  title?: string | null;
  created_at: string;
  updated_at: string;
  // Add other fields based on your Conversation model
}

// Message Types
export interface MessageCreate {
  conversation_id: UUID;
  agent_id?: UUID | null;
  content: string;
  sender_type: "user" | "agent" | "system"; // Example enum
  metadata?: Record<string, any> | null;
}

export interface MessageResponse {
  id: UUID;
  conversation_id: UUID;
  agent_id?: UUID | null;
  content: string;
  sender_type: "user" | "agent" | "system";
  metadata?: Record<string, any> | null;
  created_at: string;
  // Add other fields based on your Message model
}

// AgentState Types
export interface AgentStateCreateOrUpdate {
  conversation_id: UUID;
  agent_id: UUID;
  state_data: Record<string, any>; // JSON field
}

export interface AgentStateResponse {
  id: UUID;
  conversation_id: UUID;
  agent_id: UUID;
  state_data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// EvaluationResult Types
export interface EvaluationResultCreate {
  conversation_id: UUID;
  evaluator_id?: string | null; // Identifier for the evaluator (human or agent)
  metric: string;
  score?: number | null;
  reasoning?: string | null;
  metadata?: Record<string, any> | null;
}

export interface EvaluationResultResponse {
  id: UUID;
  conversation_id: UUID;
  evaluator_id?: string | null;
  metric: string;
  score?: number | null;
  reasoning?: string | null;
  metadata?: Record<string, any> | null;
  created_at: string;
}

