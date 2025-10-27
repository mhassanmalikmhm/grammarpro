// api/grammar.js
import express from "express";
import fetch from "node-fetch"; // npm install node-fetch

const router = express.Router();

// Make sure to set your Hugging Face token in environment variables
const HF_TOKEN = process.env.HF_TOKEN;

router.post("/", async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) return res.status(400).json({ error: "Text is required" });

        const response = await fetch("https://api-inference.huggingface.co/models/abdulmatinomotoso/English_Grammar_Checker", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${HF_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ inputs: text }),
        });

        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error("HF API Error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;