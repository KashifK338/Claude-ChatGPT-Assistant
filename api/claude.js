export default async function handler(req, res) {
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
    // Expect the full payload (including messages) along with the API key.
    const { apiKey, ...payload } = req.body;
    if (!apiKey || !payload) {
      return res.status(400).json({ error: 'Missing payload or apiKey' });
    }
  
    // Optional: Log a snippet of the text prompt for debugging
    const textSnippet = payload.messages &&
                        payload.messages[0] &&
                        payload.messages[0].content &&
                        payload.messages[0].content[0] &&
                        payload.messages[0].content[0].text;
    console.log("Received prompt snippet:", textSnippet ? textSnippet.slice(0, 200) : '');
  
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
  