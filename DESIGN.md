# DESIGN.md — The Leonida Wire Design System Contract

> **“Every image tells a story. Every edit changes what survives.”**
> 
> *The Leonida Wire* is a classified investigative newsroom and forensic evidence terminal in a neon coastal city. This document establishes the strict aesthetic, spatial, typographic, and component contract for the entire interface, grounded in the principles of high-taste digital craft and tactile analog authenticity.

---

## 1. Design Vision & Philosophy

### 1.1 The Metaphor
The interface does **not** mimic a generic SaaS dashboard, modern tech startup, or flat card grid. It operates as a late-night, clandestine wire room terminal combining:
1. **The Investigative Press Masthead**: High-dignity serif display headlines, engraved Oxford double-rules, datelines, and editorial memoranda.
2. **The Forensic Chain-of-Custody Terminal**: Monospace teletype, classified rubber stamps, evidence docket numbers, photo mounting corners, and lexical decay tracking.
3. **The Photo-Editing Workbench**: The `@unlayer/react-image-editor` integrated directly as a physical darkroom/workbench where visual evidence is manipulated to warp public perception.

### 1.2 Core Anti-Patterns (What We Ban)
- ❌ **No generic SaaS gradients**: No purple/blue/violet blurry mesh or neon glow washes.
- ❌ **No cookie-cutter 3-card templates**: No floating rounded cards with centered icons and generic marketing copy.
- ❌ **No playful or cartoonish gamification**: Every interaction must feel heavy, consequence-driven, and authentic to classified evidentiary archives.
- ❌ **No ungrounded floating elements**: Every section has clear border discipline, tactile rules, and spatial grounding.

---

## 2. Color System & Semantic Tokens

Our palette is strictly disciplined: dark near-black archival slate, warm ivory editorial text, muted amber for primary actions and evidence, controlled crimson for distortion, and subtle cyan for forensic telemetry.

| Token | Hex / Value | Semantic Role |
| :--- | :--- | :--- |
| `--bg-base` | `#08090C` | Deepest root canvas; cathode darkroom tone |
| `--bg-surface` | `#0E1017` | Card, container, and docket folder backgrounds |
| `--bg-elevated` | `#151822` | Active panels, modal surfaces, toolbar backings |
| `--bg-card` | `#11141C` | Dossier cards and custody ledger entries |
| `--bg-card-hover` | `#181B26` | Hover state for interactive dossier elements |
| `--bg-paper` | `#F4EFE6` | Newsprint / physical paper tone for light dossiers |
| `--text-primary` | `#F5EFE6` | High-readability warm ivory for headlines and primary copy |
| `--text-secondary` | `#B4B9C7` | Soft titanium gray for subheadings, captions, and descriptions |
| `--text-muted` | `#636B7B` | Muted slate for peripheral metadata, timestamps, and rules |
| `--text-gold` | `#DDA236` | Masthead highlights and epigraph text |
| `--accent-amber` | `#D49A32` | Core brand amber; primary buttons, evidence links, focus rings |
| `--accent-gold` | `#E8A838` | Highlight amber; hover states and active indicators |
| `--accent-amber-subtle` | `rgba(212, 154, 50, 0.12)` | Tinted background for wire tags and active tabs |
| `--accent-amber-border` | `rgba(212, 154, 50, 0.40)` | Highlighting borders for selected items |
| `--accent-crimson` | `#E63956` | Warning crimson; witness distortion, manipulation, critical alerts |
| `--accent-crimson-subtle`| `rgba(230, 57, 86, 0.12)` | Background tint for fabricated claims and drift warnings |
| `--accent-cyan` | `#38B2AC` | Subtle technical cyan; sensor tags, frequency readouts, verified logs |
| `--accent-cyan-subtle` | `rgba(56, 178, 172, 0.12)` | Background tint for raw archival negative badges |
| `--stamp-green` | `#10B981` | Uncorrupted baseline verification |
| `--stamp-amber` | `#D49A32` | Disputed / pending evidence stamp |
| `--stamp-red` | `#E63956` | Fabricated / total distortion stamp |

---

## 3. Typography Scale & Hierarchy

We pair two high-character typefaces:
- **Serif Masthead**: `Zilla Slab` (Google Fonts) — Authoritative, journalistic, commanding display.
- **Teletype Monospace**: `JetBrains Mono` (Google Fonts) — Precision forensic ledger, timestamps, metadata, and buttons.

```css
/* Masthead Headline Display */
--font-masthead: 'Zilla Slab', Georgia, serif;

/* Teletype & Ledger Monospace */
--font-mono: 'JetBrains Mono', 'Courier New', monospace;
```

### Typographic Ranks:
1. **Masthead Banner (`h1.wire-landing__title`)**: `clamp(40px, 6vw, 68px)`, 900 weight, letter-spacing `-0.02em`, line-height `1.05`.
2. **Page Headline (`h1`)**: `clamp(28px, 4vw, 42px)`, 800 weight, letter-spacing `-0.015em`, line-height `1.15`.
3. **Dossier Headline (`h2`)**: `clamp(20px, 2.5vw, 28px)`, 700 weight, letter-spacing `-0.01em`.
4. **Section / Panel Header (`h3`)**: `16px - 18px`, 700 weight, uppercase monospace or serif.
5. **Body Text**: `14px`, 400 weight, line-height `1.6`, color `--text-secondary`.
6. **Teletype Metadata / Stamps**: `10px - 12px`, 600/700 weight, uppercase tracking `+0.12em` to `+0.20em`.

---

## 4. Spacing System (8px Strict Rhythm)

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

Max Content Container: `1320px` centered with fluid horizontal padding.

---

## 5. Tactile Artifacts & Textures

To remove the "flat web app" feel, five physical artifacts are woven through the interface:

1. **Oxford Newspaper Rules**:
   - Double-rule border styling: a `2px solid` amber or light border accompanied by a parallel `1px solid` hairline rule, separating headlines from bylines.
2. **Manila / Slate Dossier Tabs**:
   - Physical folder tabs with 45-degree angled corner notches (`clip-path: polygon(...)`), docket index numbers (`DOSSIER #01-A`), and paper-clip accents.
3. **Forensic Photo Mounting Brackets**:
   - Corner reticles (`⌜ ⌝ ⌞ ⌟`) surrounding evidence photographs, simulating archival photo mounts.
4. **Authentic Classified Stamps**:
   - Distressed, angled rubber stamps (`transform: rotate(-3deg)`) with stamped ink borders (`border: 2px dashed` / `double`) in crimson (`TOTAL FABRICATION`) and amber (`UNRESOLVED`).
5. **Cathode Scanline & Halftone Texture**:
   - Non-intrusive CSS grain overlay (`GrainOverlay.jsx`) running at 0.035 opacity with CRT scanlines to evoke 1990s darkroom terminals.

---

## 6. Component Contracts & State Machines

### 6.1 Buttons (`Button.jsx`)
- **Primary (`variant="primary"`)**: High-contrast amber background (`#D49A32`), rich dark text (`#0D0E12`), crisp 1px borders, subtle hover lift (`translateY(-1px)`), and a physical pressed depression (`translateY(1px)`).
- **Secondary / Wire (`variant="secondary"`)**: Dark charcoal surface (`#151822`), amber border (`rgba(212, 154, 50, 0.4)`), warm ivory text, amber glow on hover.
- **Danger (`variant="danger"`)**: Controlled crimson (`#E63956`) for destructive resets or evidence purging.
- **Ghost (`variant="ghost"`)**: Subtle borderless monospace link button with hover underline and arrow translation.

### 6.2 Dossier Folders (`CaseListScreen`)
- Folders must display:
  - Physical tab with docket number and case classification category.
  - 35mm archival contact print photo mount with corner reticles.
  - Live custody chain link count badge (`3 EVIDENCE LINKS`).
  - Volatility rating (`MODERATE` vs `HIGH DRIFT`).
  - Direct CTA button (`INSPECT DOSSIER ➔`).

### 6.3 Custody Scrubber (`CustodyLogScreen`)
- An interactive analog timeline scrubber:
  - Step ticks for every custody stage (`RAW BASELINE`, `W1`, `W2`, `W3`, `YOUR LINK`).
  - Active scrubbing needle with teletype position readout (`LINK [3 / 3]`).
  - Direct bi-directional synchronization between the slider, the photo display, and the audit ledger rows below.

### 6.4 React Image Editor Workbench (`EditorScreen`)
- A 3-zone command workbench:
  - **Left Wing (`Case Context`)**: Docket metadata, witness briefing, baseline hashtags, and archival negative status.
  - **Center Stage (`React Image Editor`)**: 620px high canvas container with custom forensic chrome, camera lens reticles, and tool status indicator.
  - **Right Wing (`Edit Impact Telemetry`)**: Real-time tool usage checklist (`Crop`, `Filter`, `Draw`, `Text`, etc.), live impact score meters (`Visibility`, `Focus`, `Manipulation`, `Base Drift`), and evidence state machine progression (`RAW` ➔ `EDIT SAVED` ➔ `FILED`).
  - **Bottom Dock (`File Wire Despatch`)**: Gated filing form requiring an active saved edit before transmission.

### 6.5 Drift Status & Forensic Reveal (`DriftStatusScreen` & `RevealScreen`)
- Split-screen comparison displaying the uncorrupted archival baseline against the player's manipulated public wire claim.
- Interactive drift meter displaying cumulative narrative deviation percentage.
- Lexical forensic tag clouds highlighting surviving baseline terminology vs. fabricated sensational buzzwords.
- Certified Dossier export generation using the client-side canvas engine.

---

## 7. Accessibility & Performance Standards

- **Contrast Ratios**: All primary text maintains a minimum contrast ratio of `7:1` against `--bg-base` and `--bg-surface`, exceeding WCAG AAA standards.
- **Keyboard Navigation**: All interactive elements (folders, scrubbers, buttons, links) have a high-visibility `2px solid var(--accent-amber)` focus outline with `2px` offset.
- **Motion Reduction**: Respects `@media (prefers-reduced-motion: reduce)` by disabling transitions and animations for users with vestibular sensitivities.
- **Responsive Adaptability**: Layouts seamlessly re-stack from 3-column workbenches into intuitive single-column flows on tablet and mobile viewports (`<= 900px`).

---
*The Leonida Wire Design System Contract — Maintained for Competition Quality & High-Taste Craft.*
