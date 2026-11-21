import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.json({ limit: '20kb' }));
app.use(express.static(__dirname));

app.post('/api/analyze', async (req, res) => {
  const idea = typeof req.body?.idea === 'string' ? req.body.idea.trim() : '';
  if (idea.length < 12) return res.status(400).json({ error: 'Please provide a little more detail about your idea.' });
  if (idea.length > 4000) return res.status(400).json({ error: 'Please keep your idea under 4,000 characters.' });
  if (!process.env.GEMINI_API_KEY) return res.status(503).json({ error: 'AI is not configured yet. Add the Gemini API key on the server.' });

  const prompt = `You are Hypra Vision, an idea-to-project planning assistant. Analyze the user's idea clearly and practically. Keep guidance age-appropriate, safe, and honest; avoid dangerous step-by-step instructions. Never invent prices or claim verification. Return ONLY valid JSON with keys: title (short), overview (2-4 sentences), feasibility (array of 3 strings), requirements (array of 3-5 strings), steps (array of 5 strings), risks (array of 3 strings), improvements (array of 3 strings). Make it specific to the idea. Idea: ${idea}`;
  try {
    const apiResp = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json', temperature: 0.6 } })
    });
    const raw = await apiResp.json();
    if (!apiResp.ok) {
      console.error('Gemini API error', raw?.error?.message || apiResp.status);
      return res.status(502).json({ error: 'The AI service could not complete the analysis. Please try again later.' });
    }
    const text = raw?.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('');
    if (!text) return res.status(502).json({ error: 'The AI returned an empty response. Try again.' });
    const result = JSON.parse(text);
    const arrays = ['feasibility','requirements','steps','risks','improvements'];
    if (!result.title || !result.overview || arrays.some(k => !Array.isArray(result[k]))) {
      return res.status(502).json({ error: 'The AI response format was unexpected. Please try again.' });
    }
    res.json(result);
  } catch (e) {
    console.error('AI analysis error:', e.message);
    res.status(500).json({ error: 'An unexpected error occurred. Please try again.' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Hypra Vision server running on port ${port}`));
