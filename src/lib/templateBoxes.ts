export interface TemplateTextBox {
  id: string;
  label: string;
  placeholder: string;
  x: number; // 0.0 to 1.0 (relative to canvas width)
  y: number; // 0.0 to 1.0 (relative to canvas height)
  textAlign?: "center" | "left" | "right";
  maxWidthRatio?: number; // relative to canvas width
  fontSizeRatio?: number; // scale multiplier for base font size
  fontSize?: number; // base font size in px
  rotation?: number; // rotation angle in degrees (0 to 360)
  fontFamily?: string; // CSS font-family string (e.g. Impact, Arial Black, Anton)
  isPlain?: boolean; // Plain slim text without heavy stroke outline
  color?: string; // Default text color (e.g. #000000 or #ffffff)
}

export interface MemeFontOption {
  id: string;
  name: string;
  family: string;
  category: "meme" | "sans" | "serif" | "mono" | "fun";
}

export const AVAILABLE_MEME_FONTS: MemeFontOption[] = [
  { id: "impact", name: "Impact", family: "Impact, 'Arial Black', sans-serif", category: "meme" },
  { id: "plain-black", name: "Plain Black (Slim)", family: "Inter, system-ui, -apple-system, sans-serif", category: "sans" },
  { id: "arial-black", name: "Arial Black", family: "'Arial Black', sans-serif", category: "sans" },
  { id: "anton", name: "Anton", family: "Anton, Impact, sans-serif", category: "meme" },
  { id: "bebas-neue", name: "Bebas Neue", family: "'Bebas Neue', Impact, sans-serif", category: "meme" },
  { id: "montserrat", name: "Montserrat", family: "Montserrat, sans-serif", category: "sans" },
  { id: "oswald", name: "Oswald", family: "Oswald, sans-serif", category: "sans" },
  { id: "comic-sans", name: "Comic Sans", family: "'Comic Sans MS', cursive, sans-serif", category: "fun" },
  { id: "times", name: "Times New Roman", family: "'Times New Roman', Times, serif", category: "serif" },
  { id: "mono", name: "JetBrains Mono", family: "'JetBrains Mono', monospace", category: "mono" },
];

export function isPlainBoxStyle(box?: { isPlain?: boolean; fontFamily?: string; color?: string } | null): boolean {
  if (!box) return false;
  return Boolean(
    box.isPlain ||
    box.fontFamily === "Inter, system-ui, -apple-system, sans-serif" ||
    box.fontFamily?.includes("Inter") ||
    box.fontFamily === "plain-black"
  );
}

export const DEFAULT_BOXES: TemplateTextBox[] = [
  { id: "top", label: "Top Text", placeholder: "Top Text", x: 0.5, y: 0.12, textAlign: "center" },
  { id: "bottom", label: "Bottom Text", placeholder: "Bottom Text", x: 0.5, y: 0.88, textAlign: "center" },
];

export const TEMPLATE_BOXES: Record<number, TemplateTextBox[]> = {
  // 1: Confused Nick Young (Classic Top / Bottom)
  1: [
    { id: "top", label: "Top Text", placeholder: "Top Text", x: 0.5, y: 0.12, textAlign: "center" },
    { id: "bottom", label: "Bottom Text", placeholder: "Bottom Text", x: 0.5, y: 0.88, textAlign: "center" },
  ],

  // 2: Left Exit 12 - Car Swerving
  2: [
    { id: "straight", label: "Straight Road (Left Sign)", placeholder: "Keep doing this...", x: 0.35, y: 0.28, textAlign: "center", maxWidthRatio: 0.32 },
    { id: "exit", label: "Exit Ramp (Right Sign)", placeholder: "Exciting new thing...", x: 0.72, y: 0.28, textAlign: "center", maxWidthRatio: 0.34 },
    { id: "car", label: "Car (Bottom Right)", placeholder: "Me / Everyone", x: 0.72, y: 0.85, textAlign: "center", maxWidthRatio: 0.35 },
  ],

  // 3: Two Buttons
  3: [
    { id: "btn1", label: "Left Button", placeholder: "Option 1", x: 0.30, y: 0.16, textAlign: "center", maxWidthRatio: 0.28, fontSizeRatio: 0.8 },
    { id: "btn2", label: "Right Button", placeholder: "Option 2", x: 0.63, y: 0.14, textAlign: "center", maxWidthRatio: 0.28, fontSizeRatio: 0.8 },
    { id: "guy", label: "Guy Sweating", placeholder: "Me trying to decide...", x: 0.50, y: 0.88, textAlign: "center", maxWidthRatio: 0.8 },
  ],

  // 4: Epic Handshake
  4: [
    { id: "left", label: "Left Arm (Dutch)", placeholder: "Group A...", x: 0.25, y: 0.42, textAlign: "center", maxWidthRatio: 0.35 },
    { id: "right", label: "Right Arm (Dillon)", placeholder: "Group B...", x: 0.75, y: 0.40, textAlign: "center", maxWidthRatio: 0.35 },
    { id: "center", label: "Handshake / Agreement", placeholder: "Mutual agreement", x: 0.50, y: 0.75, textAlign: "center", maxWidthRatio: 0.5 },
  ],

  // 5: Change My Mind
  5: [
    { id: "board", label: "Sign on Table", placeholder: "Your controversial statement...", x: 0.50, y: 0.68, textAlign: "center", maxWidthRatio: 0.48, fontSizeRatio: 0.85 },
    { id: "top", label: "Top Header (Optional)", placeholder: "Top Text...", x: 0.50, y: 0.12, textAlign: "center", maxWidthRatio: 0.85 },
  ],

  // 6: Distracted Boyfriend
  6: [
    { id: "red", label: "Girl in Red (Left)", placeholder: "New distraction...", x: 0.20, y: 0.65, textAlign: "center", maxWidthRatio: 0.30 },
    { id: "guy", label: "Distracted Guy (Middle)", placeholder: "Me...", x: 0.52, y: 0.48, textAlign: "center", maxWidthRatio: 0.30 },
    { id: "gf", label: "Girlfriend (Right)", placeholder: "My current responsibilities...", x: 0.82, y: 0.60, textAlign: "center", maxWidthRatio: 0.30 },
  ],

  // 7: Woman Yelling at Cat
  7: [
    { id: "woman", label: "Woman Yelling (Left)", placeholder: "You promised...", x: 0.25, y: 0.18, textAlign: "center", maxWidthRatio: 0.42 },
    { id: "cat", label: "Cat (Right)", placeholder: "Me at 3 AM...", x: 0.75, y: 0.18, textAlign: "center", maxWidthRatio: 0.42 },
  ],

  // 8: Buff Doge vs. Cheems
  8: [
    { id: "doge", label: "Buff Doge (Left)", placeholder: "Me in 2012...", x: 0.25, y: 0.80, textAlign: "center", maxWidthRatio: 0.42 },
    { id: "cheems", label: "Cheems (Right)", placeholder: "Me in 2024...", x: 0.75, y: 0.84, textAlign: "center", maxWidthRatio: 0.42 },
    { id: "top", label: "Comparison Title", placeholder: "Before vs Now...", x: 0.50, y: 0.10, textAlign: "center", maxWidthRatio: 0.85 },
  ],

  // 9: Bernie Sanders Once Again Asking
  9: [
    { id: "top", label: "Top Text", placeholder: "Top Text...", x: 0.50, y: 0.12, textAlign: "center" },
    { id: "bottom", label: "Bottom Text", placeholder: "I am once again asking for...", x: 0.50, y: 0.88, textAlign: "center" },
  ],

  // 10: Always Has Been
  10: [
    { id: "earth", label: "Earth / Discovery (Left)", placeholder: "Wait, it's all ...?", x: 0.32, y: 0.40, textAlign: "center", maxWidthRatio: 0.38 },
    { id: "gun", label: "Astronaut with Gun (Right)", placeholder: "Always has been.", x: 0.78, y: 0.25, textAlign: "center", maxWidthRatio: 0.38 },
  ],

  // 11: Jim Halpert Explaining to Whiteboard
  11: [
    { id: "board", label: "Whiteboard Text", placeholder: "Here is the truth...", x: 0.68, y: 0.45, textAlign: "center", maxWidthRatio: 0.45 },
    { id: "jim", label: "Jim / Header", placeholder: "Explaining to everyone...", x: 0.25, y: 0.25, textAlign: "center", maxWidthRatio: 0.35 },
  ],

  // 12: Leonardo DiCaprio Laughing
  12: [
    { id: "top", label: "Top Text", placeholder: "Top Text", x: 0.50, y: 0.12, textAlign: "center" },
    { id: "bottom", label: "Bottom Text", placeholder: "Bottom Text", x: 0.50, y: 0.88, textAlign: "center" },
  ],

  // 13: Anakin and Padme
  13: [
    { id: "p1", label: "Anakin (Top Left)", placeholder: "I'm going to change things...", x: 0.25, y: 0.40, textAlign: "center", maxWidthRatio: 0.42 },
    { id: "p2", label: "Padme (Top Right)", placeholder: "For the better, right?", x: 0.75, y: 0.40, textAlign: "center", maxWidthRatio: 0.42 },
    { id: "p3", label: "Padme Worried (Bottom Right)", placeholder: "...For the better, right?", x: 0.75, y: 0.90, textAlign: "center", maxWidthRatio: 0.42 },
  ],

  // 14: Trade Offer
  14: [
    { id: "receive", label: "i receive (Left)", placeholder: "Your code with 0 bugs...", x: 0.25, y: 0.35, textAlign: "center", maxWidthRatio: 0.42 },
    { id: "give", label: "you receive (Right)", placeholder: "A working production build...", x: 0.75, y: 0.35, textAlign: "center", maxWidthRatio: 0.42 },
  ],

  // 15: Panik Kalm Panik
  15: [
    { id: "panik1", label: "Top Panik", placeholder: "Server went down!", x: 0.70, y: 0.18, textAlign: "center", maxWidthRatio: 0.45 },
    { id: "kalm", label: "Middle Kalm", placeholder: "It's just a test server.", x: 0.70, y: 0.52, textAlign: "center", maxWidthRatio: 0.45 },
    { id: "panik2", label: "Bottom Panik", placeholder: "Wait, test is connected to prod database!", x: 0.70, y: 0.85, textAlign: "center", maxWidthRatio: 0.45 },
  ],

  // 16: Expanding Brain
  16: [
    { id: "b1", label: "Small Brain (Level 1)", placeholder: "Level 1 thought...", x: 0.25, y: 0.14, textAlign: "center", maxWidthRatio: 0.45 },
    { id: "b2", label: "Glowing Brain (Level 2)", placeholder: "Level 2 thought...", x: 0.25, y: 0.39, textAlign: "center", maxWidthRatio: 0.45 },
    { id: "b3", label: "Cosmic Brain (Level 3)", placeholder: "Level 3 thought...", x: 0.25, y: 0.64, textAlign: "center", maxWidthRatio: 0.45 },
    { id: "b4", label: "Universe Brain (Level 4)", placeholder: "Galaxy brain thought...", x: 0.25, y: 0.89, textAlign: "center", maxWidthRatio: 0.45 },
  ],

  // 17: Is This a Pigeon?
  17: [
    { id: "man", label: "Man (Left)", placeholder: "Me...", x: 0.32, y: 0.45, textAlign: "center", maxWidthRatio: 0.35 },
    { id: "butterfly", label: "Butterfly (Right)", placeholder: "A slight bug...", x: 0.68, y: 0.30, textAlign: "center", maxWidthRatio: 0.35 },
    { id: "bottom", label: "Subtitle", placeholder: "Is this a critical outage?", x: 0.50, y: 0.88, textAlign: "center", maxWidthRatio: 0.85 },
  ],

  // 18: Disaster Girl
  18: [
    { id: "fire", label: "House on Fire", placeholder: "Production on Friday 5PM...", x: 0.55, y: 0.15, textAlign: "center", maxWidthRatio: 0.75 },
    { id: "girl", label: "Smiling Girl", placeholder: "Me turning off notifications...", x: 0.35, y: 0.85, textAlign: "center", maxWidthRatio: 0.60 },
  ],

  // 19: They're the Same Picture
  19: [
    { id: "pam", label: "Pam / Corporate", placeholder: "Corporate needs you to find differences...", x: 0.50, y: 0.15, textAlign: "center", maxWidthRatio: 0.80 },
    { id: "pic1", label: "Picture 1 (Left)", placeholder: "Javascript", x: 0.28, y: 0.78, textAlign: "center", maxWidthRatio: 0.40 },
    { id: "pic2", label: "Picture 2 (Right)", placeholder: "Typescript without types", x: 0.72, y: 0.78, textAlign: "center", maxWidthRatio: 0.40 },
  ],

  // 20: Hide the Pain Harold
  20: [
    { id: "top", label: "Top Text", placeholder: "When everything is on fire...", x: 0.50, y: 0.12, textAlign: "center" },
    { id: "bottom", label: "Bottom Text", placeholder: "...but you have to smile in the meeting", x: 0.50, y: 0.88, textAlign: "center" },
  ],
};

export function getTemplateBoxes(templateId: number | null): TemplateTextBox[] {
  if (templateId && TEMPLATE_BOXES[templateId]) {
    return TEMPLATE_BOXES[templateId];
  }
  return DEFAULT_BOXES;
}

export interface HandlePlacement {
  placeBelow: boolean;
  verticalOffset: number;
  transform: string;
  isObscuringText: boolean;
}

/**
 * Calculates the non-obscuring drag handle tab placement relative to a text zone.
 * When text is present, the handle is physically placed outside the text baseline:
 * - Upper zones (y <= 0.16): offset downward below the text line to avoid canvas top-edge clipping.
 * - Middle/lower zones (y > 0.16): offset upward above the text line so it never covers the letters.
 * When text is empty, the handle rests at center (y) as an intuitive positioning guide.
 */
export function calculateHandlePlacement(
  boxY: number,
  hasText: boolean,
  effectiveFontSize: number
): HandlePlacement {
  if (!hasText) {
    return {
      placeBelow: false,
      verticalOffset: 0,
      transform: "translate(-50%, -50%)",
      isObscuringText: false,
    };
  }

  const placeBelow = boxY <= 0.16;
  const verticalOffset = Math.max(18, Math.round(effectiveFontSize * 0.7));
  const transform = placeBelow
    ? `translate(-50%, ${verticalOffset}px)`
    : `translate(-50%, calc(-100% - ${verticalOffset}px))`;

  return {
    placeBelow,
    verticalOffset,
    transform,
    isObscuringText: false,
  };
}

/**
 * Calculates clamped normalized coordinates (0.02 to 0.98) from a drag movement delta.
 * Ensures 1:1 jitter-free tracking without CSS transform jumps or border overflow.
 */
export function calculateClampedCoordinate(
  initialCoord: number,
  deltaPixels: number,
  dimensionPixels: number,
  min = 0.02,
  max = 0.98
): number {
  if (!dimensionPixels || dimensionPixels <= 0) return initialCoord;
  const delta = deltaPixels / dimensionPixels;
  return Math.round(Math.max(min, Math.min(max, initialCoord + delta)) * 100) / 100;
}

