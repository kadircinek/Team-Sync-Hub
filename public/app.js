// API Base URL
const API_URL = '/api';

// DOM Elements
const userInput = document.getElementById('userInput');
const chatMessages = document.getElementById('chatMessages');
const summarizerModal = document.getElementById('summarizerModal');
const analyzerModal = document.getElementById('analyzerModal');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('Team-Sync-Hub UI loaded');
    checkHealth();
});

// Health Check
async function checkHealth() {
    try {
        const response = await fetch(`${API_URL}/health`);
        const data = await response.json();
        console.log('API Status:', data);
    } catch (error) {
        console.error('API connection failed:', error);
    }
}

// Chat Functions
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    // Add user message to chat
    addMessage(message, 'user');
    userInput.value = '';

    // Show loading state
    const btn = event.target;
    btn.disabled = true;
    btn.classList.add('loading');

    try {
        // Send to API
        const response = await fetch(`${API_URL}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });

        const data = await response.json();

        if (data.response) {
            addMessage(data.response, 'assistant');
        } else if (data.error) {
            addMessage(`Error: ${data.error}`, 'assistant');
        }
    } catch (error) {
        console.error('Chat error:', error);
        addMessage('Failed to connect to the server. Please try again.', 'assistant');
    } finally {
        btn.disabled = false;
        btn.classList.remove('loading');
    }
}

function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    messageDiv.innerHTML = `<p>${escapeHtml(text)}</p>`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Summarizer Functions
function openSummarizer() {
    summarizerModal.classList.remove('hidden');
}

function closeSummarizer() {
    summarizerModal.classList.add('hidden');
    document.getElementById('textToSummarize').value = '';
    document.getElementById('summaryResult').classList.add('hidden');
}

async function summarizeText() {
    const text = document.getElementById('textToSummarize').value.trim();
    if (!text) {
        showNotification('Please enter text to summarize');
        return;
    }

    const btn = event.target;
    btn.disabled = true;
    btn.classList.add('loading');

    try {
        const response = await fetch(`${API_URL}/summarize`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });

        const data = await response.json();

        if (data.summary) {
            document.getElementById('summaryText').textContent = data.summary;
            document.getElementById('summaryResult').classList.remove('hidden');
        } else if (data.error) {
            showNotification(`Error: ${data.error}`);
        }
    } catch (error) {
        console.error('Summarize error:', error);
        showNotification('Failed to summarize text');
    } finally {
        btn.disabled = false;
        btn.classList.remove('loading');
    }
}

// Analyzer Functions
function openAnalyzer() {
    analyzerModal.classList.remove('hidden');
}

function closeAnalyzer() {
    analyzerModal.classList.add('hidden');
    document.getElementById('dataToAnalyze').value = '';
    document.getElementById('analysisResult').classList.add('hidden');
}

async function analyzeData() {
    const dataStr = document.getElementById('dataToAnalyze').value.trim();
    if (!dataStr) {
        showNotification('Please enter data to analyze');
        return;
    }

    let data;
    try {
        data = JSON.parse(dataStr);
    } catch (error) {
        showNotification('Invalid JSON format. Please check your data.');
        return;
    }

    const btn = event.target;
    btn.disabled = true;
    btn.classList.add('loading');

    try {
        const response = await fetch(`${API_URL}/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data })
        });

        const result = await response.json();

        if (result.analysis) {
            document.getElementById('analysisText').textContent = result.analysis;
            document.getElementById('analysisResult').classList.remove('hidden');
        } else if (result.error) {
            showNotification(`Error: ${result.error}`);
        }
    } catch (error) {
        console.error('Analyze error:', error);
        showNotification('Failed to analyze data');
    } finally {
        btn.disabled = false;
        btn.classList.remove('loading');
    }
}

// Utility Functions
function showNotification(message) {
    alert(message); // Simple notification - can be replaced with better UI
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Allow Enter key in chat input
userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Close modals on background click
summarizerModal.addEventListener('click', (e) => {
    if (e.target === summarizerModal) closeSummarizer();
});

analyzerModal.addEventListener('click', (e) => {
    if (e.target === analyzerModal) closeAnalyzer();
});
