module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    
    try {
        const { prompt } = req.body;
        const API_KEY = process.env.GEMINI_KEY;
        
        // Using the 2.0-flash model which replaced the 1.5 versions in late 2025
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();
        
        // This is the most important part for you right now:
        // If Google sends back an empty list, we tell you WHY.
        if (!data.candidates || data.candidates.length === 0) {
            const finishReason = data.candidates?.[0]?.finishReason || "UNKNOWN";
            const safety = JSON.stringify(data.promptFeedback) || "No safety info";
            return res.status(200).json({ 
                error: `Empty Response. Reason: ${finishReason}. Safety: ${safety}`,
                fullDebug: data 
            });
        }

        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: "Server error: " + error.message });
    }
};