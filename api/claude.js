export default async function handler(req, res) {
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
    const { prompt, apiKey } = req.body;
    if (!prompt || !apiKey) {
      return res.status(400).json({ error: 'Missing prompt or apiKey' });
    }
    
    // Log the prompt length and a snippet (first 200 characters)
    console.log("Received prompt length:", prompt.length);
    console.log("Prompt snippet:", prompt.slice(0, 200));
  
    const API_URL = "https://api.anthropic.com/v1/messages";
    const data = {
      model: "claude-3-opus-20240229",
      max_tokens: 100,
      messages: [{ role: "user", content: prompt }]
    };
  
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
  
      if (!response.ok) {
        console.error("Anthropic API error:", response.status, response.statusText);
        return res.status(response.status).json({ error: response.statusText });
      }
  
      const result = await response.json();
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error calling Claude API:", error);
      return res.status(500).json({ error: error.message });
    }
  }
  