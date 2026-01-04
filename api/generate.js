module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { prompt } = req.body;
        
        // .trim() removes any hidden spaces that cause the "Invalid" error
        const API_KEY = process.env.GEMINI_KEY?.trim(); 

        if (!API_KEY) {
            return res.status(500).json({ error: "API Key is missing in Vercel settings." });
        }

        // Using v1 (Stable) instead of v1beta
        const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();

        if (data.error) {
            return res.status(data.error.code || 500).json({ 
                error: `Google says: ${data.error.message}` 
            });
        }

        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json({ error: "Connection Error: " + error.message });
    }
};