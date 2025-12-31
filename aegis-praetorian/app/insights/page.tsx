"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function InsightsPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<{
    text: string;
    model: string;
    usage?: { inputTokens: number; outputTokens: number };
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setInsight(null);

    try {
      const response = await fetch("/api/insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          context: {
            timestamp: new Date().toISOString(),
            source: "aegis-praetorian-dashboard",
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setInsight({
          text: data.insight,
          model: data.model,
          usage: data.usage,
        });
      } else {
        setError(data.error || "Failed to generate insights");
      }
    } catch (err) {
      console.error("Insights error:", err);
      setError("Failed to connect to insights service");
    } finally {
      setLoading(false);
    }
  };

  const exampleQueries = [
    "What are the current market trends in our inventory?",
    "Identify pricing opportunities for high-demand vehicles",
    "Analyze dealer performance and competitive positioning",
    "What vehicles are overpriced compared to market average?",
    "Suggest inventory optimization strategies",
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Insights</h1>
        <p className="text-muted-foreground">
          Get intelligent analysis powered by Claude AI
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Query Intelligence Engine</CardTitle>
          <CardDescription>
            Ask questions about your inventory, market trends, and competitive analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="query"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Your Question
              </label>
              <textarea
                id="query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about inventory trends, pricing strategies, market opportunities..."
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={loading}
              />
            </div>

            <Button type="submit" disabled={loading || !query.trim()}>
              {loading ? "Analyzing..." : "Generate Insights"}
            </Button>
          </form>

          {error && (
            <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-red-500">
              <p className="font-medium">{error}</p>
            </div>
          )}

          {insight && (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/50 p-6">
                <div className="prose prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {insight.text}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Model: {insight.model}</span>
                {insight.usage && (
                  <span>
                    Tokens: {insight.usage.inputTokens} in / {insight.usage.outputTokens} out
                  </span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Example Queries</CardTitle>
          <CardDescription>
            Try these sample questions to explore the insights engine
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {exampleQueries.map((example, index) => (
              <button
                key={index}
                onClick={() => setQuery(example)}
                className="w-full text-left rounded-lg border bg-card p-3 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Capabilities</CardTitle>
          <CardDescription>
            What the Praetorian AI can analyze
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                <strong>Market Analysis:</strong> Identify trends, pricing patterns, and demand signals
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                <strong>Competitive Intelligence:</strong> Compare dealer performance and positioning
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                <strong>Pricing Optimization:</strong> Detect overpriced/underpriced inventory
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                <strong>Inventory Strategy:</strong> Recommend acquisition and liquidation priorities
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                <strong>Geographic Insights:</strong> Analyze regional sales patterns and opportunities
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
