const fetch = require('node-fetch');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (text.length > 1000) {
      return res.status(400).json({ error: 'Text too long. Maximum 1000 characters allowed.' });
    }

    // Hugging Face API configuration
    const HF_API_TOKEN = process.env.HF_API_TOKEN;
    
    if (!HF_API_TOKEN) {
      console.error('HF_API_TOKEN environment variable not set');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const HF_MODEL = "abdul-matin/omotuo-grammar-correction-v0.1";

    console.log('Calling Hugging Face API for text:', text.substring(0, 50) + '...');

    // Call Hugging Face API
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${HF_MODEL}`,
      {
        headers: {
          'Authorization': `Bearer ${HF_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({ inputs: text }),
      }
    );

    const responseText = await response.text();
    console.log('Hugging Face response status:', response.status);
    console.log('Hugging Face response:', responseText.substring(0, 200));

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.status} - ${responseText}`);
    }

    let hfResult;
    try {
      hfResult = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error('Invalid JSON response from API');
    }
    
    if (!hfResult || !hfResult[0] || !hfResult[0].generated_text) {
      console.error('Invalid response structure:', hfResult);
      throw new Error('Invalid response from grammar model');
    }

    const correctedText = hfResult[0].generated_text;
    const explanations = analyzeGrammarCorrection(text, correctedText);

    return res.status(200).json({
      original_text: text,
      corrected_text: correctedText,
      explanations: explanations,
      confidence: 'high'
    });

  } catch (error) {
    console.error('Grammar check error:', error);
    
    // Better error handling
    return res.status(500).json({ 
      error: 'Grammar check service is temporarily unavailable. Please try again in a few moments.' 
    });
  }
};

function analyzeGrammarCorrection(original, corrected) {
  const explanations = [];
  
  const originalWords = original.split(/\s+/);
  const correctedWords = corrected.split(/\s+/);
  
  let i = 0, j = 0;
  while (i < originalWords.length && j < correctedWords.length) {
    if (originalWords[i] !== correctedWords[j]) {
      explanations.push({
        original: originalWords[i] || '',
        corrected: correctedWords[j] || '',
        explanation: getGrammarExplanation(originalWords[i], correctedWords[j])
      });
    }
    i++;
    j++;
  }
  
  return explanations;
}

function getGrammarExplanation(original, corrected) {
  const explanations = {
    'is': 'Verb agreement correction',
    'are': 'Verb agreement correction',
    'was': 'Verb agreement correction', 
    'were': 'Verb agreement correction',
    'have': 'Verb agreement correction',
    'has': 'Verb agreement correction',
    'do': 'Verb agreement correction',
    'does': 'Verb agreement correction'
  };
  
  return explanations[original.toLowerCase()] || 'Grammar improvement applied';
}