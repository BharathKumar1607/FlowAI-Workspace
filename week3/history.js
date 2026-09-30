/**
 * FlowAI Workspace - History & Archive Engine (Week 3)
 * Powers history.html:
 * - Live keyword search through conversation transcripts
 * - Metrics dashboard (Total Sessions, Messages, Last Active)
 * - "Resume in Chat" session loading
 * - File download export (JSON / TXT) via Blob API
 * - Granular and bulk conversation deletion
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

    // 4. Relative Time Formatter
    function formatTime(isoString) {
        if (!isoString) return 'Recent';
        const date = new Date(isoString);
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    // 5. Render History List
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
                <div style="text-align: center; padding: 48px 16px; color: var(--text-secondary); background: var(--bg-surface); border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                    <div style="font-size: 2.5rem; margin-bottom: 8px;">📂</div>
                    <h3>No conversations found</h3>
                    <p style="font-size: 0.9rem; margin-top: 4px;">No archived sessions match your search query.</p>
                </div>
            `;
            return;
        }

        filtered.forEach(sess => {
            const item = document.createElement('div');
            item.className = 'history-item';

            const lastMessage = sess.messages && sess.messages.length > 0 
                ? sess.messages[sess.messages.length - 1].text 
                : 'No messages yet in this session.';
            const snippet = lastMessage.length > 110 ? lastMessage.substring(0, 107) + '...' : lastMessage;

            item.innerHTML = `
                <div class="history-item-info">
                    <h3 class="history-item-title">${escapeHtml(sess.title)}</h3>
                    <div class="history-item-meta">
                        <span>🕒 ${formatTime(sess.updatedAt)}</span>
                        <span>💬 ${sess.messages ? sess.messages.length : 0} messages</span>
                    </div>
                    <p style="font-size: 0.88rem; color: var(--text-secondary); margin-top: 6px; font-style: italic;">
                        "${escapeHtml(snippet)}"
                    </p>
                </div>
                <div class="history-actions">
                    <button class="btn btn-secondary resume-chat-btn" data-id="${sess.id}">💬 Resume</button>
                    <button class="btn btn-secondary export-chat-btn" data-id="${sess.id}">⬇ Export</button>
                    <button class="btn btn-secondary delete-chat-btn" data-id="${sess.id}" style="color: var(--danger-color);">🗑️</button>
                </div>
            `;

            // Event: Resume in Chat
            item.querySelector('.resume-chat-btn').addEventListener('click', () => {
                localStorage.setItem('flowai_current_session_id', sess.id);
                window.location.href = 'index.html';
            });

            // Event: Export Session to TXT file
            item.querySelector('.export-chat-btn').addEventListener('click', () => {
                exportSessionAsTxt(sess);
            });

            // Event: Delete Session
            item.querySelector('.delete-chat-btn').addEventListener('click', () => {
                deleteSession(sess.id);
            });

            historyList.appendChild(item);
        });
    }

    // Helper: Escape HTML
    function escapeHtml(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }

    // 6. Delete Session Handler
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

    // 7. Export Single Session as TXT
    function exportSessionAsTxt(session) {
        let content = `FlowAI Workspace - Conversation Export\n`;
        content += `Session Title: ${session.title}\n`;
        content += `Export Date: ${new Date().toLocaleString()}\n`;
        content += `====================================================\n\n`;

        if (session.messages && session.messages.length > 0) {
            session.messages.forEach(m => {
                const speaker = m.sender === 'user' ? 'YOU' : 'FLOWAI';
                content += `[${speaker}]:\n${m.text}\n\n`;
            });
        } else {
            content += `(No messages recorded in this session)\n`;
        }

        downloadFile(content, `${session.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_transcript.txt`, 'text/plain');
        window.showToast('Downloaded conversation transcript', 'success');
    }

    // 8. Export All Sessions as JSON
    if (exportAllBtn) {
        exportAllBtn.addEventListener('click', () => {
            const sessions = getSessions();
            const dataStr = JSON.stringify(sessions, null, 2);
            downloadFile(dataStr, `flowai_chat_archive_${Date.now()}.json`, 'application/json');
            window.showToast('Exported complete conversation archive (JSON)', 'success');
        });
    }

    // 9. Clear All History Handler
    if (clearAllHistoryBtn) {
        clearAllHistoryBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear your entire chat history? This cannot be undone.')) {
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

    // Generic File Downloader (Blob API)
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

    // 10. Search Input Event
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            renderHistory();
        });
    }

    // Initial Render
    renderHistory();
});
