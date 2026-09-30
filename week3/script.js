/**
 * FlowAI Workspace - Shared Core JavaScript (Week 3)
 * Provides global state initialization, theme & font size persistence,
 * mobile navigation toggle, active navigation highlighting, and toast alerts.
 */

// =============================================================================
// 1. DEFAULT DATA INITIALIZATION (localStorage Seed)
// =============================================================================
(function initDefaultStorage() {
    // Default Sessions Seed
    if (!localStorage.getItem('flowai_sessions')) {
        const defaultSessions = [
            {
                id: 'sess_1',
                title: 'Python OOPs Guide',
                updatedAt: new Date(Date.now() - 3600000).toISOString(),
                messages: [
                    { sender: 'user', text: 'Can you explain Python classes, objects, and inheritance simply?' },
                    { sender: 'ai', text: 'In Python, a class is a blueprint for creating objects. Inheritance allows a child class to inherit attributes and methods from a parent class using syntax: `class Child(Parent):`.' }
                ]
            },
            {
                id: 'sess_2',
                title: 'SQL Query Optimizer',
                updatedAt: new Date(Date.now() - 86400000).toISOString(),
                messages: [
                    { sender: 'user', text: 'How do I optimize a slow INNER JOIN between users and orders tables?' },
                    { sender: 'ai', text: 'Ensure both `users.id` and `orders.user_id` have B-Tree indexes, filter records early with WHERE before joining, and only SELECT needed columns instead of `SELECT *`.' }
                ]
            },
            {
                id: 'sess_3',
                title: 'Resume Bullet Generator',
                updatedAt: new Date(Date.now() - 172800000).toISOString(),
                messages: [
                    { sender: 'user', text: 'Give me 3 strong action bullets for a Frontend Developer internship.' },
                    { sender: 'ai', text: '• Engineered a 3-tier responsive AI dashboard using CSS Grid and fluid media constraints.\n• Implemented client-side DOM manipulation and event delegation to build interactive chat threads.\n• Reduced layout shift by 40% utilizing fractional units and modern box-sizing.' }
                ]
            }
        ];
        localStorage.setItem('flowai_sessions', JSON.stringify(defaultSessions));
    }

    // Default Prompts Seed
    if (!localStorage.getItem('flowai_prompts')) {
        const defaultPrompts = [
            {
                id: 'p_1',
                title: 'Code Debugger & Explainer',
                category: 'Coding',
                description: 'Detect memory leaks, syntax errors, and performance bottlenecks in code.',
                prompt: 'Review and debug the following JavaScript code. Highlight potential bugs, explain the root cause, and provide a corrected version: '
            },
            {
                id: 'p_2',
                title: 'SQL Schema & Query Builder',
                category: 'Data',
                description: 'Write optimized queries with indexing, window functions, and joins.',
                prompt: 'Help me construct an efficient SQL query with proper indexes and constraints for the following requirement: '
            },
            {
                id: 'p_3',
                title: 'Executive Summary Generator',
                category: 'Writing',
                description: 'Condense articles, reports, and documentation into key takeaway bullets.',
                prompt: 'Analyze the following text and generate an executive summary containing 3 core insights and actionable next steps: '
            },
            {
                id: 'p_4',
                title: 'Multi-Language Translator',
                category: 'Productivity',
                description: 'Translate technical or business communications with cultural nuance.',
                prompt: 'Translate the following text into professional Spanish, French, and German while preserving tone: '
            },
            {
                id: 'p_5',
                title: 'Regex Pattern Generator',
                category: 'Coding',
                description: 'Construct and explain complex Regular Expressions for validation.',
                prompt: 'Write a Regular Expression (RegEx) with step-by-step breakdown for validating: '
            },
            {
                id: 'p_6',
                title: 'Professional Email Drafter',
                category: 'Writing',
                description: 'Draft polite, persuasive, and concise emails for workplace scenarios.',
                prompt: 'Draft a polite follow-up email to a hiring manager inquiring about the status of an internship application: '
            }
        ];
        localStorage.setItem('flowai_prompts', JSON.stringify(defaultPrompts));
    }

    // Default Settings Seed
    if (!localStorage.getItem('flowai_settings')) {
        const defaultSettings = {
            theme: 'light',
            fontSize: 'md',
            model: 'Gemini 2.5 Flash',
            temperature: '0.7',
            systemPrompt: 'You are FlowAI, an expert engineering assistant. Respond with clarity, code samples, and structured formatting.',
            apiKey: ''
        };
        localStorage.setItem('flowai_settings', JSON.stringify(defaultSettings));
    }
})();

// =============================================================================
// 2. THEME & APPEARANCE SYSTEM
// =============================================================================
function applyTheme() {
    const settings = JSON.parse(localStorage.getItem('flowai_settings') || '{}');
    const theme = settings.theme || 'light';
    const fontSize = settings.fontSize || 'md';

    if (theme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        const themeIcon = document.getElementById('theme-icon');
        if (themeIcon) themeIcon.textContent = '☀️';
    } else {
        document.body.removeAttribute('data-theme');
        const themeIcon = document.getElementById('theme-icon');
        if (themeIcon) themeIcon.textContent = '🌙';
    }

    document.body.setAttribute('data-font-size', fontSize);
}

// =============================================================================
// 3. TOAST NOTIFICATION UTILITY
// =============================================================================
window.showToast = function(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icon = type === 'success' ? '✓ ' : (type === 'danger' ? '✕ ' : 'ℹ ');
    toast.textContent = `${icon}${message}`;
    
    container.appendChild(toast);

    setTimeout(() => {
        if (toast.parentNode) {
            toast.remove();
        }
    }, 2800);
};

// =============================================================================
// 4. DOM READY INITIALIZATION
// =============================================================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. Apply theme & font
    applyTheme();

    // 2. Theme Toggle Button in Header
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const settings = JSON.parse(localStorage.getItem('flowai_settings') || '{}');
            const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
            settings.theme = newTheme;
            localStorage.setItem('flowai_settings', JSON.stringify(settings));
            applyTheme();
            showToast(`Switched to ${newTheme} mode`, 'info');
        });
    }

    // 3. Mobile Navigation Toggle
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            const isOpen = navLinks.classList.toggle('open');
            menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
    }

    // 4. Active Navigation Link Highlighting
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
});
