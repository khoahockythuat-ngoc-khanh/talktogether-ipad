# TalkTogether iPad Prototype

An iPad-first AAC conversation prototype based on the research proposal flow:

1. Choose a conversation topic
2. Parent receives suggested questions
3. Child responds with AAC cards grouped by topic/action/emotion
4. Device speaks the selected response
5. Parent receives a follow-up prompt
6. Conversation view
7. Session summary with research metrics
8. Local conversation history

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Run on an iPad on the same Wi-Fi

Start Next.js so it listens on your network:

```bash
npm run dev -- -H 0.0.0.0
```

Find your computer's local IP address and open on iPad Safari:

```text
http://YOUR-COMPUTER-IP:3000
```

For presentation, Safari → Share → **Add to Home Screen**. Open TalkTogether from the iPad Home Screen for a standalone app-like experience.

## Included demo features

- iPad-first responsive layout (portrait priority, landscape supported)
- AAC cards with selected state
- Quick responses: Có / Không / Con không biết
- Vietnamese browser text-to-speech via `speechSynthesis`
- Offline-style built-in suggestion flow (no API required for demo)
- Session metrics: turns, response time placeholder, AI suggestion count, “show more” count
- Local history using `localStorage`
- PWA manifest / Apple standalone metadata

## Important prototype note

The current “AI” questions are a safe built-in demo suggestion set. This makes the competition demo stable even without internet. A real AI API can be connected later, while still constraining outputs to an approved question/AAC vocabulary set.
