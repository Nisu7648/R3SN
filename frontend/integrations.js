/**
 * Integrations Page JavaScript
 * Manage user API connections
 */

const API_BASE = 'http://localhost:3000';
let currentUser = null;
let currentIntegration = null;
let allIntegrations = [];

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    const savedUser = localStorage.getItem('r3sn_user');
    const savedToken = localStorage.getItem('r3sn_token');

    if (!savedUser || !savedToken) {
        window.location.href = '/';
        return;
    }

    currentUser = JSON.parse(savedUser);
    document.getElementById('userName').textContent = currentUser.name;

    // Load integrations
    await loadIntegrations();

    // Setup form handler
    document.getElementById('connectionForm').addEventListener('submit', handleConnect);
});

// ============================================
// LOAD INTEGRATIONS
// ============================================

async function loadIntegrations() {
    showLoading(true);

    try {
        const response = await fetch(`${API_BASE}/api/integrations/connected`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('r3sn_token')}`
            }
        });

        const data = await response.json();

        if (data.success) {
            allIntegrations = data.integrations;
            renderIntegrations(data.integrations);
        } else {
            alert('Failed to load integrations');
        }
    } catch (error) {
        console.error('Load error:', error);
        alert('Failed to load integrations');
    } finally {
        showLoading(false);
    }
}

// ============================================
// RENDER INTEGRATIONS
// ============================================

function renderIntegrations(integrations) {
    const grid = document.getElementById('integrationsGrid');
    grid.innerHTML = '';

    integrations.forEach(integration => {
        const card = document.createElement('div');
        card.className = `integration-card ${integration.connected ? 'connected' : ''}`;
        card.onclick = () => openConnectionModal(integration);

        card.innerHTML = `
            <div class="integration-header">
                <span class="integration-icon">${integration.icon}</span>
                <div class="integration-info">
                    <h3>${integration.name}</h3>
                    <p>${integration.description}</p>
                </div>
            </div>
            <span class="integration-status ${integration.connected ? 'status-connected' : 'status-disconnected'}">
                ${integration.connected ? '✓ Connected' : 'Not Connected'}
            </span>
            ${integration.connected ? `
                <div class="integration-actions">
                    <button class="btn-configure" onclick="event.stopPropagation(); openConnectionModal(${JSON.stringify(integration).replace(/"/g, '&quot;')})">
                        Configure
                    </button>
                    <button class="btn-disconnect" onclick="event.stopPropagation(); disconnectIntegration('${integration.id}')">
                        Disconnect
                    </button>
                </div>
            ` : ''}
        `;

        grid.appendChild(card);
    });
}

// ============================================
// CONNECTION MODAL
// ============================================

function openConnectionModal(integration) {
    currentIntegration = integration;

    document.getElementById('modalIcon').textContent = integration.icon;
    document.getElementById('modalTitle').textContent = `Connect ${integration.name}`;

    // Render form fields
    const formFields = document.getElementById('formFields');
    formFields.innerHTML = '';

    integration.fields.forEach(field => {
        const group = document.createElement('div');
        group.className = 'form-group';

        group.innerHTML = `
            <label for="${field.name}">${field.label}${field.required ? ' *' : ''}</label>
            <input 
                type="${field.type}" 
                id="${field.name}" 
                name="${field.name}" 
                ${field.required ? 'required' : ''}
                placeholder="Enter ${field.label.toLowerCase()}"
            />
        `;

        formFields.appendChild(group);
    });

    document.getElementById('connectionModal').classList.add('active');
}

function closeModal() {
    document.getElementById('connectionModal').classList.remove('active');
    document.getElementById('connectionForm').reset();
    currentIntegration = null;
}

// ============================================
// CONNECT INTEGRATION
// ============================================

async function handleConnect(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const credentials = {};

    for (const [key, value] of formData.entries()) {
        credentials[key] = value;
    }

    showLoading(true);

    try {
        const response = await fetch(`${API_BASE}/api/integrations/connect`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('r3sn_token')}`
            },
            body: JSON.stringify({
                integrationId: currentIntegration.id,
                credentials
            })
        });

        const data = await response.json();

        if (data.success) {
            alert(`${currentIntegration.name} connected successfully!`);
            closeModal();
            await loadIntegrations();
        } else {
            alert(`Connection failed: ${data.error}`);
        }
    } catch (error) {
        console.error('Connect error:', error);
        alert('Connection failed. Please try again.');
    } finally {
        showLoading(false);
    }
}

// ============================================
// TEST CONNECTION
// ============================================

async function testConnection() {
    const formData = new FormData(document.getElementById('connectionForm'));
    const credentials = {};

    for (const [key, value] of formData.entries()) {
        credentials[key] = value;
    }

    showLoading(true);

    try {
        const response = await fetch(`${API_BASE}/api/integrations/test`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('r3sn_token')}`
            },
            body: JSON.stringify({
                integrationId: currentIntegration.id,
                credentials
            })
        });

        const data = await response.json();

        if (data.success) {
            alert('✅ Connection test successful!');
        } else {
            alert(`❌ Connection test failed: ${data.error}`);
        }
    } catch (error) {
        console.error('Test error:', error);
        alert('Connection test failed. Please check your credentials.');
    } finally {
        showLoading(false);
    }
}

// ============================================
// DISCONNECT INTEGRATION
// ============================================

async function disconnectIntegration(integrationId) {
    if (!confirm('Are you sure you want to disconnect this integration?')) {
        return;
    }

    showLoading(true);

    try {
        const response = await fetch(`${API_BASE}/api/integrations/disconnect`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('r3sn_token')}`
            },
            body: JSON.stringify({ integrationId })
        });

        const data = await response.json();

        if (data.success) {
            alert('Integration disconnected successfully');
            await loadIntegrations();
        } else {
            alert(`Disconnect failed: ${data.error}`);
        }
    } catch (error) {
        console.error('Disconnect error:', error);
        alert('Disconnect failed. Please try again.');
    } finally {
        showLoading(false);
    }
}

// ============================================
// NAVIGATION
// ============================================

function goBack() {
    window.location.href = '/';
}

function logout() {
    localStorage.removeItem('r3sn_user');
    localStorage.removeItem('r3sn_token');
    window.location.href = '/';
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
