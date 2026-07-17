export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, system } = req.body;

    const contents = (messages || []).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: contents
      })
    });

    const data = await response.json();

    if (data?.error) {
      return res.status(200).json({ content: [{ type: 'text', text: '⚠️ خطأ من Gemini: ' + JSON.stringify(data.error) }] });
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
      || ('⚠️ رد غير متوقع: ' + JSON.stringify(data).slice(0, 500));

    res.status(200).json({ content: [{ type: 'text', text }] });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
                                      }
