module.exports = async (req, res) => {
    // 1. Setup CORS so Vercel can talk to your site
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { prompt } = req.body;
        const API_KEY = process.env.GEMINI_KEY;

        // 2. THE STABLE 2026 URL (This is the specific "Key" to the lock)
        const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();

        // 3. Smart Error Handling
        if (data.error) {
            // If it still says "limit: 0", this will catch the specific reason
            return res.status(data.error.code || 500).json({ 
                error: data.error.message || "Google API Quota Error" 
            });
        }

        // 4. Return the successful response
        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
};