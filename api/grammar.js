export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const text = req.body.text;
  if (!text) return res.status(400).json({ error: "No text provided" });

  try {
    // Wrap fetch in async function
    const fetchGrammar = async () => {
      const response = await fetch(
        "https://patient-bread-b2c0.mhmhassanmalik.workers.dev/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ inputs: text })
        }
      );
      return await response.json();
    };

    const data = await fetchGrammar();

    res.status(200).json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server connection failed. Try again later." });
  }
}