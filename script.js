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
        // Display selected images or prepare them for upload
        const imagePreview = document.createElement('div');
        imagePreview.className = 'image-preview';
        imageDropzone.innerHTML = '';
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.type.startsWith('image/')) {
                const img = document.createElement('img');
                img.className = 'preview-img';
                img.file = file;
                
                const reader = new FileReader();
                reader.onload = (function(aImg) {
                    return function(e) {
                        aImg.src = e.target.result;
                    };
                })(img);
                
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
        
        const prompt = claudePrompt.value.trim();
        if (!prompt) {
            alert('Please enter a prompt for Claude.');
            return;
        }
        
        // Show loading state
        claudeOutput.textContent = 'Generating...';
        generateWithClaude.disabled = true;
        
        try {
            // This is a placeholder for the actual API call
            // In a real implementation, you would call the Claude API here
            const response = await simulateClaudeApi(prompt, claudeApiKey);
            
            // Update UI with response
            claudeOutput.textContent = response;
            
            // Automatically copy to ChatGPT input
            chatgptPrompt.value = response;
            
        } catch (error) {
            claudeOutput.textContent = 'Error: ' + error.message;
        } finally {
            generateWithClaude.disabled = false;
        }
    });
    
    // Generate with ChatGPT button
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
        
        // Show loading state
        chatgptOutput.textContent = 'Generating...';
        generateWithChatGPT.disabled = true;
        
        try {
            // This is a placeholder for the actual API call
            // In a real implementation, you would call the ChatGPT API here
            const response = await simulateChatGPTApi(prompt, chatgptApiKey);
            
            // Update UI with response
            chatgptOutput.textContent = response;
            
        } catch (error) {
            chatgptOutput.textContent = 'Error: ' + error.message;
        } finally {
            generateWithChatGPT.disabled = false;
        }
    });
    
    // Copy buttons
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
    
    // API simulation functions (replace these with actual API calls in production)
    async function simulateClaudeApi(prompt, apiKey) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simple response generation (replace with actual API call)
        return `Here is Claude's response to: "${prompt}"\n\nThis is a simulated response. In a real implementation, this would be replaced with the actual response from Claude API using the provided API key.`;
    }
    
    async function simulateChatGPTApi(prompt, apiKey) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simple response generation (replace with actual API call)
        return `Here is ChatGPT's response to: "${prompt}"\n\nThis is a simulated response. In a real implementation, this would be replaced with the actual response from ChatGPT API using the provided API key.`;
    }
});

