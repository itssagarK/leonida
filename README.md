# THE LEONIDA WIRE
### Unofficial Evidentiary Despatch & Narrative Drift Chronicle
> Built for the **Unlayer "Build with React Image Editor" Challenge**

[![Built with React 18](https://img.shields.io/badge/React-18.3.1-61dafb.svg?style=flat-square)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.4.3-646cff.svg?style=flat-square)](https://vitejs.dev/)
[![Unlayer React Image Editor](https://img.shields.io/badge/@unlayer/react--image--editor-1.0.2-FF4D6D.svg?style=flat-square)](https://github.com/unlayer/react-image-editor)
[![Deployed on Vercel](https://img.shields.io/badge/Deploy-Vercel%20Static-000000.svg?style=flat-square)](https://vercel.com/)

---

## 1. What is The Leonida Wire?

**The Leonida Wire** is an original interactive press-wire web experience set in the fictional state of Leonida (inspired by the sun-drenched, satirical atmosphere of the Florida/Miami wire services, free of any copyrighted assets, characters, or trademarks).

Every case begins with an authentic, unadulterated baseline negative recorded by municipal authorities. But as the photograph circulates through shady marina attendants, sensationalist late-night tabloids, and paranoid online conspiracists, each successive witness applies their own filters, crops, annotations, and wild captions. By the time the photograph reaches the player, the story has mutated far beyond reality.

The player examines this unbroken **chain of custody** using an interactive diff scrub slider, inspects the forensic evidence ledger, and is tasked with forging the newest link in the chain using the full-featured **`@unlayer/react-image-editor`**. Once the player files their visual edit and drafts their headline claim, they trigger **"Expose the Wire"**—a dramatic reveal unrolling the entire distortion timeline, computing a public-record drift score, and generating a shareable evidence poster.

---

## 2. Why `@unlayer/react-image-editor` is Core (Not Decorative)

In many web applications, image editors are relegated to decorative avatars or auxiliary upload settings. In **The Leonida Wire**, `@unlayer/react-image-editor` is the central game engine upon which the entire experience pivots:

* **Unplayable Without It:** The narrative cannot progress without the editor. A player cannot expose a wire case or uncover the truth drift without opening `@unlayer/react-image-editor`, making a tactile visual manipulation (crop, filter, text, brush, shape, stickers, or frame), and capturing that edit to the evidentiary buffer via the editor's native `onSave` hook.
* **Full Tool Suite Enabled:** All 8 core creative tools (*Crop, Resize, Filter, Draw, Text, Shapes, Stickers, Frame*) are fully unlocked with a custom `options.theme: 'dark'` integration matching the wire-room charcoal aesthetic.
* **Direct Narrative Impact:** The player directly inherits the distorted photograph from the prior witness, applies their own creative forgery, and files their headline. Their edit immediately updates the live chain-of-custody, expands the scrub slider with a player-specific state, alters the deterministic drift metrics, and is rendered on the final forensic comparison canvas.

Without `@unlayer/react-image-editor`, no report can be filed, no new link can be forged, and the case remains permanently locked.

---

## 3. Experience Architecture & Features

1. **Wire Masthead (Landing):** High-contrast vintage teletype newsroom aesthetic crossed with hot Leonida sunset neon gradients (`#FF2E63` → `#FF4D6D` → `#FFB84D`), infinite scrolling wire ticker, and active dossier briefings.
2. **Dossier Archive (`/cases`):** Evidentiary browser with multiple original cases:
   - **Case 01-A:** *THE OCEAN DRIVE "SUPERCAR SUBMERSIBLE"* (Harbor slipway sedan tow vs. billionaire amphibious spy submarine).
   - **Case 02-B:** *MIDNIGHT AT THE AMBROSIA SWAMP ROADS* (Utility night floodlights vs. bioluminescent apex cryptid UFO touchdown).
3. **Case Intro (`/case/:id`):** Visual chain progression gauge showing the flow from Raw Negative → Witness 1 → Witness 2 → Witness 3 → Player Link.
4. **Custody Log & Scrubber (`/case/:id/custody`):** Custom high-contrast diff scrubber slider smoothly transitioning between the raw baseline, witness mutations, and the player's edit in real time, accompanied by a police/press evidence ledger with interactive redaction bars.
5. **Wire Terminal Editor (`/case/:id/edit`):** Full `@unlayer/react-image-editor` integration with responsive mobile scaling, buffer validation, teletype headline filing, and live buffer preview.
6. **Drift Status & Verdict (`/case/:id/status`):** Large stamped public-record verdict badge, drift index percentage, and lexical forensics.
7. **Expose the Wire (`/case/:id/reveal`):** Unrolls the chronological chain step-by-step, presents a side-by-side comparison (*The Raw Truth vs. What the Public Believed*), and features an HTML5 Canvas poster composite generator that exports high-res shareable PNG dossiers directly in the browser.

---

## 4. The Truth-Drift Engine (Deterministic Heuristic)

The drift score ($0\%$ to $100\%$) and public-record status bands are computed by a deterministic algorithmic heuristic in [`src/lib/driftEngine.js`](./src/lib/driftEngine.js):

> **Note on Implementation:** This is a deliberate, predictable semantic-decay simulation designed for game narrative balance—it does **not** rely on third-party black-box machine learning APIs or server-side vision processing.

### Mathematical Breakdown:
$$\text{Score} = \text{ChainLengthFactor} + \text{SemanticDecay} + \text{InterWitnessVolatility} + \text{SensationalBonus}$$

1. **Chain Length Drag (35% max):** Each intermediary link in the custody chain adds friction and distortion ($L \times 8.5\text{ pts}$, capped at 35).
2. **Semantic Decay (40% max):** Evaluates Jaccard keyword overlap between the current headline and the raw negative caption after filtering common English stopwords. Lower overlap yields higher decay.
3. **Inter-Witness Volatility (15% max):** Computes step-by-step lexical divergence between consecutive witness captions.
4. **Sensational Clout Amplifier (10% max):** Scans for sensational Leonida buzzwords (*extraterrestrial, submersible, espionage, prototype, cartel, radioactive, conspiracy, etc.*).

### Public-Record Status Bands:
* **`0% – 24%`:** `VERIFIED` (Green double stamp — Truth tethered to negative)
* **`25% – 49%`:** `DISPUTED` (Amber stamp — Contested accounts)
* **`50% – 74%`:** `URBAN LEGEND` (Coral stamp — Viral folklore)
* **`75% – 100%`:** `TOTAL FABRICATION` (Red distressed double stamp — Complete evidentiary detachment)

---

## 5. Local Setup & Build

### Prerequisites
* [Node.js](https://nodejs.org/) v18+ (tested on v24.14.1)
* npm v9+

### Quick Start
```bash
# 1. Clone the repository
git clone https://github.com/your-username/the-leonida-wire.git
cd the-leonida-wire

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
# -> Opens at http://localhost:5173
```

### Production Build & Verification
```bash
# Build production bundle with Vite
npm run build

# Preview production build locally
npm run preview
```

---

## 6. Deployment (Vercel Ready)

The application is structured as a static Single Page Application (SPA). To deploy to Vercel:
1. Push to a public GitHub repository.
2. Import the project in Vercel.
3. Framework Preset: **Vite**.
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Single Page App rewrite: Included in [`vercel.json`](./vercel.json).

---

## 7. Legal Disclaimer

*The Leonida Wire* is an original fictional work inspired by satirical depictions of sunshine-state crime reporting and tropical neon aesthetics. It is **not affiliated with, associated with, authorized by, endorsed by, or in any way officially connected with Rockstar Games, Take-Two Interactive, or any of their subsidiaries or affiliates.** All names, marks, emblems, dossiers, and images are original fictional creations or royalty-free photographic assets.
