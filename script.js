document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const settingsButton = document.getElementById('settingsButton');
    const apiSettingsModal = document.getElementById('apiSettingsModal');
    const cancelApiSettings = document.getElementById('cancelApiSettings');
    const saveApiSettings = document.getElementById('saveApiSettings');
    const claudeApiKeyInput = document.getElementById('claudeApiKey');
    const chatgptApiKeyInput = document.getElementById('chatgptApiKey');
    const editClaudeKey = document.getElementById('editClaudeKey');
    const editChatGPTKey = document.getElementById('editChatGPTKey');
    const imageDropzone = document.getElementById('imageDropzone');
    const generateWithClaude = document.getElementById('generateWithClaude');
    const generateWithChatGPT = document.getElementById('generateWithChatGPT');
    const claudePrompt = document.getElementById('claudePrompt');
    const chatgptPrompt = document.getElementById('chatgptPrompt');
    const claudeOutput = document.getElementById('claudeOutput');
    const chatgptOutput = document.getElementById('chatgptOutput');
    const copyClaudeOutput = document.getElementById('copyClaudeOutput');
    const copyChatGPTOutput = document.getElementById('copyChatGPTOutput');
    
    // Initialize API keys from localStorage if available
    let claudeApiKey = localStorage.getItem('claudeApiKey') || '';
    let chatgptApiKey = localStorage.getItem('chatgptApiKey') || '';
    
    // Global variable to store the first uploaded image's data URL
    let uploadedImageDataUrl = null;
    
    // Update API key inputs with stored values
    claudeApiKeyInput.value = claudeApiKey;
    chatgptApiKeyInput.value = chatgptApiKey;
    
    // Modal event listeners
    settingsButton.addEventListener('click', function() {
        apiSettingsModal.classList.add('active');
    });
    
    cancelApiSettings.addEventListener('click', function() {
        apiSettingsModal.classList.remove('active');
        // Revert to saved values
        claudeApiKeyInput.value = claudeApiKey;
        chatgptApiKeyInput.value = chatgptApiKey;
    });
    
    saveApiSettings.addEventListener('click', function() {
        // Save API keys to local storage
        claudeApiKey = claudeApiKeyInput.value;
        chatgptApiKey = chatgptApiKeyInput.value;
        localStorage.setItem('claudeApiKey', claudeApiKey);
        localStorage.setItem('chatgptApiKey', chatgptApiKey);
        apiSettingsModal.classList.remove('active');
    });
    
    // Close modal when clicking outside
    apiSettingsModal.addEventListener('click', function(e) {
        if (e.target === apiSettingsModal) {
            apiSettingsModal.classList.remove('active');
            // Revert to saved values
            claudeApiKeyInput.value = claudeApiKey;
            chatgptApiKeyInput.value = chatgptApiKey;
        }
    });
    
    // Edit API key buttons
    editClaudeKey.addEventListener('click', function() {
        claudeApiKeyInput.value = claudeApiKey;
        apiSettingsModal.classList.add('active');
        claudeApiKeyInput.focus();
    });
    
    editChatGPTKey.addEventListener('click', function() {
        chatgptApiKeyInput.value = chatgptApiKey;
        apiSettingsModal.classList.add('active');
        chatgptApiKeyInput.focus();
    });
    
    // Image dropzone functionality
    imageDropzone.addEventListener('click', function() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.multiple = true;
        
        fileInput.addEventListener('change', function(e) {
            handleFiles(e.target.files);
        });
        
        fileInput.click();
    });
    
    imageDropzone.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        imageDropzone.style.backgroundColor = 'rgba(124, 66, 237, 0.1)';
    });
    
    imageDropzone.addEventListener('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        imageDropzone.style.backgroundColor = '';
    });
    
    imageDropzone.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        imageDropzone.style.backgroundColor = '';
        
        if (e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    });
    
    function handleFiles(files) {
        // Display selected images and store the first image as a reference
        const imagePreview = document.createElement('div');
        imagePreview.className = 'image-preview';
        imageDropzone.innerHTML = '';
        
        // Clear previous image reference
        uploadedImageDataUrl = null;
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.type.startsWith('image/')) {
                const img = document.createElement('img');
                img.className = 'preview-img';
                img.file = file;
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    img.src = e.target.result;
                    // Store the first image's base64 data URL as the image reference
                    if (!uploadedImageDataUrl) {
                        uploadedImageDataUrl = e.target.result;
                    }
                };
                reader.readAsDataURL(file);
                imagePreview.appendChild(img);
            }
        }
        
        imageDropzone.appendChild(imagePreview);
        
        // Add a "Reset" button to clear images
        const resetButton = document.createElement('button');
        resetButton.className = 'button copy-button';
        resetButton.style.marginTop = '10px';
        resetButton.textContent = 'Reset';
        resetButton.addEventListener('click', function(e) {
            e.stopPropagation();
            resetDropzone();
        });
        
        imageDropzone.appendChild(resetButton);
    }
    
    function resetDropzone() {
        // Clear the stored image reference
        uploadedImageDataUrl = null;
        imageDropzone.innerHTML = `
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 14V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V14" stroke="#aaaaaa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M7 10L12 15L17 10" stroke="#aaaaaa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 15V3" stroke="#aaaaaa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <p>Drag & drop images here or click to select</p>
        `;
    }
    
    // Generate with Claude button
    generateWithClaude.addEventListener('click', async function() {
        if (!claudeApiKey) {
            alert('Please set your Claude API key in the settings.');
            apiSettingsModal.classList.add('active');
            return;
        }
        
        const promptText = claudePrompt.value.trim();
        if (!promptText) {
            alert('Please enter a prompt for Claude.');
            return;
        }
        
        // Combine text prompt with image reference if an image was uploaded.
        let combinedPrompt = promptText;
        if (uploadedImageDataUrl) {
            combinedPrompt += "\n\n[Image Reference]: " + uploadedImageDataUrl;
        }
        
        // Show loading state
        claudeOutput.textContent = 'Generating...';
        generateWithClaude.disabled = true;
        
        try {
            const response = await callClaudeApi(combinedPrompt, claudeApiKey);
            claudeOutput.textContent = response;
            // Automatically copy to ChatGPT prompt (if needed)
            chatgptPrompt.value = response;
        } catch (error) {
            claudeOutput.textContent = 'Error: ' + error.message;
        } finally {
            generateWithClaude.disabled = false;
        }
    });
    
    // Generate with ChatGPT button (unchanged)
    generateWithChatGPT.addEventListener('click', async function() {
        if (!chatgptApiKey) {
            alert('Please set your ChatGPT API key in the settings.');
            apiSettingsModal.classList.add('active');
            return;
        }
        
        const prompt = chatgptPrompt.value.trim();
        if (!prompt) {
            alert('Please enter a prompt for ChatGPT.');
            return;
        }
        
        chatgptOutput.textContent = 'Generating...';
        generateWithChatGPT.disabled = true;
        
        try {
            const response = await callChatGPTApi(prompt, chatgptApiKey);
            chatgptOutput.textContent = response;
        } catch (error) {
            chatgptOutput.textContent = 'Error: ' + error.message;
        } finally {
            generateWithChatGPT.disabled = false;
        }
    });
    
    // Copy buttons remain unchanged
    copyClaudeOutput.addEventListener('click', function() {
        copyToClipboard(claudeOutput.textContent);
        showCopyFeedback(copyClaudeOutput);
    });
    
    copyChatGPTOutput.addEventListener('click', function() {
        copyToClipboard(chatgptOutput.textContent);
        showCopyFeedback(copyChatGPTOutput);
    });
    
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(function() {
            console.log('Copying to clipboard was successful!');
        }, function(err) {
            console.error('Could not copy text: ', err);
        });
    }
    
    function showCopyFeedback(button) {
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        setTimeout(function() {
            button.textContent = originalText;
        }, 2000);
    }
    
  // Call Claude API via the proxy endpoint (serverless function)
async function callClaudeApi(prompt, apiKey) {
    const proxyURL = '/api/claude'; // This relative path works on your deployed site
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
    // Extract Claude's response; adjust based on actual structure returned by Anthropic
    return (result.content && result.content[0] && result.content[0].text)
        ? result.content[0].text
        : "No response from Claude";
}

    
    // Call ChatGPT API (unchanged)
    async function callChatGPTApi(prompt, apiKey) {
        const API_URL = "https://api.openai.com/v1/chat/completions";
        const data = {
            "model": "gpt-4-turbo",
            "messages": [{ "role": "user", "content": prompt }]
        };
        
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`ChatGPT API error: ${response.statusText}`);
        }
        
        const result = await response.json();
        return (result.choices && result.choices[0] && result.choices[0].message && result.choices[0].message.content)
            ? result.choices[0].message.content
            : "No response from ChatGPT";
    }
});
