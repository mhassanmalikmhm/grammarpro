import express from "express";
import path from "path";
import fetch from "node-fetch"; // HF API ke liye
import { fileURLToPath } from "url";

const app = express();
const PORT = 3000;

// ES module ke liye __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(express.json());
app.use(express.static(__dirname)); // serve all frontend files

// Grammar check route
app.post("/api/grammar", async (req, res) => {
  const text = req.body.text;

  if (!text) {
    return res.status(400).json({ error: "No text provided" });
  }

  try {
    // HF API call
    const response = await fetch("https://api-inference.huggingface.co/models/abdulmatinomotoso/English_Grammar_Checker", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: text }),
    });

    const result = await response.json();

    if (!result || !Array.isArray(result[0])) {
      return res.status(500).json({ error: "Invalid response from model" });
    }

    res.json(result[0]); // LABEL_0 / LABEL_1 array
  } catch (err) {
    console.error("HF API error:", err);
    res.status(500).json({ error: "Server connection failed" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});