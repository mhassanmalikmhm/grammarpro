const HF_API_TOKEN = process.env.HF_API_TOKEN;

const response = await fetch(
    "https://api-inference.huggingface.co/models/textattack/bert-base-uncased-CoLA",
    {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${HF_API_TOKEN}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: text })
    }
);

const data = await response.json();
