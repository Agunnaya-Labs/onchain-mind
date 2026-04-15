import { useState } from "react";
import { useGetBalance, useListTransactions, useDepositAgl, getGetBalanceQueryKey, getListTransactionsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { SidebarLayout } from "@/components/layout/sidebar-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Coins, ArrowUpRight, ArrowDownRight, Plus } from "lucide-react";

const typeColors: Record<string, string> = {
  chat: "bg-blue-500/10 text-blue-400",
  memory_write: "bg-purple-500/10 text-purple-400",
  memory_search: "bg-cyan-500/10 text-cyan-400",
  deposit: "bg-green-500/10 text-green-400",
};

export default function BillingPage() {
  const { data: balance, isLoading: balanceLoading } = useGetBalance();
  const { data: transactions, isLoading: txLoading } = useListTransactions({ limit: 50 });
  const deposit = useDepositAgl();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("100");

  const handleDeposit = () => {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return;
    deposit.mutate(
      { data: { amount: num } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetBalanceQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListTransactionsQueryKey() });
          setOpen(false);
        },
      }
    );
  };

  return (
    <SidebarLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Billing</h1>
          <p className="text-sm text-muted-foreground mt-1">AGL token balance and transaction history</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Deposit AGL</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Deposit AGL Tokens</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="text-xs text-muted-foreground">Simulated deposit from AGL token contract</div>
              <Input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
              <Button onClick={handleDeposit} disabled={deposit.isPending} className="w-full">
                {deposit.isPending ? "Processing..." : `Deposit ${amount} AGL`}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-6 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border-primary/30">
        <CardContent className="py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Coins className="h-10 w-10 text-primary" />
            <div>
              <div className="text-sm text-muted-foreground">AGL Balance</div>
              {balanceLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <div className="text-3xl font-bold">{(balance?.balance ?? 0).toFixed(2)} AGL</div>
              )}
            </div>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <div>Token Contract</div>
            <div className="font-mono mt-1">{balance?.tokenAddress ?? "0xea12...4698"}</div>
            <div className="mt-2">Wallet</div>
            <div className="font-mono mt-1">{balance?.walletAddress ? `${balance.walletAddress.substring(0, 10)}...${balance.walletAddress.substring(balance.walletAddress.length - 4)}` : "---"}</div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "Chat", cost: "2 AGL", desc: "Per message" },
          { label: "Memory Write", cost: "1 AGL", desc: "Per entry" },
          { label: "Memory Search", cost: "1 AGL", desc: "Per query" },
          { label: "Deposit", cost: "Free", desc: "No fees" },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="py-3 px-4 text-center">
              <div className="text-xs text-muted-foreground">{item.label}</div>
              <div className="font-bold text-primary">{item.cost}</div>
              <div className="text-xs text-muted-foreground">{item.desc}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {txLoading ? (
            <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : transactions && transactions.length > 0 ? (
            <div className="space-y-2">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    {tx.type === "deposit" ? (
                      <ArrowDownRight className="h-4 w-4 text-green-400" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4 text-red-400" />
                    )}
                    <div>
                      <div className="text-sm">{tx.description}</div>
                      <div className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={typeColors[tx.type] ?? ""}>{tx.type}</Badge>
                    <span className={`text-sm font-mono ${tx.type === "deposit" ? "text-green-400" : "text-red-400"}`}>
                      {tx.type === "deposit" ? "+" : "-"}{tx.amount} AGL
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No transactions yet</p>
          )}
        </CardContent>
      </Card>
    </SidebarLayout>
  );
}
