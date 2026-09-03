/**
 * Generate unique cartoon-style avatar URLs using DiceBear API
 * Creates Rick and Morty style characters based on user email/name
 */

const AVATAR_STYLES = [
  "fun-emoji",
  "adventurer",
  "adventurer-neutral",
  "big-ears",
  "big-ears-neutral",
  "big-smile",
  "lorelei",
  "micah",
];

/**
 * Generate a consistent avatar URL based on a seed (email or name)
 * @param seed - The seed string (email, name, or user ID)
 * @param style - Optional style preference
 * @returns URL to the generated avatar
 */
export function generateAvatarUrl(
  seed: string,
  style?: (typeof AVATAR_STYLES)[number],
): string {
  const selectedStyle =
    style || AVATAR_STYLES[Math.abs(hashCode(seed)) % AVATAR_STYLES.length];

  const params = new URLSearchParams({
    seed,
    backgroundColor: ["b6e3f4", "c0aede", "d1d4f9", "ffd5dc", "ffdfbf"][
      Math.abs(hashCode(seed + "bg")) % 5
    ],
    radius: "50",
    size: "128",
  });

  return `https://api.dicebear.com/9.x/${selectedStyle}/svg?${params.toString()}`;
}

/**
 * Simple hash code generator for consistent randomization
 */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
}

/**
 * Get avatar URL for a user, preferring their profile picture if available
 */
export function getUserAvatarUrl(user: {
  email?: string | null;
  user_metadata?: Record<string, string | undefined>;
}): string | null {
  const metadata = user.user_metadata || {};

  // If user has a profile picture (from Google OAuth), use it
  if (metadata.avatar_url || metadata.picture) {
    return metadata.avatar_url || metadata.picture || null;
  }

  // Otherwise generate a unique cartoon avatar based on email
  if (user.email) {
    return generateAvatarUrl(user.email);
  }

  return null;
}
