/**
 * THE LEONIDA WIRE — LocalStorage Persistence Utilities
 * Stores player progress, modified chain links, and drift analysis results.
 */

const STORAGE_KEY = 'leonida_wire_progress_v1';

/**
 * Retrieves the full stored player progress map from localStorage.
 * @returns {Record<string, any>} Map of caseId -> case progress
 */
export function getPlayerProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (err) {
    console.error('[Leonida Wire] Failed to parse player progress from localStorage:', err);
    return {};
  }
}

/**
 * Saves or updates player progress in localStorage.
 * @param {Record<string, any>} progressData
 */
export function savePlayerProgress(progressData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progressData));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('wire_progress_updated', { detail: progressData }));
    }
  } catch (err) {
    console.error('[Leonida Wire] Failed to save player progress to localStorage:', err);
  }
}

/**
 * Retrieves progress for a specific case by caseId.
 * @param {string} caseId
 * @returns {any | null}
 */
export function getCaseProgress(caseId) {
  const all = getPlayerProgress();
  return all[caseId] || null;
}

/**
 * Saves progress for a specific case by caseId.
 * @param {string} caseId
 * @param {any} caseData
 */
export function saveCaseProgress(caseId, caseData) {
  const all = getPlayerProgress();
  all[caseId] = caseData;
  savePlayerProgress(all);
}

/**
 * Clears player progress for a specific case (for replayability).
 * @param {string} caseId
 */
export function clearCaseProgress(caseId) {
  const all = getPlayerProgress();
  delete all[caseId];
  savePlayerProgress(all);
}

/**
 * Completely resets all player progress across all cases.
 */
export function resetAllProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('wire_progress_updated', { detail: {} }));
    }
  } catch (err) {
    console.error('[Leonida Wire] Failed to reset localStorage:', err);
  }
}
