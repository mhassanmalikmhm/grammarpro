// ------------------------------------------------------------------
// 1. TAILWIND CONFIG
// ------------------------------------------------------------------
tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#00f5d4",
        secondary: "#f72585",
        accent: "#e0aaff",
        "background-dark": "#120c18",
      },
      fontFamily: { display: ["Poppins", "sans-serif"] },
      borderRadius: { DEFAULT: "1rem" },
    },
  },
};

// ------------------------------------------------------------------
// 2. API CONFIG
// ------------------------------------------------------------------
const WORKER_URL = "https://patient-bread-b2c0.mhmhassanmalik.workers.dev/";

// ------------------------------------------------------------------
// 3. MAIN SCRIPT
// ------------------------------------------------------------------
window.addEventListener("DOMContentLoaded", () => {
  const textInput = document.getElementById("text-input");
  const checkButton = document.getElementById("check-button");
  const resultsSection = document.getElementById("results-section");

  checkButton.addEventListener("click", async () => {
    const text = textInput.value.trim();

    if (!text) {
      resultsSection.innerHTML = `<p class="text-red-400 font-semibold">⚠️ Please enter a sentence first.</p>`;
      return;
    }

    resultsSection.innerHTML = `<p class="text-yellow-400 font-semibold animate-pulse">⏳ Checking grammar...</p>`;
    checkButton.disabled = true;

    try {
      const res = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputs: text }) // "inputs" key must match Worker
      });

      const data = await res.json();

      // data ka structure: [{ label: "LABEL_0", score: 0.99 }, ...]
      if (!Array.isArray(data) || !data[0]?.label) {
        resultsSection.innerHTML = `<p class="text-warning">No output from model</p>`;
      } else {
        const label = data[0].label;
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
      }

    } catch (err) {
      console.error(err);
      resultsSection.innerHTML = `<p class="text-red-400 font-semibold">🚫 Server connection failed. Try again later.</p>`;
    } finally {
      checkButton.disabled = false; // ensure button is always re-enabled
    }
  });
});