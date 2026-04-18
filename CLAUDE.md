# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Gas Tracker Dashboard — a flatmate gas cylinder refill rotation manager. A Next.js frontend communicates with a FastAPI Python backend, which bridges to an external MCP server (via stdio subprocess) and a DeepSeek LLM to handle natural-language queries about whose turn it is to refill gas.

## Architecture

```
Browser (Next.js :3000)
  → POST /api/chat (Next.js proxy route)
    → POST http://localhost:8000/chat (FastAPI)
      → MultiServerMCPClient (stdio subprocess → gas-tracker/main.py)
      → ChatOpenAI (DeepSeek API, openai-compatible)
```

**Key files:**
- `gastracker-ui/frontend/app/page.tsx` — main React page, state management, data fetching
- `gastracker-ui/frontend/app/api/chat/route.ts` — Next.js proxy to Python backend
- `gastracker-ui/backend/server.py` — FastAPI app (POST /chat, GET /health, CORS for :3000)
- `gastracker-ui/backend/mcp_client.py` — core LLM+MCP logic (`ask(message)` → dict)
- `gastracker-ui/backend/.env` — `DEEPSEEK_API_KEY`, `MCP_SERVER_PATH`, `FASTMCP_EXE_PATH`
- `client.py` — original CLI reference implementation (not used by the web app)
- `gastracker_ui_spec.md` — full architecture/component spec (authoritative design doc)

**MCP Tools (6):** `whos_turn`, `mark_my_turn_done`, `skip_turn`, `swap_turns`, `show_history`, `show_rotation`

**Frontend components** (`gastracker-ui/frontend/components/`): `TurnBanner`, `RotationTable`, `QuickActions`, `ChatHistory`, `ChatInput`, `StatusIndicator`

**Styling:** `gastracker-ui/frontend/styles/dashboard.module.css` — dark theme CSS modules, responsive grid (768px breakpoint)

## Running Locally

```bash
# Terminal 1 — Python backend
cd gastracker-ui/backend
pip install -r requirements.txt
uvicorn server:app --reload --port 8000

# Terminal 2 — Next.js frontend
cd gastracker-ui/frontend
npm install
npm run dev   # http://localhost:3000
```

## Commands

```bash
# Frontend
npm run dev      # dev server
npm run build    # production build
npm run lint     # lint

# Backend test
cd gastracker-ui/backend
python test_backend.py   # sends a test POST to localhost:8000/chat

# Root project (LangChain deps)
# python >= 3.11, managed via pyproject.toml
```

## Data Flow Detail

`mcp_client.py:ask()`:
1. Connects `MultiServerMCPClient` (stdio transport, launches MCP server subprocess)
2. Binds tools to `ChatOpenAI(model="deepseek-chat", base_url=DeepSeek)`
3. LLM selects a tool from `response.tool_calls[0]`
4. Executes tool; extracts text from `result[0]['text']`
5. Sends full message history back to LLM for a conversational answer
6. Returns `{ answer, tool_used, tool_args, tool_result }`

Frontend detects `tool_used` in the response to update `TurnBanner` (on `whos_turn`) and `RotationTable` (on `show_rotation`). On mount, `fetchInitialData()` silently calls both to populate the dashboard.
