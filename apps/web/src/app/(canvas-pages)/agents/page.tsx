// src/app/(canvas-pages)/agents/page.tsx
import { AgentList } from "@/components/features/agents/AgentList";
import { AgentCreateForm } from "@/components/features/agents/AgentCreateForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AgentsPage() {
  // TODO: Add state refresh logic if needed when new agent is created
  // const handleAgentCreated = () => { ... refresh AgentList ... };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <div className="lg:col-span-4">
        <AgentList />
      </div>
      <div className="lg:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle>Create New Agent</CardTitle>
          </CardHeader>
          <CardContent>
            <AgentCreateForm /* onAgentCreated={handleAgentCreated} */ />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

