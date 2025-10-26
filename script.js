// script.js
document.getElementById("checkBtn").addEventListener("click", async () => {
  const text = document.getElementById("inputText").value;
  const resultArea = document.getElementById("result");

  if (!text.trim()) {
    resultArea.textContent = "Please enter some text first.";
    return;
  }

  resultArea.textContent = "Checking grammar...";

  try {
    const response = await fetch("https://api.languagetool.org/v2/check", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        text: text,
        language: "en-US",
      }),
    });

    const data = await response.json();

    if (!data.matches.length) {
      resultArea.textContent = "✅ No grammar issues found!";
      return;
    }

    let output = "";
    data.matches.forEach((match, i) => {
      output += `${i + 1}. ${match.message}\n→ Suggestion: ${match.replacements.map(r => r.value).join(", ")}\n\n`;
    });

    resultArea.textContent = output;
  } catch (error) {
    resultArea.textContent = "⚠️ Error: Could not connect to grammar API.";
    console.error(error);
  }
});