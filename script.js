// ------------------------------------------------------------------
// 1. TAILWIND CONFIG (tumhari design ke hisaab se)
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
const WORKER_URL = "/api/grammer";

// ------------------------------------------------------------------
// 3. MAIN SCRIPT
// ------------------------------------------------------------------
window.addEventListener("DOMContentLoaded", () => {
  const textInput = document.getElementById("text-input");
  const checkButton = document.querySelector("button");
  const resultsSection = document.querySelector("div.mt-2.min-h-[6rem]");

  checkButton.addEventListener("click", async () => {
    const text = textInput.value.trim();
    if (!text) {
      resultsSection.innerHTML = `<p class="text-slate-500">Please enter some text.</p>`;
      return;
    }

    resultsSection.innerHTML = `<p class="text-slate-400">Checking grammar...</p>`;
    checkButton.disabled = true;

    try {
      const res = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });

      const data = await res.json();

      if (data.error) {
        resultsSection.innerHTML = `<p class="text-warning">${data.error}</p>`;
      } else {
        // Hugging Face model ka output usually ek array of objects hota hai
        resultsSection.innerHTML = `<p class="text-slate-200">${data[0].generated_text || "No output"}</p>`;
      }

    } catch (err) {
      resultsSection.innerHTML = `<p class="text-warning">Server connection failed. Try again later.</p>`;
      console.error(err);
    } finally {
      checkButton.disabled = false;
    }
  });
});
