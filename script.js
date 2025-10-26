// ------------------------------------------------------------------
// 1. TAILWIND CONFIG
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
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"]
      },
      borderRadius: { "DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px" },
    },
  },
};

// ------------------------------------------------------------------
// 2. API CONFIG (Serverless function)
// ------------------------------------------------------------------
const WORKER_URL = "/api/grammar"; // serverless function URL

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

  // --- Send request to Serverless Function ---
  async function queryGrammarModel(text) {
    if (loadingSpinner) loadingSpinner.classList.remove("hidden");
    resultsSection.innerHTML = "";
    checkButton.disabled = true;

    try {
      const response = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.statusText}`);
      }

      const data = await response.json();

      // ✅ Handle classification response
      const label = data?.[0]?.label;
      const score = (data?.[0]?.score * 100).toFixed(2);

      if (!label) throw new Error("Invalid response from model");

      if (label === "LABEL_1") {
        resultsSection.innerHTML = `
          <div class="w-full rounded-xl border border-success/50 bg-white dark:bg-gray-800 p-6 shadow-sm text-center">
            ✅ Grammar looks perfect! (Confidence: ${score}%)
          </div>`;
      } else {
        resultsSection.innerHTML = `
          <div class="w-full rounded-xl border border-warning/50 bg-white dark:bg-gray-800 p-6 shadow-sm text-center">
            ❌ Grammar incorrect! (Confidence: ${score}%)
          </div>`;
      }

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
      <div class="w-full rounded-xl border border-warning/50 dark:border-warning/40 bg-white dark:bg-gray-800 p-6 shadow-sm text-center">
        <h3 class="font-bold text-base text-warning">An Error Occurred</h3>
        <p class="text-gray-600 dark:text-gray-300 text-sm mt-2">${message}</p>
      </div>
    `;
    if (loadingSpinner) loadingSpinner.classList.add("hidden");
  }
});
