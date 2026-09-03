/**
 * Cookie and storage helpers for landing page template caching and local shuffling.
 */

const COOKIE_NAME = "mememaker_templates";
const DEFAULT_POOL = Array.from({ length: 20 }, (_, i) => i + 1);

/**
 * Get cookie value by name
 */
export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^|;\\s*)" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

/**
 * Set cookie with expiration (default 30 days)
 */
export function setCookie(name: string, value: string, days = 30): void {
  if (typeof document === "undefined") return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

/**
 * Retrieve cached template ID list from cookies (fallback to localStorage, then default 1..20)
 */
export function getCachedTemplatePool(): number[] {
  try {
    const cookieVal = getCookie(COOKIE_NAME);
    if (cookieVal) {
      const parsed = JSON.parse(cookieVal);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore parse error
  }

  try {
    const localVal = localStorage.getItem(COOKIE_NAME);
    if (localVal) {
      const parsed = JSON.parse(localVal);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setCookie(COOKIE_NAME, JSON.stringify(parsed));
        return parsed;
      }
    }
  } catch {
    // ignore localStorage error
  }

  // First time initialization: cache default pool in cookie & localStorage
  const initial = [...DEFAULT_POOL];
  try {
    setCookie(COOKIE_NAME, JSON.stringify(initial));
    localStorage.setItem(COOKIE_NAME, JSON.stringify(initial));
  } catch {
    // ignore
  }
  return initial;
}

/**
 * In-place Fisher-Yates shuffle returning a newly randomized array
 */
export function shuffleArray<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Pre-warms images into the browser HTTP cache so reloads are instant
 */
export function preloadTemplateImages(baseUrl: string, ids: number[]): void {
  if (typeof window === "undefined") return;
  ids.forEach((id) => {
    const img = new Image();
    img.src = `${baseUrl}/${id}.webp`;
  });
}
