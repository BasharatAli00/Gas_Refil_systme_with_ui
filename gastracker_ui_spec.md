# Gas Tracker MCP Client — UI Specification

**Version:** 1.0  
**Stack:** Next.js 14 (App Router) + Vanilla CSS  
**MCP Server:** `gas-tracker` via `stdio` transport  
**LLM:** DeepSeek `deepseek-chat` via OpenAI-compatible API  
**Client Library:** `langchain_mcp_adapters` + `langchain_openai`

---

## 1. Project Overview

Build a web dashboard UI that wraps the existing `client.py` logic into a browser-accessible interface. The UI allows flatmates to manage their gas cylinder refill rotation without touching the terminal. All 6 MCP tools from the `gas-tracker` server are exposed through the UI. The LLM (DeepSeek) sits between the UI and the MCP tools — exactly as it does in the current `client.py`.

---

## 2. What Already Exists (Do Not Rewrite)

| File | Location | Status |
|---|---|---|
| `main.py` | `C:\Users\Alee Bushu\Mcp_server_proj\main.py` | ✅ Working — do not modify |
| `database.py` | `C:\Users\Alee Bushu\Mcp_server_proj\database.py` | ✅ Working — do not modify |
| `client.py` | `C:\Users\Alee Bushu\test_mcp_client\client.py` | ✅ Working — extract logic from here |

The new UI project is a **separate Next.js app** that calls a Python backend. Do not merge it into the existing client project.

---

## 3. Architecture

```
Browser (Next.js UI)
        │
        │  HTTP POST /api/chat
        ▼
Next.js API Route (route.ts)
        │
        │  HTTP POST → forwards to Python
        ▼
FastAPI Python Backend (backend/server.py)
        │
        │  MultiServerMCPClient (stdio)
        │  ChatOpenAI (DeepSeek)
        ▼
MCP Server (gas-tracker via stdio subprocess)
  → mark_my_turn_done
  → whos_turn
  → skip_turn
  → swap_turns
  → show_history
  → show_rotation
```

### Why a Python backend?

The existing `client.py` uses `langchain_mcp_adapters` and `langchain_openai` — both Python-only. The MCP server runs via `stdio` (a subprocess). These cannot run inside Next.js. The solution is a thin FastAPI server exposing a single `/chat` endpoint. The Next.js frontend calls this endpoint.

---

## 4. Folder Structure

```
gastracker-ui/
├── frontend/                        # Next.js app
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                 # Dashboard shell
│   │   └── api/
│   │       └── chat/
│   │           └── route.ts         # Proxy → Python backend
│   ├── components/
│   │   ├── ChatInput.tsx            # Natural language input bar
│   │   ├── ChatHistory.tsx          # Scrollable message thread
│   │   ├── TurnBanner.tsx           # "It's X's turn" hero card
│   │   ├── RotationTable.tsx        # Full rotation with stats
│   │   ├── QuickActions.tsx         # One-click buttons for each tool
│   │   └── StatusIndicator.tsx      # Backend connection status
│   ├── lib/
│   │   └── api.ts                   # fetch wrapper for /api/chat
│   ├── styles/
│   │   ├── globals.css
│   │   └── dashboard.module.css
│   └── types/
│       └── chat.ts
│
├── backend/                         # Python FastAPI server
│   ├── server.py                    # FastAPI app with /chat endpoint
│   ├── mcp_client.py                # Adapted from client.py
│   ├── requirements.txt
│   └── .env
│
└── README.md
```

---

## 5. MCP Server — Tool Reference

All 6 tools confirmed loaded from terminal output:
```
✅ Loaded 6 tools:
  🔧 mark_my_turn_done
  🔧 whos_turn
  🔧 skip_turn
  🔧 swap_turns
  🔧 show_history
  🔧 show_rotation
```

### Tool Signatures

#### `whos_turn`
```python
def whos_turn() -> str
# No parameters
# Returns: "It's UK's turn (turn #3)"
```

#### `mark_my_turn_done`
```python
def mark_my_turn_done(name: str, notes: str = "", date_str: str = None) -> str
# name: required — flatmate's name
# notes: optional — any notes about the refill
# date_str: optional — "YYYY-MM-DD" for backdating
# Returns: confirmation string
```

#### `skip_turn`
```python
def skip_turn(name: str, reason: str = "") -> str
# name: required — flatmate whose turn to skip
# reason: optional
# Returns: confirmation string
```

#### `swap_turns`
```python
def swap_turns(name_a: str, name_b: str) -> str
# name_a, name_b: required — two flatmates to swap in rotation
# Returns: confirmation string
```

#### `show_history`
```python
def show_history(limit: int = 10) -> str
# limit: optional — number of recent events (default 10)
# Returns: formatted string of recent events
```

#### `show_rotation`
```python
def show_rotation() -> str
# No parameters
# Returns: formatted string of full rotation + per-flatmate stats
```

### Tool Result Format

Confirmed from terminal output — results come back as a list:
```python
[{'type': 'text', 'text': "It's UK's turn (turn #3)", 'id': 'lc_ce29be60...'}]
```
The backend must extract `result[0]['text']` to get the plain string.

---

## 6. Python Backend

### `backend/mcp_client.py`

Adapt directly from `client.py`. The core reusable function:

```python
async def ask(message: str) -> dict:
    """
    Takes a natural language message.
    Connects to gas-tracker MCP server via stdio.
    Uses DeepSeek to pick and call the right tool.
    Returns answer + tool metadata.
    """
    # Returns:
    # {
    #   "answer": "It's UK's turn (turn #3).",
    #   "tool_used": "whos_turn",
    #   "tool_args": {},
    #   "tool_result": "It's UK's turn (turn #3)"
    # }
    # or on error:
    # { "error": "..." }
```

Implementation notes:
- Copy the `MultiServerMCPClient` config from `client.py` exactly
- Read `MCP_SERVER_PATH` and `FASTMCP_EXE_PATH` from `.env` — do not hardcode paths
- Tool result extraction: `tool_result = result[0]['text']`
- If `response.tool_calls` is empty: return `response.content` as the answer with `tool_used: null`
- Wrap entire function in `try/except`, return `{"error": str(e)}` on failure

### `backend/server.py`

FastAPI app with one endpoint.

**`POST /chat`**

Request body:
```json
{ "message": "Who is next to fill the gas?" }
```

Response:
```json
{
  "answer": "It's UK's turn to refill the gas cylinder next (turn #3).",
  "tool_used": "whos_turn",
  "tool_args": {},
  "tool_result": "It's UK's turn (turn #3)"
}
```

Error response:
```json
{ "error": "Failed to connect to MCP server", "answer": null }
```

Enable CORS for `http://localhost:3000`.

**`GET /health`**

Returns `{ "status": "ok" }` — used by StatusIndicator to check if backend is reachable.

### `backend/.env`
```
DEEPSEEK_API_KEY=sk-11d46b4be3de4095a7608ad08557850a
MCP_SERVER_PATH=C:\Users\Alee Bushu\Mcp_server_proj\main.py
FASTMCP_EXE_PATH=C:\Users\Alee Bushu\Mcp_server_proj\.venv\Scripts\fastmcp.exe
```

### `backend/requirements.txt`
```
fastapi
uvicorn[standard]
langchain-mcp-adapters
langchain-openai
python-dotenv
```

---

## 7. Next.js API Proxy (`frontend/app/api/chat/route.ts`)

Simple pass-through. Receives `POST { message: string }` from the browser, forwards to `http://localhost:8000/chat`, returns the response. Reads backend URL from `PYTHON_BACKEND_URL` env var.

---

## 8. UI Layout

Single page, always showing all panels — no routing.

```
┌─────────────────────────────────────────────────┐
│  🔥 Gas Tracker                  [● Connected]  │
├──────────────────┬──────────────────────────────┤
│                  │                               │
│  TURN BANNER     │   ROTATION TABLE              │
│  "It's UK's      │   (show_rotation output)      │
│   turn (#3)"     │                               │
│  [Refresh]       │   [Refresh]                   │
│                  │                               │
├──────────────────┴──────────────────────────────┤
│  QUICK ACTIONS                                   │
│  [Who's Next?] [Mark Done] [Skip Turn]           │
│  [Swap Turns]  [History]   [Rotation]            │
│  ── inline form appears here when active ──      │
├─────────────────────────────────────────────────┤
│  CHAT THREAD (scrollable)                        │
│  ┌───────────────────────────────────────────┐  │
│  │  messages...                               │  │
│  └───────────────────────────────────────────┘  │
│  [ Type anything...                      Send ]  │
└─────────────────────────────────────────────────┘
```

---

## 9. Component Specifications

### 9.1 TurnBanner

Calls `whos_turn` automatically on page mount. Parses the returned string to show the flatmate name prominently and the turn number underneath. Shows a loading skeleton while fetching. Has a "Refresh" button to re-fetch.

### 9.2 QuickActions

Six buttons — one per tool. Clicking a button that requires input opens an inline form directly below the button row. Only one form can be open at a time.

| Button | Form Fields | Message Sent to LLM |
|---|---|---|
| Who's Next? | None | `"Who is next to fill the gas?"` |
| Mark Done | Name (required), Notes (optional), Date (optional, type=date) | `"Mark {name}'s turn as done. Notes: {notes}. Date: {date_str}"` |
| Skip Turn | Name (required), Reason (optional) | `"Skip {name}'s turn. Reason: {reason}"` |
| Swap Turns | Name A (required), Name B (required) | `"Swap turns between {name_a} and {name_b}"` |
| History | Limit (number, default 10) | `"Show last {limit} gas refill history records"` |
| Rotation | None | `"Show the full rotation"` |

All messages are sent to the `/chat` endpoint — the LLM picks the right tool. Results appear in the chat thread.

### 9.3 ChatHistory

Scrollable thread. Message types:

- **User message** — right-aligned, accent color background
- **LLM answer** — left-aligned, card background
- **Tool metadata** — small collapsed pill below each LLM answer showing `🔧 whos_turn`. Click to expand and see args and raw tool result.
- **Error message** — left-aligned, red background
- **Typing indicator** — three animated dots while request is in flight

Auto-scrolls to the latest message. History is session-only (clears on refresh).

### 9.4 ChatInput

Text input + Send button. Enter key sends. Disabled while a request is in flight. Clears after send. Trims whitespace — does not send empty strings.

Placeholder: `"Ask anything — e.g. Who's next? Mark Ali's turn done."`

### 9.5 RotationTable

Calls `show_rotation` on page mount. The raw result is a formatted string — render it inside a `<pre>` tag styled to match the dark theme. Has a "Refresh" button.

### 9.6 StatusIndicator

Top-right corner of the header. Calls `GET /health` on mount to set initial status.

- `● Connected` — green, after any successful response
- `● Disconnected` — red, after any network/backend error
- `● Starting...` — gray, initial state

---

## 10. TypeScript Types (`frontend/types/chat.ts`)

```typescript
export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  answer: string;
  tool_used: string | null;
  tool_args: Record<string, unknown>;
  tool_result: string;
  error?: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "error";
  content: string;
  tool_used?: string | null;
  tool_args?: Record<string, unknown>;
  tool_result?: string;
  timestamp: Date;
}
```

---

## 11. State Management (`frontend/app/page.tsx`)

```typescript
const [messages, setMessages]         // Message[] — chat thread
const [isLoading, setIsLoading]       // boolean — request in flight
const [connectionStatus, setStatus]   // "connected" | "disconnected" | "unknown"
const [currentTurn, setCurrentTurn]   // string — name from whos_turn result
const [activeForm, setActiveForm]     // string | null — which QuickAction form is open
```

When a response comes back with `tool_used === "whos_turn"`, parse `tool_result` and update `currentTurn` so TurnBanner re-renders without a separate fetch.

---

## 12. Styling

Dark theme throughout.

```css
--bg-page:      #0f0f0f;
--bg-panel:     #1a1a1a;
--bg-card:      #242424;
--accent:       #f97316;   /* orange — fire/gas theme */
--success:      #22c55e;
--error:        #ef4444;
--text-primary: #f1f5f9;
--text-muted:   #94a3b8;
--border:       #2e2e2e;
--radius-card:  10px;
--radius-input: 6px;
```

Font: system stack — `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`

No external UI library. CSS Modules only.

Responsive: on viewports below 768px, the two-column top section (TurnBanner + RotationTable) stacks vertically.

---

## 13. Error Handling

| Scenario | UI Behavior |
|---|---|
| Python backend not running | Status → red; chat shows "Backend is not running. Start with: `uvicorn server:app --port 8000`" |
| MCP subprocess fails | Backend catches, returns error; chat shows the error string |
| LLM makes no tool call | Return `response.content` as answer, `tool_used: null` — display normally |
| Required form field empty | Inline validation below field: "Name is required" — do not submit |
| Network timeout (>30s) | Chat shows "Request timed out. Please try again." |

---

## 14. Running the Project

**Step 1 — Start the Python backend:**
```bash
cd gastracker-ui/backend
pip install -r requirements.txt
uvicorn server:app --reload --port 8000
```

**Step 2 — Start the Next.js frontend:**
```bash
cd gastracker-ui/frontend
npm install
npm run dev
# Opens at http://localhost:3000
```

The MCP server (`main.py`) is launched as a subprocess by the Python backend automatically — do not start it separately.

---

## 15. Implementation Order (For Coding Agent)

1. Create folder structure: `gastracker-ui/frontend` and `gastracker-ui/backend`
2. Write `backend/.env` with the three environment variables
3. Build `backend/mcp_client.py` — adapt from `client.py`, single `async def ask()` function
4. Build `backend/server.py` — FastAPI, `POST /chat`, `GET /health`, CORS
5. Test backend standalone: `curl -X POST http://localhost:8000/chat -H "Content-Type: application/json" -d "{\"message\":\"whos turn\"}"` — must return valid JSON before proceeding
6. Scaffold Next.js frontend with TypeScript
7. Define types in `frontend/types/chat.ts`
8. Build `frontend/app/api/chat/route.ts` proxy
9. Build `StatusIndicator.tsx` — calls `GET /health` on mount
10. Build `TurnBanner.tsx` — calls `/api/chat` with `"whos_turn"` on mount
11. Build `ChatInput.tsx` and `ChatHistory.tsx`
12. Build `QuickActions.tsx` with all inline forms
13. Build `RotationTable.tsx`
14. Wire all components in `page.tsx`
15. Apply CSS variables and dark theme
16. Test all 6 tools end-to-end through the UI

---

## 16. Out of Scope (v1)

- User authentication
- Persistent chat history across page refreshes
- Push notifications or reminders
- Adding/removing flatmates via UI (edit `database.py` directly)
- Mobile app
- Deployment / Docker
