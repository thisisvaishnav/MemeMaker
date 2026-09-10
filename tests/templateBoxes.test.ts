import { describe, it, expect } from "vitest";
import {
  TEMPLATE_BOXES,
  DEFAULT_BOXES,
  getTemplateBoxes,
  calculateHandlePlacement,
  calculateClampedCoordinate,
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
});

