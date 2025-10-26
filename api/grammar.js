// purana (direct HF)
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

// naya (Cloudflare Worker)
const response = await fetch(
  "https://patient-bread-b2c0.mhmhassanmalik.workers.dev/",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ inputs: text })
  }
);
