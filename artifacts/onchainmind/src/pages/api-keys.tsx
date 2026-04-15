import { useState } from "react";
import { useListApiKeys, useCreateApiKey, useDeleteApiKey, getListApiKeysQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { SidebarLayout } from "@/components/layout/sidebar-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Key, Copy, Trash2, Check } from "lucide-react";

export default function ApiKeysPage() {
  const { data: keys, isLoading } = useListApiKeys();
  const createKey = useCreateApiKey();
  const deleteKey = useDeleteApiKey();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = () => {
    if (!name) return;
    createKey.mutate(
      { data: { name } },
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries({ queryKey: getListApiKeysQueryKey() });
          setNewKey(data.key);
          setName("");
        },
      }
    );
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = (id: number) => {
    deleteKey.mutate(
      { id },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListApiKeysQueryKey() }) }
    );
  };

  return (
    <SidebarLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">API Keys</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your API keys for NPC interactions</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setNewKey(null); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Generate Key</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{newKey ? "API Key Created" : "Generate API Key"}</DialogTitle></DialogHeader>
            {newKey ? (
              <div className="space-y-4 mt-4">
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-2">Copy this key now. You won't be able to see it again.</p>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono flex-1 break-all">{newKey}</code>
                    <Button variant="outline" size="sm" onClick={() => handleCopy(newKey)}>
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Button onClick={() => { setOpen(false); setNewKey(null); }} className="w-full">Done</Button>
              </div>
            ) : (
              <div className="space-y-4 mt-4">
                <Input placeholder="Key name (e.g. Production)" value={name} onChange={(e) => setName(e.target.value)} />
                <Button onClick={handleCreate} disabled={!name || createKey.isPending} className="w-full">
                  {createKey.isPending ? "Generating..." : "Generate Key"}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2].map((i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : keys && keys.length > 0 ? (
        <div className="space-y-3">
          {keys.map((key) => (
            <Card key={key.id}>
              <CardContent className="py-3 px-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Key className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">{key.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {key.prefix}...
                      {key.lastUsedAt ? ` | Last used: ${new Date(key.lastUsedAt).toLocaleDateString()}` : " | Never used"}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(key.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No API keys</h3>
            <p className="text-sm text-muted-foreground mb-4">Generate an API key to start using the NPC API</p>
            <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-2" /> Generate Key</Button>
          </CardContent>
        </Card>
      )}
    </SidebarLayout>
  );
}
