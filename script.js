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
// 2. API CONFIG (Use Cloudflare Worker instead of direct Hugging Face)
// ------------------------------------------------------------------

// ⚠️ Safe Mode (API key is stored in Cloudflare Worker)
const WORKER_URL = "https://patient-bread-b2c0.mhmhassanmalik.workers.dev/";

// ------------------------------------------------------------------
// 3. MAIN SCRIPT
// ------------------------------------------------------------------
window.addEventListener("DOMContentLoaded", () => {
  const textInput = document.getElementById("text-input");
  const wordCountDisplay = document.getElementById("word-count");
  const clearButton = document.getElementById("clear-button");
  const checkButton = document.getElementById("check-button");
  const loadingSpinner = document.querySelector(".flex.w-full.flex-col.items-center.gap-4.py-8");
  const resultsSection = document.getElementById("results-section");

  function updateWordCount() {
    const text = textInput.value.trim();
    const wordCount = text.length > 0 ? text.split(/\s+/).length : 0;
    wordCountDisplay.textContent = `${wordCount}/300 words`;
  }

  function clearText() {
    textInput.value = "";
    updateWordCount();
    resultsSection.innerHTML = "";
    if (loadingSpinner) loadingSpinner.classList.add("hidden");
  }

  if (textInput) textInput.addEventListener("input", updateWordCount);
  if (clearButton) clearButton.addEventListener("click", clearText);

  if (checkButton) {
    checkButton.addEventListener("click", () => {
      const text = textInput.value.trim();
      if (!text) {
        showError("Please enter some text to check.");
        return;
      }
      queryGrammarModel(text);
    });
  }

  // --- Send request to Cloudflare Worker ---
  async function queryGrammarModel(text) {
    if (loadingSpinner) loadingSpinner.classList.remove("hidden");
    resultsSection.innerHTML = "";
    checkButton.disabled = true;

    try {
      const response = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputs: text }), // ✅ Proper JSON format
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.statusText}`);
      }

      const result = await response.json();

      // ✅ Handle corrected text (for text generation models)
      if (Array.isArray(result) && result[0]?.generated_text) {
        const correctedText = result[0].generated_text;
        resultsSection.innerHTML = `
          <div class="w-full rounded-xl border border-success/50 bg-white dark:bg-gray-800 p-6 shadow-sm">
            <h2 class="font-bold text-xl text-success mb-2">Corrected Text ✅</h2>
            <p class="text-gray-700 dark:text-gray-300">${correctedText}</p>
          </div>
        `;
        return;
      }

      // ⚠️ Handle unexpected responses
      if (!result || typeof result !== "object") {
        throw new Error("Invalid or empty response from API.");
      }

      resultsSection.innerHTML = `
        <div class="w-full rounded-xl border border-warning/50 dark:border-warning/40 bg-white dark:bg-gray-800 p-6 shadow-sm">
          <h3 class="font-bold text-base text-warning">Unexpected Response</h3>
          <pre class="text-gray-600 dark:text-gray-300 text-sm mt-2">${JSON.stringify(result, null, 2)}</pre>
        </div>
      `;
    } catch (error) {
      console.error("Error:", error);
      showError(error.message);
    } finally {
      if (loadingSpinner) loadingSpinner.classList.add("hidden");
      checkButton.disabled = false;
    }
  }

  // --- Error UI ---
  function showError(message) {
    resultsSection.innerHTML = `
      <div class="w-full rounded-xl border border-warning/50 dark:border-warning/40 bg-white dark:bg-gray-800 p-6 shadow-sm">
        <h3 class="font-bold text-base text-warning">An Error Occurred</h3>
        <p class="text-gray-600 dark:text-gray-300 text-sm mt-2">${message}</p>
      </div>
    `;
    if (loadingSpinner) loadingSpinner.classList.add("hidden");
  }
});
