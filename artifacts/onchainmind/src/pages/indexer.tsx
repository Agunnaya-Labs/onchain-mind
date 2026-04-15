import { useState } from "react";
import { useListIndexerEvents, useSimulateIndexerEvent, getListIndexerEventsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { SidebarLayout } from "@/components/layout/sidebar-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Radio, Plus, Hash, ArrowRightLeft } from "lucide-react";

const eventTypeColors: Record<string, string> = {
  transfer: "bg-blue-500/10 text-blue-400",
  mint: "bg-green-500/10 text-green-400",
  stake: "bg-purple-500/10 text-purple-400",
  unstake: "bg-orange-500/10 text-orange-400",
  governance_vote: "bg-cyan-500/10 text-cyan-400",
};

export default function IndexerPage() {
  const { data: events, isLoading } = useListIndexerEvents({ limit: 30 });
  const simulate = useSimulateIndexerEvent();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [eventType, setEventType] = useState<string>("transfer");
  const [fromAddr, setFromAddr] = useState("0x742d35Cc6634C0532925a3b844Bc9e7595f2bD73");
  const [toAddr, setToAddr] = useState("0xea1221b4d80a89bd8c75248fae7c176bd1854698");
  const [amount, setAmount] = useState("100");

  const handleSimulate = () => {
    const amt = parseFloat(amount);
    if (isNaN(amt)) return;
    simulate.mutate(
      { data: { eventType: eventType as any, fromAddress: fromAddr, toAddress: toAddr, amount: amt } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListIndexerEventsQueryKey() });
          setOpen(false);
        },
      }
    );
  };

  return (
    <SidebarLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Blockchain Indexer</h1>
          <p className="text-sm text-muted-foreground mt-1">Simulated blockchain event feed</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Simulate Event</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Simulate Blockchain Event</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="mint">Mint</SelectItem>
                  <SelectItem value="stake">Stake</SelectItem>
                  <SelectItem value="unstake">Unstake</SelectItem>
                  <SelectItem value="governance_vote">Governance Vote</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="From address" value={fromAddr} onChange={(e) => setFromAddr(e.target.value)} />
              <Input placeholder="To address" value={toAddr} onChange={(e) => setToAddr(e.target.value)} />
              <Input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
              <Button onClick={handleSimulate} disabled={simulate.isPending} className="w-full">
                {simulate.isPending ? "Simulating..." : "Simulate Event"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : events && events.length > 0 ? (
        <div className="space-y-3">
          {events.map((event) => (
            <Card key={event.id}>
              <CardContent className="py-3 px-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={eventTypeColors[event.eventType] ?? ""}>
                      {event.eventType}
                    </Badge>
                    <Badge variant={event.processed ? "default" : "secondary"} className="text-xs">
                      {event.processed ? "Processed" : "Pending"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Hash className="h-3 w-3" /> Block {event.blockNumber}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-mono text-xs text-muted-foreground truncate max-w-[160px]">{event.fromAddress}</span>
                  <ArrowRightLeft className="h-3 w-3 text-muted-foreground shrink-0" />
                  <span className="font-mono text-xs text-muted-foreground truncate max-w-[160px]">{event.toAddress}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-mono text-xs text-muted-foreground truncate max-w-[300px]">{event.txHash}</span>
                  <span className="text-sm font-semibold text-primary">{event.amount} AGL</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Radio className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No blockchain events</h3>
            <p className="text-sm text-muted-foreground mb-4">Simulate an event to see it appear here</p>
            <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-2" /> Simulate Event</Button>
          </CardContent>
        </Card>
      )}
    </SidebarLayout>
  );
}
