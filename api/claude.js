async function callClaudeApi(prompt, apiKey) {
    // Use the deployed endpoint URL
    const proxyURL = '/api/claude'; // Relative path works on the deployed site
    const data = { prompt, apiKey };
    
    const response = await fetch(proxyURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    
    if (!response.ok) {
        throw new Error(`Proxy error: ${response.statusText}`);
    }
    
    const result = await response.json();
    return (result.content && result.content[0] && result.content[0].text)
        ? result.content[0].text
        : "No response from Claude";
}
