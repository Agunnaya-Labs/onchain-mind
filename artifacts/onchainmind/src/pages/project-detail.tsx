import { useState } from "react";
import { Link } from "wouter";
import { useGetProject, useListNpcs, useCreateNpc, getListNpcsQueryKey, getGetProjectQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { SidebarLayout } from "@/components/layout/sidebar-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Plus, Bot, MessageSquare, Database, Coins, BarChart3 } from "lucide-react";

export default function ProjectDetailPage({ id }: { id: string }) {
  const projectId = parseInt(id, 10);
  const { data: project, isLoading: projectLoading } = useGetProject(projectId, { query: { enabled: !isNaN(projectId) } });
  const { data: npcs, isLoading: npcsLoading } = useListNpcs(projectId, { query: { enabled: !isNaN(projectId) } });
  const createNpc = useCreateNpc();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [npcName, setNpcName] = useState("");
  const [personality, setPersonality] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");

  const handleCreateNpc = () => {
    if (!npcName || !personality || !systemPrompt) return;
    createNpc.mutate(
      { projectId, data: { name: npcName, personality, systemPrompt } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListNpcsQueryKey(projectId) });
          queryClient.invalidateQueries({ queryKey: getGetProjectQueryKey(projectId) });
          setOpen(false);
          setNpcName("");
          setPersonality("");
          setSystemPrompt("");
        },
      }
    );
  };

  if (projectLoading) return <SidebarLayout><Skeleton className="h-64" /></SidebarLayout>;

  return (
    <SidebarLayout>
      <div className="mb-6">
        <Link href="/projects" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-3">
          <ArrowLeft className="h-3 w-3" /> Back to Projects
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{project?.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">{project?.description}</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> New NPC</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create NPC</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-4">
                <Input placeholder="NPC Name" value={npcName} onChange={(e) => setNpcName(e.target.value)} />
                <Input placeholder="Personality (e.g. 'Friendly guide')" value={personality} onChange={(e) => setPersonality(e.target.value)} />
                <Textarea placeholder="System prompt" value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} rows={4} />
                <Button onClick={handleCreateNpc} disabled={createNpc.isPending} className="w-full">
                  {createNpc.isPending ? "Creating..." : "Create NPC"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {project && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card><CardContent className="py-3 px-4">
            <div className="text-xs text-muted-foreground flex items-center gap-1"><Bot className="h-3 w-3" /> NPCs</div>
            <div className="text-xl font-bold">{project.npcCount}</div>
          </CardContent></Card>
          <Card><CardContent className="py-3 px-4">
            <div className="text-xs text-muted-foreground flex items-center gap-1"><BarChart3 className="h-3 w-3" /> API Calls</div>
            <div className="text-xl font-bold">{project.totalApiCalls}</div>
          </CardContent></Card>
          <Card><CardContent className="py-3 px-4">
            <div className="text-xs text-muted-foreground flex items-center gap-1"><Coins className="h-3 w-3" /> AGL Spent</div>
            <div className="text-xl font-bold">{project.aglSpent.toFixed(1)}</div>
          </CardContent></Card>
        </div>
      )}

      <h2 className="text-lg font-semibold mb-4">NPCs</h2>
      {npcsLoading ? (
        <div className="space-y-3">{[1, 2].map((i) => <Skeleton key={i} className="h-24" />)}</div>
      ) : npcs && npcs.length > 0 ? (
        <div className="space-y-3">
          {npcs.map((npc) => (
            <Link key={npc.id} href={`/npcs/${npc.id}`}>
              <Card className="cursor-pointer hover:border-primary/30 transition-colors">
                <CardContent className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bot className="h-8 w-8 text-primary" />
                    <div>
                      <div className="font-semibold flex items-center gap-2">
                        {npc.name}
                        <Badge variant={npc.status === "active" ? "default" : "secondary"} className="text-xs">
                          {npc.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">{npc.personality}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {npc.messageCount}</span>
                    <span className="flex items-center gap-1"><Database className="h-3 w-3" /> {npc.memoryCount}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <Bot className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No NPCs in this project yet</p>
          </CardContent>
        </Card>
      )}
    </SidebarLayout>
  );
}
