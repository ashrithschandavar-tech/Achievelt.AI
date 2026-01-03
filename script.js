// 1. YOUR API KEY
const API_KEY = 'AIzaSyDqs1lBCmta9FHEKpws-dhQHkIoOS2rMYQ'; 

// 2. List of models to try in order of availability
const MODELS_TO_TRY = [
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-3-flash-preview'
];

const generateBtn = document.getElementById('generate-btn');
const inputCard = document.getElementById('input-card');
const loadingState = document.getElementById('loading-state');
const resultContainer = document.getElementById('result-container');
const headerSection = document.getElementById('header-section');

generateBtn.addEventListener('click', async () => {
    const aim = document.getElementById('user-aim').value;
    const category = document.getElementById('category').value;
    const difficulty = document.getElementById('difficulty').value;

    if (!aim) return alert("Please enter your goal!");

    // UI Transition
    inputCard.classList.add('hidden');
    headerSection.classList.add('hidden');
    loadingState.classList.remove('hidden');

    const prompt = `Act as an expert strategist. Create a success roadmap for: "${aim}". 
    Difficulty: ${difficulty}. Category: ${category}.
    Return ONLY a JSON object. Structure:
    {
      "title": "Title",
      "description": "Short overview",
      "phases": [{"name": "Phase 1", "date": "Month 1", "desc": "Details"}],
      "habits": ["Habit 1", "Habit 2", "Habit 3", "Habit 4", "Habit 5"],
      "hurdles": [{"issue": "Challenge", "sol": "Solution"}],
      "resources": [{"type": "BOOK", "price": "Free", "name": "Resource Name", "desc": "Description"}]
    }`;

    let success = false;

    // Loop through models until one works
    for (const model of MODELS_TO_TRY) {
        if (success) break;

        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
        
        try {
            console.log(`Trying model: ${model}...`);
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            const data = await response.json();

            if (data.error) {
                // If it's a quota error (limit 0), move to next model
                if (data.error.code === 429) {
                    console.warn(`${model} failed with quota limit 0.`);
                    continue; 
                }
                throw new Error(data.error.message);
            }

            // Extract and clean JSON
            let rawText = data.candidates[0].content.parts[0].text;
            const cleanJson = rawText.replace(/```json|```/g, "").trim();
            const plan = JSON.parse(cleanJson);
            
            renderUI(plan, difficulty);
            success = true;

        } catch (error) {
            console.error(`Error with ${model}:`, error);
        }
    }

    if (!success) {
        alert("CRITICAL ERROR: Your account has 'Limit: 0' for all models. \n\nFIX: Go to AI Studio, click 'Create API key in NEW project' and wait 10 minutes for it to activate. No bank account is needed for this.");
        // Reset UI
        inputCard.classList.remove('hidden');
        headerSection.classList.remove('hidden');
        loadingState.classList.add('hidden');
    }
});

function renderUI(plan, difficulty) {
    loadingState.classList.add('hidden');
    resultContainer.classList.remove('hidden');

    resultContainer.innerHTML = `
        <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8 animate-fade-in">
            <div class="flex justify-between items-start mb-4">
                <h2 class="text-3xl font-bold text-gray-800">${plan.title}</h2>
                <div class="flex gap-2">
                    <span class="px-3 py-1 bg-green-100 text-green-600 text-xs font-bold rounded-full tracking-wide">REALISTIC</span>
                    <span class="px-3 py-1 bg-blue-100 text-blue-600 text-xs font-bold rounded-full tracking-wide">${difficulty.toUpperCase()}</span>
                </div>
            </div>
            <p class="text-gray-600 leading-relaxed max-w-2xl">${plan.description}</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="md:col-span-2 space-y-4 relative ml-4 md:ml-8 border-l-2 border-dashed border-indigo-200 pl-8">
                <h3 class="text-xl font-bold mb-6 flex items-center gap-2"><i class="fa-solid fa-map text-indigo-500"></i> Strategic Milestones</h3>
                
                ${plan.phases.map((p, i) => `
                    <div class="milestone-card shadow-sm animate-fade-in" style="animation-delay: ${i * 0.1}s">
                        <div class="milestone-number">${i + 1}</div>
                        <div class="flex justify-between font-bold text-gray-800">
                            <span>${p.name}</span>
                            <span class="text-indigo-500 text-sm">${p.date}</span>
                        </div>
                        <p class="text-gray-500 text-sm mt-2 leading-relaxed">${p.desc}</p>
                    </div>
                `).join('')}
            </div>

            <div class="space-y-6">
                <div class="habits-sidebar shadow-lg">
                    <h3 class="text-xl font-bold mb-6 flex items-center gap-2"><i class="fa-solid fa-bolt text-yellow-400"></i> Daily Habits</h3>
                    <ul class="space-y-4 text-sm opacity-90">
                        ${plan.habits.map(h => `<li class="flex gap-2"><span>•</span> ${h}</li>`).join('')}
                    </ul>
                </div>

                <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 class="font-bold text-gray-800 mb-4">Common Hurdles</h3>
                    <div class="space-y-4">
                        ${plan.hurdles.map(h => `
                            <div>
                                <p class="font-bold text-sm text-gray-700">"${h.issue}"</p>
                                <p class="text-xs text-gray-500 mt-1">Solution: ${h.sol}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>

        <div class="mt-12 pb-20">
             <h3 class="text-xl font-bold mb-6 flex items-center gap-2 text-indigo-600"><i class="fa-solid fa-book-open"></i> Curated Resources</h3>
             <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                ${plan.resources.map(r => `
                    <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-indigo-300 transition-all cursor-pointer group">
                        <span class="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">${r.type} • ${r.price}</span>
                        <h4 class="font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">${r.name}</h4>
                        <p class="text-xs text-gray-500 mt-1 line-clamp-2">${r.desc}</p>
                    </div>
                `).join('')}
             </div>
        </div>
    `;
}