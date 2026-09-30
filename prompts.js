/**
 * FlowAI Workspace - Prompts Engine (Week 4: Performance & Accessibility)
 * Author: Bharath Kumar
 * Features:
 * - Debounced live search filtering (zero CPU layout thrashing)
 * - Accessible category tabs with ARIA state updates
 * - Modal dialog with keyboard focus trapping and Escape key dismiss
 * - Non-blocking clipboard copying with screen reader announcements
 */

document.addEventListener('DOMContentLoaded', () => {

    // 1. DOM References
    const promptsGrid = document.getElementById('prompts-grid');
    const searchInput = document.getElementById('prompt-search-input');
    const categoryPills = document.querySelectorAll('.category-pills .pill-btn');
    const openModalBtn = document.getElementById('open-create-prompt-btn');
    const modalOverlay = document.getElementById('create-prompt-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const cancelModalBtn = document.getElementById('cancel-modal-btn');
    const createPromptForm = document.getElementById('create-prompt-form');

    let currentCategory = 'all';
    let searchQuery = '';

    // 2. Fetch Prompts from LocalStorage
    function getPrompts() {
        return JSON.parse(localStorage.getItem('flowai_prompts') || '[]');
    }

    // 3. Render Prompts (Accessible Semantic Nodes)
    function renderPrompts() {
        if (!promptsGrid) return;
        promptsGrid.innerHTML = '';
        const allPrompts = getPrompts();

        const filtered = allPrompts.filter(p => {
            const matchesCat = currentCategory === 'all' || p.category.toLowerCase() === currentCategory.toLowerCase();
            const textMatch = p.title.toLowerCase().includes(searchQuery) ||
                              p.description.toLowerCase().includes(searchQuery) ||
                              p.prompt.toLowerCase().includes(searchQuery);
            return matchesCat && textMatch;
        });

        if (filtered.length === 0) {
            promptsGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 48px 16px; color: var(--text-secondary);" role="alert">
                    <div style="font-size: 2.5rem; margin-bottom: 8px;" aria-hidden="true">🔍</div>
                    <h3>No matching prompt templates found</h3>
                    <p style="font-size: 0.9rem; margin-top: 4px;">Try a different keyword or create a custom prompt.</p>
                </div>
            `;
            return;
        }

        filtered.forEach(p => {
            const card = document.createElement('article');
            card.className = 'prompt-card';
            card.setAttribute('role', 'article');
            card.setAttribute('aria-label', `Prompt template: ${p.title}`);

            card.innerHTML = `
                <div class="prompt-card-header">
                    <h2 class="prompt-card-title">${escapeHtml(p.title)}</h2>
                    <span class="tag" aria-label="Category: ${escapeHtml(p.category)}">${escapeHtml(p.category)}</span>
                </div>
                <p class="prompt-card-desc">${escapeHtml(p.description)}</p>
                <div class="prompt-snippet" aria-label="Prompt preview text">${escapeHtml(p.prompt)}</div>
                <div class="prompt-card-footer">
                    <button class="btn btn-secondary copy-prompt-btn" data-prompt="${escapeHtml(p.prompt)}" aria-label="Copy ${escapeHtml(p.title)} prompt text">📋 Copy</button>
                    <button class="btn btn-primary use-prompt-btn" data-prompt="${escapeHtml(p.prompt)}" aria-label="Use ${escapeHtml(p.title)} prompt in chat">💬 Use in Chat</button>
                </div>
            `;

            // Event: Copy Prompt
            card.querySelector('.copy-prompt-btn').addEventListener('click', (e) => {
                const text = e.target.getAttribute('data-prompt');
                navigator.clipboard.writeText(text).then(() => {
                    e.target.textContent = '✓ Copied!';
                    window.showToast('Prompt copied to clipboard', 'success');
                    setTimeout(() => { e.target.textContent = '📋 Copy'; }, 2000);
                });
            });

            // Event: Use in Chat
            card.querySelector('.use-prompt-btn').addEventListener('click', (e) => {
                const text = e.target.getAttribute('data-prompt');
                sessionStorage.setItem('flowai_pending_prompt', text);
                window.location.href = 'index.html';
            });

            promptsGrid.appendChild(card);
        });

        window.announceToScreenReader(`Displayed ${filtered.length} prompt templates`);
    }

    // Helper: Escape HTML
    function escapeHtml(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }

    // 4. Debounced Live Search Input
    if (searchInput) {
        const handleSearch = window.debounce((e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            renderPrompts();
        }, 120);

        searchInput.addEventListener('input', handleSearch);
    }

    // 5. Category Filter Pills (Accessible Tablist)
    categoryPills.forEach(pill => {
        pill.addEventListener('click', () => {
            categoryPills.forEach(p => {
                p.classList.remove('active');
                p.setAttribute('aria-selected', 'false');
            });
            pill.classList.add('active');
            pill.setAttribute('aria-selected', 'true');
            currentCategory = pill.getAttribute('data-category');
            renderPrompts();
            window.showToast(`Filtered by ${pill.textContent}`, 'info');
        });
    });

    // 6. Accessible Modal Management with Focus Trapping & Escape Key
    let lastActiveElement = null;

    function openModal() {
        lastActiveElement = document.activeElement;
        if (modalOverlay) {
            modalOverlay.classList.add('open');
            modalOverlay.setAttribute('aria-hidden', 'false');
            const firstInput = document.getElementById('modal-prompt-title');
            if (firstInput) firstInput.focus();
            window.announceToScreenReader('Create Custom Prompt dialog opened. Press Escape to cancel.');
        }
    }

    function closeModal() {
        if (modalOverlay) {
            modalOverlay.classList.remove('open');
            modalOverlay.setAttribute('aria-hidden', 'true');
            if (createPromptForm) createPromptForm.reset();
            if (lastActiveElement) lastActiveElement.focus();
            window.announceToScreenReader('Dialog closed');
        }
    }

    if (openModalBtn) openModalBtn.addEventListener('click', openModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);

    // Keyboard Accessibility: Escape key and Focus Trapping
    document.addEventListener('keydown', (e) => {
        if (!modalOverlay || !modalOverlay.classList.contains('open')) return;

        if (e.key === 'Escape') {
            closeModal();
            return;
        }

        // Focus Trapping: keep Tab within modal
        if (e.key === 'Tab') {
            const focusables = modalOverlay.querySelectorAll('input, select, textarea, button');
            const first = focusables[0];
            const last = focusables[focusables.length - 1];

            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    });

    // 7. Modal Form Submission
    if (createPromptForm) {
        createPromptForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const title = document.getElementById('modal-prompt-title').value.trim();
            const category = document.getElementById('modal-prompt-category').value;
            const description = document.getElementById('modal-prompt-desc').value.trim();
            const promptText = document.getElementById('modal-prompt-text').value.trim();

            if (!title || !description || !promptText) {
                window.showToast('Please fill in all required fields', 'danger');
                return;
            }

            const newPrompt = {
                id: 'custom_' + Date.now(),
                title,
                category,
                description,
                prompt: promptText
            };

            const allPrompts = getPrompts();
            allPrompts.unshift(newPrompt);
            localStorage.setItem('flowai_prompts', JSON.stringify(allPrompts));

            closeModal();
            renderPrompts();
            window.showToast(`Custom prompt "${title}" added to library!`, 'success');
        });
    }

    // Initial Render
    renderPrompts();
});
