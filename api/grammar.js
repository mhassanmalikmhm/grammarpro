export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const text = req.body.text || req.body.inputs; // dono check
  if (!text) return res.status(400).json({ error: "No text provided" });

  try {
    const response = await fetch(
      "https://patient-bread-b2c0.mhmhassanmalik.workers.dev/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputs: text }) // inputs key hi Worker expect karta hai
      }
    );

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server connection failed. show results." });
  }
}