# PLAN.md — Amrith's Portfolio Website

## 1. Objective

Build a complete personal portfolio website for **Amrith Akshintala** as a single-page React application. The entire UI lives in one `src/App.jsx` file (all components defined as named functions in that file). The site uses Tailwind CSS utility classes, Three.js for a 3D hero element, dark mode by default, and includes ~20 interactive features. The target audience is technical recruiters and engineering teams reviewing a freshman Computer Engineering student's portfolio.

**Target directory:** `/Users/amrith/Documents/Documents - Kishore's MacBook Pro/Amrith/Main Porfolio/`
**Remote:** `origin` at `https://github.com/CodingMastermind123/Main-Portfolio.git` (branch `main`)

---

## 2. Repo Instructions / Local Rules

- **No `CLAUDE.md`, `AGENTS.md`, or similar instruction files exist** in this repo or its parent directories.
- **No git hooks or CI/CD** configured.
- **No existing code** — the repo contains only `README.md` with the text "Amrith's Portfolio Website".
- **No conventions to match** — this is a greenfield build.
- Two prior portfolio attempts exist in sibling directories (`../Portfolio/` and `../Portfolio2/`) using vanilla HTML/CSS/JS. They provide **content reference only** (bio text, skill lists, section structure). Do not copy their code.

**Implication:** Sonnet has full freedom on structure. Follow the plan exactly.

---

## 3. Current-State Understanding

### Repository contents
```
Main Porfolio/
  .git/
  README.md          # "Amrith's Portfolio Website"
```

### System environment
- **Node v25.6.0**, **npm 11.11.0** available at `/opt/homebrew/bin/`
- **macOS** (Apple Silicon)
- `gh` CLI authenticated and working

### Content extracted from prior portfolios (use as placeholder data)
- **Name:** Amrith Akshintala
- **Role:** Freshman Computer Engineering student at Texas A&M University
- **Bio:** Focused on building strong software foundations while exploring hardware through hands-on projects, goal of developing well-rounded engineering skills and creating practical real-world solutions.
- **Skills mentioned:** Python, C++, JavaScript, MATLAB, Embedded Systems, ROS, Git, CAD Design, 3D Printing, Robotics
- **Social links:** GitHub (`https://github.com/CodingMastermind123`), LinkedIn (placeholder `#`), Email (`aamrith@tamu.edu`)
- **Prior portfolio had:** hero section, about, projects (6 placeholder slots), skills, certifications, contact
- **Color scheme from Portfolio2:** dark background (#0a0a0a), neon green accent (rgb(0,255,140)), grid pattern overlay

### Tech stack (per request)
- **React** via Vite (single `.jsx` file architecture)
- **Tailwind CSS v4** (utility classes, `@tailwindcss/vite` plugin)
- **Three.js** (3D wireframe in hero)
- **react-icons** (icon library — NOT a component library, just icons)
- **No external component libraries** (no MUI, Chakra, shadcn, Headless UI, etc.)

---

## 4. Assumptions and Open Questions

| # | Assumption | Action if wrong |
|---|-----------|-----------------|
| 1 | "Single `.jsx` file" means one `App.jsx` containing ALL component functions, plus a tiny `main.jsx` entry that mounts `<App />`. | Follow literally — do not split components into separate files. |
| 2 | Vite is the scaffolding tool (fast, React + Tailwind support, zero-config dev server). | If Vite causes issues, use Create React App as fallback. |
| 3 | Project data uses **realistic placeholders** since no real project details were provided. | Sonnet should create 6-8 believable projects spanning ML, Hardware, Web, Other. |
| 4 | Resume file does not exist — download CTA links to `#` or `/resume.pdf`. | User replaces later. |
| 5 | Contact form is **frontend-only** (no backend). Shows success message but does not send data. | Proceed. |
| 6 | `react-icons` is acceptable (it's an icon library, not a component library). | If user objects, replace with inline SVG icons. |
| 7 | Tailwind v4 is used. If it causes problems, fall back to Tailwind v3 with `tailwind.config.js`. | See Phase 1 notes. |
| 8 | Three.js is imported as npm dependency, not CDN script. | Proceed. |
| 9 | The typed text effect uses a custom implementation (no external Typed.js dependency). | Proceed — keep deps minimal. |
| 10 | Particle network + wireframe polyhedron are combined into one Three.js canvas scene. | Proceed. |
| 11 | Achievement items are exactly: Eagle Scout, Presidential Volunteer Service Award, Varsity Tennis, hackathon participation, team engineering projects. | Follow request literally. |

---

## 5. Risks / Edge Cases

### High risk
1. **Single-file size:** `App.jsx` will be 2500-3500+ lines. Organize meticulously with `// ════════════════ SECTION NAME ════════════════` comment separators. Group related code together.
2. **Three.js memory leaks:** Every `useEffect` that creates a renderer MUST return a cleanup function that calls `renderer.dispose()`, cancels `requestAnimationFrame`, and removes event listeners. Failure here crashes the browser tab.
3. **Tailwind v4 setup differences:** v4 uses `@import "tailwindcss"` in CSS + `@tailwindcss/vite` plugin. There is NO `tailwind.config.js`. Custom theme values go in `@theme {}` blocks. If this causes issues, fall back to v3.

### Medium risk
4. **CSS 3D flip cross-browser:** Parent must have `perspective: 1000px`. Both front/back faces need `backface-visibility: hidden`. Back face needs `rotateY(180deg)` as default transform. Test in Safari — it's the most likely to break.
5. **Command palette Cmd+K conflicts:** `e.preventDefault()` is required or the browser's search bar opens. Must handle both `metaKey` (Mac) and `ctrlKey` (Windows/Linux).
6. **Custom cursor performance:** Outer ring uses `requestAnimationFrame` with lerp. Must cancel animation frame on unmount. Must not render on touch devices.
7. **Dark/light mode flash:** Default is dark. Set `class="dark"` on `<html>` in `index.html` statically so there's no flash of light mode on load.

### Low risk
8. **Konami code detection:** Buffer must reset on wrong key or after 3-second timeout.
9. **Contact form XSS:** Not a real risk since form doesn't submit, but still use controlled inputs.
10. **Radar chart SVG math:** Pentagon vertices at `(i * 72deg - 90deg)` for 5 axes. Double-check trig.
11. **Scroll observer memory:** Each `IntersectionObserver` should `unobserve` on cleanup.

---

## 6. Implementation Plan

---

### Phase 1: Project Scaffolding

**Purpose:** Create a Vite + React + Tailwind project with all dependencies.

**Step 1.1: Initialize Vite project**
- Working directory: `/Users/amrith/Documents/Documents - Kishore's MacBook Pro/Amrith/Main Porfolio/`
- Run: `npm create vite@latest . -- --template react`
- This creates `package.json`, `vite.config.js`, `index.html`, `src/main.jsx`, `src/App.jsx`, `src/App.css`, `src/index.css`, etc.
- **Pitfall:** The directory already has `README.md` and `.git`. Vite may warn but should proceed. If it refuses, temporarily move `README.md`, scaffold, then move it back.

**Step 1.2: Install dependencies**
```bash
npm install
npm install -D tailwindcss @tailwindcss/vite
npm install three react-icons
```
- **Do NOT install** any component libraries (MUI, Chakra, shadcn, etc.)
- **Do NOT install** typed.js, particles.js, chart.js, or similar — all effects are custom-built.

**Step 1.3: Configure Tailwind v4 with Vite**
- Open `vite.config.js`
- Import `tailwindcss` from `@tailwindcss/vite`
- Add it to the `plugins` array alongside the React plugin:
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

**Step 1.4: Set up `src/index.css`**
- Replace all contents with:
```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));
```
- This is the Tailwind v4 way to enable class-based dark mode.
- Additional theme/custom CSS will be added in Phase 2.

**Step 1.5: Clean up scaffolding**
- **Delete** `src/App.css` (all styling via Tailwind utilities + index.css custom properties)
- **Clear out** the default Vite boilerplate content from `src/App.jsx` — replace with a minimal `function App() { return <div>Hello</div> }; export default App;`
- **Modify** `index.html`:
  - Set `<html lang="en" class="dark">` (dark mode default)
  - Change `<title>` to `Amrith Akshintala — Portfolio`
  - Add Google Fonts links in `<head>`:
    ```html
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    ```
  - Add meta description: `<meta name="description" content="Amrith Akshintala — Freshman Computer Engineering student at Texas A&M. Projects in ML, hardware, and web development.">`
- **Modify** `src/main.jsx`: ensure it imports `./index.css` and renders `<App />` in strict mode.

**Step 1.6: Verify**
- Run `npm run dev`
- Open browser — should see "Hello" on a dark background
- Verify Tailwind works by temporarily adding `className="text-red-500 text-4xl"` to the div
- Fix any errors before proceeding

**Definition of done:** `npm run dev` starts, page renders, Tailwind classes apply correctly.

---

### Phase 2: CSS Foundation & Theme System

**Purpose:** Define CSS custom properties for both themes, grain texture, global transitions.

**File to modify:** `src/index.css`

**Step 2.1: Add `@theme` block with design tokens**
- Add after the `@import "tailwindcss"` and `@custom-variant` lines:
```css
@theme {
  --font-display: 'Space Grotesk', sans-serif;
  --font-body: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --color-accent: #6366f1;
  --color-accent-light: #818cf8;
  --color-accent-glow: rgba(99, 102, 241, 0.4);
}
```

**Step 2.2: Add global base styles**
```css
body {
  font-family: var(--font-body);
  overflow-x: hidden;
}

*, *::before, *::after {
  transition: background-color 200ms ease, color 200ms ease, border-color 200ms ease, box-shadow 200ms ease;
}

[data-no-transition] {
  transition: none !important;
}
```

**Step 2.3: Grain/noise texture overlay**
```css
body::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  opacity: 0.04;
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 256px 256px;
}
```

**Step 2.4: Custom scrollbar**
```css
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: transparent; }
.dark ::-webkit-scrollbar-thumb { background: #374151; border-radius: 4px; }
::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
```

**Step 2.5: Scroll reveal animation utility classes**
```css
.reveal-hidden {
  opacity: 0;
  transform: translateY(2rem);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.reveal-visible {
  opacity: 1;
  transform: translateY(0);
}
@media (prefers-reduced-motion: reduce) {
  .reveal-hidden { opacity: 1; transform: none; transition: none; }
}
```

**Step 2.6: Custom cursor styles**
```css
@media (pointer: fine) {
  .custom-cursor-active { cursor: none; }
  .custom-cursor-active a,
  .custom-cursor-active button,
  .custom-cursor-active [role="button"] { cursor: none; }
}
```

**Definition of done:** Dark page with grain texture visible. Removing `dark` class switches to light. Scrollbar styled.

---

### Phase 3: App.jsx — Skeleton & Data Constants

**Purpose:** Create the single-file architecture with all component stubs, data arrays, and state management.

**File:** `src/App.jsx`

**Step 3.1: Imports section**
```jsx
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import {
  FiGithub, FiLinkedin, FiMail, FiExternalLink, FiDownload,
  FiSun, FiMoon, FiMenu, FiX, FiSearch, FiChevronDown,
  FiArrowRight, FiAward, FiCode, FiCpu, FiDatabase,
  FiGlobe, FiTerminal, FiTool, FiLayers, FiZap, FiUser,
  FiArrowUp, FiActivity
} from 'react-icons/fi';
import {
  SiPython, SiCplusplus, SiJavascript, SiReact, SiTensorflow,
  SiArduino, SiGit, SiDocker, SiLinux, SiNodedotjs,
  SiTailwindcss
} from 'react-icons/si';
```
- **Verify** each import compiles. If any icon doesn't exist, use a close alternative from `fi` set.
- `react-icons/gi` icons (eagle, tennis) may or may not exist — test and use fallbacks from `fi`.

**Step 3.2: Data constants**

Define these OUTSIDE any component (top of file after imports). Include:

- `NAV_LINKS` — array of `{ label, href }` for About, Skills, Projects, Achievements, Contact
- `TAGLINES` — array of 4 strings for typed text effect:
  - 'Computer Engineering @ Texas A&M'
  - 'Building with ML & Hardware'
  - 'Eagle Scout & Problem Solver'
  - 'Currently building FoodLink'
- `SOCIAL_LINKS` — array of `{ icon, href, label }` for GitHub, LinkedIn, Email
- `STATS` — array of `{ label, value, suffix }`:
  - `{ label: 'Projects', value: 8, suffix: '+' }`
  - `{ label: 'Hours Coding', value: 500, suffix: '+' }`
  - `{ label: 'Hackathons', value: 3, suffix: '' }`
  - `{ label: 'Service Hours', value: 100, suffix: '+' }`
- `SKILLS` — object with three keys (Languages, Frameworks, Tools), each an array of `{ name, icon, color }`:
  - Languages: Python (#3776AB), C++ (#00599C), JavaScript (#F7DF1E), MATLAB (#E16737), Verilog (#848484)
  - Frameworks: React (#61DAFB), TensorFlow (#FF6F00), Node.js (#339933), Tailwind (#06B6D4), ROS (#22314E)
  - Tools: Git (#F05032), Docker (#2496ED), Arduino (#00979D), Linux (#FCC624), SolidWorks (#FF0000)
- `RADAR_DATA` — array of `{ axis, value }` for 5 domains: ML (0.7), Web (0.75), Hardware (0.65), Systems (0.6), Design (0.5)
- `PROJECTS` — array of 7 project objects with `{ id, title, summary, description, stack, category, featured, github, demo }`:
  1. FoodLink (Web, featured) — iOS/web food donation app
  2. Autonomous Line Follower (Hardware) — Arduino PID robot
  3. Sentiment Analyzer (ML) — NLP social media classifier
  4. Smart Irrigation System (Hardware) — ESP32 IoT monitoring
  5. Digit Recognizer (ML) — CNN handwritten digits
  6. Portfolio Website (Web) — this site
  7. Study Group Finder (Web) — campus study matching app
- `PROJECT_CATEGORIES` — `['All', 'ML', 'Hardware', 'Web', 'Other']`
- `ACHIEVEMENTS` — array of 5 objects with `{ title, description, icon }`:
  1. Eagle Scout — 'eagle' icon
  2. Presidential Volunteer Service Award — 'award' icon
  3. Varsity Tennis — 'tennis' icon
  4. TAMUhack Participant — 'code' icon
  5. Engineering Team Projects — 'team' icon
- `KONAMI_SEQUENCE` — `['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','KeyB','KeyA']`
- `COMMAND_ACTIONS` — array of `{ label, action, target, icon }` for palette navigation (scroll to sections, toggle theme, open resume, visit GitHub/LinkedIn)

**Step 3.3: Custom hooks** (define after constants, before components)

1. **`useDarkMode()`** — returns `[darkMode, toggleDarkMode]`
   - Init: read `localStorage.getItem('theme')`, default to `'dark'`
   - Toggle: flip state, update `localStorage`, toggle `dark` class on `document.documentElement`

2. **`useScrollReveal(delay = 0)`** — returns a `ref`
   - `IntersectionObserver` with `threshold: 0.1`, `rootMargin: '0px 0px -50px 0px'`
   - On entry: after `delay` ms, swap `reveal-hidden` to `reveal-visible`
   - Respects `prefers-reduced-motion`
   - Disconnect on unmount

3. **`useAnimatedCounter(target, duration = 2000)`** — returns `{ ref, count }`
   - `IntersectionObserver` triggers once
   - Animate 0 to `target` with `requestAnimationFrame` + easing
   - `hasAnimated` ref prevents re-trigger

4. **`useKonamiCode(callback)`** — no return
   - Tracks `keydown` vs `KONAMI_SEQUENCE`
   - Resets on wrong key or 3s timeout
   - Calls `callback()` on match

5. **`useMediaQuery(query)`** — returns boolean
   - Wraps `window.matchMedia`, listens for changes

**Step 3.4: Component stubs**

Create empty function declarations for all components:

```
// ════════════════ UTILITY COMPONENTS ════════════════
function CustomCursor() { return null; }
function ScrollArrow() { return null; }

// ════════════════ HERO COMPONENTS ════════════════
function ThreeHero() { return null; }
function TypedText() { return null; }
function CurrentlyBuildingBadge() { return null; }

// ════════════════ SECTION COMPONENTS ════════════════
function Navbar() { return null; }
function HeroSection() { return null; }
function AboutSection() { return null; }
function SkillsSection() { return null; }
function SkillRadarChart() { return null; }
function ProjectsSection() { return null; }
function AchievementsSection() { return null; }
function ContactSection() { return null; }
function Footer() { return null; }

// ════════════════ OVERLAY COMPONENTS ════════════════
function MobileNav() { return null; }
function ProjectModal() { return null; }
function CommandPalette() { return null; }
function EasterEggConfetti() { return null; }
```

**Step 3.5: Root `App` component**

Wire all state and render all section components:
- State: `darkMode`, `mobileMenuOpen`, `commandPaletteOpen`, `activeFilter`, `selectedProject`, `easterEggActive`
- Derived: `isMobile = useMediaQuery('(max-width: 768px)')`, `isFineCursor = useMediaQuery('(pointer: fine)')`
- `useKonamiCode(() => setEasterEggActive(true))`
- Global `keydown` listener: Cmd/Ctrl+K toggles command palette, Escape closes all overlays
- Render all sections and conditional overlays
- `export default App`

**Definition of done:** File compiles, `npm run dev` shows blank dark page, no errors. All stubs exist.

---

### Phase 4: Hero Section + Three.js + Typed Text + Scroll Arrow + Currently Building Badge

**File:** `src/App.jsx` — fill in `ThreeHero`, `TypedText`, `ScrollArrow`, `CurrentlyBuildingBadge`, `HeroSection`

**Step 4.1: `ThreeHero` component**
- Render `<canvas ref={canvasRef} />` absolutely positioned, full size
- In `useEffect`:
  1. Create `THREE.Scene` (transparent bg), `THREE.PerspectiveCamera` (FOV 75), `THREE.WebGLRenderer` (alpha: true, antialias: true)
  2. **Wireframe icosahedron:** `new THREE.IcosahedronGeometry(2.5, 1)` → `THREE.WireframeGeometry` → `THREE.LineSegments` with indigo-colored material. Position slightly right of center.
  3. **Particles + network:** `THREE.BufferGeometry` with 60-80 random positions in radius-5 sphere. `THREE.Points` with small size. `THREE.LineSegments` connecting particles within distance 1.5.
  4. **Mouse reactivity:** `mousemove` listener, lerp scene rotation toward normalized mouse position (damping 0.05)
  5. **Animation loop:** `requestAnimationFrame`, slow rotation (y += 0.003, x += 0.001), render
  6. **Resize handler:** update camera aspect and renderer size
- **CRITICAL cleanup:** `cancelAnimationFrame`, `renderer.dispose()`, remove listeners, dispose geometries + materials
- **Do NOT render on mobile** (guard with `isMobile` prop)

**Step 4.2: Parallax**
- Wrap `ThreeHero` in a div with ref
- Scroll listener applies `transform: translateY(${scrollY * 0.5}px)` + `will-change: transform`

**Step 4.3: `TypedText` component**
- Props: `strings` (array)
- State: `displayText`, `stringIndex`, `charIndex`, `isDeleting`
- `useEffect` with `setTimeout`:
  - Typing forward: 50ms/char
  - Pause at end: 2000ms
  - Deleting: 30ms/char
  - Move to next string on empty
- Render text + blinking `|` cursor

**Step 4.4: `CurrentlyBuildingBadge`**
- Pill with pulsing green dot (Tailwind `animate-ping` for the outer, static inner dot) + text

**Step 4.5: `ScrollArrow`**
- Bottom-center of hero, `animate-bounce`, `FiChevronDown`
- Click scrolls to `#about`
- Fades out when `scrollY > 100`

**Step 4.6: `HeroSection`**
- `min-h-screen flex items-center justify-center` with parallax 3D background
- Large bold name: `text-5xl md:text-7xl lg:text-8xl font-black` in display font
- `TypedText` below name
- `CurrentlyBuildingBadge` above name
- Two CTA buttons: "View Projects" (filled) + "Contact Me" (outlined)

**Definition of done:** Hero with 3D wireframe, typed text cycling, pulsing badge, bouncing scroll arrow, parallax on scroll.

---

### Phase 5: Sticky Navbar

**File:** `src/App.jsx` — fill in `Navbar` and `MobileNav`

**Step 5.1: `Navbar`**
- Fixed `top-0 z-50`, transparent by default
- On scroll > 50px: frosted glass (`bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b`)
- Left: "AA" logo or "Amrith" in display font
- Center (desktop): nav links with sliding underline hover (`::after` pseudo with `scaleX` transition). Active section detection via `IntersectionObserver`.
- Right: dark/light toggle (sun/moon with rotation), Resume button pill
- Mobile: hamburger + dark toggle only

**Step 5.2: `MobileNav`**
- Full-screen overlay `z-[60]`, dark backdrop with blur
- Close button top-right
- Large stacked nav links with staggered entrance (increasing `transitionDelay`)
- Body scroll lock on mount, restore on unmount
- Click link: scroll to section + close menu

**Definition of done:** Navbar transparent over hero, frosted glass on scroll. Active link highlighting. Mobile hamburger overlay works.

---

### Phase 6: About Section

**File:** `src/App.jsx` — fill in `AboutSection`

**Step 6.1: Two-column layout** (`grid-cols-1 md:grid-cols-2`)
- Left: circular profile placeholder with gradient border, hover scale
- Right: bio heading + paragraphs + social links

**Step 6.2: Bio content**
- "Hi, I'm Amrith!" heading
- Two paragraphs about CompE at TAMU, software + hardware passion
- Social link icons with hover effects

**Step 6.3: Stat chips**
- 4 pills with animated counters using `useAnimatedCounter`
- Count from 0 to target on first scroll into view
- Staggered `useScrollReveal`

**Definition of done:** Two-column about, animated counters, social links.

---

### Phase 7: Skills Section + Radar Chart

**File:** `src/App.jsx` — fill in `SkillsSection` and `SkillRadarChart`

**Step 7.1: Skills grid**
- Three categories from `SKILLS` object
- Responsive grid of icon + label cards
- **Hover glow:** `onMouseEnter`/`onMouseLeave` toggling inline `style` for `boxShadow` and `borderColor` using each skill's brand color
- Staggered `useScrollReveal`

**Step 7.2: `SkillRadarChart` (SVG)**
- SVG `viewBox="0 0 300 300"`, center (150,150)
- 5 axes at 72-degree intervals starting at -90 degrees (top)
- 3 concentric pentagon grid lines, 5 axis lines, 5 axis labels
- Data polygon filled with semi-transparent accent
- **Animate on scroll:** `IntersectionObserver` triggers, animate radii from 0 to final over 1s using `requestAnimationFrame`
- Math: `x = cx + r * cos(angle), y = cy + r * sin(angle)`

**Definition of done:** Skills grid with brand-color hover glow. Radar chart animates from center.

---

### Phase 8: Projects Section + Filters + Flip Cards + Modal

**File:** `src/App.jsx` — fill in `ProjectsSection` and `ProjectModal`

**Step 8.1: Filter buttons**
- Row of `PROJECT_CATEGORIES` buttons
- Active: filled accent. Inactive: outline/muted.
- On click: `setActiveFilter(category)`

**Step 8.2: Filter logic**
- `filteredProjects = activeFilter === 'All' ? PROJECTS : PROJECTS.filter(p => p.category === activeFilter)`
- `featuredProject = filteredProjects.find(p => p.featured)`
- `gridProjects = filteredProjects.filter(p => !p.featured)`

**Step 8.3: Featured spotlight card**
- Full-width gradient card for the featured project (if visible in current filter)
- Title, description, stack pills, links

**Step 8.4: 3D flip cards**
- Manage flip state as `{ [projectId]: boolean }` in `ProjectsSection`
- Card wrapper: `style={{ perspective: '1000px' }}`
- Inner: `transition-transform duration-500`, `style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'none' }}`
- Front face: title, summary, stack pills, category badge — `style={{ backfaceVisibility: 'hidden' }}`
- Back face: description, links, "View Details" button — `style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}`
- Staggered `useScrollReveal`

**Step 8.5: `ProjectModal`**
- Fixed overlay `z-[70]`, dark backdrop + blur
- Centered card with title, full description, stack, links
- Close: backdrop click, Escape, X button
- Focus trap + body scroll lock

**Definition of done:** Filters work. Featured spotlight. Cards flip. Modal opens/closes.

---

### Phase 9: Achievements Section

**File:** `src/App.jsx` — fill in `AchievementsSection`

- 5 badge cards from `ACHIEVEMENTS` array
- Each: icon (map string to react-icon), title, description
- Icon in colored circle container
- Hover lift + shadow
- Staggered `useScrollReveal(i * 150)` for waterfall entrance

**Icon mapping fallbacks:**
- 'eagle' → `FiAward` (or `GiEagle` if available)
- 'award' → `FiAward`
- 'tennis' → `FiActivity` (or `GiTennisRacket` if available)
- 'code' → `FiCode`
- 'team' → `FiUsers` or `FiGlobe`

**Definition of done:** 5 achievement cards with staggered entrance.

---

### Phase 10: Contact Section + Footer

**File:** `src/App.jsx` — fill in `ContactSection` and `Footer`

**Step 10.1: Split layout**
- Left: "Let's build something together" + blurb + social links
- Right: contact form (name, email, message)

**Step 10.2: Contact form**
- Controlled inputs with `useState`
- Validation via `required` + `type="email"`
- On submit: `e.preventDefault()`, show success message, reset form after 3s
- Success banner: "Message sent! (Demo — no backend connected)"

**Step 10.3: Resume CTA**
- Full-width button below: "Download Resume" with `FiDownload` icon

**Step 10.4: Footer**
- Border-top, centered text: "2025 Amrith Akshintala. Built with React & Three.js."
- Small social icons

**Definition of done:** Form validates and shows success. Resume CTA renders. Footer present.

---

### Phase 11: Dark/Light Mode Verification

**Already wired in Phase 3.** Verify:
- `useDarkMode` hook reads/writes `localStorage`, toggles `dark` class on `<html>`
- All components have `dark:` Tailwind variants
- 200ms transition on all color properties
- No flash of wrong theme on load
- Three.js colors acceptable in both themes

---

### Phase 12: Custom Cursor

**File:** `src/App.jsx` — fill in `CustomCursor`

- Only rendered on desktop fine-pointer devices
- Inner dot: 6px, follows mouse immediately
- Outer ring: 32px border, follows with lerp (0.15) via `requestAnimationFrame`
- Hover morph: event delegation on `document`, detect `a, button, [role="button"]`, scale ring 1.5x
- Default cursor hidden via `custom-cursor-active` class on body
- Cleanup: cancel RAF, remove listeners

**Definition of done:** Dot + ring follow mouse. Ring morphs on interactive hover. Hidden on mobile.

---

### Phase 13: Command Palette

**File:** `src/App.jsx` — fill in `CommandPalette`

- Opens with Cmd+K / Ctrl+K (handled in App)
- Fixed overlay `z-[80]`, backdrop + blur
- Search input (autoFocus), filters `COMMAND_ACTIONS` by label
- Keyboard navigation: ArrowUp/Down moves selection, Enter executes, Escape closes
- Actions: scroll to section, toggle theme, open link
- Focus management: auto-focus input, restore previous focus on close
- Entrance animation: scale + fade

**Definition of done:** Cmd+K opens. Search filters. Arrow+Enter navigate. Actions work. Escape closes.

---

### Phase 14: Scroll Reveals (Apply everywhere)

Ensure `useScrollReveal` is applied to:
- Each section heading
- About photo + bio (with delay offset)
- Each skill card (stagger `i * 50`)
- Each project card (stagger `i * 100`)
- Each achievement card (stagger `i * 150`)
- Each stat chip (stagger `i * 100`)
- Contact section columns
- Verify `prefers-reduced-motion` skips animations

---

### Phase 15: Konami Code Easter Egg

**File:** `src/App.jsx` — fill in `EasterEggConfetti`

- 50 confetti particles: random position, color, size, rotation
- CSS animation: fall + fade over 2-3 seconds
- Toast: "You found the secret!" centered at top
- Auto-remove after 3s via `setTimeout(onComplete, 3000)`
- `pointer-events: none`, `z-[9999]`

**Definition of done:** ↑↑↓↓←→←→BA triggers confetti + toast.

---

### Phase 16: "Currently Building" Badge

Already implemented in Phase 4 as `CurrentlyBuildingBadge`. Verify pulsing green dot renders in hero.

---

### Phase 17: Mobile Responsiveness Pass

Test at 375px, 428px, 768px, 1024px, 1440px:

| Section | Mobile fix |
|---------|-----------|
| Hero | `text-4xl` name, no Three.js, no parallax |
| Navbar | Hamburger only |
| About | Single column, photo above bio |
| Skills | `grid-cols-2` cards, radar chart above grid |
| Projects | Single column, modal instead of flip on tap |
| Achievements | Single column |
| Contact | Single column, form below blurb |
| Cursor | Not rendered |
| Palette | Full width with mx-4 padding |

- Fix any horizontal overflow
- Ensure 44px minimum touch targets
- Simplify reveals on mobile (fade only, no translateY)

---

### Phase 18: Final Polish

- **Section headings:** Consistent `text-3xl md:text-4xl font-bold text-center mb-12` in display font
- **Smooth scroll:** `scroll-behavior: smooth` + `scroll-padding-top: 5rem` on `html`
- **Performance:** `React.memo` on `ThreeHero` and `SkillRadarChart`. Verify all `useEffect` cleanups.
- **Accessibility:** `aria-label`s, focus trapping, heading hierarchy (1 h1, h2s per section), color contrast
- **Meta tags:** OG title, description, type in `index.html`
- **Cleanup:** Remove TODOs, unused imports, Vite boilerplate files (`public/vite.svg`)

---

## 7. Testing Plan

### 7.1 Dev Server Smoke Test
```bash
npm run dev
```
- Verify zero console errors/warnings
- Page loads with dark background and grain texture

### 7.2 Production Build
```bash
npm run build && npm run preview
```
- Build succeeds, preview works identically to dev

### 7.3 Feature Testing Matrix

| # | Feature | Test | Pass criteria |
|---|---------|------|---------------|
| 1 | Hero 3D | Load desktop | Wireframe rotates, particles float, mouse tilts scene |
| 2 | Parallax | Scroll hero | 3D bg at half scroll speed |
| 3 | Typed text | Watch subtitle | Types, pauses, deletes, cycles all 4 taglines |
| 4 | Building badge | Hero area | Green dot pulses |
| 5 | Scroll arrow | Hero bottom | Bounces, clicks to About, fades on scroll |
| 6 | Navbar glass | Scroll down | Gains blur + bg + border |
| 7 | Active nav | Scroll sections | Correct link highlights |
| 8 | Mobile nav | < 768px | Hamburger opens overlay, links work, X closes |
| 9 | Theme toggle | Click sun/moon | 200ms color swap |
| 10 | Theme persist | Toggle + refresh | Survives reload |
| 11 | Counters | Scroll to About | Numbers count up from 0 |
| 12 | Skill glow | Hover cards | Brand-color box shadow |
| 13 | Radar chart | Scroll to skills | Animates from center |
| 14 | Filters | Click category buttons | Grid filters with animation |
| 15 | Card flip | Click project card | 3D rotateY flip |
| 16 | Modal | Click "View Details" | Opens with full info, closes 3 ways |
| 17 | Featured | All/Web filter | FoodLink spotlight card |
| 18 | Achievement stagger | Scroll down | Cards enter one-by-one |
| 19 | Form validation | Submit empty | Required messages |
| 20 | Form success | Fill + submit | Success message, form resets |
| 21 | Custom cursor | Desktop mouse | Dot + lagging ring |
| 22 | Cursor morph | Hover button | Ring scales up |
| 23 | No cursor mobile | Touch device | Not visible |
| 24 | Cmd+K | Press shortcut | Palette opens |
| 25 | Palette search | Type "proj" | Filters to "Go to Projects" |
| 26 | Palette nav | Arrows + Enter | Navigates correctly |
| 27 | Konami | Type sequence | Confetti + toast |
| 28 | Grain | Inspect closely | Noise texture visible |
| 29 | Scroll reveals | Scroll page | Sections fade+slide up |
| 30 | Reduced motion | Enable in OS | Animations skipped |

### 7.4 Responsive Testing
- 375px, 428px, 768px, 1024px, 1440px
- No horizontal scroll, readable text, tappable buttons

### 7.5 Accessibility
- Tab through page — all elements reachable
- Escape closes overlays
- Heading hierarchy: h1 > h2 > h3
- Color contrast sufficient in both themes

---

## 8. Validation Checklist for Sonnet

- [ ] `npm run dev` starts without errors
- [ ] `npm run build` succeeds
- [ ] Zero console errors/warnings
- [ ] All 7 sections render (Hero, About, Skills, Projects, Achievements, Contact, Footer)
- [ ] Dark mode default, no flash
- [ ] Toggle works + persists localStorage
- [ ] Three.js renders on desktop, skipped on mobile
- [ ] Three.js cleanup: no memory leaks
- [ ] Typed text cycles all taglines
- [ ] Currently Building badge with pulsing dot
- [ ] Scroll arrow bounces + scrolls + fades
- [ ] Navbar transparent → frosted glass
- [ ] Active section nav highlighting
- [ ] Mobile hamburger overlay
- [ ] Animated counters count up once
- [ ] Skill cards brand-color hover glow
- [ ] Radar chart animates on scroll
- [ ] Project filters work
- [ ] Featured project spotlight
- [ ] Cards 3D-flip on click
- [ ] Project modal opens/closes (backdrop/Escape/X)
- [ ] Achievements staggered entrance
- [ ] Contact form validates + shows success
- [ ] Resume CTA button
- [ ] Custom cursor desktop-only with morph
- [ ] Cmd+K / Ctrl+K command palette
- [ ] Palette search + keyboard nav
- [ ] Konami code confetti + toast
- [ ] Grain overlay visible
- [ ] Parallax on hero bg
- [ ] Scroll reveals on all sections
- [ ] `prefers-reduced-motion` respected
- [ ] No horizontal overflow at any width
- [ ] All components in single `src/App.jsx`
- [ ] Only other JSX: `src/main.jsx`
- [ ] No external component libraries
- [ ] All `dark:` variants present
- [ ] Focus trapping in modals
- [ ] Body scroll lock on overlays
- [ ] All useEffect cleanups present
- [ ] Meta tags in index.html

---

## 9. Suggested Execution Order for Sonnet

**Run `npm run dev` after each phase. Fix errors before proceeding.**

| Order | Phase | Description |
|-------|-------|-------------|
| 1 | Phase 1 | Scaffold Vite + React + Tailwind + Three.js |
| 2 | Phase 2 | CSS foundation (theme, grain, transitions) |
| 3 | Phase 3 | App.jsx skeleton (imports, data, hooks, stubs) |
| 4 | Phase 11 | Dark/light mode verification |
| 5 | Phase 5 | Navbar + mobile nav |
| 6 | Phase 4 | Hero + Three.js + typed text + badge |
| 7 | Phase 14 | Apply scroll reveals |
| 8 | Phase 6 | About + animated counters |
| 9 | Phase 7 | Skills + radar chart |
| 10 | Phase 8 | Projects + filters + flip + modal |
| 11 | Phase 9 | Achievements |
| 12 | Phase 10 | Contact + footer |
| 13 | Phase 12 | Custom cursor |
| 14 | Phase 13 | Command palette |
| 15 | Phase 15 | Konami easter egg |
| 16 | Phase 17 | Mobile responsiveness pass |
| 17 | Phase 18 | Final polish + a11y + meta |

---

## 10. Final Notes for Sonnet

1. **SINGLE FILE is non-negotiable.** ALL React components, hooks, constants in `src/App.jsx`. Only exception: `src/main.jsx` (mount point).

2. **Test incrementally.** `npm run dev` after EVERY phase. Fix all errors before continuing.

3. **Three.js cleanup is the #1 crash risk.** Every `useEffect` touching Three.js MUST have cleanup: `renderer.dispose()`, `cancelAnimationFrame`, remove listeners, dispose geometries + materials.

4. **Tailwind v4 fallback:** If v4 breaks, switch to v3:
   ```bash
   npm uninstall tailwindcss @tailwindcss/vite
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```
   Config: `darkMode: 'class'`, `content: ['./index.html', './src/**/*.{js,jsx}']`. CSS: `@tailwind base; @tailwind components; @tailwind utilities;`. Remove Tailwind Vite plugin.

5. **Icon import fallbacks:** If any icon from `react-icons` doesn't compile, swap for nearest `Fi*` alternative. Always test imports compile before writing component code.

6. **CSS `backface-visibility`:** If Tailwind lacks `backface-hidden`, use `style={{ backfaceVisibility: 'hidden' }}`.

7. **Scroll behavior:** CSS `html { scroll-behavior: smooth; scroll-padding-top: 5rem; }`.

8. **All data is placeholder.** Projects, stats, social links use realistic but fake data. User replaces later.

9. **Performance:** `React.memo` on `ThreeHero` and `SkillRadarChart`. Efficient RAF loops. `will-change` only on parallax + cursor.

10. **Simple > broken.** A clean working feature beats an over-engineered broken one. If stuck on an effect, implement a simpler version and move on.
