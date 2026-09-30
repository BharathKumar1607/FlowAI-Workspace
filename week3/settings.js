/**
 * FlowAI Workspace - Settings & Model Configuration Engine (Week 3)
 * Powers settings.html:
 * - Real-time theme & font-size switching
 * - Live temperature range slider synchronization
 * - AI Model & System Instruction persistence
 * - API Key password visibility toggle & validation
 * - Factory data reset with safety confirmation
 */

document.addEventListener('DOMContentLoaded', () => {

    // 1. DOM References
    const settingsForm = document.getElementById('settings-form');
    const themeSelect = document.getElementById('setting-theme');
    const fontSizeSelect = document.getElementById('setting-font-size');
    const modelSelect = document.getElementById('setting-model');
    const tempSlider = document.getElementById('setting-temperature');
    const tempValBadge = document.getElementById('temp-value-display');
    const systemPromptInput = document.getElementById('setting-system-prompt');
    const apiKeyInput = document.getElementById('setting-api-key');
    const toggleApiKeyBtn = document.getElementById('toggle-api-key-btn');
    const factoryResetBtn = document.getElementById('factory-reset-btn');

    // 2. Load Settings from LocalStorage
    function loadCurrentSettings() {
        return JSON.parse(localStorage.getItem('flowai_settings') || '{}');
    }

    const currentSettings = loadCurrentSettings();

    // 3. Populate Form with Current Values
    if (themeSelect && currentSettings.theme) {
        themeSelect.value = currentSettings.theme;
    }
    if (fontSizeSelect && currentSettings.fontSize) {
        fontSizeSelect.value = currentSettings.fontSize;
    }
    if (modelSelect && currentSettings.model) {
        modelSelect.value = currentSettings.model;
    }
    if (tempSlider && currentSettings.temperature) {
        tempSlider.value = currentSettings.temperature;
        if (tempValBadge) tempValBadge.textContent = currentSettings.temperature;
    }
    if (systemPromptInput && currentSettings.systemPrompt) {
        systemPromptInput.value = currentSettings.systemPrompt;
    }
    if (apiKeyInput && currentSettings.apiKey) {
        apiKeyInput.value = currentSettings.apiKey;
    }

    // 4. Live Temperature Slider Listener
    if (tempSlider && tempValBadge) {
        tempSlider.addEventListener('input', (e) => {
            tempValBadge.textContent = Number(e.target.value).toFixed(1);
        });
    }

    // 5. Live Theme Change Listener
    if (themeSelect) {
        themeSelect.addEventListener('change', (e) => {
            const chosenTheme = e.target.value;
            if (chosenTheme === 'dark') {
                document.body.setAttribute('data-theme', 'dark');
            } else {
                document.body.removeAttribute('data-theme');
            }
        });
    }

    // 6. Live Font Size Change Listener
    if (fontSizeSelect) {
        fontSizeSelect.addEventListener('change', (e) => {
            document.body.setAttribute('data-font-size', e.target.value);
        });
    }

    // 7. API Key Visibility Toggle
    if (toggleApiKeyBtn && apiKeyInput) {
        toggleApiKeyBtn.addEventListener('click', () => {
            const isPassword = apiKeyInput.type === 'password';
            apiKeyInput.type = isPassword ? 'text' : 'password';
            toggleApiKeyBtn.textContent = isPassword ? '🙈' : '👁️';
        });
    }

    // 8. Settings Form Submission (Save & Persist)
    if (settingsForm) {
        settingsForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const updatedSettings = {
                theme: themeSelect.value,
                fontSize: fontSizeSelect.value,
                model: modelSelect.value,
                temperature: tempSlider.value,
                systemPrompt: systemPromptInput.value.trim(),
                apiKey: apiKeyInput.value.trim()
            };

            localStorage.setItem('flowai_settings', JSON.stringify(updatedSettings));
            window.showToast('All settings and model preferences saved!', 'success');
        });
    }

    // 9. Factory Reset Handler
    if (factoryResetBtn) {
        factoryResetBtn.addEventListener('click', () => {
            const confirmed = confirm('WARNING: This will reset all chat history, custom prompts, and settings back to factory defaults. Proceed?');
            if (confirmed) {
                localStorage.removeItem('flowai_sessions');
                localStorage.removeItem('flowai_prompts');
                localStorage.removeItem('flowai_settings');
                localStorage.removeItem('flowai_current_session_id');
                window.location.reload();
            }
        });
    }
});
