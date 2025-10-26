// ------------------------------------------------------------------
// 1. TAILWIND CONFIG (Your existing code)
// ------------------------------------------------------------------
tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#137fec",
        "background-light": "#f6f7f8",
        "background-dark": "#101922",
        "success": "#28a745",
        "warning": "#dc3545",
        "suggestion": "#ffc107",
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"]
      },
      borderRadius: { "DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px" },
    },
  },
};

// ------------------------------------------------------------------
// 2. API CONFIG (Use Vercel Serverless function instead of direct Hugging Face)
// ------------------------------------------------------------------
const WORKER_URL = "/api/grammar"; // Serverless function route

// ------------------------------------------------------------------
// 3. MAIN SCRIPT
// ------------------------------------------------------------------
window.addEventListener("DOMContentLoaded", () => {
  const textInput = document.getElementById("text-input") || document.getElementById("sentenceInput");
  const checkButton = document.getElementById("check-button");
  const resultsSection = document.getElementById("results-section") || document.getElementById("result");

  if (checkButton) {
    checkButton.addEventListener("click", async () => {
      const text = textInput.value.trim();
      if (!text) {
        showError("Please enter some text to check.");
        return;
      }

      resultsSection.innerHTML = `<p class="text-yellow-400 font-semibold animate-pulse">⏳ Checking grammar... please wait.</p>`;
      checkButton.disabled = true;

      try {
        const response = await fetch(WORKER_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });

        if (!response.ok) throw new Error(`Request failed: ${response.statusText}`);
        const result = await response.json();

        const correctedText = result?.[0]?.generated_text || "No correction found.";

        if (correctedText.trim() === text.trim()) {
          resultsSection.innerHTML = `
            <div class="p-4 bg-green-900/40 border border-green-600 rounded-xl text-green-300 font-semibold">
              ✅ Grammar looks perfect!<br><br>
              <span class="text-gray-300 text-sm">"${text}"</span>
            </div>`;
        } else {
          resultsSection.innerHTML = `
            <div class="p-4 bg-red-900/40 border border-red-600 rounded-xl text-red-300">
              ❌ Correction Suggested:<br><br>
              <span class="text-gray-400">Original:</span> "${text}"<br>
              <span class="text-gray-400">Corrected:</span> <span class="text-green-300 font-semibold">"${correctedText}"</span>
            </div>`;
        }
      } catch (err) {
        console.error(err);
        showError(err.message || "Server connection failed. Try again later.");
      } finally {
        checkButton.disabled = false;
      }
    });
  }

  function showError(message) {
    resultsSection.innerHTML = `
      <div class="w-full rounded-xl border border-warning/50 dark:border-warning/40 bg-white dark:bg-gray-800 p-6 shadow-sm">
        <h3 class="font-bold text-base text-warning">An Error Occurred</h3>
        <p class="text-gray-600 dark:text-gray-300 text-sm mt-2">${message}</p>
      </div>`;
  }
});
