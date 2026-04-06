# SWOTPal MCP Server

SWOT analysis tools for AI agents. Use in Claude Desktop, Cursor, Windsurf, and any MCP-compatible client.

Generate professional SWOT analyses, competitive comparisons, and browse 100+ pre-built examples — all from your AI assistant.

## Quick Start

### 1. Get your API Key

Sign up at [swotpal.com](https://swotpal.com) and generate an API key from your dashboard.

### 2. Configure your MCP client

**Claude Desktop** — Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "swotpal": {
      "command": "npx",
      "args": ["-y", "@swotpal/mcp-server"],
      "env": {
        "SWOTPAL_API_KEY": "sk_live_your_key_here"
      }
    }
  }
}
```

**Cursor** — Add to your MCP settings (Settings > MCP Servers):

```json
{
  "swotpal": {
    "command": "npx",
    "args": ["-y", "@swotpal/mcp-server"],
    "env": {
      "SWOTPAL_API_KEY": "sk_live_your_key_here"
    }
  }
}
```

**Windsurf** — Same JSON format in your MCP configuration.

### 3. Use it

Ask your AI agent:

- "Generate a SWOT analysis for Tesla"
- "Compare Netflix vs Disney+"
- "Show me my saved analyses"
- "Browse SWOT examples in healthcare"

## Tools

| Tool | Description |
|------|-------------|
| `generate_swot` | SWOT analysis for any company, brand, product, or topic |
| `generate_versus` | Side-by-side competitive comparison of two companies |
| `list_analyses` | List your saved analyses with pagination |
| `get_analysis` | Get full details of a saved analysis by ID |
| `browse_examples` | Browse 100+ pre-built industry SWOT examples |

## Supported Languages

English, Japanese, Traditional Chinese, Simplified Chinese, Korean, Vietnamese, Portuguese, German, Spanish, French, Italian, Russian

## Example Output

```
## SWOT Analysis: Tesla 2026

### Strengths
- Global EV market leader with 20%+ market share
- Vertically integrated manufacturing and battery production
- Supercharger network as competitive moat
...

### Weaknesses
- Quality control issues persist across models
- CEO distraction risk with multiple ventures
...

View & edit: https://swotpal.com/editor/abc123
Remaining usage: 47
```

## Links

- [SWOTPal](https://swotpal.com) — AI-powered SWOT analysis platform
- [Examples](https://swotpal.com/examples) — 100+ company SWOT examples
- [Blog](https://swotpal.com/blog) — Strategic analysis articles
- [API Docs](https://swotpal.com/api) — REST API documentation

## License

MIT
