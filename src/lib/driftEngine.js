/**
 * THE LEONIDA WIRE — DRIFT ENGINE
 *
 * A deliberate, deterministic heuristic that models how truth degrades as an evidentiary
 * photograph and story pass through consecutive witnesses.
 *
 * NOTE: This is an intentional algorithmic simulation designed for game narrative feel,
 * NOT machine learning or actual computer vision. It is completely transparent,
 * predictable, and runs entirely in the browser.
 */

// Common English stopwords to filter out before computing lexical overlap
const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any',
  'are', 'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between',
  'both', 'but', 'by', 'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each',
  'few', 'for', 'from', 'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here',
  'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it',
  'its', 'itself', 'just', 'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not',
  'now', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our', 'ours', 'ourselves',
  'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than', 'that',
  'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this',
  'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were',
  'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you',
  'your', 'yours', 'yourself', 'yourselves'
]);

// Sensationalized Leonida buzzwords that amplify narrative distortion
const SENSATIONAL_KEYWORDS = new Set([
  'alien', 'extraterrestrial', 'saucer', 'ufo', 'submersible', 'submarine', 'prototype',
  'espionage', 'billionaire', 'cartel', 'secret', 'conspiracy', 'classified', 'monster',
  'reptile', 'radioactive', 'covert', 'crypto', 'heist', 'syndicate', 'clandestine',
  'smuggling', 'undercover', 'weapon', 'apocalypse', 'biological', 'interstellar'
]);

/**
 * Tokenizes a string into lowercase significant keywords (excluding stopwords & punctuation).
 * @param {string} text
 * @returns {string[]}
 */
export function extractKeywords(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
}

/**
 * Calculates Jaccard similarity between two arrays of words.
 * Returns a value between 0 (no words in common) and 1 (identical vocabulary).
 * @param {string[]} wordsA
 * @param {string[]} wordsB
 * @returns {number}
 */
export function calculateKeywordOverlap(wordsA, wordsB) {
  if (!wordsA.length || !wordsB.length) return 0;
  const setA = new Set(wordsA);
  const setB = new Set(wordsB);
  let intersectionCount = 0;

  for (const word of setA) {
    if (setB.has(word)) {
      intersectionCount++;
    }
  }

  const unionSize = new Set([...setA, ...setB]).size;
  return unionSize === 0 ? 0 : intersectionCount / unionSize;
}

/**
 * Evaluates the 4 public-record status bands based on the drift score (0-100).
 * @param {number} score
 * @returns {{ label: string, variant: string, tone: string, stampRotate: number }}
 */
export function getStatusBand(score) {
  if (score <= 24) {
    return {
      label: 'VERIFIED',
      variant: 'verified',
      tone: 'Consistent with baseline photographic negative.',
      stampRotate: -2
    };
  } else if (score <= 49) {
    return {
      label: 'DISPUTED',
      variant: 'disputed',
      tone: 'Substantial narrative divergence; corroboration compromised.',
      stampRotate: 3
    };
  } else if (score <= 74) {
    return {
      label: 'URBAN LEGEND',
      variant: 'legend',
      tone: 'High distortion threshold; viral sensationalism dominates baseline facts.',
      stampRotate: -4
    };
  } else {
    return {
      label: 'TOTAL FABRICATION',
      variant: 'fabrication',
      tone: 'Complete evidentiary collapse. Reality has decoupled from the negative.',
      stampRotate: 5
    };
  }
}

/**
 * Computes the truth-drift score and narrative distortion metrics across the custody chain.
 *
 * Deterministic calculation formula:
 * 1. Chain Length Component (35% weight): Every witness link adds cumulative friction.
 * 2. Original Semantic Decay (40% weight): How far the current headline drifted from originalCaption.
 * 3. Step-by-Step Volatility (15% weight): Average vocabulary mismatch between adjacent links.
 * 4. Sensational Keyword Amplifier (10% weight): Presence of provocative Leonida buzzwords.
 *
 * @param {object} caseObj - The baseline case object
 * @param {Array<object>} fullChain - The sequence of witness links + player's filed link
 * @returns {object} Comprehensive drift audit results
 */
export function computeDrift(caseObj, fullChain) {
  if (!caseObj || !fullChain || fullChain.length === 0) {
    return {
      score: 0,
      status: getStatusBand(0),
      breakdown: { lengthFactor: 0, originalDecay: 0, stepVolatility: 0, sensationalBonus: 0 },
      explanation: 'No custody chain detected.',
      deltaList: []
    };
  }

  const originalWords = extractKeywords(caseObj.originalCaption);
  const chainLength = fullChain.length;

  // 1. Chain Length Factor: 0 - 35 points (capped at ~6 links)
  const lengthFactor = Math.min(35, chainLength * 8.5);

  // 2. Original Semantic Decay: Compare head link against originalCaption
  const headLink = fullChain[chainLength - 1];
  const headWords = extractKeywords(headLink.caption);
  const headOverlap = calculateKeywordOverlap(originalWords, headWords);
  // Lower overlap means higher decay (0 overlap = 40 points)
  const originalDecay = Math.round((1 - headOverlap) * 40);

  // 3. Step-by-step consecutive volatility
  let volatilitySum = 0;
  let prevWords = originalWords;
  const deltaList = [];

  for (let i = 0; i < chainLength; i++) {
    const currentLink = fullChain[i];
    const currentWords = extractKeywords(currentLink.caption);
    const stepOverlap = calculateKeywordOverlap(prevWords, currentWords);
    const stepDrift = Math.round((1 - stepOverlap) * 100);

    deltaList.push({
      step: i + 1,
      author: currentLink.author,
      caption: currentLink.caption,
      overlapWithPrior: Math.round(stepOverlap * 100),
      driftStep: stepDrift,
      isPlayer: Boolean(currentLink.isPlayerSubmission)
    });

    volatilitySum += (1 - stepOverlap);
    prevWords = currentWords;
  }

  const avgStepVolatility = chainLength > 0 ? (volatilitySum / chainLength) : 0;
  const stepVolatility = Math.round(avgStepVolatility * 15);

  // 4. Sensational Keyword Amplifier (up to 10 points)
  let sensationalHits = 0;
  for (const word of headWords) {
    if (SENSATIONAL_KEYWORDS.has(word)) {
      sensationalHits++;
    }
  }
  const sensationalBonus = Math.min(10, sensationalHits * 3.5);

  // Total raw score clamped between 0 and 100
  const rawScore = Math.round(lengthFactor + originalDecay + stepVolatility + sensationalBonus);
  const score = Math.max(5, Math.min(99, rawScore));
  const status = getStatusBand(score);

  // Retained vs new keywords for inspector display
  const retainedWords = originalWords.filter((w) => headWords.includes(w));
  const mutatedWords = headWords.filter((w) => !originalWords.includes(w));

  // Generated press-wire explanation
  let explanation = '';
  if (status.label === 'VERIFIED') {
    explanation = `The story passed through ${chainLength} link(s) with minimal lexical mutation (${retainedWords.length} baseline keywords preserved). Core factual markers remain tethered to the original negative.`;
  } else if (status.label === 'DISPUTED') {
    explanation = `The story has passed through ${chainLength} editorial hands. Only ${Math.round(headOverlap * 100)}% of baseline terminology survived. Key details regarding vehicles, agents, or locations are currently contested.`;
  } else if (status.label === 'URBAN LEGEND') {
    explanation = `High narrative drift detected across ${chainLength} consecutive witness retellings. The report now incorporates ${mutatedWords.length} unverified speculative terms, mutating the original incident into folklore.`;
  } else {
    explanation = `Evidentiary detachment: 0% correlation with original police negative. Through ${chainLength} cycles of compounding distortion, the event has transmuted into an unrecognizable fabrication.`;
  }

  return {
    score,
    status,
    chainLength,
    breakdown: {
      lengthFactor: Math.round(lengthFactor),
      originalDecay,
      stepVolatility,
      sensationalBonus: Math.round(sensationalBonus)
    },
    retainedWords,
    mutatedWords: mutatedWords.slice(0, 8),
    explanation,
    deltaList
  };
}
