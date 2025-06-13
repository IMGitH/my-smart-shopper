/* global process */
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
app.use(cors());
app.use(express.json());

/* ──────────────────────────────
   Health-check (Render & Hosting)
   ────────────────────────────── */
app.get(['/health', '/api/health'], (_, res) =>
  res.status(200).send('OK')
);

/* ──────────────────────────────
   Simple GET so a browser never 404s
   ────────────────────────────── */
app.get('/api/autoMapItems', (_, res) =>
  res.status(200).json({ status: 'alive' })
);

/* ──────────────────────────────
   Helper: call Gemini with retries
   ────────────────────────────── */
async function callGemini(prompt, retries = 2) {
  const { GEMINI_API_KEY } = process.env;
  const body = JSON.stringify({
    contents: [{ role: 'user', parts: [{ text: prompt }] }]
  });

  for (let attempt = 0; attempt <= retries; attempt++) {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body }
    );

    if (resp.ok) return resp.json();               // 2xx → success
    if (resp.status >= 500 && attempt < retries) { // transient
      await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
      continue;
    }
    const text = await resp.text();
    throw new Error(`Gemini ${resp.status}: ${text}`);
  }
}

/* ──────────────────────────────
   Main POST endpoint
   ────────────────────────────── */
app.post('/api/autoMapItems', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

  try {
    const result = await callGemini(prompt);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(503).json({ error: 'Gemini temporarily unavailable' });
  }
});

/* ──────────────────────────────
   Demo endpoint (unchanged)
   ────────────────────────────── */
app.get('/api/hello', (_req, res) =>
  res.json({ message: 'Hello from Cloud Run!' })
);

/* ────────────────────────────── */
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
