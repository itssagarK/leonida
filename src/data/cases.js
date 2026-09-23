/**
 * THE LEONIDA WIRE — EVIDENTIARY CASES DATABASE
 * Fictional Leonida wire-service cases documenting the degradation of truth
 * across consecutive witness links.
 */

export const INITIAL_CASES = [
  {
    id: 'case-01',
    caseNumber: 'DOSSIER #01-A',
    title: 'THE OCEAN DRIVE "SUPERCAR SUBMERSIBLE"',
    subtitle: 'Abandoned Slipway Sedan vs. Billionaire Amphibious Espionage Prototype',
    location: 'Vice Beach Marina, Slipway #4',
    dateLogged: '23-SEP-2026 // 02:45 EST',
    originalImage: '/assets/cases/case-01-base.jpg',
    originalCaption: 'Harbor patrol winch an abandoned red sports coupe off the Vice Beach marina slipway after high tide.',
    originalPhotographer: 'Vice Port Authority Harbor Log (Field Unit #12)',
    category: 'TRANSIT & CONTRABAND',
    baselineTags: ['Tow Truck', 'Marina Slipway', 'Water Damage', 'High Tide'],
    chain: [
      {
        id: 'link-01-1',
        step: 1,
        author: 'Nico "Valet" Delgado',
        handle: '@vice_valet_leaks',
        role: 'Marina Valet Attendant',
        timestamp: '03:12 EST',
        caption: 'Caught this at 2am: some cartel boss tested his twin-turbo amphibious coupe straight into the bay and drove under water!',
        filterStyle: 'contrast(1.35) saturate(1.7) brightness(1.05)',
        toolsUsed: ['Neon Sunset Filter', 'Saturate', 'Dynamic Contrast'],
        distortionNote: 'Ignored the tow truck winch cable; claimed the submerged bumper was an "amphibious water-jet rudder".'
      },
      {
        id: 'link-01-2',
        step: 2,
        author: 'Leonida Night Tabloid Desk',
        handle: '@vice_night_wire',
        role: 'Midnight Tabloid Stringer',
        timestamp: '04:05 EST',
        caption: 'BREAKING: Tech oligarch evades federal harbor pursuit in experimental submersible luxury roadster near Starfish Key.',
        filterStyle: 'sepia(0.3) contrast(1.6) brightness(0.9) hue-rotate(-20deg)',
        toolsUsed: ['Telephoto Crop', 'Paparazzi Grain', 'High Drama'],
        distortionNote: 'Invented a "federal pursuit" based on the blinking orange warning light of the tow truck.'
      },
      {
        id: 'link-01-3',
        step: 3,
        author: 'Deep Leonida Syndicate',
        handle: '@leonida_underbelly',
        role: 'Underground Conspiracy Forum',
        timestamp: '05:30 EST',
        caption: 'CONFIRMED: Military-grade submersible disguised as supercar intercepted smuggling unmarked bearer bonds into Vice Channel.',
        filterStyle: 'contrast(1.8) saturate(0.6) hue-rotate(180deg) brightness(0.85)',
        toolsUsed: ['Night Surveillance Invert', 'Thermal Tint', 'Evidence Vignette'],
        distortionNote: 'Water reflections labeled as "ballast tanks"; harbor buoy markers claimed to be naval depth charges.'
      }
    ]
  },
  {
    id: 'case-02',
    caseNumber: 'DOSSIER #02-B',
    title: 'MIDNIGHT AT THE AMBROSIA SWAMP ROADS',
    subtitle: 'Overtime Utility Lighting vs. Apex Cryptid Extraterrestrial Landing',
    location: 'Route 84 Marshland Crossing, Ambrosia County',
    dateLogged: '23-SEP-2026 // 01:18 EST',
    originalImage: '/assets/cases/case-02-base.jpg',
    originalCaption: 'County road repair crew illuminates an overgrown drainage ditch with high-power sodium halogen spotlights.',
    originalPhotographer: 'Leonida Dept. of Public Works Incident Report',
    category: 'ANOMALY & INFRASTRUCTURE',
    baselineTags: ['Utility Crew', 'Halogen Lamp', 'Mud Canal', 'Overgrowth'],
    chain: [
      {
        id: 'link-02-1',
        step: 1,
        author: 'Gator_Dan_88',
        handle: '@ambrosia_airboat_dan',
        role: 'Airboat Tour Operator',
        timestamp: '01:52 EST',
        caption: 'Yall ain’t ready for this. Something massive was glowing under the water by the culvert. The crew wouldn’t get near it.',
        filterStyle: 'contrast(1.4) saturate(1.8) hue-rotate(90deg)',
        toolsUsed: ['Bioluminescent Shift', 'Green Filter', 'Shadow Boost'],
        distortionNote: 'Mistook yellow generator headlights reflected through algae for an organic bioluminescent glow.'
      },
      {
        id: 'link-02-2',
        step: 2,
        author: 'Leonida Paranormal Gazette',
        handle: '@leonida_cryptid_wire',
        role: 'Online Cryptid Investigator',
        timestamp: '03:15 EST',
        caption: 'ALERT: 20-foot radioactive reptile emerges from Ambrosia chemical runoff canal, startling county engineers.',
        filterStyle: 'contrast(1.7) saturate(0.5) brightness(1.2) hue-rotate(45deg)',
        toolsUsed: ['Radioactive False-Color', 'Contrast Spike', 'Edge Sharpening'],
        distortionNote: 'Interpreted fallen tree branches as the spine and ridges of a prehistoric swamp monster.'
      },
      {
        id: 'link-02-3',
        step: 3,
        author: 'Interstellar Leonida Watch',
        handle: '@ufos_over_leonida',
        role: 'Deep Sky Theorist',
        timestamp: '04:40 EST',
        caption: 'DISCLOSURE EVENT: Off-world scout saucer touches down in Ambrosia marsh; utility trucks surround craft for extraction.',
        filterStyle: 'invert(0.15) contrast(1.9) saturate(2.0) hue-rotate(220deg)',
        toolsUsed: ['Alien Violet Spectrum', 'Extreme Vignette', 'Exposure Blowout'],
        distortionNote: 'Turned circular floodlight halos in the swamp fog into the anti-gravity propulsion ring of a UFO.'
      }
    ]
  }
];

/**
 * Returns all available cases.
 */
export function getAllCases() {
  return INITIAL_CASES;
}

/**
 * Returns a case by its ID, supporting aliases like '1', '2', 'case-1', 'case-2'.
 * Always falls back safely to the first case to prevent deep-route crashes.
 * @param {string} id
 */
export function getCaseById(id) {
  if (!id) return INITIAL_CASES[0];
  const cleanId = String(id).toLowerCase().trim();

  // Exact ID match (e.g. 'case-01')
  const exact = INITIAL_CASES.find((c) => c.id.toLowerCase() === cleanId);
  if (exact) return exact;

  // Numeric shorthand match (e.g. '1', 'case-1', 'case1')
  if (cleanId === '1' || cleanId === 'case-1' || cleanId === 'case1') {
    return INITIAL_CASES[0];
  }
  if (cleanId === '2' || cleanId === 'case-2' || cleanId === 'case2') {
    return INITIAL_CASES[1] || INITIAL_CASES[0];
  }

  // Substring or caseNumber match (e.g. '01-A')
  const partial = INITIAL_CASES.find(
    (c) => c.id.toLowerCase().includes(cleanId) || c.caseNumber.toLowerCase().includes(cleanId)
  );
  if (partial) return partial;

  // Ultimate fallback to prevent crashes on invalid routes
  return INITIAL_CASES[0];
}

/**
 * Computes the full chain including any saved player contribution from localStorage.
 * @param {object} caseObj
 * @param {object|null} playerProgress
 */
export function getEffectiveChain(caseObj, playerProgress) {
  if (!caseObj) return [];
  const baseChain = [...caseObj.chain];

  if (playerProgress && playerProgress.playerLink) {
    baseChain.push({
      id: `player-link-${caseObj.id}`,
      step: baseChain.length + 1,
      author: playerProgress.playerLink.author || 'YOU (LEONIDA WIRE AGENT)',
      handle: '@you_the_wire',
      role: 'Investigative Press Contributor',
      timestamp: playerProgress.playerLink.timestamp || 'JUST NOW',
      caption: playerProgress.playerLink.caption,
      imageDataUrl: playerProgress.playerLink.imageDataUrl,
      filterStyle: null,
      toolsUsed: playerProgress.playerLink.toolsUsed || ['React Image Editor'],
      distortionNote: 'Player-submitted final wire report.',
      isPlayerSubmission: true
    });
  }

  return baseChain;
}
