module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { prompt } = req.body;
        // This MUST match the new name we put in Vercel
        const API_KEY = process.env.GEMINI_API_KEY_FINAL; 

        // 2026 STABLE ENDPOINT
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
                error: data.error.message 
            });
        }

        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json({ error: "System Connection Error" });
    }
};