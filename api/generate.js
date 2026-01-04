module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    
    try {
        const { prompt } = req.body;
        const API_KEY = process.env.GEMINI_KEY;

        // UPDATED URL: Using the stable v1 path and the 2.0-flash model 
        // which is the 2026 default for India
        const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();
        
        // If Google sends back an error or empty candidates
        if (data.error || !data.candidates || data.candidates.length === 0) {
            const msg = data.error?.message || "Model is busy or restricted in your region.";
            return res.status(200).json({ error: msg });
        }

        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: "Server error: " + error.message });
    }
};