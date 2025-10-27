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

  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
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
    const HF_MODEL = "abdul-matin/omotuo-grammar-correction-v0.1";

    console.log('Processing text:', text.substring(0, 50) + '...');

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

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.status}`);
    }

    const hfResult = await response.json();
    
    if (!hfResult || !hfResult[0] || !hfResult[0].generated_text) {
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
    
    // Fallback basic grammar correction if API fails
    if (error.message.includes('Hugging Face API')) {
      const fallbackCorrections = {
        'i is': 'I am',
        'you is': 'you are', 
        'he are': 'he is',
        'she are': 'she is',
        'we is': 'we are',
        'they is': 'they are',
        'i has': 'I have',
        'you has': 'you have',
        'he have': 'he has',
        'she have': 'she has'
      };
      
      let correctedText = req.body.text;
      Object.keys(fallbackCorrections).forEach(wrong => {
        const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
        correctedText = correctedText.replace(regex, fallbackCorrections[wrong]);
      });
      
      return res.json({
        original_text: req.body.text,
        corrected_text: correctedText,
        explanations: [],
        confidence: 'low',
        note: 'Using fallback correction'
      });
    } else {
      return res.status(500).json({ 
        error: 'Failed to check grammar. Please try again.' 
      });
    }
  }
};

function analyzeGrammarCorrection(original, corrected) {
  const explanations = [];
  
  const originalWords = original.toLowerCase().split(/\s+/);
  const correctedWords = corrected.toLowerCase().split(/\s+/);
  
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
  const verbAgreements = {
    'is': 'are',
    'are': 'is', 
    'was': 'were',
    'were': 'was',
    'have': 'has',
    'has': 'have',
    'do': 'does',
    'does': 'do'
  };
  
  if (verbAgreements[original] === corrected) {
    return 'Subject-verb agreement correction';
  }
  
  const tenseCorrections = {
    'go': 'went',
    'see': 'saw',
    'eat': 'ate',
    'run': 'ran'
  };
  
  if (tenseCorrections[original] === corrected) {
    return 'Verb tense correction';
  }
  
  return 'Grammar correction applied';
}