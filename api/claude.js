export default async function handler(req, res) {
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
    // Read the API key from the request headers.
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
      return res.status(400).json({ error: 'Missing API key in header' });
    }
  
    // The entire request body is the payload to forward.
    const payload = req.body;
    if (!payload || Object.keys(payload).length === 0) {
      return res.status(400).json({ error: 'Missing payload' });
    }
  
    // Log a snippet from the text prompt for debugging.
    let textSnippet = '';
    try {
      textSnippet = payload.messages[0].content[0].text;
    } catch (err) {
      // No valid text found.
    }
    console.log("Received prompt snippet:", textSnippet ? textSnippet.slice(0, 200) : 'None');
  
    const API_URL = "https://api.anthropic.com/v1/messages";
  
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Anthropic API error:", response.status, response.statusText, errorText);
        return res.status(response.status).json({ error: response.statusText, details: errorText });
      }
  
      const result = await response.json();
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error calling Claude API:", error);
      return res.status(500).json({ error: error.message });
    }
  }
  