import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderKanban,
  Bot,
  Key,
  CreditCard,
  BarChart3,
  Radio,
  Brain,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/npcs", label: "NPCs", icon: Bot },
  { href: "/api-keys", label: "API Keys", icon: Key },
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/indexer", label: "Indexer", icon: Radio },
];

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-64 border-r border-border bg-card flex flex-col shrink-0">
        <div className="p-6 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Brain className="h-7 w-7 text-primary" />
            <div>
              <span className="font-bold text-lg text-foreground">OnchainMind</span>
              <span className="text-xs text-primary ml-1">x AGL</span>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href || location.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border">
          <div className="text-xs text-muted-foreground">
            AGL Token
          </div>
          <div className="text-xs text-muted-foreground mt-1 font-mono truncate">
            0xea12...4698
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
