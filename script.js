// script.js

document.getElementById("check-button").addEventListener("click", async () => {
    const textInput = document.getElementById("text-input").value.trim();
    const resultsSection = document.getElementById("results-section");

    // Agar input empty hai
    if (!textInput) {
        resultsSection.innerHTML = `<p class="text-red-400 font-semibold">⚠️ Please enter a sentence first.</p>`;
        return;
    }

    // Loading message
    resultsSection.innerHTML = `<p class="text-yellow-400 font-semibold animate-pulse">⏳ Checking grammar... please wait.</p>`;

    try {
        // Server ko POST request bhejna
        const res = await fetch("/api/grammar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: textInput }),
        });

        const data = await res.json();

        // HF API se aaya response array
        const resultArray = data?.[0]; // ye array of objects
        if (!resultArray || !Array.isArray(resultArray)) throw new Error("Invalid response");

        // LABEL_1 ka matlab correct grammar
        const correctLabel = resultArray.find(item => item.label === "LABEL_1") ? "LABEL_1" : "LABEL_0";

        // Result show karna
        if (correctLabel === "LABEL_1") {
            resultsSection.innerHTML = `
                <div class="p-4 bg-green-900/40 border border-green-600 rounded-xl text-green-300 font-semibold text-center">
                    ✅ Grammar looks good!
                </div>`;
        } else {
            resultsSection.innerHTML = `
                <div class="p-4 bg-red-900/40 border border-red-600 rounded-xl text-red-300 font-semibold text-center">
                    ❌ Grammar needs correction!
                </div>`;
        }

    } catch (err) {
        console.error(err);
        resultsSection.innerHTML = `<p class="text-red-400 font-semibold">🚫 Server connection failed. Try again later.</p>`;
    }
});