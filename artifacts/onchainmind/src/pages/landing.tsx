import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Brain, Bot, Database, Coins, Zap, Shield, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-7 w-7 text-primary" />
            <span className="font-bold text-lg">OnchainMind</span>
            <span className="text-xs text-primary ml-1 font-semibold">x AGL</span>
          </div>
          <Link href="/dashboard">
            <Button variant="default" size="sm">
              Launch App <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-8">
            <Zap className="h-3.5 w-3.5" /> Powered by AGL Token on Base
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            AI NPCs with
            <span className="text-primary"> Persistent Memory</span>
            <br />on the Blockchain
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Create intelligent NPCs that remember, learn, and evolve. Tokenized compute billing with AGL. Built for developers who build the future.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="px-8">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="px-8">
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Core Platform Features</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Bot,
                title: "AI NPC Engine",
                desc: "Create NPCs with unique personalities and system prompts. Real AI responses powered by GPT models with memory recall.",
              },
              {
                icon: Database,
                title: "Persistent Memory",
                desc: "Vector-style memory system. NPCs remember past conversations and build context over time. Semantic search across memories.",
              },
              {
                icon: Coins,
                title: "AGL Token Billing",
                desc: "Pay-per-use with AGL tokens. 2 AGL per chat, 1 AGL per memory write, 1 AGL per search. Transparent on-chain billing.",
              },
              {
                icon: Shield,
                title: "API Key Auth",
                desc: "Secure API key authentication for all endpoints. Multi-tenant project isolation. Rate limiting and input validation.",
              },
              {
                icon: Zap,
                title: "Blockchain Indexer",
                desc: "Simulated blockchain event indexer. Track transfers, mints, staking, and governance votes in real-time.",
              },
              {
                icon: Brain,
                title: "Developer Dashboard",
                desc: "Full analytics suite. Track API calls, AGL spend, active NPCs, and memory writes. Project-level breakdowns.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
              >
                <feature.icon className="h-10 w-10 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Quick Start</h2>
          <div className="bg-card border border-border rounded-xl p-8">
            <pre className="text-sm font-mono text-muted-foreground overflow-x-auto">
              <code>{`// Chat with an NPC
curl -X POST /api/v1/npc/chat \\
  -H "Content-Type: application/json" \\
  -d '{
    "npcId": 1,
    "message": "Hello, who are you?",
    "wallet": "0x742d...bD73"
  }'

// Response
{
  "response": "I'm Arena Guide! I remember you asked about...",
  "memoryRecalled": ["User asked about game mechanics"],
  "aglCharged": 3
}`}</code>
            </pre>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            OnchainMind x AGL
          </div>
          <div className="font-mono text-xs">
            AGL: 0xea1221b4d80a89bd8c75248fae7c176bd1854698
          </div>
        </div>
      </footer>
    </div>
  );
}
