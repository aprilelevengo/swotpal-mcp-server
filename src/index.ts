#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// ─── Config ──────────────────────────────────────────────────────────────────

const API_KEY = process.env.SWOTPAL_API_KEY;
const BASE_URL = process.env.SWOTPAL_API_URL ?? "https://swotpal.com/api/public/v1";

if (!API_KEY) {
  console.error(
    "Error: SWOTPAL_API_KEY environment variable is required.\n" +
    "Get your API key at https://swotpal.com/dashboard\n" +
    "Then set it: export SWOTPAL_API_KEY=sk_live_..."
  );
  process.exit(1);
}

// ─── API Client ──────────────────────────────────────────────────────────────

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
      ...options.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    let msg: string;
    try { msg = JSON.parse(body).error ?? body; } catch { msg = body; }
    throw new Error(`API error (${res.status}): ${msg}`);
  }
  return res.json() as Promise<T>;
}

// ─── Examples Data (28 pre-built examples) ───────────────────────────────────

const examples = [
  { id: "manus", company: "Manus", industry: "Artificial Intelligence", description: "AI Agent OS for independent task execution" },
  { id: "meta", company: "Meta", industry: "Social Media", description: "Pivot to Metaverse vs. advertising juggernaut" },
  { id: "starbucks", company: "Starbucks", industry: "Food & Beverage", description: "Market entry snapshot & cafe dominance analysis" },
  { id: "tesla", company: "Tesla", industry: "Automotive", description: "EV innovation vs. supply chain risks" },
  { id: "netflix", company: "Netflix", industry: "Technology", description: "Streaming dominance, ad-tier growth, and original IP strategy" },
  { id: "hm", company: "H&M", industry: "Fashion", description: "Fast fashion sustainability challenges" },
  { id: "costco", company: "Costco", industry: "Retail", description: "Bulk retail membership model strength" },
  { id: "gymshark", company: "Gymshark", industry: "Fashion", description: "DTC fitness apparel brand growth" },
  { id: "apple", company: "Apple", industry: "Technology", description: "Ecosystem lock-in vs innovation slowdown" },
  { id: "nike", company: "Nike", industry: "Fashion", description: "DTC strategy, brand dominance, and competitive landscape" },
  { id: "airbnb", company: "Airbnb", industry: "Hospitality", description: "Regulatory challenges in global markets" },
  { id: "bill-gates", company: "Bill Gates", industry: "Philanthropy", description: "The Global Statesman - Co-chair, Gates Foundation" },
  { id: "richard-branson", company: "Richard Branson", industry: "Conglomerate", description: "The Maverick Entrepreneur - Founder, Virgin Group" },
  { id: "jeff-weiner", company: "Jeff Weiner", industry: "Technology", description: "The Compassionate Leader - Executive Chairman, LinkedIn" },
  { id: "arianna-huffington", company: "Arianna Huffington", industry: "Wellness", description: "The Wellness Crusader - Founder, Thrive Global" },
  { id: "uber", company: "Uber", industry: "Transportation", description: "Driver supply vs profitability" },
  { id: "satya-nadella", company: "Satya Nadella", industry: "Technology", description: "LinkedIn thought leadership analysis" },
  { id: "openai", company: "OpenAI", industry: "Artificial Intelligence", description: "ChatGPT dominance and the race to AGI" },
  { id: "nvidia", company: "Nvidia", industry: "Semiconductors", description: "AI GPU monopoly and Blackwell architecture leadership" },
  { id: "spotify", company: "Spotify", industry: "Entertainment", description: "Leading music and podcast streaming platform" },
  { id: "amazon", company: "Amazon", industry: "E-commerce", description: "Global e-commerce and cloud computing giant" },
  { id: "google", company: "Google", industry: "Technology", description: "Global leader in search, advertising, and cloud" },
  { id: "samsung", company: "Samsung", industry: "Electronics", description: "Global electronics conglomerate spanning mobile and semiconductors" },
  { id: "disney", company: "Disney", industry: "Entertainment/Media", description: "Theme parks, streaming, and iconic IP franchises" },
  { id: "microsoft", company: "Microsoft", industry: "Technology/Cloud", description: "Cloud computing, productivity software, AI, and gaming" },
  { id: "salesforce", company: "Salesforce", industry: "Technology/SaaS", description: "Cloud-based CRM and enterprise AI agents" },
  { id: "axon-enterprise", company: "Axon Enterprise", industry: "Public Safety/Technology", description: "Body cameras, TASER devices, and AI-powered public safety tools" },
  { id: "anthropic", company: "Anthropic", industry: "Artificial Intelligence", description: "Claude AI safety leadership and the enterprise AI race" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toolError(error: unknown) {
  const msg = error instanceof Error ? error.message : String(error);
  return { content: [{ type: "text" as const, text: msg }], isError: true };
}

function text(s: string) {
  return { content: [{ type: "text" as const, text: s }] };
}

function formatItems(label: string, items: string[]) {
  return `### ${label}\n${items.map(i => `- ${i}`).join("\n")}`;
}

// ─── Server Setup ────────────────────────────────────────────────────────────

const server = new McpServer({
  name: "SWOTPal",
  version: "0.1.0",
});

// ─── Tool: generate_swot ─────────────────────────────────────────────────────

server.tool(
  "generate_swot",
  "Generate a SWOT analysis (Strengths, Weaknesses, Opportunities, Threats) for any company, brand, product, or topic.",
  {
    topic: z.string().describe("Company, brand, or topic to analyze (e.g. 'Tesla 2026')"),
    language: z.string().optional().describe("Language code: en, ja, zh_TW, zh, ko, vi, pt, de, es, fr, it, ru"),
  },
  async ({ topic, language }) => {
    try {
      const r = await api<{
        title: string; strengths: string[]; weaknesses: string[];
        opportunities: string[]; threats: string[]; url: string; remaining_usage: number;
      }>("/swot", { method: "POST", body: JSON.stringify({ topic, language }) });

      return text([
        `## SWOT Analysis: ${r.title}\n`,
        formatItems("Strengths", r.strengths), "",
        formatItems("Weaknesses", r.weaknesses), "",
        formatItems("Opportunities", r.opportunities), "",
        formatItems("Threats", r.threats), "",
        `---\nView & edit: ${r.url}\nRemaining usage: ${r.remaining_usage}`,
      ].join("\n"));
    } catch (e) { return toolError(e); }
  }
);

// ─── Tool: generate_versus ───────────────────────────────────────────────────

server.tool(
  "generate_versus",
  "Compare two companies or topics side-by-side with a SWOT analysis for each. Great for competitive analysis.",
  {
    topicA: z.string().describe("First company/topic (e.g. 'Tesla')"),
    topicB: z.string().describe("Second company/topic (e.g. 'BYD')"),
    language: z.string().optional().describe("Language code: en, ja, zh_TW, zh, ko, vi, pt, de, es, fr, it, ru"),
  },
  async ({ topicA, topicB, language }) => {
    try {
      const r = await api<{
        left_title: string; right_title: string;
        comparison: {
          strengths: { left: string[]; right: string[] };
          weaknesses: { left: string[]; right: string[] };
          opportunities: { left: string[]; right: string[] };
          threats: { left: string[]; right: string[] };
        };
        url: string; remaining_usage: number;
      }>("/versus", { method: "POST", body: JSON.stringify({ left: topicA, right: topicB, language }) });

      const sections = (["strengths", "weaknesses", "opportunities", "threats"] as const).map(key => {
        const label = key.charAt(0).toUpperCase() + key.slice(1);
        return [
          `### ${label}\n`,
          `**${r.left_title}:**`,
          ...r.comparison[key].left.map(i => `- ${i}`), "",
          `**${r.right_title}:**`,
          ...r.comparison[key].right.map(i => `- ${i}`),
        ].join("\n");
      });

      return text([
        `## SWOT Comparison: ${r.left_title} vs ${r.right_title}\n`,
        ...sections, "",
        `---\nView & edit: ${r.url}\nRemaining usage: ${r.remaining_usage}`,
      ].join("\n"));
    } catch (e) { return toolError(e); }
  }
);

// ─── Tool: list_analyses ─────────────────────────────────────────────────────

server.tool(
  "list_analyses",
  "List your saved SWOT analyses with pagination.",
  {
    page: z.number().int().min(1).optional().describe("Page number (default: 1)"),
    limit: z.number().int().min(1).max(50).optional().describe("Items per page (default: 10, max: 50)"),
  },
  async ({ page, limit }) => {
    try {
      const params = new URLSearchParams();
      if (page) params.set("page", String(page));
      if (limit) params.set("limit", String(limit));
      const q = params.toString();

      const r = await api<{
        analyses: { id: string; title: string; mode: string; input_type: string; created_at: string; url: string }[];
        total: number; page: number; limit: number;
        usage: { used: number; max: number; plan: string };
      }>(`/analyses${q ? `?${q}` : ""}`);

      if (r.analyses.length === 0) return text("No analyses found.");

      const rows = r.analyses.map(a =>
        `- **${a.title}** (${a.mode}, ${a.input_type}) — ${a.created_at.split("T")[0]} — [View](${a.url})`
      );
      return text([
        `## Your Analyses (page ${r.page}, ${r.total} total)\n`,
        ...rows, "",
        `---\nUsage: ${r.usage.used}/${r.usage.max} (${r.usage.plan} plan)`,
      ].join("\n"));
    } catch (e) { return toolError(e); }
  }
);

// ─── Tool: get_analysis ──────────────────────────────────────────────────────

server.tool(
  "get_analysis",
  "Get full details of a saved SWOT analysis by its ID, including all quadrants and TOWS strategies.",
  {
    id: z.string().describe("Analysis session ID"),
  },
  async ({ id }) => {
    try {
      const r = await api<{
        title: string; mode: string; data: Record<string, unknown>; url: string;
      }>(`/analyses/${encodeURIComponent(id)}`);

      const session = r.data as Record<string, unknown>;
      const result = session.result as Record<string, unknown> | undefined;
      if (!result) return text(`## ${r.title}\n\nNo analysis data available.\n\nView: ${r.url}`);

      if (r.mode === "single" && result.single) {
        const s = result.single as {
          strengths?: string[]; weaknesses?: string[];
          opportunities?: string[]; threats?: string[];
          tows?: { so?: string[]; wo?: string[]; st?: string[]; wt?: string[] };
        };
        const parts = [
          `## ${r.title}\n`,
          formatItems("Strengths", s.strengths ?? []), "",
          formatItems("Weaknesses", s.weaknesses ?? []), "",
          formatItems("Opportunities", s.opportunities ?? []), "",
          formatItems("Threats", s.threats ?? []),
        ];
        if (s.tows) {
          parts.push(
            "", "### TOWS Strategies\n",
            "**SO (Growth):**", ...(s.tows.so ?? []).map(i => `- ${i}`), "",
            "**WO (Turnaround):**", ...(s.tows.wo ?? []).map(i => `- ${i}`), "",
            "**ST (Defense):**", ...(s.tows.st ?? []).map(i => `- ${i}`), "",
            "**WT (Retreat):**", ...(s.tows.wt ?? []).map(i => `- ${i}`),
          );
        }
        parts.push("", `---\nView & edit: ${r.url}`);
        return text(parts.join("\n"));
      }

      return text([`## ${r.title}\n`, "```json", JSON.stringify(result, null, 2), "```", "", `View & edit: ${r.url}`].join("\n"));
    } catch (e) { return toolError(e); }
  }
);

// ─── Tool: browse_examples ───────────────────────────────────────────────────

server.tool(
  "browse_examples",
  "Browse SWOTPal's library of 28 pre-built SWOT analysis examples across industries. No API key usage consumed.",
  {
    industry: z.string().optional().describe("Filter by industry (e.g. 'Technology', 'Fashion'). Leave empty to list all."),
  },
  async ({ industry }) => {
    let filtered = examples;
    if (industry) {
      const lower = industry.toLowerCase();
      filtered = examples.filter(e => e.industry.toLowerCase().includes(lower));
    }

    if (filtered.length === 0) {
      const industries = [...new Set(examples.map(e => e.industry))];
      return text(`No examples found for "${industry}". Available industries: ${industries.join(", ")}`);
    }

    return text([
      `## SWOTPal Examples${industry ? ` (${industry})` : ""} — ${filtered.length} results\n`,
      ...filtered.map(e => `- **${e.company}** (${e.industry}) — ${e.description} — [View](https://swotpal.com/examples/${e.id})`),
      "",
      "---",
      "Use `generate_swot` to create a custom analysis, or visit the links above for detailed pre-built analyses.",
    ].join("\n"));
  }
);

// ─── Start ───────────────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Failed to start MCP server:", err);
  process.exit(1);
});
