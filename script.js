document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("grammar-form");
    const input = document.getElementById("sentence");
    const resultsSection = document.getElementById("results");

    if (!form || !input || !resultsSection) {
        console.error("Required DOM elements not found!");
        return;
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        resultsSection.innerHTML = `<p class="text-yellow-400 font-semibold">Checking...</p>`;
        const sentence = input.value.trim();
        if (!sentence) return;

        try {
            const response = await fetch("https://patient-bread-b2c0.mhmhassanmalik.workers.dev/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: sentence })
            });

            const data = await response.json();
            const resultArray = data?.[0];
            if (!resultArray || !Array.isArray(resultArray)) throw new Error("Invalid response");

            const correctLabel = resultArray.find(item => item.label === "LABEL_1") ? "LABEL_1" : "LABEL_0";

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
});