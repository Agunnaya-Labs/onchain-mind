import { useState } from "react";
import { Link } from "wouter";
import { useListProjects, useCreateProject, getListProjectsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { SidebarLayout } from "@/components/layout/sidebar-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, FolderKanban, Bot, BarChart3, Coins } from "lucide-react";

export default function ProjectsPage() {
  const { data: projects, isLoading } = useListProjects();
  const createProject = useCreateProject();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = () => {
    if (!name) return;
    createProject.mutate(
      { data: { name, description } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
          setOpen(false);
          setName("");
          setDescription("");
        },
      }
    );
  };

  return (
    <SidebarLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your AI NPC projects</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> New Project</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <Input placeholder="Project name" value={name} onChange={(e) => setName(e.target.value)} />
              <Textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
              <Button onClick={handleCreate} disabled={!name || createProject.isPending} className="w-full">
                {createProject.isPending ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40" />)}
        </div>
      ) : projects && projects.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="cursor-pointer hover:border-primary/30 transition-colors h-full">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FolderKanban className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">{project.name}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.description}</p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Bot className="h-3 w-3" /> {project.npcCount} NPCs
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <BarChart3 className="h-3 w-3" /> {project.totalApiCalls} calls
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Coins className="h-3 w-3" /> {project.aglSpent.toFixed(1)} AGL
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <FolderKanban className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No projects yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Create your first project to get started</p>
            <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-2" /> Create Project</Button>
          </CardContent>
        </Card>
      )}
    </SidebarLayout>
  );
}
