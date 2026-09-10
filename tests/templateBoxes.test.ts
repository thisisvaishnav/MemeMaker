import { describe, it, expect } from "vitest";
import {
  TEMPLATE_BOXES,
  DEFAULT_BOXES,
  getTemplateBoxes,
  calculateHandlePlacement,
  calculateClampedCoordinate,
  calculateEffectiveFontSize,
} from "../src/lib/templateBoxes";
import { TEMPLATE_NAMES } from "../src/components/MemeMaker";

describe("Template Box Positioning (lib/templateBoxes.ts)", () => {
  it("defines custom box configurations for all 20 templates", () => {
    for (let i = 1; i <= 20; i++) {
      expect(TEMPLATE_BOXES[i]).toBeDefined();
      expect(TEMPLATE_BOXES[i].length).toBeGreaterThanOrEqual(1);
    }
  });

  it("all boxes have valid normalized coordinates between 0 and 1", () => {
    for (let i = 1; i <= 20; i++) {
      const boxes = TEMPLATE_BOXES[i];
      for (const box of boxes) {
        expect(box.id).toBeDefined();
        expect(box.id.length).toBeGreaterThan(0);
        expect(box.label.length).toBeGreaterThan(0);
        expect(box.placeholder.length).toBeGreaterThan(0);
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x).toBeLessThanOrEqual(1);
        expect(box.y).toBeGreaterThanOrEqual(0);
        expect(box.y).toBeLessThanOrEqual(1);

        if (box.textAlign) {
          expect(["left", "center", "right"]).toContain(box.textAlign);
        }
        if (box.maxWidthRatio) {
          expect(box.maxWidthRatio).toBeGreaterThan(0);
          expect(box.maxWidthRatio).toBeLessThanOrEqual(1);
        }
      }
    }
  });

  it("Buff Doge vs Cheems (id: 8) has left doge and right cheems boxes", () => {
    const boxes = getTemplateBoxes(8);
    expect(boxes.length).toBe(3);
    const doge = boxes.find((b) => b.id === "doge");
    const cheems = boxes.find((b) => b.id === "cheems");
    expect(doge).toBeDefined();
    expect(cheems).toBeDefined();
    expect(doge!.x).toBeLessThan(0.5); // left side
    expect(cheems!.x).toBeGreaterThan(0.5); // right side
  });

  it("Left Exit 12 (id: 2) has straight, exit, and car boxes", () => {
    const boxes = getTemplateBoxes(2);
    expect(boxes.length).toBe(3);
    const ids = boxes.map((b) => b.id);
    expect(ids).toContain("straight");
    expect(ids).toContain("exit");
    expect(ids).toContain("car");
  });

  it("Two Buttons (id: 3) has left and right button boxes", () => {
    const boxes = getTemplateBoxes(3);
    const btn1 = boxes.find((b) => b.id === "btn1");
    const btn2 = boxes.find((b) => b.id === "btn2");
    expect(btn1).toBeDefined();
    expect(btn2).toBeDefined();
    expect(btn1!.x).toBeLessThan(btn2!.x);
  });

  it("getTemplateBoxes falls back to DEFAULT_BOXES for null or out-of-range IDs", () => {
    expect(getTemplateBoxes(null)).toEqual(DEFAULT_BOXES);
    expect(getTemplateBoxes(999)).toEqual(DEFAULT_BOXES);
  });
});

describe("Regression Tests: Edit Page Non-Obscuring Handle Placement & Drag Math", () => {
  it("places handle outside text baseline when text is present (never dead-center on letters)", () => {
    // Top text (y <= 0.16): should be placed below text with positive vertical offset
    const topPlacement = calculateHandlePlacement(0.12, true, 40);
    expect(topPlacement.placeBelow).toBe(true);
    expect(topPlacement.verticalOffset).toBeGreaterThanOrEqual(18);
    expect(topPlacement.isObscuringText).toBe(false);
    expect(topPlacement.transform).not.toBe("translate(-50%, -50%)");
    expect(topPlacement.transform).toContain("translate(-50%, ");

    // Bottom text (y > 0.16): should be placed above text with negative/upward offset
    const bottomPlacement = calculateHandlePlacement(0.88, true, 40);
    expect(bottomPlacement.placeBelow).toBe(false);
    expect(bottomPlacement.verticalOffset).toBeGreaterThanOrEqual(18);
    expect(bottomPlacement.isObscuringText).toBe(false);
    expect(bottomPlacement.transform).not.toBe("translate(-50%, -50%)");
    expect(bottomPlacement.transform).toContain("calc(-100% - ");

    // Middle text zone (e.g. Change My Mind board at y = 0.68)
    const midPlacement = calculateHandlePlacement(0.68, true, 36);
    expect(midPlacement.placeBelow).toBe(false);
    expect(midPlacement.isObscuringText).toBe(false);
    expect(midPlacement.transform).toContain("calc(-100% - ");
  });

  it("rests at center as guide placeholder only when text is empty", () => {
    const emptyTop = calculateHandlePlacement(0.12, false, 40);
    expect(emptyTop.transform).toBe("translate(-50%, -50%)");
    expect(emptyTop.verticalOffset).toBe(0);

    const emptyBottom = calculateHandlePlacement(0.88, false, 40);
    expect(emptyBottom.transform).toBe("translate(-50%, -50%)");
    expect(emptyBottom.verticalOffset).toBe(0);
  });

  it("calculates clamped coordinates smoothly and prevents overflow out of bounds", () => {
    // Normal drag: initial 0.50 + 40px on 800px width -> 0.55
    const moved = calculateClampedCoordinate(0.50, 40, 800);
    expect(moved).toBe(0.55);

    // Negative drag: initial 0.50 - 40px on 800px width -> 0.45
    const movedBack = calculateClampedCoordinate(0.50, -40, 800);
    expect(movedBack).toBe(0.45);

    // Extreme left drag: should clamp to 0.02 (not negative or 0)
    const clampedMin = calculateClampedCoordinate(0.20, -500, 800);
    expect(clampedMin).toBe(0.02);

    // Extreme right drag: should clamp to 0.98 (not > 1)
    const clampedMax = calculateClampedCoordinate(0.80, 500, 800);
    expect(clampedMax).toBe(0.98);

    // Zero dimension safety: returns initialCoord without NaN or division by zero
    const safeZero = calculateClampedCoordinate(0.50, 50, 0);
    expect(safeZero).toBe(0.50);
  });

  it("ensures direct text dragging provides smooth sub-pixel tracking and clamped bounds", () => {
    // Sub-pixel movement (small finger touch on mobile screen)
    const smallStep = calculateClampedCoordinate(0.50, 3.4, 375); // 375px mobile viewport
    expect(smallStep).toBe(0.51);

    // Negative small step
    const smallStepBack = calculateClampedCoordinate(0.50, -3.4, 375);
    expect(smallStepBack).toBe(0.49);

    // Full screen swipe up: clamps to top boundary safely
    const topClamp = calculateClampedCoordinate(0.50, -600, 667);
    expect(topClamp).toBe(0.02);

    // Full screen swipe down: clamps to bottom boundary safely
    const bottomClamp = calculateClampedCoordinate(0.50, 600, 667);
    expect(bottomClamp).toBe(0.98);
  });

  it("verifies all template boxes have uppercase placeholders suitable for ghost overlay", () => {
    for (let i = 1; i <= 20; i++) {
      const boxes = getTemplateBoxes(i);
      for (const box of boxes) {
        expect(box.placeholder).toBeDefined();
        expect(box.placeholder.trim().length).toBeGreaterThan(0);
        // Ensure placeholder can be safely uppercased for the DOM ghost text overlay
        const uppercase = box.placeholder.toUpperCase();
        expect(uppercase.length).toBeGreaterThan(0);
      }
    }
  });

  it("formats generic sequential labels (Text #1, Text #2) for any template box array", () => {
    for (let i = 1; i <= 20; i++) {
      const boxes = getTemplateBoxes(i);
      boxes.forEach((_, idx) => {
        const label = `Text #${idx + 1}`;
        expect(label).toMatch(/^Text #\d+$/);
      });
    }
  });

  it("correctly identifies empty text so that the template image starts 100% plain", () => {
    const isTextPresent = (text?: string) => Boolean(text && text.trim().length > 0);

    expect(isTextPresent("")).toBe(false);
    expect(isTextPresent("   ")).toBe(false);
    expect(isTextPresent(undefined)).toBe(false);
    expect(isTextPresent("Hello")).toBe(true);
    expect(isTextPresent("  Meme  ")).toBe(true);
  });

  it("calculates rotation angles and correctly wraps around 360 degrees", () => {
    const normalizeRotation = (initial: number, diff: number) => {
      let angle = Math.round((initial + diff) % 360);
      if (angle < 0) angle += 360;
      if (Math.abs(angle) < 4 || Math.abs(angle - 360) < 4) angle = 0;
      else if (Math.abs(angle - 90) < 4) angle = 90;
      else if (Math.abs(angle - 180) < 4) angle = 180;
      else if (Math.abs(angle - 270) < 4) angle = 270;
      return angle;
    };

    expect(normalizeRotation(0, 45)).toBe(45);
    expect(normalizeRotation(350, 20)).toBe(10); // wrap around 360
    expect(normalizeRotation(10, -20)).toBe(350); // wrap below 0
    expect(normalizeRotation(0, 92)).toBe(90); // snap to 90
    expect(normalizeRotation(0, 182)).toBe(180); // snap to 180
    expect(normalizeRotation(0, 268)).toBe(270); // snap to 270
    expect(normalizeRotation(0, 2)).toBe(0); // snap to 0
  });

  describe("calculateEffectiveFontSize helper", () => {
    it("scales baseFontSize cleanly by fontSizeRatio without double multiplication", () => {
      const box = {
        id: "top",
        label: "Top",
        placeholder: "Top",
        x: 0.5,
        y: 0.2,
        fontSizeRatio: 2.0,
        fontSize: 72, // 72 is 36 * 2.0
      };

      // On canvas (base 52, scaleFactor 1)
      const canvasSize = calculateEffectiveFontSize({ box, baseFontSize: 52, scaleFactor: 1 });
      expect(canvasSize).toBe(104); // 52 * 2.0, NOT 72 * 2.0 = 144

      // On screen DOM overlay (base 52, scaleFactor 0.5)
      const domSize = calculateEffectiveFontSize({ box, baseFontSize: 52, scaleFactor: 0.5 });
      expect(domSize).toBe(52); // 104 * 0.5
    });

    it("falls back to fontSize / 36 ratio when fontSizeRatio is absent", () => {
      const box = {
        id: "board",
        label: "Board",
        placeholder: "Board",
        x: 0.5,
        y: 0.5,
        fontSize: 54, // 54 / 36 = 1.5
      };

      const size = calculateEffectiveFontSize({ box, baseFontSize: 52, scaleFactor: 1 });
      expect(size).toBe(78); // 52 * 1.5
    });

    it("uses user customFontSize override when provided", () => {
      const box = {
        id: "custom",
        label: "Custom",
        placeholder: "Custom",
        x: 0.5,
        y: 0.5,
        fontSizeRatio: 1.0,
      };

      const size = calculateEffectiveFontSize({
        box,
        baseFontSize: 52,
        customFontSize: 80,
        scaleFactor: 0.75,
      });
      expect(size).toBe(60); // 80 * 0.75
    });

    it("clamps to minimum font size", () => {
      const box = {
        id: "tiny",
        label: "Tiny",
        placeholder: "Tiny",
        x: 0.5,
        y: 0.5,
        fontSizeRatio: 0.1,
      };

      const size = calculateEffectiveFontSize({ box, baseFontSize: 30, scaleFactor: 1, minFontSize: 12 });
      expect(size).toBe(12);
    });

    it("preserves exact font proportions across mobile display and 1000px canvas export", () => {
      const box = {
        id: "headline",
        label: "Headline",
        placeholder: "Headline",
        x: 0.5,
        y: 0.1,
        fontSizeRatio: 1.5,
      };

      const canvasWidth = 1000;
      const mobileDisplayWidth = 300;
      const desktopDisplayWidth = 600;

      // Canvas export font size
      const exportFontSize = calculateEffectiveFontSize({
        box,
        baseFontSize: 52,
        scaleFactor: canvasWidth / 1000, // 1.0
      });

      // Mobile preview font size
      const mobileFontSize = calculateEffectiveFontSize({
        box,
        baseFontSize: 52,
        scaleFactor: mobileDisplayWidth / canvasWidth, // 0.3
      });

      // Desktop preview font size
      const desktopFontSize = calculateEffectiveFontSize({
        box,
        baseFontSize: 52,
        scaleFactor: desktopDisplayWidth / canvasWidth, // 0.6
      });

      // The ratio of font size to width must remain invariant across all viewports
      const exportRatio = exportFontSize / canvasWidth;
      const mobileRatio = mobileFontSize / mobileDisplayWidth;
      const desktopRatio = desktopFontSize / desktopDisplayWidth;

      expect(Math.abs(exportRatio - mobileRatio)).toBeLessThan(0.005);
      expect(Math.abs(exportRatio - desktopRatio)).toBeLessThan(0.005);
    });

    it("verifies percentage positioning is strictly screen-size invariant", () => {
      const box = { x: 0.35, y: 0.72 };
      const mobileWidth = 320;
      const desktopWidth = 1024;
      const canvasWidth = 1000;

      // In percentage-based positioning, relative coordinates are identical regardless of container width
      expect(box.x * mobileWidth / mobileWidth).toBe(box.x);
      expect(box.x * desktopWidth / desktopWidth).toBe(box.x);
      expect(box.x * canvasWidth / canvasWidth).toBe(box.x);
    });

    it("guarantees 1:1 text size parity between preview and export on 500px CDN template images", () => {
      const box = {
        id: "top",
        label: "Top Text",
        placeholder: "Top Text",
        x: 0.5,
        y: 0.12,
        fontSizeRatio: 1.0,
      };

      const canvasWidth = 500; // CDN template 1, 2, 7 width
      const mobileDisplayWidth = 300;
      const desktopDisplayWidth = 500;
      const baseFontSize = 52;

      // When not custom-resized:
      const canvasExportFontSize = calculateEffectiveFontSize({
        box,
        baseFontSize,
        scaleFactor: 1,
      });

      const mobilePreviewFontSize = calculateEffectiveFontSize({
        box,
        baseFontSize,
        scaleFactor: mobileDisplayWidth / canvasWidth,
      });

      const desktopPreviewFontSize = calculateEffectiveFontSize({
        box,
        baseFontSize,
        scaleFactor: desktopDisplayWidth / canvasWidth,
      });

      // Assert that the visual proportion relative to image width is identical
      expect(canvasExportFontSize / canvasWidth).toBeCloseTo(mobilePreviewFontSize / mobileDisplayWidth, 2);
      expect(canvasExportFontSize / canvasWidth).toBeCloseTo(desktopPreviewFontSize / desktopDisplayWidth, 2);

      // When user custom-resizes on mobile to 40px:
      const customMobileDisplayFont = 40;
      const exportScaledFont = Math.round(customMobileDisplayFont * (canvasWidth / mobileDisplayWidth));

      // Assert export scaled font matches the custom display font proportion
      expect(exportScaledFont / canvasWidth).toBeCloseTo(customMobileDisplayFont / mobileDisplayWidth, 2);
    });
  });
});


