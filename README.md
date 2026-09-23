# THE LEONIDA WIRE

> “Every image tells a story. Every edit changes what survives.”

**The Leonida Wire** is an interactive, browser-based investigative press and evidentiary experience built for the **Build with React Image Editor Challenge**. Set in a fictional coastal metropolitan wire service, the application places players in the role of an investigative press agent examining how photographic evidence degrades and mutates as it travels from witness to witness. Starting from an unaltered archival negative, players must inspect the unbroken custody log, use the embedded **React Image Editor** to forge their own visual link in the chain, formulate a headline claim, and expose the resulting editorial drift between baseline reality and public narrative.

[![React](https://img.shields.io/badge/React-18.3.1-61dafb.svg?style=flat-square)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.4.3-646cff.svg?style=flat-square)](https://vitejs.dev/)
[![React Image Editor](https://img.shields.io/badge/@unlayer%2Freact--image--editor-1.0.2-D49A32.svg?style=flat-square)](https://github.com/unlayer/react-image-editor)
[![React Router](https://img.shields.io/badge/React_Router-6.28.0-CA4245.svg?style=flat-square)](https://reactrouter.com/)

---

## Live Demo

🔗 **[Live Demo (Vercel)](https://the-leonida-wire.vercel.app)** *(TODO: Replace with final deployed URL if different)*

---

## Screenshots

<!-- TODO: Add actual screenshot images to the /screenshots folder once captured -->

* **Landing Masthead**: `![Landing](./screenshots/landing.png)` *(TODO: Add screenshot)*
* **Evidence Dossier Archive**: `![Case Selection](./screenshots/case-selection.png)` *(TODO: Add screenshot)*
* **React Image Editor Workbench (3-Zone Layout)**: `![React Image Editor](./screenshots/editor.png)` *(TODO: Add screenshot)*
* **Truth Drift Analysis**: `![Editorial Drift](./screenshots/drift.png)` *(TODO: Add screenshot)*
* **Wire Reveal & Split Comparison**: `![Wire Reveal](./screenshots/reveal.png)` *(TODO: Add screenshot)*

---

## What Is The Leonida Wire?

The Leonida Wire is a fictional investigative newsroom and classified evidence terminal. In the fictional state of Leonida, every sensationalized news event begins with a single, unglamorous baseline photograph. By the time that image filters through opportunistic eyewitnesses, anonymous forum theorists, and midnight tabloids, the original factual record has been cropped, filtered, annotated, and twisted into an urban legend.

Players do not merely spectate the story. To advance the investigation, players are presented with an active chain of custody and must interact directly with the photographic record. Using the embedded React Image Editor, players actively manipulate the evidence—applying crops, filters, annotations, and overlays—before recording their own headline claim into the wire registry.

The application evaluates the cumulative semantic and visual degradation across the entire chain of witnesses, computing an official **Editorial Drift Index** (0% to 100%) and categorizing the public narrative into one of four certified ratings: *Verified*, *Disputed*, *Urban Legend*, or *Total Fabrication*.

*(Note: The Leonida Wire is an original fictional work inspired by satirical late-night press despatches and coastal crime reporting. It is not affiliated with, endorsed by, or connected to any real police department, government agency, journalism organization, or video game franchise.)*

---

## User Flow

```text
CASE FILE
   ↓
RAW EVIDENCE
   ↓
CUSTODY LOG
   ↓
REACT IMAGE EDITOR
   ↓
SAVE EDIT
   ↓
FILE EVIDENCE
   ↓
EDITORIAL DRIFT
   ↓
WIRE REVEAL
   ↓
DOSSIER
```

---

## How It Works

### 1. Receive Evidence
Players begin at the **Evidentiary Archive** (`/cases`), selecting an active dossier file such as *Case 01-A: The Ocean Drive "Supercar Submersible"* or *Case 02-B: Midnight at the Ambrosia Swamp Roads*. Opening a case presents the initial classified briefing, baseline location, logging timestamp, and the unaltered municipal negative.

### 2. Investigate the Custody Log
In the **Custody Log** (`/case/:id/custody`), players examine the chronological chain of custody. An interactive multi-state slider allows players to scrub between the original negative and each successive witness edit. A synchronized evidence register details each witness's alias, their headline claim, the specific manipulations applied, and an audit drift note.

### 3. Edit the Evidence
In the **Visual Evidence Workbench** (`/case/:id/edit`), players take custody of the chain-head photograph using a full-suite three-zone layout:
* **Left Column (Case Context):** Displays case metadata, scene location, baseline incident tags, and current buffer status.
* **Center Column (Image Canvas):** Hosts the embedded `@unlayer/react-image-editor` with a dark theme and unconstrained viewport. Players have access to all 8 core creative tools: **Crop, Resize, Filter, Draw, Text, Shapes, Stickers, and Frame**.
* **Right Column (Edit Impact):** A live diagnostics panel displaying real-time tool tracking, deterministic editorial signal metrics (Visibility, Focus, Manipulation, Base Drift), single-active evidence progression, and a buffer reset action.

### 4. Save the Edit
Clicking the native **"Save"** button inside the React Image Editor triggers the `onSave` callback, capturing the high-resolution edited image as a base64 `dataUrl` into the player's evidence buffer. The workbench confirms buffer capture with a prominent verification banner: `✓ EDIT SAVED: Evidence buffer captured successfully.`

### 5. File the Evidence
With the evidence buffer locked, players complete the **Press Transmission Filing** step below the canvas. Players enter their reporter byline/alias and type a headline claim explaining what their edited photograph shows. Pre-flight checks validate that both a saved image and a non-empty headline exist before enabling the `[ FILE YOUR EDIT • EXPOSE WIRE DRIFT ]` button.

### 6. Editorial Drift
Submitting the filed report navigates to the **Truth Drift Analysis** (`/case/:id/status`). The system deterministically computes cumulative factual decay, displaying a large central drift percentage hero (`XX% EDITORIAL DRIFT`) and an official public record rating stamp:
* **VERIFIED (0% – 24%):** Factual corroboration intact with baseline negative.
* **DISPUTED (25% – 49%):** Substantial divergence; key facts contested.
* **URBAN LEGEND (50% – 74%):** Viral folklore and sensationalism eclipse reality.
* **TOTAL FABRICATION (75% – 100%):** Complete evidentiary detachment from the original negative.

### 7. Expose the Wire
Clicking `[ EXPOSE THE WIRE ]` opens the **Wire Reveal** (`/case/:id/reveal`), the visual climax of the investigation. Players view a large split-screen comparison: **THE RAW TRUTH** vs **WHAT THE PUBLIC SAW** centered around a circular drift index meter, alongside compact **WHAT CHANGED?** mutation tags (`CROP`, `FILTER`, `TEXT`, `DRAW`, `FRAME`, `SATURATION`, `RE-FRAMING`) and a side-by-side comparison of the public narrative against the original municipal record.

### 8. Download the Dossier
Players click `[ DOWNLOAD YOUR WIRE DOSSIER ]` to generate a high-resolution, certified 1200×800 evidentiary dossier. The dossier composites both photographs, metadata, captions, bylines, and the stamped verdict onto an HTML5 Canvas and triggers an immediate `.png` file download directly in the browser.

---

## React Image Editor Integration

> **“React Image Editor is the primary interaction mechanism of The Leonida Wire. Players cannot simply read the investigation and reach the final result. They must manipulate and save photographic evidence through the editor before the evidence can be filed and processed through the editorial-drift workflow.”**

In many web applications, an image editor is a decorative utility or an auxiliary profile upload tool. In **The Leonida Wire**, `@unlayer/react-image-editor` is the central game engine upon which the entire narrative and application state pivot.

### Technical Implementation Details

* **Package & Version:** `@unlayer/react-image-editor` (`v1.0.2`), imported directly as a controlled React component.
* **Integration Location:** [`src/screens/EditorScreen.jsx`](./src/screens/EditorScreen.jsx).
* **Creative Tool Suite:** All 8 tools are fully operational:
  * `Crop`: Re-framing the field of view to omit exculpatory context.
  * `Resize`: Modifying photographic dimensions and resolution.
  * `Filter`: Applying chromatic shifts, contrast boosts, and surveillance tints.
  * `Draw`: Adding freehand brush annotations and highlight marks.
  * `Text`: Overlaying breaking-news captions and sensational watermarks.
  * `Shapes`: Inserting forensic arrows, callout rectangles, and focal circles.
  * `Stickers`: Applying badges, icons, and contextual stamps.
  * `Frame`: Surrounding the negative with editorial borders.
* **Editor Configuration:**
  ```jsx
  <ImageEditor
    ref={editorRef}
    image={editorImageUrl}
    options={{ theme: 'dark' }}
    minHeight={editorMinHeight}
    onSave={handleEditorSave}
    onCancel={handleEditorCancel}
    onLoadError={handleEditorLoadError}
  />
  ```
* **How Edits Are Saved:** When the user clicks "Save" within the editor's toolbar, the component's `onSave` hook fires with `{ dataUrl }`. The application captures this output into React state (`savedDataUrl`), sets `hasSavedImage = true`, renders an instant visual confirmation banner, and unlocks the filing step.
* **How the Saved Image Becomes Part of the Investigation:** When filed, the player's edit buffer is combined with their byline and headline claim into an evidentiary link object (`playerLink`) and persisted to browser storage via `saveCaseProgress()` in [`src/utils/storage.js`](./src/utils/storage.js). The helper `getEffectiveChain()` dynamically appends this link as the terminal stage of the custody timeline, immediately reflecting the player's visual edit across the Custody Scrubber, Drift Status, and Reveal screens.
* **How the Application Tracks Editor Interaction:** An interaction listener attached to the editor host container (`editorHostRef`) detects user selections across tool categories (`Crop`, `Filter`, `Draw`, `Text`, `Shapes`, `Stickers`, `Frame`, `Resize`). The `TOOLS USED` panel dynamically updates to show active tools (`✓ CROP`, `✓ FILTER`) while leaving unused tools in a clean muted state (`○ DRAW`, `○ TEXT`).
* **Deterministic Editorial Signal Calculation:** User editor actions directly and deterministically update live editorial metrics:
  * **Visibility:** Reflects focal prominence based on tool usage (`60% – 95%`).
  * **Focus:** Measures narrative framing precision (`40% – 95%`).
  * **Manipulation:** Quantifies artificial alteration severity (`20% – 98%`).
  * **Base Drift:** Integrates tool count into the case's baseline drift index.
* **Strict Progression Gating:**
  * Before saving an edit: `FILE YOUR EDIT` is strictly disabled with the message: *“Save an edited image before filing.”* Players cannot bypass the editor to reach the drift or reveal screens.
  * After saving an edit: `✓ EDIT SAVED / Evidence buffer captured.` is displayed, and filing is unlocked once a headline claim is typed.
  * Resetting the buffer (`[ RESET BUFFER ]`): Clears the saved image, resets tool tracking, wipes the draft headline, and returns the evidence state strictly to `RAW RECORD`.

---

## Key Features

* **Original Evidentiary Cases:** Includes fully authored investigative cases with municipal negatives, metadata, and multi-link witness chains (*The Ocean Drive "Supercar Submersible"* and *Midnight at the Ambrosia Swamp Roads*).
* **Case Selection Archive:** Classified evidence folder layout with physical tabs, unsealed status stamps, forensic photo thumbnails, difficulty ratings, and time estimates.
* **Interactive Custody Timeline & Scrubber:** Range slider scrubbing through every state in the custody chain with real-time synchronized viewport rendering.
* **Forensic Evidence Ledger:** Monospace witness register detailing entry timestamps, sources, quotes, and audit drift notes.
* **Embedded React Image Editor:** Full integration of `@unlayer/react-image-editor` featuring a dark theme, 8 creative tools, and responsive scaling.
* **Live Tool Usage Tracking:** Real-time checklist identifying which editor tools have been actively engaged (`✓ CROP` vs. `○ DRAW`).
* **Save/Edit Buffer Management:** Immediate buffer capture, clear visual save feedback, and clean buffer reset capability.
* **Strict Evidence Gating:** Prevents progression or submission until photographic evidence has been edited and saved.
* **Press Filing Workflow:** Teletype byline and story headline entry with live character counter and pre-flight validation.
* **Deterministic Editorial Drift Engine:** Mathematical heuristic computing factual decay (0–100%) and 4 public-record status bands based on chain length friction, semantic decay, inter-witness volatility, and sensational buzzwords.
* **Large Split-Screen Comparison:** Side-by-side photographic comparison of *The Raw Truth* vs. *What the Public Saw* with a center drift meter.
* **Compact Mutation Tags:** Highlights specific visual alterations (`CROP`, `FILTER`, `TEXT`, `DRAW`, `FRAME`, `SATURATION`, `RE-FRAMING`).
* **Public Narrative vs. The Record:** Direct side-by-side comparison of the player's headline claim against the baseline municipal caption.
* **HTML5 Canvas Dossier PNG Exporter:** Native in-browser canvas compositor producing high-resolution, shareable 1200×800 evidence posters with zero external image-processing dependencies.
* **Client-Side Persistence:** LocalStorage persistence for player submissions and case progress, with clean per-case reset controls.
* **Persistent Navigation:** Global newsroom navbar featuring brand wordmark, section navigation, live status indicator (`● SYSTEM ONLINE`), and active case indicator.
* **Deep-Link Routing & Fault Tolerance:** Full React Router v6 route coverage with alias resolution (`case-01`, `1`, `case-1`) and graceful fallback handling.
* **Responsive Architecture:** Tailored layouts across mobile (375px), tablet (768px), and desktop (1024px+ / 1320px container).

---

## Tech Stack & Architecture

* **Frontend Framework:** React 18 (`react` v18.3.1, `react-dom` v18.3.1)
* **Build Tool:** Vite 6 (`vite` v6.4.3, `@vitejs/plugin-react` v4.3.4)
* **Image Editor Engine:** `@unlayer/react-image-editor` (`v1.0.2`)
* **Routing:** React Router v6 (`react-router-dom` v6.28.0)
* **Styling:** Custom CSS3 with an 8px spacing scale, CSS Custom Properties (`tokens.css`), and responsive grid/flexbox layouts
* **Export Engine:** Native HTML5 Canvas API (2D context compositing with dynamic text wrapping)
* **Persistence:** Browser `localStorage` API

---

## Local Development & Setup

### Prerequisites
* [Node.js](https://nodejs.org/) v18.0.0 or higher
* npm v9.0.0 or higher

### Installation
```bash
# 1. Clone the repository
git clone https://github.com/your-username/the-leonida-wire.git
cd the-leonida-wire

# 2. Install project dependencies
npm install

# 3. Start local development server with Vite
npm run dev
# -> Local server opens at http://localhost:5173
```

### Production Build & Verification
```bash
# Compile and bundle for production
npm run build

# Preview production build locally
npm run preview
```

---

## Project Structure

```text
the-leonida-wire/
├── index.html                   # HTML entry point with Google Fonts
├── package.json                 # Project dependencies and npm scripts
├── vite.config.js               # Vite bundler configuration with React plugin
├── vercel.json                  # Single Page Application rewrite rules
├── public/
│   └── assets/
│       └── cases/               # Original baseline evidence photographs
│           ├── case-01-base.jpg # Marina slipway incident
│           └── case-02-base.jpg # Marshland utility road incident
└── src/
    ├── main.jsx                 # React root mount
    ├── App.jsx                  # Route definitions and global navigation
    ├── data/
    │   └── cases.js             # Dossier data, witness chains, and chain helpers
    ├── lib/
    │   └── driftEngine.js       # Deterministic truth drift calculation heuristic
    ├── screens/
    │   ├── LandingScreen.jsx    # Hero masthead and evidentiary protocol
    │   ├── CaseListScreen.jsx   # Classified evidence dossier cards
    │   ├── CaseIntroScreen.jsx  # Case overview and chain progression gauge
    │   ├── CustodyLogScreen.jsx # Interactive scrubber slider and audit ledger
    │   ├── EditorScreen.jsx     # 3-Zone React Image Editor workbench & filing
    │   ├── DriftStatusScreen.jsx# Large drift score hero and progression flow
    │   └── RevealScreen.jsx     # Side-by-side comparison & Canvas dossier exporter
    ├── components/
    │   └── common/
    │       ├── Navbar.jsx       # Persistent top navigation and active case tag
    │       ├── TickerHeader.jsx # Wire-service teletype marquee
    │       ├── Button.jsx       # Universal accessible press button component
    │       ├── Badge.jsx        # Forensic status stamp and pill badges
    │       ├── Divider.jsx      # Classified dashed/evidence rule lines
    │       ├── RedactionBar.jsx # Interactive hover redaction bars
    │       └── GrainOverlay.jsx # CRT film-grain and scanline overlay
    ├── styles/
    │   └── tokens.css           # 8px spacing system, color tokens, and resets
    └── utils/
        ├── imageHelpers.js      # Filter-to-canvas baking and URL resolution
        └── storage.js           # LocalStorage case progress persistence
```

---

## Legal & Fictional Universe Disclaimer

*The Leonida Wire* is an original fictional work inspired by the atmospheric, satirical, and tropical character of coastal reporting and late-night tabloid journalism.

It is **not affiliated with, endorsed by, sponsored by, or in any way associated with Rockstar Games, Take-Two Interactive, or any of their subsidiaries or affiliates.** All characters, locations, incidents, headlines, and dossiers are purely fictional original creations. All baseline images used are royalty-free photographic assets.
