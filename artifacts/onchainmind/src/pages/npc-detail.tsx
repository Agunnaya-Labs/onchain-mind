import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import {
  useGetNpc,
  useGetNpcChatHistory,
  useGetNpcMemory,
  useNpcChat,
  getGetNpcChatHistoryQueryKey,
  getGetNpcMemoryQueryKey,
  getGetNpcQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { SidebarLayout } from "@/components/layout/sidebar-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Send, Bot, User, Brain, Database, MessageSquare } from "lucide-react";

export default function NpcDetailPage({ id }: { id: string }) {
  const npcId = parseInt(id, 10);
  const { data: npc, isLoading: npcLoading } = useGetNpc(npcId, { query: { enabled: !isNaN(npcId) } });
  const { data: chatHistory } = useGetNpcChatHistory(npcId, { limit: 100 }, { query: { enabled: !isNaN(npcId) } });
  const { data: memories } = useGetNpcMemory(npcId, { limit: 50 }, { query: { enabled: !isNaN(npcId) } });
  const chatMutation = useNpcChat();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleSend = () => {
    if (!message.trim()) return;
    const msg = message;
    setMessage("");
    chatMutation.mutate(
      { data: { npcId, message: msg } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetNpcChatHistoryQueryKey(npcId) });
          queryClient.invalidateQueries({ queryKey: getGetNpcMemoryQueryKey(npcId) });
          queryClient.invalidateQueries({ queryKey: getGetNpcQueryKey(npcId) });
        },
      }
    );
  };

  if (npcLoading) return <SidebarLayout><Skeleton className="h-64" /></SidebarLayout>;

  return (
    <SidebarLayout>
      <div className="mb-6">
        <Link href="/npcs" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-3">
          <ArrowLeft className="h-3 w-3" /> Back to NPCs
        </Link>
        <div className="flex items-center gap-3">
          <Bot className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {npc?.name}
              <Badge variant={npc?.status === "active" ? "default" : "secondary"}>{npc?.status}</Badge>
            </h1>
            <p className="text-sm text-muted-foreground">{npc?.personality}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card><CardContent className="py-3 px-4">
          <div className="text-xs text-muted-foreground">Model</div>
          <div className="font-mono text-sm">{npc?.model}</div>
        </CardContent></Card>
        <Card><CardContent className="py-3 px-4">
          <div className="text-xs text-muted-foreground flex items-center gap-1"><MessageSquare className="h-3 w-3" /> Messages</div>
          <div className="text-xl font-bold">{npc?.messageCount ?? 0}</div>
        </CardContent></Card>
        <Card><CardContent className="py-3 px-4">
          <div className="text-xs text-muted-foreground flex items-center gap-1"><Database className="h-3 w-3" /> Memories</div>
          <div className="text-xl font-bold">{npc?.memoryCount ?? 0}</div>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="chat">
        <TabsList>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="memory">Memory Log</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="chat">
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-96 p-4">
                {chatHistory && chatHistory.length > 0 ? (
                  <div className="space-y-4">
                    {chatHistory.map((msg) => (
                      <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                        {msg.role === "assistant" && <Bot className="h-6 w-6 text-primary shrink-0 mt-1" />}
                        <div className={`max-w-[75%] rounded-lg px-4 py-2.5 text-sm ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}>
                          {msg.content}
                          {msg.aglCharged && msg.aglCharged > 0 && (
                            <span className="block text-xs mt-1 opacity-60">{msg.aglCharged} AGL</span>
                          )}
                        </div>
                        {msg.role === "user" && <User className="h-6 w-6 text-muted-foreground shrink-0 mt-1" />}
                      </div>
                    ))}
                    {chatMutation.isPending && (
                      <div className="flex gap-3">
                        <Bot className="h-6 w-6 text-primary shrink-0 mt-1" />
                        <div className="bg-muted rounded-lg px-4 py-2.5 text-sm">
                          <div className="flex gap-1">
                            <span className="animate-pulse">.</span>
                            <span className="animate-pulse" style={{ animationDelay: "0.2s" }}>.</span>
                            <span className="animate-pulse" style={{ animationDelay: "0.4s" }}>.</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                    <div className="text-center">
                      <Bot className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                      <p>Start a conversation with {npc?.name}</p>
                    </div>
                  </div>
                )}
              </ScrollArea>
              <div className="border-t border-border p-4 flex gap-2">
                <Input
                  placeholder={`Message ${npc?.name}...`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  disabled={chatMutation.isPending}
                />
                <Button onClick={handleSend} disabled={!message.trim() || chatMutation.isPending}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="memory">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Brain className="h-4 w-4" /> Memory Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              {memories && memories.length > 0 ? (
                <div className="space-y-3">
                  {memories.map((mem) => (
                    <div key={mem.id} className="border border-border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="outline" className="text-xs">{mem.category}</Badge>
                        <span className="text-xs text-muted-foreground">
                          importance: {mem.importance.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-sm">{mem.text}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(mem.createdAt).toLocaleString()}
                        {mem.wallet && ` | ${mem.wallet.substring(0, 8)}...`}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No memories stored yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config">
          <Card>
            <CardHeader><CardTitle className="text-sm font-medium">System Prompt</CardTitle></CardHeader>
            <CardContent>
              <pre className="text-sm bg-muted rounded-lg p-4 whitespace-pre-wrap font-mono">
                {npc?.systemPrompt}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </SidebarLayout>
  );
}
