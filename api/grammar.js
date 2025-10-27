import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.post("/", async (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "No text provided" });

    try {
        // Cloudflare Worker URL (aapka proxy URL)
        const CF_PROXY_URL = "https://patient-bread-b2c0.mhmhassanmalik.workers.dev/";

        const response = await fetch(CF_PROXY_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text })
        });

        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch from HF API" });
    }
});

export default router;