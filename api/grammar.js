export default {
  async fetch(request) {
    const HF_URL = "https://api-inference.huggingface.co/models/abdulmatinomotoso/English_Grammar_Checker";
    const HF_TOKEN = "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"; // apna Hugging Face token

    try {
      let body;
      try {
        const json = await request.json();
        body = json.inputs; // frontend se "inputs" key aani chahiye
      } catch {
        body = await request.text();
      }

      if (!body) throw new Error("No input provided");

      const hfResponse = await fetch(HF_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: body })
      });

      const data = await hfResponse.json();

      return new Response(JSON.stringify(data), {
        status: hfResponse.status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }
  }
};
