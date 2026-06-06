# Spur Chat — AI Live Chat Support Agent

A full-stack mini AI support agent built for the Spur founding engineer take-home assignment.

Customers chat with an AI agent that knows the policies of **Spark & Co.**, a fictional e-commerce store.

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Backend | Node.js + TypeScript + Express | Fast setup, clean typing |
| Frontend | SvelteKit | Lightweight, reactive, compiles small |
| Database | SQLite (via `better-sqlite3`) | Zero-config, portable, sync API is perfect for this scale |
| LLM | Anthropic Claude (claude-sonnet-4) | High quality, well-structured SDK |
| Validation | Zod | Runtime safety with TypeScript inference |

---

## Project Structure

```
spur-chat/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── connection.ts     # SQLite connection + WAL setup
│   │   │   ├── migrate.ts        # Schema creation (run on startup + manually)
│   │   │   ├── repository.ts     # All DB queries (conversations + messages)
│   │   │   └── seed.ts           # Seed script (no-op for data; runs migrations)
│   │   ├── middleware/
│   │   │   ├── errorHandler.ts   # Global error + 404 handler
│   │   │   └── validation.ts     # Zod-based request validators
│   │   ├── routes/
│   │   │   └── chat.ts           # POST /chat/message, GET /chat/history/:id
│   │   ├── services/
│   │   │   ├── chat.ts           # Orchestrates DB + LLM per request
│   │   │   ├── knowledge.ts      # Spark & Co. FAQ / domain knowledge
│   │   │   └── llm.ts            # Anthropic API wrapper (generateReply)
│   │   ├── types/
│   │   │   └── index.ts          # Shared TypeScript types
│   │   └── index.ts              # Express app entry point
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatBubble.svelte       # Individual message bubble
│   │   │   ├── TypingIndicator.svelte  # Animated "agent is typing" indicator
│   │   │   └── ErrorBanner.svelte      # Dismissable error notice
│   │   ├── lib/
│   │   │   ├── api.ts            # Typed fetch wrappers for backend
│   │   │   └── session.ts        # localStorage session persistence
│   │   ├── routes/
│   │   │   ├── +layout.svelte    # Root layout (imports global CSS)
│   │   │   └── +page.svelte      # Main chat page
│   │   ├── app.css               # Global styles + design tokens
│   │   └── app.html              # HTML shell
│   ├── .env.example
│   ├── package.json
│   ├── svelte.config.js
│   └── vite.config.ts
│
├── .gitignore
└── README.md
```

---

## Running Locally

### Prerequisites

- Node.js v18+
- npm v9+
- An Anthropic API key (get one at [console.anthropic.com](https://console.anthropic.com))

---

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd spur-chat
```

---

### 2. Set up the backend

```bash
cd backend
npm install
```

**Configure environment variables:**

```bash
cp .env.example .env
```

Open `backend/.env` and set:

```env
ANTHROPIC_API_KEY=sk-ant-...your-key-here...
PORT=3001
NODE_ENV=development
DATABASE_PATH=./data/spur_chat.db
CORS_ORIGIN=http://localhost:5173
```

**Run migrations + seed:**

```bash
npm run migrate   # creates SQLite schema
npm run seed      # no-op for data; runs migrate as a safety check
```

**Start the dev server:**

```bash
npm run dev
```

Backend will be running at `http://localhost:3001`.  
Health check: `http://localhost:3001/chat/health`

---

### 3. Set up the frontend

In a new terminal:

```bash
cd frontend
npm install
```

**Configure environment:**

```bash
cp .env.example .env
```

`frontend/.env` should contain:

```env
PUBLIC_API_BASE_URL=http://localhost:3001
```

**Start the dev server:**

```bash
npm run dev
```

Frontend will be at `http://localhost:5173`.

---

## API Reference

### `POST /chat/message`

Send a user message, get an AI reply.

**Request body:**
```json
{
  "message": "What is your return policy?",
  "sessionId": "optional-uuid-to-continue-a-session"
}
```

**Response:**
```json
{
  "reply": "Our return window is 30 days from delivery...",
  "sessionId": "uuid-of-the-conversation",
  "messageId": "uuid-of-the-ai-message"
}
```

**Error (e.g. empty message):**
```json
{
  "error": "Invalid request body.",
  "details": { "message": ["Message cannot be empty."] }
}
```

---

### `GET /chat/history/:sessionId`

Fetch all messages for a session (used on page reload).

**Response:**
```json
{
  "sessionId": "uuid",
  "messages": [
    {
      "id": "uuid",
      "conversation_id": "uuid",
      "sender": "user",
      "text": "What's your return policy?",
      "timestamp": "2024-01-01T12:00:00.000Z"
    }
  ]
}
```

---

## Architecture Overview

### Separation of concerns

```
HTTP Layer  →  routes/chat.ts          (parses request, calls service, returns JSON)
Service     →  services/chat.ts        (orchestrates: DB + LLM)
LLM         →  services/llm.ts         (one function: generateReply — all Anthropic SDK logic here)
Data        →  db/repository.ts        (all SQL — no raw SQL elsewhere)
Knowledge   →  services/knowledge.ts   (Spark & Co. FAQ, injected into system prompt)
```

### LLM Prompting

- **System prompt** = base persona + full Spark & Co. knowledge base (hardcoded in `knowledge.ts`).
- **Messages** = last 20 messages from the conversation (10 turns), in Anthropic's `user` / `assistant` format.
- **Max tokens** = 512 (enough for support replies; controls cost).
- No vector search / RAG — at this scale, the full FAQ fits in the system prompt comfortably.

### Session persistence

- `sessionId` is a UUID generated on the first message.
- Stored in `localStorage` on the frontend; sent with every subsequent request.
- On page reload, the frontend fetches history from `GET /chat/history/:sessionId` and re-renders.

### Error handling strategy

- **Validation errors** (empty message, bad UUID) → 400 with Zod field errors.
- **LLM errors** (auth, rate limit, 5xx) → mapped to friendly messages in `llm.ts`, surfaced as dismissable banners in the UI.
- **Unknown errors** → caught by global `errorHandler` middleware, returned as 500 JSON.
- Backend never throws uncaught exceptions to the user.

---

## LLM Notes

**Provider:** Anthropic Claude (`claude-sonnet-4-20250514`)

**Prompting approach:**
1. System prompt establishes the agent persona and injects the complete store knowledge base.
2. Conversation history (last 20 messages) provides context for follow-up questions.
3. New user message is the final turn.

**Cost controls:**
- `max_tokens: 512` per completion.
- History capped at 20 messages (~10 turns) — older messages are dropped, not summarised (YAGNI).
- Messages longer than 2,000 characters are truncated server-side with a note appended.

**Guardrails:**
- Anthropic SDK errors are caught and mapped to user-friendly strings.
- API key is loaded from env at call-time, not module init — a missing key fails clearly with a descriptive error.

---

## Trade-offs & "If I Had More Time"

| Area | Current | With more time |
|---|---|---|
| **DB** | SQLite (sync, file-based) | PostgreSQL + connection pool for multi-instance deployments |
| **History** | Hard-truncate at 20 msgs | Summarise older turns with a cheap LLM call to preserve context |
| **Auth** | None (sessionId via localStorage) | JWT / Clerk for authenticated sessions |
| **Typing indicator** | Fires immediately on send | Stream tokens from Claude via SSE for true streaming UX |
| **Knowledge base** | Hardcoded in prompt | Store FAQs in DB + simple keyword search injection |
| **Rate limiting** | None | Per-IP rate limit with `express-rate-limit` + Redis |
| **Tests** | None | Unit tests for services; integration tests for API routes |
| **Redis** | Not used | Cache recent history lookups; lock concurrent requests per session |
| **Observability** | console.error | Structured logging (pino) + Sentry |
| **Deployment** | Local | Docker Compose (backend + SQLite volume); Render/Railway for hosting |

---

## Robustness Notes

The app is designed to fail gracefully:
- Empty or whitespace-only messages are rejected at the validation layer.
- Messages over 10,000 chars are rejected (backend validation); messages over 2,000 chars are truncated before the LLM call.
- All async operations are wrapped in try/catch; errors surface as clean JSON, never HTML stack traces.
- The frontend shows dismissable error banners rather than crashing.
- The backend never crashes on bad input (Zod validates all incoming bodies).
