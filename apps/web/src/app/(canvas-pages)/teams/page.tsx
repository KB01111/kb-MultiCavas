// src/app/(canvas-pages)/teams/page.tsx
import { TeamList } from "@/components/features/teams/TeamList";
import { TeamCreateForm } from "@/components/features/teams/TeamCreateForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TeamsPage() {
  // TODO: Add state refresh logic if needed when new team is created
  // const handleTeamCreated = () => { ... refresh TeamList ... };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <div className="lg:col-span-4">
        <TeamList />
      </div>
      <div className="lg:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle>Create New Team</CardTitle>
          </CardHeader>
          <CardContent>
            <TeamCreateForm /* onTeamCreated={handleTeamCreated} */ />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

