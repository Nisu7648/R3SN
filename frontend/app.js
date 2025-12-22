/**
 * R3SN Frontend Application
 * Complete natural language loop system like Bhindi AI
 */

const API_BASE = 'http://localhost:3000';
let currentUser = null;
let conversationHistory = [];

// ============================================
// AUTHENTICATION
// ============================================

function showLogin() {
    document.getElementById('loginScreen').classList.add('active');
    document.getElementById('signupScreen').classList.remove('active');
    document.getElementById('appScreen').classList.remove('active');
}

function showSignup() {
    document.getElementById('loginScreen').classList.remove('active');
    document.getElementById('signupScreen').classList.add('active');
    document.getElementById('appScreen').classList.remove('active');
}

function showApp() {
    document.getElementById('loginScreen').classList.remove('active');
    document.getElementById('signupScreen').classList.remove('active');
    document.getElementById('appScreen').classList.add('active');
}

async function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        alert('Please enter email and password');
        return;
    }

    showLoading(true);

    try {
        const response = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
            currentUser = data.user;
            localStorage.setItem('r3sn_user', JSON.stringify(currentUser));
            localStorage.setItem('r3sn_token', data.token);
            
            document.getElementById('userName').textContent = currentUser.name;
            showApp();
            loadUserData();
        } else {
            alert(data.error || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please try again.');
    } finally {
        showLoading(false);
    }
}

async function signup() {
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    if (!name || !email || !password) {
        alert('Please fill all fields');
        return;
    }

    showLoading(true);

    try {
        const response = await fetch(`${API_BASE}/api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (data.success) {
            alert('Account created successfully! Please login.');
            showLogin();
        } else {
            alert(data.error || 'Signup failed');
        }
    } catch (error) {
        console.error('Signup error:', error);
        alert('Signup failed. Please try again.');
    } finally {
        showLoading(false);
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('r3sn_user');
    localStorage.removeItem('r3sn_token');
    conversationHistory = [];
    document.getElementById('chatMessages').innerHTML = '';
    showLogin();
}

// ============================================
// NAVIGATION
// ============================================

function openIntegrations() {
    window.location.href = '/integrations.html';
}

// ============================================
// NATURAL LANGUAGE LOOP SYSTEM
// ============================================

async function sendMessage() {
    const input = document.getElementById('userInput');
    const message = input.value.trim();

    if (!message) return;

    // Add user message to chat
    addMessage(message, 'user');
    input.value = '';

    // Add to conversation history
    conversationHistory.push({
        role: 'user',
        content: message
    });

    showLoading(true);

    try {
        // Send to natural language processor
        const response = await fetch(`${API_BASE}/api/process`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('r3sn_token')}`
            },
            body: JSON.stringify({
                message,
                history: conversationHistory,
                userId: currentUser.id
            })
        });

        const data = await response.json();

        if (data.success) {
            // Add assistant response
            addMessage(data.response, 'assistant');

            // Add to conversation history
            conversationHistory.push({
                role: 'assistant',
                content: data.response
            });

            // Handle special actions
            if (data.action) {
                await handleAction(data.action, data.actionData);
            }

            // Refresh lists if needed
            if (data.refreshLists) {
                loadUserData();
            }
        } else {
            addMessage('Sorry, I encountered an error. Please try again.', 'assistant');
        }
    } catch (error) {
        console.error('Message error:', error);
        addMessage('Sorry, I encountered an error. Please try again.', 'assistant');
    } finally {
        showLoading(false);
    }
}

function addMessage(content, role) {
    const messagesDiv = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = formatMessage(content);

    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    timeDiv.textContent = new Date().toLocaleTimeString();

    messageDiv.appendChild(contentDiv);
    messageDiv.appendChild(timeDiv);
    messagesDiv.appendChild(messageDiv);

    // Scroll to bottom
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function formatMessage(content) {
    // Convert markdown-style formatting
    content = content.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    content = content.replace(/`([^`]+)`/g, '<code>$1</code>');
    content = content.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    content = content.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    content = content.replace(/\n/g, '<br>');
    return content;
}

async function handleAction(action, data) {
    switch (action) {
        case 'api_created':
            showNotification('API created successfully!', 'success');
            break;
        case 'plugin_created':
            showNotification('Plugin created successfully!', 'success');
            break;
        case 'workflow_created':
            showNotification('Workflow created successfully!', 'success');
            break;
        case 'api_executed':
            showNotification('API executed successfully!', 'success');
            break;
        case 'plugin_executed':
            showNotification('Plugin executed successfully!', 'success');
            break;
        case 'workflow_executed':
            showNotification('Workflow executed successfully!', 'success');
            break;
    }
}

// ============================================
// QUICK ACTIONS
// ============================================

function quickAction(type) {
    const prompts = {
        api: 'I want to build an API for ',
        plugin: 'I want to create a plugin that ',
        workflow: 'I want to build a workflow that '
    };

    const input = document.getElementById('userInput');
    input.value = prompts[type];
    input.focus();
}

// ============================================
// DATA LOADING
// ============================================

async function loadUserData() {
    await Promise.all([
        loadAPIs(),
        loadPlugins(),
        loadWorkflows()
    ]);
}

async function loadAPIs() {
    try {
        const response = await fetch(`${API_BASE}/api/builder/api/list?userId=${currentUser.id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('r3sn_token')}`
            }
        });

        const data = await response.json();

        if (data.success) {
            const listDiv = document.getElementById('apiList');
            listDiv.innerHTML = '';

            data.apis.forEach(api => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'item';
                itemDiv.onclick = () => showAPIDetails(api.id);

                itemDiv.innerHTML = `
                    <div class="item-name">${api.name}</div>
                    <div class="item-desc">${api.description}</div>
                `;

                listDiv.appendChild(itemDiv);
            });
        }
    } catch (error) {
        console.error('Load APIs error:', error);
    }
}

async function loadPlugins() {
    try {
        const response = await fetch(`${API_BASE}/api/builder/plugin/list?userId=${currentUser.id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('r3sn_token')}`
            }
        });

        const data = await response.json();

        if (data.success) {
            const listDiv = document.getElementById('pluginList');
            listDiv.innerHTML = '';

            data.plugins.forEach(plugin => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'item';
                itemDiv.onclick = () => showPluginDetails(plugin.id);

                itemDiv.innerHTML = `
                    <div class="item-name">${plugin.name}</div>
                    <div class="item-desc">${plugin.description}</div>
                `;

                listDiv.appendChild(itemDiv);
            });
        }
    } catch (error) {
        console.error('Load plugins error:', error);
    }
}

async function loadWorkflows() {
    try {
        const response = await fetch(`${API_BASE}/api/builder/workflow/list?userId=${currentUser.id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('r3sn_token')}`
            }
        });

        const data = await response.json();

        if (data.success) {
            const listDiv = document.getElementById('workflowList');
            listDiv.innerHTML = '';

            data.workflows.forEach(workflow => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'item';
                itemDiv.onclick = () => showWorkflowDetails(workflow.id);

                itemDiv.innerHTML = `
                    <div class="item-name">${workflow.name}</div>
                    <div class="item-desc">${workflow.description}</div>
                `;

                listDiv.appendChild(itemDiv);
            });
        }
    } catch (error) {
        console.error('Load workflows error:', error);
    }
}

function showAPIDetails(apiId) {
    document.getElementById('userInput').value = `Show me details of API ${apiId}`;
    sendMessage();
}

function showPluginDetails(pluginId) {
    document.getElementById('userInput').value = `Show me details of plugin ${pluginId}`;
    sendMessage();
}

function showWorkflowDetails(workflowId) {
    document.getElementById('userInput').value = `Show me details of workflow ${workflowId}`;
    sendMessage();
}

// ============================================
// UI HELPERS
// ============================================

function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (show) {
        overlay.classList.add('active');
    } else {
        overlay.classList.remove('active');
    }
}

function showNotification(message, type = 'info') {
    // Simple notification (can be enhanced)
    console.log(`[${type.toUpperCase()}] ${message}`);
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('userInput');

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Auto-resize textarea
    input.addEventListener('input', () => {
        input.style.height = 'auto';
        input.style.height = input.scrollHeight + 'px';
    });

    // Check if user is already logged in
    const savedUser = localStorage.getItem('r3sn_user');
    const savedToken = localStorage.getItem('r3sn_token');

    if (savedUser && savedToken) {
        currentUser = JSON.parse(savedUser);
        document.getElementById('userName').textContent = currentUser.name;
        showApp();
        loadUserData();

        // Welcome message
        addMessage(`Welcome back, ${currentUser.name}! How can I help you today?`, 'assistant');
    }
});
