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
        success: "#28a745",
        warning: "#dc3545",
      },
      fontFamily: {
        display: ["Poppins", "sans-serif"],
      },
      borderRadius: { DEFAULT: "1rem" },
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
  const checkButton = document.querySelector("button"); // design ke hisaab se first button
  const resultsSection = document.querySelector("div.mt-2 > p")?.parentElement; // result div wrapper

  // --- Send request to Serverless Function ---
  async function queryGrammarModel(text) {
    resultsSection.innerHTML = `<p class="text-yellow-400 font-semibold animate-pulse">⏳ Checking grammar... please wait.</p>`;
    checkButton.disabled = true;

    try {
      const response = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error(`Request failed: ${response.statusText}`);

      const data = await response.json();
      const label = data?.[0]?.label;
      const score = (data?.[0]?.score * 100).toFixed(2);

      if (!label) throw new Error("Invalid response from model");

      if (label === "LABEL_1") {
        resultsSection.innerHTML = `
          <p class="text-success font-semibold text-center">
            ✅ Grammar looks perfect! (Confidence: ${score}%)
          </p>`;
      } else {
        resultsSection.innerHTML = `
          <p class="text-warning font-semibold text-center">
            ❌ Grammar incorrect! (Confidence: ${score}%)
          </p>`;
      }
    } catch (error) {
      console.error("Error:", error);
      resultsSection.innerHTML = `<p class="text-warning font-semibold text-center">🚫 Server connection failed. Try again later.</p>`;
    } finally {
      checkButton.disabled = false;
    }
  }

  // --- Button click ---
  if (checkButton) {
    checkButton.addEventListener("click", () => {
      const text = textInput.value.trim();
      if (!text) {
        resultsSection.innerHTML = `<p class="text-warning font-semibold text-center">⚠️ Please enter some text first.</p>`;
        return;
      }
      queryGrammarModel(text);
    });
  }
});
