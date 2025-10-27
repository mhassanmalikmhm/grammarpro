const fetch = require('node-fetch');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Hugging Face API
    const HF_API_TOKEN = process.env.HF_API_TOKEN;
    const response = await fetch(
      'https://api-inference.huggingface.co/models/abdul-matin/omotuo-grammar-correction-v0.1',
      {
        headers: {
          'Authorization': `Bearer ${HF_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({ inputs: text }),
      }
    );

    const result = await response.json();
    
    if (result.error) {
      return res.status(500).json({ error: 'Model is loading, please try again in a few seconds' });
    }

    const correctedText = result[0]?.generated_text || text;

    res.json({
      original_text: text,
      corrected_text: correctedText,
      success: true
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};