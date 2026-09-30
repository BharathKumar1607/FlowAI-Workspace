# FlowAI Workspace - Week 5: Single Page Application (SPA) Simulation 🚀⚡

This repository contains the completed **Week 5 Final Project** for the Frontend Web Developer Internship at Yuva: **Developing a Single Page Application (SPA) Simulation**.

---

## 🎯 Task Objective
Simulate a full-featured, small-scale **Single Page Application (SPA)** that dynamically loads and displays modular views (`Chat`, `Prompts Library`, `Conversation History`, `Settings`) without triggering full browser page reloads.

The application combines:
- **Semantic HTML5** as the primary dynamic shell and accessibility foundation.
- **Modern Vanilla CSS** featuring glassmorphic aesthetics, fluid transitions, and WCAG 2.1 AAA high-contrast light/dark themes.
- **Vanilla JavaScript (ES6+)** orchestrating client-side routing, centralized reactive state management, DOM component injection, and browser history synchronization.

---

## 📁 Project Architecture & File Structure

```text
├── index.html       # Main SPA Container & Shell (Navbar, Sidebar, Mount Point, Modals, Toasts)
├── styles.css       # Unified Design System (CSS Custom Properties, Glassmorphism, SPA Transitions)
├── app.js           # Client-Side Router, LocalStorage State Store, Dynamic View Renderers
├── README.md        # Technical Documentation, Architecture Blueprint & Run Instructions
└── FlowAI_SPA_Week5.zip # Complete Packaged Project Deliverable
```

---

## 🌟 Key Technical Features

### 1. Client-Side Routing (SPA Navigation)
* **Zero Full Page Reloads:** Uses the `window.location.hash` and `hashchange` API to deliver instant route transitions without requesting new documents from the server.
* **Route Map:**
  * `#/chat` &mdash; Interactive AI chat workspace with conversation sessions, starter prompt chips, typing animations, and clipboard copy.
  * `#/prompts` &mdash; Filterable prompt engineering library with real-time text search, category pills, custom prompt modal with focus trapping, and "Use in Chat" direct routing.
  * `#/history` &mdash; Comprehensive conversation logs with aggregate statistics, keyword search, one-click session resumption, and text/JSON transcript downloads via the **Blob API**.
  * `#/settings` &mdash; Model parameters (temperature, model selection), theme toggles, font scaling, API key visibility, and storage footprint diagnostics.
* **Layout Adaptability:** The layout automatically detects the active route and adapts grid templates (e.g., hiding or showing the sidebar smoothly).

### 2. Centralized Reactive State Store
* Implements a `StateStore` class managing:
  * `sessions`: Array of chat threads with timestamps, role badges, and unique IDs.
  * `currentSessionId`: Active conversation pointer.
  * `prompts`: Built-in and user-created prompt templates.
  * `settings`: Theme mode, base font size, model selection, temperature, and API keys.
* Automatically syncs state changes to `localStorage` (`flowai_spa_state_v1`).

### 3. Glassmorphic Aesthetics & Transitions
* **Smooth View Fade-in:** CSS keyframe animations (`@keyframes viewFadeIn`) execute on route change for a polished native-app feel.
* **Glassmorphic Navigation:** Utilizes `backdrop-filter: blur(12px)` and subtle transparent alpha borders.
* **Typing Indicator:** Dynamic pulsing 3-dot animation simulating real-time inference latency.

### 4. Comprehensive Accessibility (WCAG 2.1 AAA Compliant)
* **Screen Reader Route Announcer:** An `aria-live="polite"` region alerts visually impaired users when route views change.
* **Programmatic Focus Management:** Shifting focus smoothly to `<main id="app-view">` upon route transition so screen readers start reading the new view content.
* **Skip to Main Content Link:** First focusable element for rapid keyboard navigation.
* **Accessible Modals:** Dialog overlay with `role="dialog"`, `aria-modal="true"`, focus trapping, and `Escape` key close listener.
* **Keyboard Shortcuts:**
  * `Alt + N` &mdash; Spawns a new chat session from any view.
  * `Enter` &mdash; Submits chat message / triggers active card.
  * `Escape` &mdash; Closes modals.

---

## 🚀 How to Run the Application

1. **Option A: Direct Browser Execution (Zero Build Tools Required)**
   * Simply double-click [`index.html`](file:///c:/Bharath/Yuva/web%20Development/index.html) or open it in any modern web browser (Google Chrome, Microsoft Edge, Firefox, Safari).
   * Since hash routing (`#/chat`) is utilized, the application runs natively from local file paths (`file:///`) without requiring a local web server!

2. **Option B: Live Server / Dev Server**
   * If you prefer running through an HTTP server:
     ```bash
     npx serve .
     # or
     python -m http.server 8000
     ```
   * Open `http://localhost:8000` in your browser.

---

## 🧪 Testing the SPA Flow

1. **Navigation Test:** Click between **💬 Chat**, **💡 Prompts**, **🕒 History**, and **⚙️ Settings** in the top navigation bar. Notice the URL updates (`#/prompts`, etc.) and the view transitions instantaneously without a white flash or page reload.
2. **Browser History Test:** Click the browser's native **Back** and **Forward** buttons. The SPA maintains history and navigates between views seamlessly.
3. **Chat Simulation Test:** Send a message or click a starter card in `#/chat`. Observe the animated typing indicator and the contextual AI response.
4. **Prompt-to-Chat Routing:** Navigate to `#/prompts`, find a prompt, and click **"Use in Chat"**. The router navigates directly to `#/chat` and pre-populates the input field.
5. **Session Export Test:** Navigate to `#/history` and click **"Export All (JSON)"** or the download button on a session to verify client-side Blob file generation.
6. **Theme & Font Scaling:** Go to `#/settings` or click the navbar theme icon (🌙/☀️) to toggle high-contrast modes and live font size scaling.

---

*Developed by Bharath Kumar for the Yuva Web Development Internship (Week 5 Final Project).*
