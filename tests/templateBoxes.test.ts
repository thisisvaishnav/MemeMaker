import { describe, it, expect } from "vitest";
import {
  TEMPLATE_BOXES,
  DEFAULT_BOXES,
  getTemplateBoxes,
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
