# Dendron

A user-owned AI assistant widget. Zero backend cost. Full data ownership.

## Architecture

```
User Website
 └─ Dendron CDN Script
     └─ User's Supabase Edge Functions (/chat, /rag_ingest)
         ├─ Read assistant config (Supabase DB)
         ├─ Retrieve RAG context (pgvector)
         ├─ Call LLM (User's API Key)
         └─ Return response
```

## Tech Stack

- **CDN Runtime**: TypeScript, Vite, Web Components (Shadow DOM)
- **Execution**: Supabase Edge Functions (Deno)
- **Storage**: Supabase Postgres + pgvector
- **AI**: BYOK (Bring Your Own Key) - OpenAI, etc.

## Setup (For End Users)

### 1. Create a Supabase Project
Go to [supabase.com](https://supabase.com) and create a new project.

### 2. Run SQL Schema
In your Supabase Dashboard > SQL Editor, run the contents of `supabase/schema.sql`.

### 3. Set Secrets
In Supabase > Project Settings > Secrets, add:
```
OPENAI_API_KEY=sk-...
EMBEDDING_MODEL=text-embedding-3-small
CHAT_MODEL=gpt-4o-mini
```

### 4. Deploy Edge Functions
Install Supabase CLI, then:
```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase functions deploy chat
supabase functions deploy rag_ingest
```

### 5. Add CDN Script to Your Website
```html
<script
  src="https://cdn.jsdelivr.net/gh/your-org/dendron-cdn@v1/dist/dendron.min.js"
  data-project-ref="YOUR_PROJECT_REF"
  data-project-id="YOUR_PROJECT_ID">
</script>
```

### 6. Ingest Knowledge (Optional)
Call the `rag_ingest` function to add website content:
```bash
curl -X POST \
  https://YOUR_PROJECT_REF.functions.supabase.co/rag_ingest \
  -H "Content-Type: application/json" \
  -d '{"projectId": "YOUR_PROJECT_ID", "url": "https://your-docs.com"}'
```

## Development

### CDN Widget
```bash
cd dendron-cdn
npm install
npm run dev
```

### Build for Production
```bash
npm run build
# Output: dist/dendron.js
```

## Project Structure

```
dendron/
├── dendron-cdn/              # Frontend widget (Vite + TS)
│   └── src/
│       ├── main.ts           # Global init API
│       └── widget.ts         # Shadow DOM chat UI
├── supabase/
│   ├── functions/
│   │   ├── chat/index.ts     # Chat orchestration
│   │   └── rag_ingest/index.ts # Document ingestion
│   └── schema.sql            # Database schema
└── README.md
```

## License

MIT
