/* global process */
import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

/* ──────────────────────────────────────────────
   1. Health-check endpoint for Render
   ──────────────────────────────────────────── */
app.get('/health', (_req, res) => {
  res.status(200).send('OK');
});

/* ──────────────────────────────────────────────
   2. Simple GET so hitting the URL in a browser
      (or curl -I) never 404s
   ──────────────────────────────────────────── */
app.get('/api/autoMapItems', (_req, res) => {
  res.status(200).json({ status: 'alive' });
});

/* ──────────────────────────────────────────────
   Existing POST endpoint – keeps full Gemini logic
   ──────────────────────────────────────────── */
app.post('/api/autoMapItems', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  try {
    const { GEMINI_API_KEY } = process.env;
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    const result = await response.json();
    console.log('Gemini response:', JSON.stringify(result));
    res.status(200).json(result);
  } catch (error) {
    console.error('Gemini API error:', error);
    res.status(500).json({ error: 'Gemini API call failed' });
  }
});

/* ──────────────────────────────────────────────
   Demo endpoint you already had
   ──────────────────────────────────────────── */
app.get('/api/hello', (_req, res) => {
  res.json({ message: 'Hello from Cloud Run!' });
});

/* ────────────────────────────────────────────── */
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
