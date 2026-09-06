import { Feedback } from "./types";
import { generateSampleData } from "./sampleData";

const STORAGE_KEY = "lobbyloop_feedback";
const EVENT_NAME = "lobbyloop:update";

/**
 * This module is the only place that talks to localStorage.
 * Swapping in Firebase/Supabase/a real API later means reimplementing
 * these four functions with the same signatures — nothing else in the
 * app needs to change.
 */

export function getAllFeedback(): Feedback[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(data: Feedback[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  // Notify listeners in this tab (storage events only fire in *other* tabs).
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

export function addFeedback(feedback: Feedback): void {
  const current = getAllFeedback();
  persist([feedback, ...current]);
}

export function resetToSampleData(): void {
  persist(generateSampleData());
}

export function clearAllFeedback(): void {
  persist([]);
}

/** Ensures there's always something to look at on first dashboard load. */
export function ensureSeeded(): void {
  if (getAllFeedback().length === 0) {
    resetToSampleData();
  }
}

/**
 * Subscribe to feedback changes. Fires on writes made in this tab
 * (custom event) and in other tabs (native storage event) — this is
 * what makes "Phone submits -> Dashboard updates live" work when the
 * phone and the dashboard are two different browser tabs/devices
 * pointed at the same origin, and always works within one tab.
 */
export function subscribeToFeedback(callback: () => void): () => void {
  const handler = () => callback();
  window.addEventListener(EVENT_NAME, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT_NAME, handler);
    window.removeEventListener("storage", handler);
  };
}
