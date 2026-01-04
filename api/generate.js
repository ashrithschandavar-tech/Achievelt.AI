export default async function handler(req, res) {
  const { prompt } = req.body; // Gets the prompt from your script.js
  const API_KEY = process.env.GEMINI_KEY; // Grabs the key from the .env

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
  });

  const data = await response.json();
  res.status(200).json(data); // Sends the AI's answer back to your script.js
}