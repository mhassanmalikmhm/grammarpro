import fetch from "node-fetch";
import express from "express";

const router = express.Router();
const HF_TOKEN = process.env.HF_API_TOKEN; // Make sure this matches your environment variable

router.post("/", async (req, res) => {
    try {
        const text = req.body.text;
        if (!text) return res.status(400).json({ error: "No text provided" });

        console.log("Sending to HF API:", text);

        const response = await fetch(
            "https://api-inference.huggingface.co/models/abdulmatinomotoso/English_Grammar_Checker",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${HF_TOKEN}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ inputs: text }),
            }
        );

        const data = await response.json();
        console.log("HF API response:", data);

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "HF API request failed" });
    }
});

export default router;