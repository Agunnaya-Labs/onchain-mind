import { Link } from "wouter";
import { useListProjects, useListNpcs } from "@workspace/api-client-react";
import { SidebarLayout } from "@/components/layout/sidebar-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Bot, MessageSquare, Database } from "lucide-react";

function NpcsByProject({ projectId, projectName }: { projectId: number; projectName: string }) {
  const { data: npcs, isLoading } = useListNpcs(projectId);
  if (isLoading) return <Skeleton className="h-20" />;
  if (!npcs || npcs.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">{projectName}</h3>
      {npcs.map((npc) => (
        <Link key={npc.id} href={`/npcs/${npc.id}`}>
          <Card className="cursor-pointer hover:border-primary/30 transition-colors">
            <CardContent className="py-3 px-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bot className="h-6 w-6 text-primary" />
                <div>
                  <div className="font-medium flex items-center gap-2">
                    {npc.name}
                    <Badge variant={npc.status === "active" ? "default" : "secondary"} className="text-xs">{npc.status}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">{npc.personality}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {npc.messageCount}</span>
                <span className="flex items-center gap-1"><Database className="h-3 w-3" /> {npc.memoryCount}</span>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

export default function NpcsPage() {
  const { data: projects, isLoading } = useListProjects();

  return (
    <SidebarLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">NPCs</h1>
        <p className="text-sm text-muted-foreground mt-1">All AI NPCs across your projects</p>
      </div>
      {isLoading ? (
        <div className="space-y-4">{[1, 2].map((i) => <Skeleton key={i} className="h-24" />)}</div>
      ) : projects && projects.length > 0 ? (
        <div className="space-y-6">
          {projects.map((p) => (
            <NpcsByProject key={p.id} projectId={p.id} projectName={p.name} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No NPCs yet</h3>
            <p className="text-sm text-muted-foreground">Create a project first, then add NPCs</p>
          </CardContent>
        </Card>
      )}
    </SidebarLayout>
  );
}
