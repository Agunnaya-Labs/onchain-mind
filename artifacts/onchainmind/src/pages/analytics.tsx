import { useGetUsage, useGetAnalyticsTimeline } from "@workspace/api-client-react";
import { SidebarLayout } from "@/components/layout/sidebar-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, Bot, Coins, MessageSquare, Database, Search } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AnalyticsPage() {
  const { data: usage, isLoading: usageLoading } = useGetUsage();
  const { data: timeline } = useGetAnalyticsTimeline({ days: 14 });

  const stats = [
    { label: "Total API Calls", value: usage?.totalApiCalls ?? 0, icon: BarChart3, color: "text-blue-400" },
    { label: "AGL Spent", value: (usage?.totalAglSpent ?? 0).toFixed(1), icon: Coins, color: "text-yellow-400" },
    { label: "Active NPCs", value: usage?.activeNpcs ?? 0, icon: Bot, color: "text-green-400" },
    { label: "Total Chats", value: usage?.totalChats ?? 0, icon: MessageSquare, color: "text-cyan-400" },
    { label: "Memory Writes", value: usage?.totalMemoryWrites ?? 0, icon: Database, color: "text-purple-400" },
    { label: "Searches", value: usage?.totalSearches ?? 0, icon: Search, color: "text-pink-400" },
  ];

  return (
    <SidebarLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Platform usage and performance metrics</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="py-3 px-4">
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              {usageLoading ? (
                <Skeleton className="h-6 w-16" />
              ) : (
                <div className="text-xl font-bold">{stat.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">API Calls Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {timeline && timeline.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={timeline}>
                  <defs>
                    <linearGradient id="colorApiCalls" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 6%, 15%)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(240, 5%, 65%)" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(240, 5%, 65%)" }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(240, 10%, 6%)", border: "1px solid hsl(240, 6%, 15%)", borderRadius: "8px" }} />
                  <Area type="monotone" dataKey="apiCalls" stroke="hsl(262, 83%, 58%)" fill="url(#colorApiCalls)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-72 flex items-center justify-center text-sm text-muted-foreground">No data yet</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">AGL Spend Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {timeline && timeline.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={timeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 6%, 15%)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(240, 5%, 65%)" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(240, 5%, 65%)" }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(240, 10%, 6%)", border: "1px solid hsl(240, 6%, 15%)", borderRadius: "8px" }} />
                  <Bar dataKey="aglSpent" fill="hsl(262, 83%, 58%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-72 flex items-center justify-center text-sm text-muted-foreground">No data yet</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Chats vs Memory Writes</CardTitle>
          </CardHeader>
          <CardContent>
            {timeline && timeline.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={timeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 6%, 15%)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(240, 5%, 65%)" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(240, 5%, 65%)" }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(240, 10%, 6%)", border: "1px solid hsl(240, 6%, 15%)", borderRadius: "8px" }} />
                  <Bar dataKey="chats" fill="hsl(280, 83%, 58%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="memoryWrites" fill="hsl(300, 83%, 58%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-72 flex items-center justify-center text-sm text-muted-foreground">No data yet</div>
            )}
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
