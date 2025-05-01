// src/lib/services/evaluationResultService.ts
import { EvaluationResultCreate, EvaluationResultResponse } from "@/app/types"; // Assuming types are defined here

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const getEvaluationResults = async (filters: { conversationId: string }): Promise<EvaluationResultResponse[]> => {
  const queryParams = new URLSearchParams();
  queryParams.append("conversation_id", filters.conversationId);

  const response = await fetch(`${API_BASE_URL}/evaluations/?${queryParams.toString()}`);
  if (!response.ok) {
    throw new Error("Failed to fetch evaluation results");
  }
  return response.json();
};

export const getEvaluationResult = async (resultId: string): Promise<EvaluationResultResponse> => {
  const response = await fetch(`${API_BASE_URL}/evaluations/${resultId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch evaluation result ${resultId}`);
  }
  return response.json();
};

export const createEvaluationResult = async (resultData: EvaluationResultCreate): Promise<EvaluationResultResponse> => {
  const response = await fetch(`${API_BASE_URL}/evaluations/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(resultData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: "Failed to create evaluation result" }));
    throw new Error(errorData.detail || "Failed to create evaluation result");
  }
  return response.json();
};

// Delete/Update for evaluation results might be less common, add if needed
// export const deleteEvaluationResult = async (resultId: string): Promise<void> => { ... }

