document.getElementById("check-button").addEventListener("click", async () => {
    const textInput = document.getElementById("text-input").value.trim();
    const resultsSection = document.getElementById("results-section");

    if (!textInput) {
        resultsSection.innerHTML = `<p class="text-red-400 font-semibold">⚠️ Please enter a sentence first.</p>`;
        return;
    }

    resultsSection.innerHTML = `<p class="text-yellow-400 font-semibold animate-pulse">⏳ Checking grammar... please wait.</p>`;

    try {
        const res = await fetch("/api/grammar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: textInput }),
        });

        const data = await res.json();
        const label = data?.[0]?.label;

        if (!label) throw new Error("Invalid response from model");

        if (label === "LABEL_1") {
            resultsSection.innerHTML = `
                <div class="p-4 bg-green-900/40 border border-green-600 rounded-xl text-green-300 font-semibold text-center">
                    ✅ Grammar looks perfect!
                </div>`;
        } else {
            resultsSection.innerHTML = `
                <div class="p-4 bg-red-900/40 border border-red-600 rounded-xl text-red-300 font-semibold text-center">
                    ❌ Grammar incorrect!
                </div>`;
        }

    } catch (err) {
        console.error(err);
        resultsSection.innerHTML = `<p class="text-red-400 font-semibold">🚫 Server connection failed. Try again later.</p>`;
    }
});