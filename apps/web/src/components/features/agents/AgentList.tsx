// src/components/features/agents/AgentList.tsx
"use client";

import React, { useState, useEffect } from "react";
import { getAgents } from "@/lib/services/agentService";
import { AgentResponse } from "@/app/types"; // Assuming types are defined here
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

export function AgentList() {
  const [agents, setAgents] = useState<AgentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedAgents = await getAgents();
        setAgents(fetchedAgents);
      } catch (err) {
        console.error("Error fetching agents:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Agents</CardTitle>
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
        <CardTitle>Agents</CardTitle>
        {/* Add Create Agent Button Here Later */}
      </CardHeader>
      <CardContent>
        {agents.length === 0 ? (
          <p className="text-sm text-muted-foreground">No agents found.</p>
        ) : (
          <ul className="space-y-2">
            {agents.map((agent) => (
              <li key={agent.id} className="p-2 border rounded hover:bg-accent">
                <p className="font-medium">{agent.name}</p>
                <p className="text-sm text-muted-foreground">{agent.description}</p>
                {/* Add Edit/Delete buttons later */}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

