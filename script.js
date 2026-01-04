    const generateBtn = document.getElementById('generate-btn');
    const inputCard = document.getElementById('input-card');
    const loadingState = document.getElementById('loading-state');
    const resultContainer = document.getElementById('result-container');
    const headerSection = document.getElementById('header-section');
    const logoHome = document.querySelector('nav .flex.items-center.gap-2'); 

    if (logoHome) {
        logoHome.style.cursor = 'pointer';
        logoHome.addEventListener('click', () => {
            document.getElementById('user-aim').value = '';
            document.getElementById('due-date').value = '';
            document.getElementById('category').selectedIndex = 0;
            document.getElementById('difficulty').selectedIndex = 0;
            resultContainer.classList.add('hidden');
            loadingState.classList.add('hidden');
            inputCard.classList.remove('hidden');
            headerSection.classList.remove('hidden');
            window.scrollTo(0, 0);
        });
    }

    generateBtn.addEventListener('click', async () => {
        const aim = document.getElementById('user-aim').value;
        const category = document.getElementById('category').value;
        const difficulty = document.getElementById('difficulty').value;
        const dueDate = document.getElementById('due-date').value;

        if (!aim || !dueDate) return alert("Please enter your goal and a due date!");

        inputCard.classList.add('hidden');
        headerSection.classList.add('hidden');
        loadingState.classList.remove('hidden');

        const today = new Date().toISOString().split('T')[0];
        const prompt = `Act as an expert strategist. Today's date is ${today} (Year 2026).
        Goal: "${aim}". Target Date: ${dueDate}. Difficulty: ${difficulty}. Category: ${category}.
        Return ONLY JSON:
        {
        "warning": "Timeline warning or null",
        "categoryMismatch": "Mismatch message or null",
        "title": "Title",
        "description": "Short overview",
        "phases": [{"name": "Phase 1", "date": "Month/Year", "desc": "Details"}],
        "habits": ["Habit 1", "Habit 2", "Habit 3", "Habit 4", "Habit 5"],
        "hurdles": [{"issue": "Challenge", "sol": "Solution"}],
        "resources": [{"type": "BOOK", "price": "Free", "name": "Resource Name", "desc": "Description"}]
        }`;

        try {
            // --- SECURE CALL STARTS HERE ---
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: prompt })
            });

            const data = await response.json();

if (!response.ok) {
    // This catches the real error message from the server
    const errorMsg = data.error?.message || data.error || response.statusText;
    throw new Error(errorMsg);
}

// Then handle the Gemini-specific response format
if (!data.candidates || !data.candidates[0]) {
    throw new Error("AI returned an empty response. Check your API Key.");
}

let rawText = data.candidates[0].content.parts[0].text;

            let rawText = data.candidates[0].content.parts[0].text;
            const cleanJson = rawText.replace(/```json|```/g, "").trim();
            renderUI(JSON.parse(cleanJson), difficulty);
            // --- SECURE CALL ENDS HERE ---

        } catch (error) {
        console.error("Full Error:", error);
        // This will show us the REAL error message in a popup
        alert("Actual Error: " + error.message); 
        inputCard.classList.remove('hidden');
        headerSection.classList.remove('hidden');
        loadingState.classList.add('hidden');
    }
    });

    function renderUI(plan, difficulty) {
        loadingState.classList.add('hidden');
        resultContainer.classList.remove('hidden');

        let warningsHtml = '';
        if (plan.categoryMismatch) {
            warningsHtml += `<div class="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-2xl mb-4"><p class="text-blue-800 text-sm">${plan.categoryMismatch}</p></div>`;
        }
        if (plan.warning) {
            warningsHtml += `<div class="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-2xl mb-8"><p class="text-amber-800 text-sm">${plan.warning}</p></div>`;
        }

        resultContainer.innerHTML = `
            ${warningsHtml}
            <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
                <h2 class="text-3xl font-bolad text-gray-800">${plan.title}</h2>
                <p class="text-gray-600 mt-2">${plan.description}</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div class="md:col-span-2 space-y-4 border-l-2 border-dashed border-indigo-200 pl-8">
                    ${plan.phases.map((p, i) => `
                        <div class="milestone-card shadow-sm">
                            <div class="milestone-number">${i + 1}</div>
                            <div class="flex justify-between font-bold"><span>${p.name}</span><span class="text-indigo-500">${p.date}</span></div>
                            <p class="text-gray-500 text-sm mt-2">${p.desc}</p>
                        </div>`).join('')}
                </div>
                <div class="space-y-6">
                    <div class="habits-sidebar">
                        <h3 class="text-xl font-bold mb-4">Daily Habits</h3>
                        <ul class="space-y-2 text-sm">${plan.habits.map(h => `<li>• ${h}</li>`).join('')}</ul>
                    </div>
                </div>
            </div>`;
    }
