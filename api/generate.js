module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { prompt } = req.body;
        const API_KEY = process.env.GEMINI_KEY;

        // UPDATED URL: Using v1beta and ensuring model name is exact
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();
        
        // Detailed error reporting so we know exactly what Google says
        if (data.error) {
            console.error("Google API Error:", data.error);
            return res.status(data.error.code || 500).json({ 
                error: data.error.message || "Google API Error" 
            });
        }

        return res.status(200).json(data);

    } catch (error) {
        console.error("Server Crash:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};