# FlowAI Workspace - Week 3: Multi-Page Interactive Web Application 🤖✨

This directory contains the completed **Week 3 Task** for the Frontend Web Developer Internship at Yuva.

---

## 🎯 Task Objective
Transform the FlowAI Workspace from a static wireframe into a **complete, production-grade, multi-page web application** using **pure (vanilla) JavaScript**. The application focuses on DOM manipulation, real-time event listeners, client-side data persistence (`localStorage`), and responsive UI feedback across four specialized pages.

---

## 📱 Multi-Page Application Architecture

The application is structured into four interconnected HTML views:

| Page | File | Purpose & Key Features |
| :--- | :--- | :--- |
| **💬 Chat** | [`index.html`](file:///c:/Bharath/Yuva/web%20Development/week3/index.html) | Live interactive AI conversation workspace with sidebar session switching, starter template injection, typing bubble animation, and copy-to-clipboard functionality. |
| **💡 Prompts** | [`prompts.html`](file:///c:/Bharath/Yuva/web%20Development/week3/prompts.html) | Searchable prompt engineering catalog with real-time category filtering (Coding, Writing, Data, Productivity), a custom prompt creator modal, and a "Use in Chat" button. |
| **🕒 History** | [`history.html`](file:///c:/Bharath/Yuva/web%20Development/week3/history.html) | Searchable conversation transcript archive with live statistics (total sessions, messages, last active), single-click "Resume in Chat", and file export (`.txt` / `.json`). |
| **⚙️ Settings** | [`settings.html`](file:///c:/Bharath/Yuva/web%20Development/week3/settings.html) | AI configuration control panel with live Dark/Light theme switching, font scaling (`sm`, `md`, `lg`), model selector, interactive temperature slider with live badge readout, and API key management. |

---

## 🚀 JavaScript Architecture & Modules

The application uses a clean, modular JavaScript design without external frameworks:

1. **[`script.js`](file:///c:/Bharath/Yuva/web%20Development/week3/script.js) (Shared Core Engine)**:
   * **State Initialization**: Automatically seeds default conversation sessions and prompt templates into `localStorage`.
   * **Theme & Appearance Engine**: Toggles between Light and Dark mode, updates theme tokens, and remembers user choices across sessions.
   * **Toast Notification System**: Reusable floating toast alert utility (`showToast(msg, type)`).
   * **Responsive Mobile Navigation**: Handles hamburger drawer toggle with smooth animation.

2. **[`chat.js`](file:///c:/Bharath/Yuva/web%20Development/week3/chat.js) (Chat Engine)**:
   * Dynamically renders and manages conversation threads.
   * Intercepts form submissions (`event.preventDefault()`) and safely appends user message nodes.
   * Simulates asynchronous AI responses with a 3-dot bouncing typing indicator and realistic latency.
   * Adds instant "Copy to Clipboard" action buttons on AI response bubbles.
   * Manages "+ New Chat" session creation and sidebar updates.

3. **[`prompts.js`](file:///c:/Bharath/Yuva/web%20Development/week3/prompts.js) (Prompt Catalog Engine)**:
   * Real-time search query filtering over titles, descriptions, and prompt text.
   * Interactive category filter pills without page reloads.
   * "Use in Chat" functionality transferring prompt content via `sessionStorage`.
   * Accessible modal dialog for creating and saving custom prompts to `localStorage`.

4. **[`history.js`](file:///c:/Bharath/Yuva/web%20Development/week3/history.js) (Archive & Export Engine)**:
   * Real-time search through archived chat transcripts.
   * Calculates dashboard metrics (total conversations, total messages, last activity).
   * Generates and triggers instant browser file downloads (`.txt` and `.json`) using the HTML5 `Blob` and `URL.createObjectURL` APIs.

5. **[`settings.js`](file:///c:/Bharath/Yuva/web%20Development/week3/settings.js) (Configuration Engine)**:
   * Synchronizes the temperature range slider with a live numerical display on `input`.
   * Toggles API key password visibility (`type="password"` vs `type="text"`).
   * Persists AI model preferences, custom system personas, and font scaling in `localStorage`.

---

## 🎨 Unified CSS Design System ([`styles.css`](file:///c:/Bharath/Yuva/web%20Development/week3/styles.css))
* Modern CSS Custom Properties (Theme variables for Light and Dark modes).
* 2-Dimensional CSS Grid for multi-column dashboards and card layouts.
* Fluid image constraints (`max-width: 100%; height: auto; display: block;`).
* 3-Tier responsive breakpoints (Desktop `>1024px`, Tablet `≤1024px`, Smartphone `≤768px`).

---

## 🛠️ How to View & Run
1. Open the `week3/` directory.
2. Double-click [`index.html`](file:///c:/Bharath/Yuva/web%20Development/week3/index.html) in any modern browser (Chrome, Edge, Firefox).
3. Seamlessly navigate between **Chat**, **Prompts**, **History**, and **Settings** using the top navigation bar!

---
*Developed by Bharath Kumar for the Yuva Web Development Internship (Week 3).*
