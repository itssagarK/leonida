# DESIGN.md — The Leonida Wire Design System Contract

> **“Every image tells a story. Every edit changes what survives.”**
> 
> *The Leonida Wire* is a classified investigative newsroom and forensic evidence terminal in a neon coastal city (inspired by the Leonida / GTA VI setting). This document establishes the strict aesthetic, spatial, typographic, motion, and component contract for the entire interface, grounded in the **taste-skill** (Anti-Slop frontend framework) and **Google Stitch / awesome-design-md** design specifications.

---

## 1. Taste-Skill Dials & Framework Alignment

| Dial | Setting | Implementation in The Leonida Wire |
| :--- | :---: | :--- |
| **DESIGN VARIANCE** | **8 / 10** | Every single screen has a bespoke editorial layout suited to its narrative purpose (Landing broadsheet unroll, Manila folder archives, analog scrubber timeline, 3-zone photo workbench, forensic teletype drift meter, interactive wipe reveal). Zero cookie-cutter card grids. |
| **MOTION INTENSITY** | **7 / 10** | Purposeful physical transitions: `@keyframes stampIn` with mechanical deceleration & rotation, unrolling broadsheet reveal, live teletype ticker ticker, tense 0% → N% countup meter, dynamic optical chromatic aberration degradation. |
| **VISUAL DENSITY** | **8 / 10** | High-density investigative terminal: docket numbers, custody chain steps, sensor readouts, Oxford double-rules, corner photo-mounting reticles, teletype ledgers with dotted leader lines, analog ruler ticks. |

---

## 2. Core Metaphor & Anti-Slop Rules

### 2.1 The Metaphor: Classified Archival Noir
The interface is **not** a generic modern web dashboard. It operates as a clandestine late-night investigative wire room terminal:
1. **The Press Masthead**: Authoritative serif display headlines, engraved Oxford double-rules, datelines, and editorial memoranda.
2. **The Forensic Chain-of-Custody Terminal**: Monospace teletype, classified rubber stamps, evidence docket numbers, photo mounting corners, and lexical decay tracking.
3. **The Photo-Editing Workbench**: The `@unlayer/react-image-editor` integrated directly as an evidentiary darkroom table with a radial lamp spotlight where visual evidence is altered to sway public perception.

### 2.2 Anti-Slop Strict Rules (Enforced Throughout Codebase)
- ❌ **NO Generic SaaS Gradients**: No purple/blue/violet blurry mesh or neon glow washes. All depth is created with crisp 1px borders, subtle opacity layering, and physical drop shadows.
- ❌ **NO Off-Palette Colors**: No green, cyan, or generic SaaS colors. The application enforces a strict **2-Accent Color Rule**.
- ❌ **NO Cookie-Cutter 3-Card Templates**: Every section has intentional, content-tailored hierarchy.
- ❌ **NO Decorative Icons Without Function**: Every symbol (crosshairs `+`, reticles `⌜ ⌝`, arrows `→`, bullets `●`) carries semantic evidentiary meaning.
- ❌ **NO Floating Soft Glassmorphism**: Cards and panels have tactile physical grounding with borders and drop shadows (`--shadow-lift`, `--shadow-deep`).

---

## 3. Color System: Strict 2-Accent Palette

The interface adheres to a strict 2-accent palette. Everything else is tonal black, charcoal, or warm ivory.

| Token | Hex / Value | Semantic Role |
| :--- | :--- | :--- |
| `--bg-base` | `#0A0B0E` | Deepest root canvas; cathode darkroom tone |
| `--bg-surface` | `#101217` | Card, container, and docket folder backgrounds |
| `--bg-elevated` | `#161922` | Active panels, modal surfaces, toolbar backings |
| `--bg-card` | `#12141A` | Dossier cards and custody ledger entries |
| `--bg-card-hover` | `#191C25` | Hover state for interactive dossier elements |
| `--bg-panel` | `#0D0F14` | Editor panel and evidence workbench backdrop |
| `--bg-paper` | `#F3ECE1` | Physical paper tone for light dossiers |
| `--text-primary` | `#F5EFE6` | High-readability warm ivory for headlines and primary copy |
| `--text-secondary` | `#B4B9C7` | Titanium gray for subheadings, captions, and descriptions |
| `--text-muted` | `#656C7D` | Muted slate for peripheral metadata, timestamps, and rules |
| `--text-gold` | `#DDA236` | Masthead highlights and epigraph text |
| **`--accent-amber`** | **`#D49A32`** | **Signature Accent 1**: Teletype cursor, evidence stamps, primary CTAs, active tools |
| **`--accent-gold`** | **`#E5A93C`** | **Signature Accent 1 Highlight**: Hover states, active links, verified chain nodes |
| `--accent-amber-subtle` | `rgba(212, 154, 50, 0.10)` | Tinted background for wire tags, badges, and active tabs |
| `--accent-amber-border` | `rgba(212, 154, 50, 0.35)` | Highlighting borders for selected items |
| **`--accent-crimson`** | **`#E63956`** | **Secondary Accent 2 (STRICTLY Danger/Drift)**: Tampered evidence, drift score > 70%, reset prompts |
| `--accent-crimson-subtle`| `rgba(230, 57, 86, 0.10)` | Background tint for fabricated claims and drift warnings |
| `--stamp-verified` | `var(--accent-gold)` | Authenticated chain-of-custody stamp |
| `--stamp-amber` | `var(--accent-amber)` | Disputed / pending evidence stamp |
| `--stamp-red` | `var(--accent-crimson)`| Fabricated / high-drift tamper stamp |

---

## 4. Typography Scale & Hierarchy

We pair two high-character typefaces with clear contrast:
- **Serif Masthead**: `Zilla Slab` (Google Fonts) — Authoritative, journalistic, commanding display.
- **Teletype Monospace**: `JetBrains Mono` (Google Fonts) — Precision forensic ledger, timestamps, metadata, and buttons.
- **Clean Sans**: System UI (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`) — High-legibility narrative body.

```css
--font-masthead: 'Zilla Slab', Georgia, serif;
--font-mono: 'JetBrains Mono', 'Courier New', monospace;
--font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
```

### Typographic Ranks:
1. **Masthead Banner (`h1.wire-landing__title`)**: `clamp(40px, 6vw, 68px)`, 900 weight, letter-spacing `-0.02em`, line-height `1.05`.
2. **Page Headline (`h1`)**: `clamp(28px, 4vw, 42px)`, 800 weight, letter-spacing `-0.015em`, line-height `1.15`.
3. **Dossier Headline (`h2`)**: `clamp(20px, 2.5vw, 28px)`, 700 weight, letter-spacing `-0.01em`.
4. **Section / Panel Header (`h3`)**: `16px - 18px`, 700 weight, uppercase monospace or serif.
5. **Body Text**: `14px`, 400 weight, line-height `1.6`, color `--text-secondary`.
6. **Teletype Metadata / Stamps**: `10px - 12px`, 600/700 weight, uppercase tracking `+0.12em` to `+0.20em`.

---

## 5. Spacing System (8px Strict Spatial Grid)

All margins, paddings, gaps, and heights follow a strict 8px spatial grid:

| Variable | Value | Typical Usage |
| :--- | :--- | :--- |
| `--space-1` | `8px` | Micro-gap between icons and labels, badge padding |
| `--space-2` | `16px` | Standard button padding, card interior gaps |
| `--space-3` | `24px` | Section padding, container gutters |
| `--space-4` | `32px` | Spacing between major component groups |
| `--space-5` | `40px` | Header separation, card group gaps |
| `--space-6` | `48px` | Major section vertical rhythm |
| `--space-8` | `64px` | Page boundary padding |
| `--space-10` | `80px` | Hero section vertical padding |

Max Content Container: `1320px` centered with fluid horizontal padding (`padding: 0 var(--space-3)`).

---

## 6. Tactile Artifacts & Physical Textures

To eliminate the "flat digital dashboard" feeling, six physical artifacts are woven across every screen:

1. **Oxford Broadsheet Double Rules**:
   - Double-rule border styling: a `2px solid` amber or light border accompanied by a parallel `1px solid` hairline rule, separating headlines from datelines.
2. **Manila / Slate Dossier Folders**:
   - Physical folder tabs with 45-degree angled corner notches (`clip-path: polygon(...)`), docket index numbers (`CASE FILE // 01`), and paperclip accents.
   - Archive photograph thumbnails desaturated (`grayscale(45%)`) with archival contrast, restoring to full saturation on hover.
3. **Forensic Photo Mounting Brackets**:
   - Corner reticles (`⌜ ⌝ ⌞ ⌟`) surrounding evidence photographs, simulating archival photo mounts.
4. **Physical Ink Rubber Stamps (`stampIn`)**:
   - Distressed, angled rubber stamps (`transform: rotate(-3deg)`) slamming down with mechanical spring deceleration (`cubic-bezier(0.175, 0.885, 0.32, 1.275)`), double-borders, and box shadows.
5. **Dynamic Optical Degradation & Artifacting**:
   - In the Custody Scrubber, chromatic aberration (`drop-shadow(2px 0 red) drop-shadow(-2px 0 blue)`) and CRT scanline density scale live with the scrubber position, accompanied by an `OPTICAL ARTIFACTING` telemetry HUD.
6. **Cathode Scanline & Halftone Texture**:
   - Subtle grain overlay (`GrainOverlay.jsx`) running at 0.035 opacity with CRT scanlines to evoke 1990s darkroom terminals.

---

## 7. Key Interactive Workbenches & Features

### 7.1 React Image Editor Workbench (`EditorScreen`)
- **Center Examination Table**: Radial spotlight effect behind the canvas simulating a darkroom lamp (`radial-gradient(circle at 50% 45%, rgba(212, 154, 50, 0.08) 0%, transparent 70%)`).
- **Telemetry Ruler Ticks**: Stepped tick marks along the right-hand panel measuring editorial signal values.
- **Dynamic Tool Used Checklist**: Live audit marks punching in with `@keyframes stampIn` (`✓ CROP`, `✓ FILTER`, etc.) when tools are activated.
- **Live Metric Count-Up**: Smooth `requestAnimationFrame` counters for Visibility, Focus, Manipulation, and Base Drift.

### 7.2 Drift Status Screen (`DriftStatusScreen`)
- **Tense 0% → Final Score Count-Up**: 1.2s decelerating countup with live color transition:
  - 0–40%: Amber (`#D49A32`)
  - 41–70%: Gold (`#E5A93C`)
  - 71–100%: Danger Crimson (`#E63956`) with pulsating glow.
- **Stamped Rating Badge**: Slams into position on count-up completion (`TOTAL FABRICATION`, `SUBSTANTIAL REWRITE`, etc.).
- **Teletype Ledger**: Dotted leader lines (`. . . . . . . .`) connecting evidentiary decay factors to percentage impacts.

### 7.3 Interactive Wipe Reveal Slider (`RevealScreen`)
- Hardware-accelerated split-view comparison using CSS `clip-path: polygon()`.
- Interactive draggable splitter with handle `[ ◀ || ▶ ]` and keyboard arrow support.
- Mode toggle between **`[ ⇄ INTERACTIVE WIPE REVEAL ]`** and **`[ ☷ SIDE-BY-SIDE ]`**.

### 7.4 Certified Dossier Canvas Generator
- Client-side 1400x940 high-resolution HTML5 canvas rendering engine.
- Generates printable evidence sheet with Oxford double rules, corner registration crosshairs (`+`), classified classification headers, and distressed rubber stamp seals.

---

## 8. Accessibility & Performance Standards

- **Contrast Ratios**: All primary text maintains a minimum contrast ratio of `7:1` against `--bg-base` and `--bg-surface`, exceeding WCAG AAA standards.
- **Keyboard Navigation**: All interactive elements (folders, scrubbers, buttons, links, wipe slider) have a high-visibility `2px solid var(--accent-amber)` focus outline with `2px` offset.
- **Motion Reduction**: Respects `@media (prefers-reduced-motion: reduce)` by disabling transitions and animations for users with vestibular sensitivities.
- **Responsive Adaptability**: Layouts seamlessly re-stack into intuitive single-column flows on mobile and tablet viewports (`<= 860px`).

---
*The Leonida Wire Design System Contract — Maintained for Competition Quality & High-Taste Craft.*
