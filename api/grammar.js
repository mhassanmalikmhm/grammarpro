export default async function handler(req, res) {
  if (req.method !== "POST") 
    return res.status(405).json({ error: "Method not allowed" });

  const HF_API_TOKEN = process.env.HF_API_TOKEN; // apna Hugging Face token
  const text = req.body.text;

  if (!text) 
    return res.status(400).json({ error: "No text provided" });

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/abdulmatinomotoso/English_Grammar_Checker",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HF_API_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: text })
      }
    );

    if (!response.ok) throw new Error("Hugging Face API error");

    const data = await response.json();
    res.status(200).json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server connection failed. Try again later." });
  }
}
