/**
 * FlowAI Workspace - Chat Engine (Week 3)
 * Powers the interactive Home/Dashboard workspace:
 * - Real-time session management & sidebar sync
 * - Interactive prompt template injection
 * - Streaming message simulation with typing indicator
 * - Copy message to clipboard
 * - LocalStorage state persistence
 */

document.addEventListener('DOMContentLoaded', () => {

    // 1. DOM References
    const sessionList = document.getElementById('session-list');
    const sessionCountBadge = document.getElementById('session-count');
    const newChatBtn = document.getElementById('new-chat-btn');
    const chatThread = document.getElementById('chat-thread');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const clearChatBtn = document.getElementById('clear-chat-btn');
    const activeModelName = document.getElementById('active-model-name');
    const starterCards = document.querySelectorAll('.starter-card');

    // 2. Active Session State
    let sessions = JSON.parse(localStorage.getItem('flowai_sessions') || '[]');
    let currentSessionId = localStorage.getItem('flowai_current_session_id') || (sessions[0] ? sessions[0].id : null);

    // Sync Active Model Display from Settings
    const settings = JSON.parse(localStorage.getItem('flowai_settings') || '{}');
    if (activeModelName && settings.model) {
        activeModelName.textContent = settings.model;
    }

    // 3. Render Sessions in Sidebar
    function renderSidebarSessions() {
        if (!sessionList) return;
        sessionList.innerHTML = '';
        sessions = JSON.parse(localStorage.getItem('flowai_sessions') || '[]');

        if (sessionCountBadge) {
            sessionCountBadge.textContent = sessions.length;
        }

        sessions.forEach(sess => {
            const item = document.createElement('li');
            item.className = `session-item ${sess.id === currentSessionId ? 'active' : ''}`;
            item.setAttribute('data-id', sess.id);

            const titleSpan = document.createElement('span');
            titleSpan.className = 'session-name';
            titleSpan.textContent = sess.title;

            const delBtn = document.createElement('button');
            delBtn.className = 'session-del-btn';
            delBtn.title = 'Delete Session';
            delBtn.innerHTML = '🗑️';
            delBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteSession(sess.id);
            });

            item.appendChild(titleSpan);
            item.appendChild(delBtn);

            item.addEventListener('click', () => {
                switchSession(sess.id);
            });

            sessionList.appendChild(item);
        });
    }

    // 4. Render Messages for Active Session
    function renderActiveChat() {
        if (!chatThread) return;
        chatThread.innerHTML = '';

        const currentSession = sessions.find(s => s.id === currentSessionId);
        if (!currentSession || currentSession.messages.length === 0) {
            chatThread.innerHTML = `
                <div class="message ai-message">
                    <div class="avatar">🤖</div>
                    <div class="bubble-wrapper">
                        <div class="bubble">Hello! I am FlowAI. Pick a starter template above or type your prompt below to start interacting.</div>
                    </div>
                </div>
            `;
            return;
        }

        currentSession.messages.forEach(msg => {
            appendMessageToDom(msg.sender, msg.text, false);
        });

        chatThread.scrollTop = chatThread.scrollHeight;
    }

    // 5. Append Single Message to DOM
    function appendMessageToDom(sender, text, scroll = true) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;

        const avatar = document.createElement('div');
        avatar.className = 'avatar';
        avatar.textContent = sender === 'user' ? '👤' : '🤖';

        const wrapper = document.createElement('div');
        wrapper.className = 'bubble-wrapper';

        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        bubble.textContent = text;
        wrapper.appendChild(bubble);

        // Add Copy Button for AI messages
        if (sender === 'ai') {
            const actions = document.createElement('div');
            actions.className = 'message-actions';

            const copyBtn = document.createElement('button');
            copyBtn.className = 'msg-action-btn';
            copyBtn.innerHTML = '📋 Copy';
            copyBtn.title = 'Copy response to clipboard';
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(text).then(() => {
                    copyBtn.innerHTML = '✓ Copied!';
                    window.showToast('Response copied to clipboard', 'success');
                    setTimeout(() => { copyBtn.innerHTML = '📋 Copy'; }, 2000);
                });
            });

            actions.appendChild(copyBtn);
            wrapper.appendChild(actions);
        }

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(wrapper);

        chatThread.appendChild(messageDiv);
        if (scroll) {
            chatThread.scrollTop = chatThread.scrollHeight;
        }
    }

    // 6. Switch Session
    function switchSession(sessionId) {
        currentSessionId = sessionId;
        localStorage.setItem('flowai_current_session_id', sessionId);
        renderSidebarSessions();
        renderActiveChat();
        const currentSession = sessions.find(s => s.id === sessionId);
        if (currentSession) {
            window.showToast(`Switched to "${currentSession.title}"`, 'info');
        }
    }

    // 7. Delete Session
    function deleteSession(sessionId) {
        if (sessions.length <= 1) {
            window.showToast('You must have at least one active chat session', 'danger');
            return;
        }
        sessions = sessions.filter(s => s.id !== sessionId);
        localStorage.setItem('flowai_sessions', JSON.stringify(sessions));

        if (currentSessionId === sessionId) {
            currentSessionId = sessions[0].id;
            localStorage.setItem('flowai_current_session_id', currentSessionId);
        }

        renderSidebarSessions();
        renderActiveChat();
        window.showToast('Session deleted', 'info');
    }

    // 8. Create New Chat Session
    if (newChatBtn) {
        newChatBtn.addEventListener('click', () => {
            const newId = 'sess_' + Date.now();
            const newSession = {
                id: newId,
                title: `Chat Session #${sessions.length + 1}`,
                updatedAt: new Date().toISOString(),
                messages: []
            };

            sessions.unshift(newSession);
            localStorage.setItem('flowai_sessions', JSON.stringify(sessions));
            switchSession(newId);
            window.showToast('Fresh chat session started', 'success');
            if (chatInput) chatInput.focus();
        });
    }

    // 9. Clear Active Chat
    if (clearChatBtn) {
        clearChatBtn.addEventListener('click', () => {
            const currentSession = sessions.find(s => s.id === currentSessionId);
            if (currentSession) {
                currentSession.messages = [];
                localStorage.setItem('flowai_sessions', JSON.stringify(sessions));
                renderActiveChat();
                window.showToast('Conversation cleared', 'info');
            }
        });
    }

    // 10. Starter Prompt Cards
    starterCards.forEach(card => {
        card.addEventListener('click', () => {
            const prompt = card.getAttribute('data-prompt');
            const title = card.getAttribute('data-title');
            if (chatInput) {
                chatInput.value = prompt;
                chatInput.focus();
                if (sendBtn) sendBtn.removeAttribute('disabled');
                window.showToast(`Loaded "${title}" template`, 'info');
            }
        });
    });

    // 11. Check for Pending Prompt passed from prompts.html or history.html
    const pendingPrompt = sessionStorage.getItem('flowai_pending_prompt');
    if (pendingPrompt && chatInput) {
        chatInput.value = pendingPrompt;
        chatInput.focus();
        if (sendBtn) sendBtn.removeAttribute('disabled');
        sessionStorage.removeItem('flowai_pending_prompt');
        window.showToast('Loaded prompt template from library!', 'success');
    }

    // 12. Input Event for Send Button State
    if (chatInput && sendBtn) {
        chatInput.addEventListener('input', () => {
            const hasText = chatInput.value.trim().length > 0;
            if (hasText) {
                sendBtn.removeAttribute('disabled');
            } else {
                sendBtn.setAttribute('disabled', 'true');
            }
        });
    }

    // 13. Simulated AI Response Logic
    function generateAiResponse(userText) {
        const lower = userText.toLowerCase();
        const activeModel = settings.model || 'Gemini 2.5 Flash';

        if (lower.includes('debug') || lower.includes('error') || lower.includes('bug')) {
            return `[${activeModel}] Debugger Analysis:\n1. Checked code for unhandled promise rejections and syntax traps.\n2. Ensure all event listeners are removed on component teardown.\n3. Wrap asynchronous DOM manipulation in try/catch blocks for resilience.`;
        }
        if (lower.includes('sql') || lower.includes('query') || lower.includes('database')) {
            return `[${activeModel}] SQL Recommendation:\n\`\`\`sql\nSELECT u.id, u.username, COUNT(o.id) AS total_orders\nFROM users u\nLEFT JOIN orders o ON u.id = o.user_id\nWHERE u.status = 'active'\nGROUP BY u.id;\n\`\`\`\nEnsure composite indexes exist on \`(user_id, status)\` for sub-millisecond lookups.`;
        }
        if (lower.includes('summar') || lower.includes('bullet') || lower.includes('brief')) {
            return `[${activeModel}] Key Takeaways:\n• Responsive layout engineered with 2D CSS Grid.\n• Multi-page navigation seamlessly synchronizes state.\n• Client-side data persisted securely in localStorage.`;
        }
        if (lower.includes('translat') || lower.includes('spanish') || lower.includes('french')) {
            return `[${activeModel}] Multi-lingual Output:\n🇪🇸 ES: ¡La interfaz interactiva se ejecuta con gran fluidez!\n🇫🇷 FR: L'interface utilisateur interactive fonctionne avec fluidité !`;
        }
        return `[${activeModel}]: I analyzed your query: "${userText}". The FlowAI application state and responsive layout are fully operational with zero console warnings!`;
    }

    // 14. Chat Submission Handler
    if (chatForm && chatInput) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = chatInput.value.trim();
            if (!text) return;

            // 1. Append User Message
            appendMessageToDom('user', text);

            // 2. Save in Session
            const currentSession = sessions.find(s => s.id === currentSessionId);
            if (currentSession) {
                currentSession.messages.push({ sender: 'user', text });
                // If this is the first message and title is default, update session title
                if (currentSession.messages.length === 1) {
                    currentSession.title = text.length > 26 ? text.substring(0, 24) + '...' : text;
                    renderSidebarSessions();
                }
                currentSession.updatedAt = new Date().toISOString();
                localStorage.setItem('flowai_sessions', JSON.stringify(sessions));
            }

            // 3. Clear Input
            chatInput.value = '';
            sendBtn.setAttribute('disabled', 'true');

            // 4. Show Animated Typing Indicator
            const typingDiv = document.createElement('div');
            typingDiv.className = 'message ai-message typing-indicator-item';
            typingDiv.id = 'active-typing-indicator';
            typingDiv.innerHTML = `
                <div class="avatar">🤖</div>
                <div class="bubble-wrapper">
                    <div class="typing-indicator">
                        <span></span><span></span><span></span>
                    </div>
                </div>
            `;
            chatThread.appendChild(typingDiv);
            chatThread.scrollTop = chatThread.scrollHeight;

            // 5. Simulate AI Streaming Delay
            setTimeout(() => {
                const indicator = document.getElementById('active-typing-indicator');
                if (indicator) indicator.remove();

                const aiReply = generateAiResponse(text);
                appendMessageToDom('ai', aiReply);

                if (currentSession) {
                    currentSession.messages.push({ sender: 'ai', text: aiReply });
                    localStorage.setItem('flowai_sessions', JSON.stringify(sessions));
                }
            }, 900);
        });
    }

    // Initial Execution
    renderSidebarSessions();
    renderActiveChat();
});
