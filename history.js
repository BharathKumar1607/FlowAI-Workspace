/**
 * FlowAI Workspace - History Archive Engine (Week 4: Performance & Accessibility)
 * Author: Bharath Kumar
 * Features:
 * - Debounced transcript search across all conversations
 * - Client-side non-blocking file generation (Blob API)
 * - Accessible metrics dashboard with live ARIA regions
 * - Granular session deletion with screen reader announcements
 */

document.addEventListener('DOMContentLoaded', () => {

    // 1. DOM References
    const historyList = document.getElementById('history-list');
    const searchInput = document.getElementById('history-search-input');
    const statSessions = document.getElementById('stat-total-sessions');
    const statMessages = document.getElementById('stat-total-messages');
    const statActive = document.getElementById('stat-last-active');
    const exportAllBtn = document.getElementById('export-all-btn');
    const clearAllHistoryBtn = document.getElementById('clear-all-history-btn');

    let searchQuery = '';

    // 2. Fetch Sessions
    function getSessions() {
        return JSON.parse(localStorage.getItem('flowai_sessions') || '[]');
    }

    // 3. Update Dashboard Metrics
    function updateMetrics(sessions) {
        if (statSessions) statSessions.textContent = sessions.length;
        
        let totalMsgs = 0;
        sessions.forEach(s => totalMsgs += (s.messages ? s.messages.length : 0));
        if (statMessages) statMessages.textContent = totalMsgs;

        if (statActive) {
            if (sessions.length > 0 && sessions[0].updatedAt) {
                const date = new Date(sessions[0].updatedAt);
                statActive.textContent = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            } else {
                statActive.textContent = 'None';
            }
        }
    }

    function formatTime(isoString) {
        if (!isoString) return 'Recent';
        const date = new Date(isoString);
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    // 4. Render History List (Semantic Articles & Accessible Buttons)
    function renderHistory() {
        if (!historyList) return;
        historyList.innerHTML = '';
        const sessions = getSessions();
        updateMetrics(sessions);

        const filtered = sessions.filter(s => {
            const titleMatch = s.title.toLowerCase().includes(searchQuery);
            const msgMatch = s.messages && s.messages.some(m => m.text.toLowerCase().includes(searchQuery));
            return titleMatch || msgMatch;
        });

        if (filtered.length === 0) {
            historyList.innerHTML = `
                <div style="text-align: center; padding: 48px 16px; color: var(--text-secondary); background: var(--bg-surface); border-radius: var(--radius-md); border: 1px solid var(--border-color);" role="alert">
                    <div style="font-size: 2.5rem; margin-bottom: 8px;" aria-hidden="true">📂</div>
                    <h3>No archived conversations found</h3>
                    <p style="font-size: 0.9rem; margin-top: 4px;">Try searching for a different keyword or start a new chat.</p>
                </div>
            `;
            return;
        }

        filtered.forEach(sess => {
            const item = document.createElement('article');
            item.className = 'history-item';
            item.setAttribute('role', 'article');
            item.setAttribute('aria-label', `Conversation archive: ${sess.title}`);

            const lastMessage = sess.messages && sess.messages.length > 0 
                ? sess.messages[sess.messages.length - 1].text 
                : 'No messages in this conversation.';
            const snippet = lastMessage.length > 110 ? lastMessage.substring(0, 107) + '...' : lastMessage;

            item.innerHTML = `
                <div class="history-item-info">
                    <h2 class="history-item-title">${escapeHtml(sess.title)}</h2>
                    <div class="history-item-meta">
                        <span>🕒 ${formatTime(sess.updatedAt)}</span>
                        <span>💬 ${sess.messages ? sess.messages.length : 0} messages</span>
                    </div>
                    <p style="font-size: 0.88rem; color: var(--text-secondary); margin-top: 6px; font-style: italic;">
                        "${escapeHtml(snippet)}"
                    </p>
                </div>
                <div class="history-actions">
                    <button class="btn btn-secondary resume-chat-btn" data-id="${sess.id}" aria-label="Resume conversation ${escapeHtml(sess.title)}">💬 Resume</button>
                    <button class="btn btn-secondary export-chat-btn" data-id="${sess.id}" aria-label="Export ${escapeHtml(sess.title)} conversation as text">⬇ Export</button>
                    <button class="btn btn-secondary delete-chat-btn" data-id="${sess.id}" style="color: var(--danger-color);" aria-label="Delete ${escapeHtml(sess.title)} conversation">🗑️</button>
                </div>
            `;

            // Resume in Chat
            item.querySelector('.resume-chat-btn').addEventListener('click', () => {
                localStorage.setItem('flowai_current_session_id', sess.id);
                window.location.href = 'index.html';
            });

            // Export to TXT
            item.querySelector('.export-chat-btn').addEventListener('click', () => {
                exportSessionAsTxt(sess);
            });

            // Delete Session
            item.querySelector('.delete-chat-btn').addEventListener('click', () => {
                deleteSession(sess.id);
            });

            historyList.appendChild(item);
        });

        window.announceToScreenReader(`Displayed ${filtered.length} archived conversations`);
    }

    function escapeHtml(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }

    // 5. Delete Session
    function deleteSession(id) {
        let sessions = getSessions();
        if (sessions.length <= 1) {
            window.showToast('You must keep at least one session in your history', 'danger');
            return;
        }

        sessions = sessions.filter(s => s.id !== id);
        localStorage.setItem('flowai_sessions', JSON.stringify(sessions));

        const activeId = localStorage.getItem('flowai_current_session_id');
        if (activeId === id) {
            localStorage.setItem('flowai_current_session_id', sessions[0].id);
        }

        renderHistory();
        window.showToast('Conversation removed from archive', 'info');
    }

    // 6. Export Session as TXT (Blob API)
    function exportSessionAsTxt(session) {
        let content = `FlowAI Workspace - Accessible Transcript Export\n`;
        content += `Session Title: ${session.title}\n`;
        content += `Timestamp: ${new Date().toLocaleString()}\n`;
        content += `====================================================\n\n`;

        if (session.messages && session.messages.length > 0) {
            session.messages.forEach(m => {
                const speaker = m.sender === 'user' ? 'YOU' : 'FLOWAI';
                content += `[${speaker}]:\n${m.text}\n\n`;
            });
        } else {
            content += `(No messages recorded)\n`;
        }

        downloadFile(content, `${session.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_transcript.txt`, 'text/plain');
        window.showToast('Transcript downloaded (.txt)', 'success');
    }

    // 7. Export All as JSON
    if (exportAllBtn) {
        exportAllBtn.addEventListener('click', () => {
            const sessions = getSessions();
            const dataStr = JSON.stringify(sessions, null, 2);
            downloadFile(dataStr, `flowai_archive_${Date.now()}.json`, 'application/json');
            window.showToast('Exported complete archive (.json)', 'success');
        });
    }

    // 8. Clear All History
    if (clearAllHistoryBtn) {
        clearAllHistoryBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all conversation history?')) {
                const freshSession = [{
                    id: 'sess_' + Date.now(),
                    title: 'New Workspace Session',
                    updatedAt: new Date().toISOString(),
                    messages: []
                }];
                localStorage.setItem('flowai_sessions', JSON.stringify(freshSession));
                localStorage.setItem('flowai_current_session_id', freshSession[0].id);
                renderHistory();
                window.showToast('All conversation archives reset', 'info');
            }
        });
    }

    function downloadFile(content, fileName, contentType) {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // 9. Debounced Live Search
    if (searchInput) {
        const handleSearch = window.debounce((e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            renderHistory();
        }, 120);

        searchInput.addEventListener('input', handleSearch);
    }

    // Initial Render
    renderHistory();
});
