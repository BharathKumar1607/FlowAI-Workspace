/**
 * FlowAI Workspace - Settings Engine (Week 4: Performance & Accessibility)
 * Author: Bharath Kumar
 * Features:
 * - Real-time temperature slider with ARIA attributes (aria-valuenow)
 * - Accessible High Contrast & Font scaling toggles
 * - API key visibility toggle with dynamic accessible aria-label
 * - Form validation with screen reader announcements
 */

document.addEventListener('DOMContentLoaded', () => {

    // 1. DOM References
    const settingsForm = document.getElementById('settings-form');
    const themeSelect = document.getElementById('setting-theme');
    const highContrastCheck = document.getElementById('setting-high-contrast');
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
    if (highContrastCheck) {
        highContrastCheck.checked = currentSettings.highContrast || false;
    }
    if (fontSizeSelect && currentSettings.fontSize) {
        fontSizeSelect.value = currentSettings.fontSize;
    }
    if (modelSelect && currentSettings.model) {
        modelSelect.value = currentSettings.model;
    }
    if (tempSlider && currentSettings.temperature) {
        tempSlider.value = currentSettings.temperature;
        tempSlider.setAttribute('aria-valuenow', currentSettings.temperature);
        if (tempValBadge) tempValBadge.textContent = currentSettings.temperature;
    }
    if (systemPromptInput && currentSettings.systemPrompt) {
        systemPromptInput.value = currentSettings.systemPrompt;
    }
    if (apiKeyInput && currentSettings.apiKey) {
        apiKeyInput.value = currentSettings.apiKey;
    }

    // 4. Live Temperature Slider Listener (WCAG 4.1.2 Name, Role, Value)
    if (tempSlider && tempValBadge) {
        tempSlider.addEventListener('input', (e) => {
            const val = Number(e.target.value).toFixed(1);
            tempValBadge.textContent = val;
            tempSlider.setAttribute('aria-valuenow', val);
        });
    }

    // 5. Live Theme Change Listener
    if (themeSelect) {
        themeSelect.addEventListener('change', (e) => {
            const chosen = e.target.value;
            if (chosen === 'dark') {
                document.body.setAttribute('data-theme', 'dark');
            } else {
                document.body.removeAttribute('data-theme');
            }
        });
    }

    // 6. Live High Contrast Mode Toggle
    if (highContrastCheck) {
        highContrastCheck.addEventListener('change', (e) => {
            if (e.target.checked) {
                document.body.classList.add('high-contrast');
            } else {
                document.body.classList.remove('high-contrast');
            }
        });
    }

    // 7. Live Font Size Change Listener
    if (fontSizeSelect) {
        fontSizeSelect.addEventListener('change', (e) => {
            document.body.setAttribute('data-font-size', e.target.value);
        });
    }

    // 8. API Key Visibility Toggle with Dynamic ARIA Label
    if (toggleApiKeyBtn && apiKeyInput) {
        toggleApiKeyBtn.addEventListener('click', () => {
            const isPassword = apiKeyInput.type === 'password';
            apiKeyInput.type = isPassword ? 'text' : 'password';
            toggleApiKeyBtn.textContent = isPassword ? '🙈' : '👁️';
            toggleApiKeyBtn.setAttribute('aria-label', isPassword ? 'Hide API Key' : 'Show API Key');
            window.announceToScreenReader(isPassword ? 'API key text shown' : 'API key text hidden');
        });
    }

    // 9. Save Settings Form Submission
    if (settingsForm) {
        settingsForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const updated = {
                theme: themeSelect.value,
                highContrast: highContrastCheck ? highContrastCheck.checked : false,
                fontSize: fontSizeSelect.value,
                model: modelSelect.value,
                temperature: tempSlider.value,
                systemPrompt: systemPromptInput.value.trim(),
                apiKey: apiKeyInput.value.trim()
            };

            localStorage.setItem('flowai_settings', JSON.stringify(updated));
            window.showToast('Settings & preferences saved successfully!', 'success');
        });
    }

    // 10. Factory Reset
    if (factoryResetBtn) {
        factoryResetBtn.addEventListener('click', () => {
            const confirmed = confirm('WARNING: This will reset all conversation history, custom prompts, and preferences to original factory defaults. Proceed?');
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
