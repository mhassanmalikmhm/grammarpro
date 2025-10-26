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
// 2. HUGGING FACE API CONFIG (Grammar Model)
// ------------------------------------------------------------------

// ⚠️ Safe Mode (GitHub Pages friendly)
// Leave API_KEY empty for public hosting.
// For local use (faster response), you can paste your HF token below.
// Example (for local only): const API_KEY = "hf_xxxxxxxxxxxxxxxxxxxxx";
const API_KEY = "";

// Hugging Face Grammar Checker model
const GRAMMAR_MODEL_URL =
  "https://api-inference.huggingface.co/models/Prithivida/grammar_error_correcter_v1";

// ------------------------------------------------------------------
// 3. MAIN SCRIPT
// ------------------------------------------------------------------
window.addEventListener("DOMContentLoaded", () => {
  // --- Get UI Elements ---
  const textInput = document.getElementById("text-input");
  const wordCountDisplay = document.getElementById("word-count");
  const clearButton = document.getElementById("clear-button");
  const checkButton = document.getElementById("check-button");
  const loadingSpinner = document.querySelector(
    ".flex.w-full.flex-col.items-center.gap-4.py-8"
  );
  const resultsSection = document.getElementById("results-section");

  // --- Word Count & Clear Functions ---
  function updateWordCount() {
    const text = textInput.value;
    let wordCount = 0;
    const trimmedText = text.trim();
    if (trimmedText.length > 0) {
      wordCount = trimmedText.split(/\s+/).length;
    }
    wordCountDisplay.textContent = `${wordCount}/300 words`;
  }

  function clearText() {
    textInput.value = "";
    updateWordCount();
    resultsSection.innerHTML = ""; // Clear results
    if (loadingSpinner) {
      loadingSpinner.classList.add("hidden");
    }
  }

  // --- Add Event Listeners ---
  if (textInput) {
    textInput.addEventListener("input", updateWordCount);
  }
  if (clearButton) {
    clearButton.addEventListener("click", clearText);
  }

  // --- Main Button Event Listener ---
  if (checkButton) {
    checkButton.addEventListener("click", () => {
      const text = textInput.value;
      if (text.trim() === "") {
        showError("Please enter some text to check.");
        return;
      }
      queryGrammarModel(text);
    });
  }

  // --- Function to call the AI Model ---
  async function queryGrammarModel(text) {
    if (loadingSpinner) {
      loadingSpinner.classList.remove("hidden");
    }
    resultsSection.innerHTML = "";
    checkButton.disabled = true;

    try {
      console.log(`Querying model: ${GRAMMAR_MODEL_URL} with text: ${text}`);

      const response = await fetch(GRAMMAR_MODEL_URL, {
        headers: {
          Authorization: API_KEY ? `Bearer ${API_KEY}` : "",
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ inputs: text }),
      });

      if (!response.ok) {
        let errorBody;
        try {
          errorBody = await response.json();
        } catch (e) {
          throw new Error("API request failed. Please try again later.");
        }

        if (errorBody.error && errorBody.estimated_time) {
          throw new Error(
            `Model is loading. Please try again in ${Math.ceil(
              errorBody.estimated_time
            )} seconds.`
          );
        } else if (errorBody.error) {
          throw new Error(`API Error: ${errorBody.error}`);
        } else {
          throw new Error(`API request failed: ${response.statusText}`);
        }
      }

      const result = await response.json();
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


      if (result && result.length > 0 && result[0].length > 0) {
        const scores = result[0];
        displayResults(scores);
      } else {
        throw new Error("Invalid response structure from API.");
      }
    } catch (error) {
      console.error("Full error object:", error);
      showError(error.message);
    } finally {
      if (loadingSpinner) {
        loadingSpinner.classList.add("hidden");
      }
      checkButton.disabled = false;
    }
  }

  // --- Function to display the "Analysis" ---
  function displayResults(scores) {
    resultsSection.innerHTML = "";

    let bestResult = scores.reduce((prev, current) => {
      return prev.score > current.score ? prev : current;
    });

    const label = bestResult.label;
    const confidence = (bestResult.score * 100).toFixed(0);

    let title, message, borderColor, spanText, spanColor;

    // LABEL_1 = Correct, LABEL_0 = Incorrect
    if (label === "LABEL_1") {
      title = "Grammar Analysis ✅";
      spanText = "Correct";
      spanColor = "text-success";
      borderColor = "border-success/50 dark:border-success/40";

      if (confidence >= 95)
        message = `Excellent! The AI is ${confidence}% certain your grammar is perfect.`;
      else if (confidence >= 75)
        message = `Nice job. The AI is ${confidence}% confident this is correct.`;
      else
        message = `The AI is ${confidence}% confident this is correct, but it's not 100% sure.`;
    } else {
      title = "Grammar Analysis ⚠️";
      spanText = "Incorrect";
      spanColor = "text-warning";
      borderColor = "border-warning/50 dark:border-warning/40";

      if (confidence >= 95)
        message = `Whoops! The AI is ${confidence}% sure it found an error.`;
      else if (confidence >= 75)
        message = `The AI is ${confidence}% confident there's a mistake.`;
      else
        message = `The AI is only ${confidence}% confident, but it's leaning towards this being incorrect.`;
    }

    resultsSection.innerHTML = `
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 class="text-2xl font-bold tracking-[-0.015em] text-[#111418] dark:text-white">${title}</h2>
        <div class="flex items-center gap-4">
          <p class="text-base text-gray-600 dark:text-gray-300">
            <span class="font-bold ${spanColor}">${spanText}</span> (Confidence: ${confidence}%)
          </p>
        </div>
      </div>
      <div class="w-full rounded-xl border ${borderColor} bg-white dark:bg-gray-800 p-6 shadow-sm">
        <p class="text-base leading-relaxed text-gray-700 dark:text-gray-300">${message}</p>
      </div>
    `;
  }

  // --- Helper function for showing errors ---
  function showError(message) {
    resultsSection.innerHTML = `
      <div class="w-full rounded-xl border border-warning/50 dark:border-warning/40 bg-white dark:bg-gray-800 p-6 shadow-sm">
        <h3 class="font-bold text-base text-warning">An Error Occurred</h3>
        <p class="text-gray-600 dark:text-gray-300 text-sm mt-2">${message}</p>
      </div>
    `;
    if (loadingSpinner) {
      loadingSpinner.classList.add("hidden");
    }
  }
});