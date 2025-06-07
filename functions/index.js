/* eslint-env node, commonjs */
/* global require, exports, process */
// Backend endpoint to securely access Gemini API:
// secure Gemini proxy. Only backend sees the API key

const functions = require("firebase-functions");
const fetch = require("node-fetch");

async function geminiHandler(req, res) {
  res.set("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Methods", "POST");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).send("");
  }
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Missing prompt" });
  }

  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              item: { type: "STRING" },
              section: { type: "STRING" }
            },
            propertyOrdering: ["item", "section"]
          }
        }
      }
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );

    const result = await response.json();

    let parsed = null;
    const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text === "string") {
      try {
        parsed = JSON.parse(text);
    } catch {
        // return raw text if it isn't valid JSON
        parsed = text;
      }
    }

    res.status(200).json(parsed ?? result);
  } catch (error) {
    console.error("Gemini API error:", error);
    res.status(500).json({ error: "Gemini API call failed" });
  }
}

exports.autoMapItems = functions.https.onRequest(geminiHandler);
exports.gemini = functions.https.onRequest(geminiHandler);

async function typoHandler(req, res) {
  res.set("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Methods", "POST");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).send("");
  }
  const { items } = req.body;
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: "Missing items" });
  }
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const prompt = `Correct spelling mistakes in the following grocery items and return a JSON array of corrected strings. Items: ${items.join(', ')}`;
    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: { responseMimeType: "application/json" }
    };
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );
    const result = await response.json();

    let parsed = null;
    const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text === "string") {
      try {
        parsed = JSON.parse(text);
    } catch {
        parsed = text;
      }
    }

    res.status(200).json(parsed ?? result);
  } catch (error) {
    console.error("Gemini typo API error:", error);
    res.status(500).json({ error: "Gemini API call failed" });
  }
}

exports.correctTypos = functions.https.onRequest(typoHandler);
