import { useGetDashboardSummary, useGetRecentActivity, useGetAnalyticsTimeline, useGetBalance } from "@workspace/api-client-react";
import { SidebarLayout } from "@/components/layout/sidebar-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, Bot, Brain, Coins, FolderKanban, MessageSquare, Database, Zap } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function DashboardPage() {
  const { data: summary, isLoading: summaryLoading } = useGetDashboardSummary();
  const { data: activity } = useGetRecentActivity({ limit: 8 });
  const { data: timeline } = useGetAnalyticsTimeline({ days: 7 });
  const { data: balance } = useGetBalance();

  const stats = [
    { label: "Projects", value: summary?.totalProjects ?? 0, icon: FolderKanban, color: "text-blue-400" },
    { label: "Active NPCs", value: summary?.activeNpcs ?? 0, icon: Bot, color: "text-green-400" },
    { label: "Total API Calls", value: summary?.totalApiCalls ?? 0, icon: BarChart3, color: "text-yellow-400" },
    { label: "Memories Stored", value: summary?.totalMemories ?? 0, icon: Database, color: "text-purple-400" },
    { label: "AGL Spent", value: (summary?.totalAglSpent ?? 0).toFixed(1), icon: Coins, color: "text-red-400" },
    { label: "Recent Chats (7d)", value: summary?.recentChatCount ?? 0, icon: MessageSquare, color: "text-cyan-400" },
  ];

  const activityIcons: Record<string, string> = {
    chat: "text-blue-400",
    memory_write: "text-purple-400",
    npc_created: "text-green-400",
    project_created: "text-yellow-400",
    api_key_created: "text-cyan-400",
    deposit: "text-emerald-400",
  };

  return (
    <SidebarLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of your OnchainMind platform</p>
      </div>

      {balance && (
        <Card className="mb-6 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border-primary/30">
          <CardContent className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Coins className="h-8 w-8 text-primary" />
              <div>
                <div className="text-sm text-muted-foreground">AGL Balance</div>
                <div className="text-2xl font-bold">{balance.balance.toFixed(2)} AGL</div>
              </div>
            </div>
            <div className="text-right text-xs text-muted-foreground font-mono">
              {balance.tokenAddress.substring(0, 10)}...{balance.tokenAddress.substring(balance.tokenAddress.length - 4)}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="py-3 px-4">
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              {summaryLoading ? (
                <Skeleton className="h-6 w-16" />
              ) : (
                <div className="text-xl font-bold">{stat.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">API Usage (7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {timeline && timeline.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={timeline}>
                  <defs>
                    <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 6%, 15%)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(240, 5%, 65%)" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(240, 5%, 65%)" }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(240, 10%, 6%)", border: "1px solid hsl(240, 6%, 15%)", borderRadius: "8px" }}
                    labelStyle={{ color: "hsl(0, 0%, 98%)" }}
                  />
                  <Area type="monotone" dataKey="apiCalls" stroke="hsl(262, 83%, 58%)" fill="url(#colorCalls)" strokeWidth={2} />
                  <Area type="monotone" dataKey="chats" stroke="hsl(280, 83%, 58%)" fill="none" strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-60 flex items-center justify-center text-sm text-muted-foreground">
                No usage data yet. Start chatting with NPCs!
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activity && activity.length > 0 ? (
              activity.map((item) => (
                <div key={item.id} className="flex items-start gap-3 text-sm">
                  <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${activityIcons[item.type] ?? "text-muted-foreground"} bg-current`} />
                  <div className="min-w-0">
                    <p className="text-foreground truncate">{item.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.createdAt).toLocaleString()}
                      {item.aglAmount && item.aglAmount > 0 ? ` | ${item.aglAmount} AGL` : ""}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            )}
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
