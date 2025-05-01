// src/components/features/teams/TeamList.tsx
"use client";

import React, { useState, useEffect } from "react";
import { getTeams } from "@/lib/services/teamService";
import { TeamResponse } from "@/app/types"; // Assuming types are defined here
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

export function TeamList() {
  const [teams, setTeams] = useState<TeamResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedTeams = await getTeams();
        setTeams(fetchedTeams);
      } catch (err) {
        console.error("Error fetching teams:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Teams</CardTitle>
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
        <CardTitle>Teams</CardTitle>
        {/* Add Create Team Button Here Later */}
      </CardHeader>
      <CardContent>
        {teams.length === 0 ? (
          <p className="text-sm text-muted-foreground">No teams found.</p>
        ) : (
          <ul className="space-y-2">
            {teams.map((team) => (
              <li key={team.id} className="p-2 border rounded hover:bg-accent">
                <p className="font-medium">{team.name}</p>
                <p className="text-sm text-muted-foreground">{team.description}</p>
                {/* Add View Details/Edit/Delete buttons later */}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

