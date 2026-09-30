/**
 * FlowAI Workspace - Prompts Library Engine (Week 3)
 * Powers prompts.html:
 * - Live search & category filtering
 * - "Use in Chat" prompt transfer via sessionStorage
 * - Copy prompt to clipboard
 * - Interactive modal form to create custom prompts saved to localStorage
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

    // 3. Render Filtered Prompts
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
                <div style="grid-column: 1 / -1; text-align: center; padding: 48px 16px; color: var(--text-secondary);">
                    <div style="font-size: 2.5rem; margin-bottom: 8px;">🔍</div>
                    <h3>No matching prompts found</h3>
                    <p style="font-size: 0.9rem; margin-top: 4px;">Try searching for a different keyword or create your own prompt template.</p>
                </div>
            `;
            return;
        }

        filtered.forEach(p => {
            const card = document.createElement('div');
            card.className = 'prompt-card';

            card.innerHTML = `
                <div class="prompt-card-header">
                    <h3 class="prompt-card-title">${escapeHtml(p.title)}</h3>
                    <span class="starter-card-tag">${escapeHtml(p.category)}</span>
                </div>
                <p class="prompt-card-desc">${escapeHtml(p.description)}</p>
                <div class="prompt-snippet">${escapeHtml(p.prompt)}</div>
                <div class="prompt-card-footer">
                    <button class="btn btn-secondary copy-prompt-btn" data-prompt="${escapeHtml(p.prompt)}">📋 Copy</button>
                    <button class="btn btn-primary use-prompt-btn" data-prompt="${escapeHtml(p.prompt)}">💬 Use in Chat</button>
                </div>
            `;

            // Event: Copy Prompt
            card.querySelector('.copy-prompt-btn').addEventListener('click', (e) => {
                const text = e.target.getAttribute('data-prompt');
                navigator.clipboard.writeText(text).then(() => {
                    e.target.innerHTML = '✓ Copied!';
                    window.showToast('Prompt copied to clipboard', 'success');
                    setTimeout(() => { e.target.innerHTML = '📋 Copy'; }, 2000);
                });
            });

            // Event: Use in Chat (redirects to index.html with prompt loaded)
            card.querySelector('.use-prompt-btn').addEventListener('click', (e) => {
                const text = e.target.getAttribute('data-prompt');
                sessionStorage.setItem('flowai_pending_prompt', text);
                window.location.href = 'index.html';
            });

            promptsGrid.appendChild(card);
        });
    }

    // Helper: Escape HTML
    function escapeHtml(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }

    // 4. Live Search Handler
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            renderPrompts();
        });
    }

    // 5. Category Filter Pills
    categoryPills.forEach(pill => {
        pill.addEventListener('click', () => {
            categoryPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            currentCategory = pill.getAttribute('data-category');
            renderPrompts();
        });
    });

    // 6. Modal Open/Close Controls
    function openModal() {
        if (modalOverlay) modalOverlay.classList.add('open');
    }
    function closeModal() {
        if (modalOverlay) modalOverlay.classList.remove('open');
        if (createPromptForm) createPromptForm.reset();
    }

    if (openModalBtn) openModalBtn.addEventListener('click', openModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);

    // Close on overlay click outside card
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
    }

    // 7. Form Submission: Add Custom Prompt
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
            window.showToast(`Custom prompt "${title}" added!`, 'success');
        });
    }

    // Initial Render
    renderPrompts();
});
