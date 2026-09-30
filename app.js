/**
 * FlowAI Workspace - Single Page Application (SPA)
 * Week 5 Final Project - Complete Client-Side Routing & State Management
 * Author: Bharath Kumar
 */

(() => {
    'use strict';

    /* ==========================================================================
       1. CENTRALIZED STATE STORE (LocalStorage Persistence)
       ========================================================================== */
    const STORAGE_KEY = 'flowai_spa_state_v1';

    const DEFAULT_PROMPTS = [
        {
            id: 'p-1',
            title: 'Modern SPA Architecture Review',
            category: 'Engineering',
            description: 'Evaluate client-side routing, DOM updates, and state management against industry best practices.',
            snippet: 'Analyze the architectural pros and cons of single page applications vs multi-page applications, focusing on client-side routing and cache invalidation.',
            tag: 'SPA / Architecture'
        },
        {
            id: 'p-2',
            title: 'WCAG AAA Accessibility Audit',
            category: 'Engineering',
            description: 'Review color contrast ratios, ARIA live announcers, focus traps, and keyboard shortcuts.',
            snippet: 'Conduct a thorough accessibility audit on this web component. List all required ARIA attributes, semantic landmarks, and keyboard event handlers.',
            tag: 'Accessibility'
        },
        {
            id: 'p-3',
            title: 'Executive Technical Summary',
            category: 'Writing',
            description: 'Draft a concise, high-impact summary suitable for engineering leadership and stakeholder reports.',
            snippet: 'Draft a 250-word executive summary detailing the implementation milestones, architectural hurdles, and performance metrics of our web platform.',
            tag: 'Documentation'
        },
        {
            id: 'p-4',
            title: 'Glassmorphic Design System',
            category: 'Design',
            description: 'Create harmonious CSS color tokens, backdrop filters, and subtle micro-interactions.',
            snippet: 'Generate a complete CSS custom properties token set for a sleek glassmorphic UI, ensuring WCAG 2.1 AAA high-contrast compliance in dark and light modes.',
            tag: 'UI / UX Design'
        },
        {
            id: 'p-5',
            title: 'Daily Standup & Sprint Optimizer',
            category: 'Productivity',
            description: 'Structure sprint blockers, current progress, and deliverables in bullet points.',
            snippet: 'Summarize today\'s development progress into What was done, What is next, and Blockers encountered for the frontend sprint standup.',
            tag: 'Agile / Workflow'
        },
        {
            id: 'p-6',
            title: 'CSS Grid & Flexbox Layout Bugfix',
            category: 'Engineering',
            description: 'Diagnose overflow, wrapping issues, and responsive collapse bugs.',
            snippet: 'I have a CSS grid layout that fails to shrink on mobile viewport widths below 480px. Help me diagnose and fix the minmax and auto-fill rules.',
            tag: 'CSS Debugging'
        }
    ];

    const DEFAULT_STATE = {
        sessions: [
            {
                id: 'session-spa-1',
                title: 'SPA Routing & Client-Side Navigation',
                createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
                messages: [
                    {
                        role: 'user',
                        text: 'How does client-side routing work in a Single Page Application without reloading the entire page?',
                        timestamp: '10:14 AM'
                    },
                    {
                        role: 'assistant',
                        text: 'In an SPA, client-side routing intercepts URL changes—either via the History API (`pushState` / `popstate`) or the HashChange API (`window.location.hash`). Instead of asking the web server for a new HTML document, JavaScript catches the change event, parses the route identifier, and dynamically mounts the appropriate UI view into a main container element (`#app-view`). State is preserved in memory or LocalStorage, yielding instant transitions without page blinks!',
                        timestamp: '10:15 AM'
                    }
                ]
            },
            {
                id: 'session-spa-2',
                title: 'WCAG AAA Accessibility Best Practices',
                createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
                messages: [
                    {
                        role: 'user',
                        text: 'What are the most critical steps to make an SPA accessible to screen readers?',
                        timestamp: 'Yesterday'
                    },
                    {
                        role: 'assistant',
                        text: 'Key SPA accessibility techniques include:\n1. An `aria-live="polite"` announcer region that announces page navigation.\n2. Managing focus: Shifting programmatic focus to the `<main>` container or view `<h1>` on route change.\n3. Semantic landmarks (`<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`).\n4. Keyboard shortcuts with clear `<kbd>` indicators.\n5. Ensuring a contrast ratio >= 7:1 for WCAG AAA compliance.',
                        timestamp: 'Yesterday'
                    }
                ]
            }
        ],
        currentSessionId: 'session-spa-1',
        prompts: DEFAULT_PROMPTS,
        settings: {
            theme: 'dark',
            fontSize: 'md',
            model: 'Gemini 2.5 Flash',
            temperature: 0.7,
            apiKey: 'flw-sec-99214-live-key',
            streamResponse: true
        },
        draftPrompt: ''
    };

    class StateStore {
        constructor() {
            this.state = this.loadState();
        }

        loadState() {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    return { ...DEFAULT_STATE, ...parsed };
                }
            } catch (err) {
                console.warn('Could not read state from localStorage, using defaults:', err);
            }
            return JSON.parse(JSON.stringify(DEFAULT_STATE));
        }

        saveState() {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
            } catch (err) {
                console.error('Failed to save state to localStorage:', err);
            }
        }

        getCurrentSession() {
            let session = this.state.sessions.find(s => s.id === this.state.currentSessionId);
            if (!session && this.state.sessions.length > 0) {
                this.state.currentSessionId = this.state.sessions[0].id;
                session = this.state.sessions[0];
                this.saveState();
            }
            return session;
        }

        createSession(title = 'New Conversation') {
            const newId = 'session-' + Date.now();
            const newSession = {
                id: newId,
                title: title,
                createdAt: new Date().toISOString(),
                messages: []
            };
            this.state.sessions.unshift(newSession);
            this.state.currentSessionId = newId;
            this.saveState();
            return newSession;
        }

        deleteSession(sessionId) {
            this.state.sessions = this.state.sessions.filter(s => s.id !== sessionId);
            if (this.state.currentSessionId === sessionId) {
                this.state.currentSessionId = this.state.sessions.length > 0 ? this.state.sessions[0].id : null;
            }
            this.saveState();
        }

        clearCurrentSessionMessages() {
            const session = this.getCurrentSession();
            if (session) {
                session.messages = [];
                this.saveState();
            }
        }

        addMessage(role, text) {
            let session = this.getCurrentSession();
            if (!session) {
                session = this.createSession();
            }
            
            // Auto update session title from first user query if still default
            if (session.messages.length === 0 && role === 'user') {
                session.title = text.length > 32 ? text.substring(0, 32) + '...' : text;
            }

            const now = new Date();
            const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            session.messages.push({
                role,
                text,
                timestamp: timeString
            });
            this.saveState();
        }

        addCustomPrompt(prompt) {
            const newPrompt = {
                id: 'p-' + Date.now(),
                title: prompt.title,
                category: prompt.category || 'Custom',
                description: prompt.description,
                snippet: prompt.snippet,
                tag: prompt.tag || prompt.category
            };
            this.state.prompts.unshift(newPrompt);
            this.saveState();
            return newPrompt;
        }

        updateSettings(newSettings) {
            this.state.settings = { ...this.state.settings, ...newSettings };
            this.saveState();
        }

        clearAllHistory() {
            this.state.sessions = [];
            this.state.currentSessionId = null;
            this.saveState();
        }

        resetToFactoryDefaults() {
            this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
            this.saveState();
        }
    }

    const store = new StateStore();

    /* ==========================================================================
       2. ACCESSIBILITY & TOAST NOTIFICATION UTILITIES
       ========================================================================== */
    const ariaAnnouncer = document.getElementById('aria-announcer');
    const toastContainer = document.getElementById('toast-container');

    function announce(text) {
        if (ariaAnnouncer) {
            ariaAnnouncer.textContent = text;
        }
    }

    function showToast(message, type = 'info') {
        if (!toastContainer) return;
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.setAttribute('role', 'alert');
        
        let icon = 'ℹ️';
        if (type === 'success') icon = '✅';
        if (type === 'error') icon = '⚠️';

        toast.innerHTML = `<span aria-hidden="true">${icon}</span> <span>${escapeHtml(message)}</span>`;
        toastContainer.appendChild(toast);

        announce(message);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 300);
        }, 3200);
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    /* ==========================================================================
       3. THEME & DISPLAY INITIALIZATION
       ========================================================================== */
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const themeIcon = document.getElementById('theme-icon');

    function applyTheme(theme) {
        if (theme === 'system') {
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', systemPrefersDark ? 'dark' : 'light');
        } else {
            document.documentElement.setAttribute('data-theme', theme);
        }
        const currentActiveTheme = document.documentElement.getAttribute('data-theme');
        if (themeIcon) {
            themeIcon.textContent = currentActiveTheme === 'dark' ? '☀️' : '🌙';
        }
    }

    function applyFontSize(fontSize) {
        document.body.setAttribute('data-font-size', fontSize);
    }

    // Initialize Theme & Typography
    applyTheme(store.state.settings.theme);
    applyFontSize(store.state.settings.fontSize);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            store.updateSettings({ theme: next });
            applyTheme(next);
            showToast(`Theme changed to ${next} mode`, 'success');
        });
    }

    // Mobile Navigation Toggle
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            const isOpen = navLinks.classList.toggle('open');
            menuToggle.setAttribute('aria-expanded', String(isOpen));
        });
    }

    /* ==========================================================================
       4. CLIENT-SIDE ROUTER ARCHITECTURE
       ========================================================================== */
    const appView = document.getElementById('app-view');
    const appLayout = document.getElementById('app-layout');
    const sidebarSessionsList = document.getElementById('sidebar-sessions');
    const sessionCountBadge = document.getElementById('session-count');
    const activeModelDisplay = document.getElementById('active-model-display');
    const newChatBtn = document.getElementById('new-chat-btn');

    // Update Sidebar Sessions List
    function updateSidebarSessions() {
        if (!sidebarSessionsList) return;
        sidebarSessionsList.innerHTML = '';
        
        const sessions = store.state.sessions;
        if (sessionCountBadge) {
            sessionCountBadge.textContent = sessions.length;
        }

        if (activeModelDisplay) {
            activeModelDisplay.textContent = store.state.settings.model || 'Gemini 2.5 Flash';
        }

        if (sessions.length === 0) {
            const emptyItem = document.createElement('li');
            emptyItem.style.padding = '12px 14px';
            emptyItem.style.fontSize = '0.85rem';
            emptyItem.style.color = 'var(--text-muted)';
            emptyItem.textContent = 'No conversations yet.';
            sidebarSessionsList.appendChild(emptyItem);
            return;
        }

        sessions.forEach(session => {
            const li = document.createElement('li');
            li.className = `session-item ${session.id === store.state.currentSessionId ? 'active' : ''}`;
            li.setAttribute('tabindex', '0');
            li.setAttribute('role', 'button');
            li.setAttribute('aria-label', `Open conversation: ${session.title}`);

            const titleSpan = document.createElement('span');
            titleSpan.style.overflow = 'hidden';
            titleSpan.style.textOverflow = 'ellipsis';
            titleSpan.style.whiteSpace = 'nowrap';
            titleSpan.style.maxWidth = '180px';
            titleSpan.textContent = session.title;

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'session-del-btn';
            deleteBtn.setAttribute('title', 'Delete conversation');
            deleteBtn.setAttribute('aria-label', `Delete conversation ${session.title}`);
            deleteBtn.innerHTML = '🗑️';

            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm(`Delete session "${session.title}"?`)) {
                    store.deleteSession(session.id);
                    updateSidebarSessions();
                    if (window.location.hash.includes('/chat') || window.location.hash === '' || window.location.hash === '#') {
                        router.renderCurrentRoute();
                    }
                    showToast('Session deleted', 'info');
                }
            });

            li.appendChild(titleSpan);
            li.appendChild(deleteBtn);

            const selectSession = () => {
                store.state.currentSessionId = session.id;
                store.saveState();
                updateSidebarSessions();
                if (window.location.hash !== '#/chat') {
                    window.location.hash = '#/chat';
                } else {
                    renderChatView();
                }
            };

            li.addEventListener('click', selectSession);
            li.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    selectSession();
                }
            });

            sidebarSessionsList.appendChild(li);
        });
    }

    // Sidebar New Chat Button Listener
    if (newChatBtn) {
        newChatBtn.addEventListener('click', () => {
            createNewChatSession();
        });
    }

    // Global Shortcut: Alt + N for New Chat
    window.addEventListener('keydown', (e) => {
        if (e.altKey && (e.key === 'n' || e.key === 'N')) {
            e.preventDefault();
            createNewChatSession();
        }
    });

    function createNewChatSession() {
        const session = store.createSession('New Chat');
        updateSidebarSessions();
        if (window.location.hash !== '#/chat') {
            window.location.hash = '#/chat';
        } else {
            renderChatView();
        }
        showToast('Started new conversation', 'success');
        setTimeout(() => {
            const chatInput = document.getElementById('chat-input');
            if (chatInput) chatInput.focus();
        }, 100);
    }

    // Client-Side Router Implementation
    const router = {
        routes: {
            '/chat': { title: 'FlowAI - Chat Workspace', render: renderChatView, showSidebar: true },
            '/prompts': { title: 'FlowAI - Prompts Library', render: renderPromptsView, showSidebar: false },
            '/history': { title: 'FlowAI - Conversation History', render: renderHistoryView, showSidebar: false },
            '/settings': { title: 'FlowAI - Workspace Settings', render: renderSettingsView, showSidebar: false }
        },

        getCurrentPath() {
            const hash = window.location.hash.slice(1);
            if (!hash || hash === '/' || hash === '') return '/chat';
            return hash;
        },

        renderCurrentRoute() {
            const path = this.getCurrentPath();
            const route = this.routes[path] || this.routes['/chat'];

            // Update Navigation active state
            document.querySelectorAll('.nav-link').forEach(link => {
                const routeAttr = link.getAttribute('data-route');
                if (routeAttr === path || (path === '/chat' && routeAttr === '/chat')) {
                    link.classList.add('active');
                    link.setAttribute('aria-current', 'page');
                } else {
                    link.classList.remove('active');
                    link.removeAttribute('aria-current');
                }
            });

            // Close mobile menu if opened
            if (navLinks && navLinks.classList.contains('open')) {
                navLinks.classList.remove('open');
                if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
            }

            // Adapt Layout (Sidebar presence)
            if (appLayout) {
                if (route.showSidebar) {
                    appLayout.classList.remove('no-sidebar');
                } else {
                    appLayout.classList.add('no-sidebar');
                }
            }

            // Update Document Title & Accessibility Announcement
            document.title = route.title;
            announce(`Loaded ${route.title.replace('FlowAI - ', '')}`);

            // Reset Animation on View Container
            if (appView) {
                appView.classList.remove('spa-view-container');
                void appView.offsetWidth; // Force reflow
                appView.classList.add('spa-view-container');
            }

            // Execute View Render
            route.render();

            // Refresh sessions list
            updateSidebarSessions();

            // Shift focus smoothly to main container for keyboard users
            if (appView) {
                appView.focus();
            }
        },

        init() {
            window.addEventListener('hashchange', () => this.renderCurrentRoute());
            if (!window.location.hash) {
                window.location.hash = '#/chat';
            } else {
                this.renderCurrentRoute();
            }
        }
    };

    /* ==========================================================================
       5. VIEW: CHAT WORKSPACE COMPONENT
       ========================================================================== */
    function renderChatView() {
        let session = store.getCurrentSession();
        if (!session) {
            session = store.createSession('New Chat');
        }

        const currentModel = store.state.settings.model || 'Gemini 2.5 Flash';

        appView.innerHTML = `
            <div class="chat-workspace">
                <header class="workspace-header">
                    <div class="workspace-title-box">
                        <h2 id="chat-heading">${escapeHtml(session.title)}</h2>
                        <p>Model: <strong>${escapeHtml(currentModel)}</strong> &bull; Client-Side Session Active</p>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button id="clear-chat-btn" class="btn btn-secondary" title="Clear current session messages" aria-label="Clear chat messages">
                            <span>🧹</span> Clear Chat
                        </button>
                        <button id="export-chat-btn" class="btn btn-secondary" title="Export session transcript" aria-label="Export chat transcript">
                            <span>📥</span> Export
                        </button>
                    </div>
                </header>

                ${session.messages.length === 0 ? `
                    <section class="starter-prompts" aria-labelledby="starter-heading">
                        <div class="starter-card" tabindex="0" role="button" data-prompt="Analyze the trade-offs of Single Page Applications vs Multi Page Applications in terms of SEO, performance, and client routing.">
                            <div class="card-icon-box">⚡</div>
                            <div class="card-body">
                                <h3>SPA vs MPA Analysis</h3>
                                <p>Compare routing, dynamic rendering, and performance bottlenecks.</p>
                                <span class="tag">Architecture</span>
                            </div>
                        </div>
                        <div class="starter-card" tabindex="0" role="button" data-prompt="Explain how to build accessible modals with focus trapping, Escape key closing, and ARIA attributes in Vanilla JS.">
                            <div class="card-icon-box">♿</div>
                            <div class="card-body">
                                <h3>Accessible Modals</h3>
                                <p>Learn focus traps, screen reader live announcements, and ARIA dialogs.</p>
                                <span class="tag">Accessibility</span>
                            </div>
                        </div>
                        <div class="starter-card" tabindex="0" role="button" data-prompt="Write an optimized JavaScript function to debounce search inputs and prevent layout thrashing.">
                            <div class="card-icon-box">💻</div>
                            <div class="card-body">
                                <h3>Debounced Search</h3>
                                <p>Generate performant client-side query filters without UI lag.</p>
                                <span class="tag">Optimization</span>
                            </div>
                        </div>
                        <div class="starter-card" tabindex="0" role="button" data-prompt="Give me 5 practical tips to achieve WCAG AAA 7:1 color contrast and smooth glassmorphism.">
                            <div class="card-icon-box">🎨</div>
                            <div class="card-body">
                                <h3>Design System</h3>
                                <p>Explore modern glassmorphism that satisfies strict contrast criteria.</p>
                                <span class="tag">UI / UX</span>
                            </div>
                        </div>
                    </section>
                ` : ''}

                <div class="chat-container">
                    <div class="chat-thread" id="chat-thread" role="log" aria-live="polite" aria-label="Chat messages thread">
                        <!-- Messages dynamically rendered here -->
                    </div>

                    <div class="chat-input-bar">
                        <input type="text" id="chat-input" placeholder="Type your query or choose a prompt starter... (Press Enter)" aria-label="Chat query input">
                        <button id="chat-send-btn" class="send-btn" aria-label="Send message">
                            <span>Send</span> <span aria-hidden="true">➤</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        const chatThread = document.getElementById('chat-thread');
        const chatInput = document.getElementById('chat-input');
        const chatSendBtn = document.getElementById('chat-send-btn');
        const clearChatBtn = document.getElementById('clear-chat-btn');
        const exportChatBtn = document.getElementById('export-chat-btn');

        // Render Existing Messages
        function renderMessages() {
            chatThread.innerHTML = '';
            session.messages.forEach((msg, idx) => {
                const isUser = msg.role === 'user';
                const msgEl = document.createElement('div');
                msgEl.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
                msgEl.innerHTML = `
                    <div class="avatar" aria-hidden="true">${isUser ? '👤' : '🤖'}</div>
                    <div style="display: flex; flex-direction: column; gap: 4px;">
                        <div class="bubble">${escapeHtml(msg.text)}</div>
                        <div style="display: flex; align-items: center; justify-content: ${isUser ? 'flex-end' : 'flex-start'}; gap: 8px;">
                            <span style="font-size: 0.72rem; color: var(--text-muted);">${escapeHtml(msg.timestamp || '')}</span>
                            ${!isUser ? `<button class="msg-action-btn copy-msg-btn" data-idx="${idx}" title="Copy message text">📋 Copy</button>` : ''}
                        </div>
                    </div>
                `;
                chatThread.appendChild(msgEl);
            });

            // Attach Copy buttons
            chatThread.querySelectorAll('.copy-msg-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const msgIdx = parseInt(btn.getAttribute('data-idx'), 10);
                    const msgToCopy = session.messages[msgIdx];
                    if (msgToCopy) {
                        navigator.clipboard.writeText(msgToCopy.text).then(() => {
                            showToast('Copied message to clipboard!', 'success');
                        }).catch(() => {
                            showToast('Failed to copy', 'error');
                        });
                    }
                });
            });

            // Auto-scroll to latest message
            chatThread.scrollTop = chatThread.scrollHeight;
        }

        renderMessages();

        // Check if there is a draft prompt from Prompts Library
        if (store.state.draftPrompt) {
            chatInput.value = store.state.draftPrompt;
            store.state.draftPrompt = '';
            store.saveState();
            chatInput.focus();
        }

        // Handle Starter Card Clicks
        document.querySelectorAll('.starter-card').forEach(card => {
            const promptText = card.getAttribute('data-prompt');
            const handleSelect = () => {
                chatInput.value = promptText;
                handleSendMessage();
            };
            card.addEventListener('click', handleSelect);
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelect();
                }
            });
        });

        // Send Message Functionality
        let isSimulating = false;
        function handleSendMessage() {
            const text = chatInput.value.trim();
            if (!text || isSimulating) return;

            // Add User Message
            store.addMessage('user', text);
            chatInput.value = '';
            renderMessages();
            updateSidebarSessions();

            // Update title if needed
            const updatedTitle = document.getElementById('chat-heading');
            if (updatedTitle) updatedTitle.textContent = session.title;

            // Show Animated Typing Indicator
            isSimulating = true;
            chatSendBtn.disabled = true;

            const typingIndicator = document.createElement('div');
            typingIndicator.className = 'message ai-message';
            typingIndicator.id = 'typing-indicator-msg';
            typingIndicator.innerHTML = `
                <div class="avatar" aria-hidden="true">🤖</div>
                <div class="typing-indicator" aria-label="FlowAI is thinking">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            `;
            chatThread.appendChild(typingIndicator);
            chatThread.scrollTop = chatThread.scrollHeight;

            // Intelligent simulated AI response based on query
            setTimeout(() => {
                const indicator = document.getElementById('typing-indicator-msg');
                if (indicator) indicator.remove();

                const aiReply = generateAiResponse(text, currentModel);
                store.addMessage('assistant', aiReply);
                renderMessages();
                updateSidebarSessions();

                isSimulating = false;
                chatSendBtn.disabled = false;
                chatInput.focus();
                announce('FlowAI has answered your query.');
            }, 900);
        }

        chatSendBtn.addEventListener('click', handleSendMessage);
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSendMessage();
            }
        });

        // Clear Chat Action
        clearChatBtn.addEventListener('click', () => {
            if (session.messages.length === 0) {
                showToast('Chat is already empty.', 'info');
                return;
            }
            if (confirm('Clear all messages in this conversation?')) {
                store.clearCurrentSessionMessages();
                renderChatView();
                showToast('Conversation cleared.', 'info');
            }
        });

        // Export Chat Action
        exportChatBtn.addEventListener('click', () => {
            if (session.messages.length === 0) {
                showToast('No messages to export.', 'info');
                return;
            }
            const exportText = `FlowAI Workspace - Conversation Transcript\nSession: ${session.title}\nDate: ${new Date(session.createdAt).toLocaleString()}\nModel: ${currentModel}\n----------------------------------------\n\n` +
                session.messages.map(m => `[${m.timestamp}] ${m.role.toUpperCase()}:\n${m.text}\n`).join('\n');
            
            downloadFile(`${session.title.replace(/[^a-zA-Z0-9]/g, '_')}_transcript.txt`, exportText, 'text/plain');
            showToast('Transcript downloaded!', 'success');
        });
    }

    // AI Response Generator Simulation
    function generateAiResponse(query, model) {
        const lower = query.toLowerCase();
        
        if (lower.includes('spa') || lower.includes('single page')) {
            return `Single Page Applications (SPAs) maintain application state inside client memory and use dynamic DOM injection without round-trip HTML page refreshes. In this FlowAI implementation, we utilize hash-based client routing (\`#/chat\`, \`#/prompts\`, \`#/history\`, \`#/settings\`), a reactive store persisting to LocalStorage, and CSS view fade-in animations to deliver sub-millisecond route transitions.`;
        }

        if (lower.includes('contrast') || lower.includes('accessibility') || lower.includes('wcag')) {
            return `Accessibility (a11y) in modern web development requires compliance with WCAG 2.1 AA/AAA criteria. Key pillars include:
1. High Contrast: Text contrast >= 7:1 for normal text and >= 4.5:1 for large headings.
2. Focus Management: Using visible \`:focus-visible\` rings and trapping keyboard focus within dialogs.
3. Screen Reader Live Announcements: Dynamically pushing route updates to an \`aria-live="polite"\` container.`;
        }

        if (lower.includes('css') || lower.includes('style') || lower.includes('design')) {
            return `For modern UI styling, Vanilla CSS custom properties (variables) provide superior runtime flexibility, zero bundle overhead, and instant theme switching. By pairing \`backdrop-filter: blur(12px)\` with subtle border tokens and cubic-bezier easing (\`cubic-bezier(0.16, 1, 0.3, 1)\`), we achieve a high-end glassmorphic aesthetic without external library bloat.`;
        }

        if (lower.includes('debounce') || lower.includes('optimize') || lower.includes('performance')) {
            return `Here is a high-performance debounced search pattern:
\`\`\`js
function debounce(fn, delay = 250) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}
\`\`\`
This prevents search query callbacks from thrashing the DOM or blocking the main thread on every keystroke!`;
        }

        if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
            return `Hello! I'm FlowAI, powered by ${model}. How can I assist your engineering, design, or architecture workflow today? You can choose a starter prompt or type any query!`;
        }

        return `Thank you for your prompt! Using ${model}, I processed your request: "${query.length > 60 ? query.substring(0, 60) + '...' : query}". FlowAI's SPA architecture enables dynamic execution, local state caching, and rapid responses. Let me know if you would like me to elaborate, generate code, or draft technical documentation!`;
    }

    /* ==========================================================================
       6. VIEW: PROMPTS LIBRARY COMPONENT
       ========================================================================== */
    function renderPromptsView() {
        appView.innerHTML = `
            <div class="page-container">
                <header class="page-header">
                    <div>
                        <h1>💡 Prompt Engineering Library</h1>
                        <p>Curated prompts to accelerate development, architectural reviews, and content workflows.</p>
                    </div>
                    <button id="add-prompt-btn" class="btn btn-primary" aria-label="Add custom prompt">
                        <span>➕</span> Add Custom Prompt
                    </button>
                </header>

                <div class="search-filter-bar">
                    <div class="search-box">
                        <span class="search-icon" aria-hidden="true">🔍</span>
                        <input type="text" id="prompt-search-input" placeholder="Search prompts by title, snippet, or tag..." aria-label="Search prompt library">
                    </div>
                    <div class="category-pills" role="radiogroup" aria-label="Filter prompts by category">
                        <button class="pill-btn active" data-category="All" role="radio" aria-checked="true">All Prompts</button>
                        <button class="pill-btn" data-category="Engineering" role="radio" aria-checked="false">Engineering</button>
                        <button class="pill-btn" data-category="Writing" role="radio" aria-checked="false">Writing</button>
                        <button class="pill-btn" data-category="Design" role="radio" aria-checked="false">Design</button>
                        <button class="pill-btn" data-category="Productivity" role="radio" aria-checked="false">Productivity</button>
                    </div>
                </div>

                <div class="prompts-grid" id="prompts-grid" role="region" aria-label="Prompts listing">
                    <!-- Dynamic Prompt Cards -->
                </div>
            </div>
        `;

        const promptsGrid = document.getElementById('prompts-grid');
        const searchInput = document.getElementById('prompt-search-input');
        const categoryPills = document.querySelectorAll('.pill-btn');
        const addPromptBtn = document.getElementById('add-prompt-btn');

        let activeCategory = 'All';
        let searchQuery = '';

        function renderGrid() {
            promptsGrid.innerHTML = '';
            const filtered = store.state.prompts.filter(p => {
                const matchesCategory = activeCategory === 'All' || p.category.toLowerCase() === activeCategory.toLowerCase();
                const q = searchQuery.toLowerCase();
                const matchesSearch = !q || 
                    p.title.toLowerCase().includes(q) || 
                    p.description.toLowerCase().includes(q) || 
                    p.snippet.toLowerCase().includes(q) || 
                    (p.tag && p.tag.toLowerCase().includes(q));
                return matchesCategory && matchesSearch;
            });

            if (filtered.length === 0) {
                promptsGrid.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 48px; background: var(--bg-surface); border: 1px dashed var(--border-color); border-radius: var(--radius-md);">
                        <p style="font-size: 1.1rem; font-weight: 700;">No prompts found matching your criteria.</p>
                        <p style="color: var(--text-secondary); margin-top: 6px;">Try adjusting your search terms or select "All Prompts".</p>
                    </div>
                `;
                return;
            }

            filtered.forEach(prompt => {
                const card = document.createElement('article');
                card.className = 'prompt-card';
                card.innerHTML = `
                    <div class="prompt-card-header">
                        <span class="tag">${escapeHtml(prompt.category)}</span>
                        <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">${escapeHtml(prompt.tag || '')}</span>
                    </div>
                    <h2 class="prompt-card-title">${escapeHtml(prompt.title)}</h2>
                    <p class="prompt-card-desc">${escapeHtml(prompt.description)}</p>
                    <div class="prompt-snippet">${escapeHtml(prompt.snippet)}</div>
                    <div class="prompt-card-footer">
                        <button class="btn btn-secondary copy-snippet-btn" data-snippet="${escapeHtml(prompt.snippet)}" title="Copy prompt text">
                            <span>📋</span> Copy
                        </button>
                        <button class="btn btn-primary use-in-chat-btn" data-snippet="${escapeHtml(prompt.snippet)}" title="Use this prompt in chat">
                            <span>💬</span> Use in Chat
                        </button>
                    </div>
                `;
                promptsGrid.appendChild(card);
            });

            // Copy Snippet buttons
            promptsGrid.querySelectorAll('.copy-snippet-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const text = btn.getAttribute('data-snippet');
                    navigator.clipboard.writeText(text).then(() => {
                        showToast('Prompt copied to clipboard!', 'success');
                    });
                });
            });

            // Use in Chat buttons (Navigate to #/chat & pre-populate)
            promptsGrid.querySelectorAll('.use-in-chat-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const text = btn.getAttribute('data-snippet');
                    store.state.draftPrompt = text;
                    store.saveState();
                    window.location.hash = '#/chat';
                });
            });
        }

        renderGrid();

        // Search Input Filter
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.trim();
            renderGrid();
        });

        // Category Pills Filter
        categoryPills.forEach(pill => {
            pill.addEventListener('click', () => {
                categoryPills.forEach(p => {
                    p.classList.remove('active');
                    p.setAttribute('aria-checked', 'false');
                });
                pill.classList.add('active');
                pill.setAttribute('aria-checked', 'true');
                activeCategory = pill.getAttribute('data-category');
                renderGrid();
            });
        });

        // Add Custom Prompt Modal
        addPromptBtn.addEventListener('click', () => {
            openCustomPromptModal(() => {
                renderGrid();
            });
        });
    }

    // Modal Handler: Add Custom Prompt
    function openCustomPromptModal(onSaved) {
        const modalRoot = document.getElementById('app-modal-root');
        if (!modalRoot) return;

        modalRoot.innerHTML = `
            <div class="modal-overlay open" id="prompt-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-prompt-title">
                <div class="modal-card">
                    <div class="modal-header">
                        <h2 id="modal-prompt-title" style="font-size: 1.25rem; font-weight: 800;">Add Custom Prompt</h2>
                        <button class="modal-close-btn" id="modal-close-btn" aria-label="Close dialog">&times;</button>
                    </div>
                    <form id="custom-prompt-form" style="display: flex; flex-direction: column; gap: 16px;">
                        <div class="form-group">
                            <label for="prompt-title" class="form-label">Prompt Title</label>
                            <input type="text" id="prompt-title" class="form-control" placeholder="e.g. Next.js Routing Architecture" required>
                        </div>
                        <div class="form-group">
                            <label for="prompt-category" class="form-label">Category</label>
                            <select id="prompt-category" class="form-control">
                                <option value="Engineering">Engineering</option>
                                <option value="Writing">Writing</option>
                                <option value="Design">Design</option>
                                <option value="Productivity">Productivity</option>
                                <option value="Custom">Custom</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="prompt-desc" class="form-label">Short Description</label>
                            <input type="text" id="prompt-desc" class="form-control" placeholder="Brief summary of when to use this prompt" required>
                        </div>
                        <div class="form-group">
                            <label for="prompt-snippet-input" class="form-label">Prompt Snippet</label>
                            <textarea id="prompt-snippet-input" class="form-control" rows="4" placeholder="Enter complete prompt text..." required style="resize: vertical;"></textarea>
                        </div>
                        <div class="modal-footer">
                            <button type="button" id="modal-cancel-btn" class="btn btn-secondary">Cancel</button>
                            <button type="submit" class="btn btn-primary">Save Prompt</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        const overlay = document.getElementById('prompt-modal-overlay');
        const closeBtn = document.getElementById('modal-close-btn');
        const cancelBtn = document.getElementById('modal-cancel-btn');
        const form = document.getElementById('custom-prompt-form');
        const firstInput = document.getElementById('prompt-title');

        if (firstInput) firstInput.focus();

        function closeModal() {
            modalRoot.innerHTML = '';
        }

        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });

        window.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                closeModal();
                window.removeEventListener('keydown', escHandler);
            }
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('prompt-title').value.trim();
            const category = document.getElementById('prompt-category').value;
            const description = document.getElementById('prompt-desc').value.trim();
            const snippet = document.getElementById('prompt-snippet-input').value.trim();

            if (title && description && snippet) {
                store.addCustomPrompt({ title, category, description, snippet });
                showToast('Custom prompt saved successfully!', 'success');
                closeModal();
                if (onSaved) onSaved();
            }
        });
    }

    /* ==========================================================================
       7. VIEW: CONVERSATION HISTORY COMPONENT
       ========================================================================== */
    function renderHistoryView() {
        const sessions = store.state.sessions;
        const totalMessages = sessions.reduce((acc, s) => acc + s.messages.length, 0);
        const currentModel = store.state.settings.model || 'Gemini 2.5 Flash';

        appView.innerHTML = `
            <div class="page-container">
                <header class="page-header">
                    <div>
                        <h1>🕒 Conversation History & Transcripts</h1>
                        <p>Review past interactions, resume active sessions, or export complete transcripts.</p>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button id="export-all-history-btn" class="btn btn-secondary" title="Export all conversations">
                            <span>📥</span> Export All (JSON)
                        </button>
                        <button id="clear-all-history-btn" class="btn btn-danger" title="Purge all saved sessions">
                            <span>🗑️</span> Clear All History
                        </button>
                    </div>
                </header>

                <div class="history-stats">
                    <div class="stat-card">
                        <span class="stat-value">${sessions.length}</span>
                        <span class="stat-label">Saved Sessions</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-value">${totalMessages}</span>
                        <span class="stat-label">Total Messages Exchanged</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-value" style="font-size: 1.3rem; margin-top: 6px;">${escapeHtml(currentModel)}</span>
                        <span class="stat-label">Active Intelligence Model</span>
                    </div>
                </div>

                <div class="search-box" style="margin-bottom: 24px;">
                    <span class="search-icon" aria-hidden="true">🔍</span>
                    <input type="text" id="history-search-input" placeholder="Search saved conversations by title or message keyword..." aria-label="Search conversation history">
                </div>

                <div class="history-list" id="history-list-container">
                    <!-- Dynamic History Items -->
                </div>
            </div>
        `;

        const historyContainer = document.getElementById('history-list-container');
        const historySearch = document.getElementById('history-search-input');
        const exportAllBtn = document.getElementById('export-all-history-btn');
        const clearAllBtn = document.getElementById('clear-all-history-btn');

        function renderHistoryList(filterTerm = '') {
            historyContainer.innerHTML = '';
            const filteredSessions = sessions.filter(s => {
                if (!filterTerm) return true;
                const term = filterTerm.toLowerCase();
                const titleMatch = s.title.toLowerCase().includes(term);
                const msgMatch = s.messages.some(m => m.text.toLowerCase().includes(term));
                return titleMatch || msgMatch;
            });

            if (filteredSessions.length === 0) {
                historyContainer.innerHTML = `
                    <div style="text-align: center; padding: 48px; background: var(--bg-surface); border: 1px dashed var(--border-color); border-radius: var(--radius-md);">
                        <p style="font-size: 1.1rem; font-weight: 700;">No history records found.</p>
                        <p style="color: var(--text-secondary); margin-top: 6px;">Start a new conversation in the Chat view to build your history log.</p>
                    </div>
                `;
                return;
            }

            filteredSessions.forEach(session => {
                const item = document.createElement('article');
                item.className = 'history-item';
                
                const lastMsg = session.messages.length > 0 ? session.messages[session.messages.length - 1].text : 'No messages yet';
                const dateStr = new Date(session.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

                item.innerHTML = `
                    <div class="history-item-info">
                        <h2 class="history-item-title">${escapeHtml(session.title)}</h2>
                        <div class="history-item-meta">
                            <span>📅 ${dateStr}</span>
                            <span>💬 ${session.messages.length} message${session.messages.length === 1 ? '' : 's'}</span>
                        </div>
                        <p style="font-size: 0.86rem; color: var(--text-muted); margin-top: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 650px;">
                            ${escapeHtml(lastMsg)}
                        </p>
                    </div>
                    <div class="history-actions">
                        <button class="btn btn-primary resume-chat-btn" data-id="${session.id}" title="Resume this chat">
                            <span>💬</span> Resume
                        </button>
                        <button class="btn btn-secondary download-transcript-btn" data-id="${session.id}" title="Download conversation text">
                            <span>📥</span>
                        </button>
                        <button class="btn btn-secondary delete-session-btn" data-id="${session.id}" title="Delete session" style="color: var(--danger-color);">
                            <span>🗑️</span>
                        </button>
                    </div>
                `;
                historyContainer.appendChild(item);
            });

            // Resume Chat button handlers
            historyContainer.querySelectorAll('.resume-chat-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const sid = btn.getAttribute('data-id');
                    store.state.currentSessionId = sid;
                    store.saveState();
                    window.location.hash = '#/chat';
                });
            });

            // Download individual transcript handlers
            historyContainer.querySelectorAll('.download-transcript-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const sid = btn.getAttribute('data-id');
                    const sess = store.state.sessions.find(s => s.id === sid);
                    if (sess) {
                        const transcriptText = `FlowAI Workspace - Session Transcript\nSession: ${sess.title}\nDate: ${new Date(sess.createdAt).toLocaleString()}\n----------------------------------------\n\n` +
                            sess.messages.map(m => `[${m.timestamp}] ${m.role.toUpperCase()}:\n${m.text}\n`).join('\n');
                        downloadFile(`${sess.title.replace(/[^a-zA-Z0-9]/g, '_')}_transcript.txt`, transcriptText, 'text/plain');
                        showToast('Transcript downloaded!', 'success');
                    }
                });
            });

            // Delete session button handlers
            historyContainer.querySelectorAll('.delete-session-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const sid = btn.getAttribute('data-id');
                    const sess = store.state.sessions.find(s => s.id === sid);
                    if (confirm(`Delete session "${sess ? sess.title : ''}"?`)) {
                        store.deleteSession(sid);
                        updateSidebarSessions();
                        renderHistoryList(historySearch.value.trim());
                        showToast('Session removed', 'info');
                    }
                });
            });
        }

        renderHistoryList();

        // Search Filter
        historySearch.addEventListener('input', (e) => {
            renderHistoryList(e.target.value.trim());
        });

        // Export All Conversations (JSON)
        exportAllBtn.addEventListener('click', () => {
            if (sessions.length === 0) {
                showToast('No history available to export.', 'info');
                return;
            }
            const dataStr = JSON.stringify(sessions, null, 2);
            downloadFile(`flowai_all_sessions_${Date.now()}.json`, dataStr, 'application/json');
            showToast('Exported all sessions as JSON!', 'success');
        });

        // Clear All History
        clearAllBtn.addEventListener('click', () => {
            if (sessions.length === 0) {
                showToast('History is already clear.', 'info');
                return;
            }
            if (confirm('Are you sure you want to permanently erase all conversation history?')) {
                store.clearAllHistory();
                updateSidebarSessions();
                renderHistoryView();
                showToast('All conversation history erased.', 'info');
            }
        });
    }

    /* ==========================================================================
       8. VIEW: SETTINGS COMPONENT
       ========================================================================== */
    function renderSettingsView() {
        const settings = store.state.settings;

        // Calculate storage usage
        let storageKB = '0.0';
        try {
            const str = localStorage.getItem(STORAGE_KEY) || '';
            storageKB = (new Blob([str]).size / 1024).toFixed(1);
        } catch (e) {
            storageKB = 'N/A';
        }

        appView.innerHTML = `
            <div class="page-container">
                <header class="page-header">
                    <div>
                        <h1>⚙️ Workspace Settings & Preferences</h1>
                        <p>Configure model parameters, display aesthetics, theme preferences, and security keys.</p>
                    </div>
                    <button id="save-settings-btn" class="btn btn-primary" aria-label="Save settings">
                        <span>💾</span> Save Changes
                    </button>
                </header>

                <div class="settings-grid">
                    <!-- Appearance Card -->
                    <div class="settings-card">
                        <h2 class="settings-card-title">🎨 Appearance & Display</h2>
                        
                        <div class="form-group">
                            <label for="settings-theme" class="form-label">Theme Mode</label>
                            <p class="form-desc">Select high-contrast dark or light mode with WCAG 2.1 AAA color ratios.</p>
                            <select id="settings-theme" class="form-control">
                                <option value="dark" ${settings.theme === 'dark' ? 'selected' : ''}>Dark Mode (Default)</option>
                                <option value="light" ${settings.theme === 'light' ? 'selected' : ''}>Light Mode</option>
                                <option value="system" ${settings.theme === 'system' ? 'selected' : ''}>System Default</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="settings-font-size" class="form-label">Interface Font Scaling</label>
                            <p class="form-desc">Adjust the base font scaling across the Single Page Application.</p>
                            <select id="settings-font-size" class="form-control">
                                <option value="sm" ${settings.fontSize === 'sm' ? 'selected' : ''}>Small (14px)</option>
                                <option value="md" ${settings.fontSize === 'md' ? 'selected' : ''}>Medium (16px - Standard)</option>
                                <option value="lg" ${settings.fontSize === 'lg' ? 'selected' : ''}>Large (18px - High Accessibility)</option>
                            </select>
                        </div>
                    </div>

                    <!-- Intelligence Model Card -->
                    <div class="settings-card">
                        <h2 class="settings-card-title">🧠 Model & Inference Parameters</h2>
                        
                        <div class="form-group">
                            <label for="settings-model" class="form-label">Default LLM Model</label>
                            <p class="form-desc">Choose the foundational inference model for workspace simulations.</p>
                            <select id="settings-model" class="form-control">
                                <option value="Gemini 2.5 Flash" ${settings.model === 'Gemini 2.5 Flash' ? 'selected' : ''}>Gemini 2.5 Flash (Ultra-fast, Recommended)</option>
                                <option value="Gemini 1.5 Pro" ${settings.model === 'Gemini 1.5 Pro' ? 'selected' : ''}>Gemini 1.5 Pro (Deep Reasoning)</option>
                                <option value="Claude 3.5 Sonnet" ${settings.model === 'Claude 3.5 Sonnet' ? 'selected' : ''}>Claude 3.5 Sonnet (Coding & Context)</option>
                                <option value="GPT-4o" ${settings.model === 'GPT-4o' ? 'selected' : ''}>GPT-4o (Multimodal Standard)</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <label for="settings-temp" class="form-label">Creativity / Temperature</label>
                                <span class="slider-val-badge" id="temp-val-display">${settings.temperature}</span>
                            </div>
                            <p class="form-desc">Lower values yield deterministic technical responses; higher values encourage brainstorming.</p>
                            <div class="range-slider-wrapper">
                                <input type="range" id="settings-temp" min="0.0" max="1.0" step="0.1" value="${settings.temperature}">
                            </div>
                        </div>
                    </div>

                    <!-- Security & API Card -->
                    <div class="settings-card">
                        <h2 class="settings-card-title">🔐 API Key & Credentials</h2>
                        
                        <div class="form-group">
                            <label for="settings-api-key" class="form-label">FlowAI Secret Key</label>
                            <p class="form-desc">Client-side mock API key stored securely in your browser's LocalStorage.</p>
                            <div class="password-input-wrapper">
                                <input type="password" id="settings-api-key" class="form-control" value="${escapeHtml(settings.apiKey)}">
                                <button type="button" class="eye-toggle-btn" id="eye-toggle-btn" title="Toggle key visibility" aria-label="Show or hide API key">👁️</button>
                            </div>
                        </div>

                        <div class="form-group">
                            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                                <input type="checkbox" id="settings-streaming" ${settings.streamResponse ? 'checked' : ''} style="width: 18px; height: 18px; accent-color: var(--accent-color);">
                                <span class="form-label" style="margin: 0;">Simulate streaming token animations</span>
                            </label>
                        </div>
                    </div>

                    <!-- Local Storage & Diagnostics -->
                    <div class="settings-card">
                        <h2 class="settings-card-title">📦 Local Data Storage</h2>
                        
                        <div style="display: flex; flex-direction: column; gap: 12px;">
                            <p class="form-desc">All sessions, custom prompts, and settings are preserved locally without cloud leaks.</p>
                            <div style="display: flex; justify-content: space-between; padding: 12px 16px; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--radius-sm); font-size: 0.9rem;">
                                <span>Storage Consumption:</span>
                                <strong>${storageKB} KB</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 12px 16px; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--radius-sm); font-size: 0.9rem;">
                                <span>Application Routing:</span>
                                <strong>Hash-based SPA Router</strong>
                            </div>
                            <button id="reset-factory-btn" class="btn btn-danger" style="margin-top: 10px;" aria-label="Reset workspace to factory default settings">
                                <span>⚠️</span> Reset Workspace to Defaults
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const themeSelect = document.getElementById('settings-theme');
        const fontSelect = document.getElementById('settings-font-size');
        const modelSelect = document.getElementById('settings-model');
        const tempSlider = document.getElementById('settings-temp');
        const tempDisplay = document.getElementById('temp-val-display');
        const apiKeyInput = document.getElementById('settings-api-key');
        const eyeToggleBtn = document.getElementById('eye-toggle-btn');
        const streamingCheck = document.getElementById('settings-streaming');
        const saveBtn = document.getElementById('save-settings-btn');
        const resetBtn = document.getElementById('reset-factory-btn');

        // Live slider update
        tempSlider.addEventListener('input', (e) => {
            tempDisplay.textContent = e.target.value;
        });

        // Live theme change preview
        themeSelect.addEventListener('change', (e) => {
            applyTheme(e.target.value);
        });

        // Live font size preview
        fontSelect.addEventListener('change', (e) => {
            applyFontSize(e.target.value);
        });

        // Eye Toggle for API Key
        eyeToggleBtn.addEventListener('click', () => {
            if (apiKeyInput.type === 'password') {
                apiKeyInput.type = 'text';
                eyeToggleBtn.textContent = '🔒';
            } else {
                apiKeyInput.type = 'password';
                eyeToggleBtn.textContent = '👁️';
            }
        });

        // Save Settings
        saveBtn.addEventListener('click', () => {
            const newSettings = {
                theme: themeSelect.value,
                fontSize: fontSelect.value,
                model: modelSelect.value,
                temperature: parseFloat(tempSlider.value),
                apiKey: apiKeyInput.value.trim(),
                streamResponse: streamingCheck.checked
            };

            store.updateSettings(newSettings);
            applyTheme(newSettings.theme);
            applyFontSize(newSettings.fontSize);
            updateSidebarSessions();
            showToast('Settings saved successfully!', 'success');
        });

        // Reset to Defaults
        resetBtn.addEventListener('click', () => {
            if (confirm('Warning: This will reset all conversation sessions, custom prompts, and settings to original defaults. Proceed?')) {
                store.resetToFactoryDefaults();
                applyTheme(store.state.settings.theme);
                applyFontSize(store.state.settings.fontSize);
                updateSidebarSessions();
                renderSettingsView();
                showToast('Workspace reset to defaults.', 'info');
            }
        });
    }

    /* ==========================================================================
       9. FILE DOWNLOAD HELPER (Blob API)
       ========================================================================== */
    function downloadFile(filename, content, mimeType = 'text/plain') {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /* ==========================================================================
       10. APPLICATION BOOTSTRAP
       ========================================================================== */
    document.addEventListener('DOMContentLoaded', () => {
        router.init();
    });

})();
