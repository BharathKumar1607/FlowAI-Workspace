# FlowAI Workspace - Week 2 Task: Advanced Responsive Web Design

This branch contains the completed Week 2 Task for the Frontend Web Developer Internship.

## 🎯 Task Objective
Create a responsive webpage from scratch that adapts seamlessly across desktops, tablets, and smartphones using CSS media queries, flexible grids, and fluid images.

## 🚀 Key Deliverables & Technologies
- **Semantic HTML5 (`week2/index.html`)**: Clear layout hierarchy using `<header>`, `<nav>`, `<aside>`, `<main>`, `<section class="prompt-grid">`, `<div class="card">`, and `<footer>`.
- **CSS Grid Architecture (`week2/styles.css`)**: 
  - Main app layout: Two-column grid (`260px 1fr`) using fractional units (`fr`).
  - Quick Prompts: Multi-column grid (`repeat(3, 1fr)`) with gap spacing.
- **Fluid Images**:
  - Global responsive rule: `img { max-width: 100%; height: auto; display: block; }`
  - Scalable prompt card images, logo, and promotional banners that never distort or overflow their parent containers.
- **3-Tier Responsive Breakpoints**:
  - **Desktop (> 1024px)**: Full 260px sidebar and 3-column prompt card grid.
  - **Tablet (≤ 1024px)**: Sidebar condensed to 200px; card grid transitions smoothly to 2 columns.
  - **Mobile (≤ 768px)**: Layout shifts to a single column (`1fr`), stacking the sidebar above the workspace and collapsing prompt cards into a single column.

## 📄 Documentation
- Detailed internship report available in `Bharath_Week2_Report.doc`.
