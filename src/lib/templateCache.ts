/**
 * LocalStorage helpers for landing page template caching and layout persistence.
 * No cookies are used; all template arrangements and active templates are persisted in localStorage.
 */

const LANDING_LAYOUT_KEY = "mememaker_landing_layout";
const TRENDING_TEMPLATES_KEY = "mememaker_trending_templates";

export interface LandingCardLayout {
  templateId: number;
  width: string;
  left: string;
  top: string;
  rotation: string;
}

const randomBetween = (minimum: number, maximum: number) =>
  minimum + Math.random() * (maximum - minimum);

/**
 * Retrieves the persisted landing template layout from localStorage,
 * or generates and persists it once so returning to the landing page
 * shows the exact same templates without re-shuffling or hitting the server.
 */
export function getLandingTemplatesLayout(count: number = 20): LandingCardLayout[] {
  if (typeof window === "undefined") {
    return generateDefaultLayout(count);
  }

  try {
    const raw = localStorage.getItem(LANDING_LAYOUT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length === count) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Could not read landing templates layout from localStorage:", e);
  }

  const generated = generateDefaultLayout(count);
  try {
    localStorage.setItem(LANDING_LAYOUT_KEY, JSON.stringify(generated));
  } catch (e) {
    console.warn("Could not persist landing templates layout to localStorage:", e);
  }
  return generated;
}

function generateDefaultLayout(count: number): LandingCardLayout[] {
  const templateIds = Array.from({ length: count }, (_, index) => (index % 20) + 1);
  const positionSlots = Array.from({ length: count }, (_, index) => index);

  // Fisher-Yates shuffle for initial generation only
  for (let i = templateIds.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [templateIds[i], templateIds[j]] = [templateIds[j], templateIds[i]];
    [positionSlots[i], positionSlots[j]] = [positionSlots[j], positionSlots[i]];
  }

  return Array.from({ length: count }, (_, index) => {
    const templateId = templateIds[index];
    const position = positionSlots[index];
    const column = position % 5;
    const row = Math.floor(position / 5);

    return {
      templateId,
      width: `${randomBetween(14.85, 22.95).toFixed(2)}rem`,
      left: `${Math.max(-5, Math.min(72, column * 18 + randomBetween(-7, 7))).toFixed(2)}%`,
      top: `${Math.max(-8, Math.min(66, row * 23 + randomBetween(-8, 8))).toFixed(2)}%`,
      rotation: `${randomBetween(-16, 16).toFixed(2)}deg`,
    };
  });
}

/**
 * Retrieves persisted trending template IDs from localStorage, or generates once.
 */
export function getTrendingTemplates(count: number = 20): number[] {
  if (typeof window === "undefined") {
    return Array.from({ length: count }, (_, i) => (i % 20) + 1);
  }

  try {
    const raw = localStorage.getItem(TRENDING_TEMPLATES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length === count) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Could not read trending templates from localStorage:", e);
  }

  const ids = Array.from({ length: count }, (_, i) => (i % 20) + 1);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }

  try {
    localStorage.setItem(TRENDING_TEMPLATES_KEY, JSON.stringify(ids));
  } catch (e) {
    console.warn("Could not persist trending templates to localStorage:", e);
  }

  return ids;
}
