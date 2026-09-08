import { describe, it, expect, beforeEach } from "vitest";
import {
  getLandingTemplatesLayout,
  getTrendingTemplates,
} from "../src/lib/templateCache";

describe("Landing Template Cache (lib/templateCache.ts)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("generates correct number of layout cards with valid bounds", () => {
    const layout = getLandingTemplatesLayout(20);
    expect(layout).toHaveLength(20);

    layout.forEach((card) => {
      expect(card.templateId).toBeGreaterThanOrEqual(1);
      expect(card.templateId).toBeLessThanOrEqual(20);
      expect(card.width).toMatch(/^\d+(\.\d+)?rem$/);
      expect(card.left).toMatch(/^-?\d+(\.\d+)?%$/);
      expect(card.top).toMatch(/^-?\d+(\.\d+)?%$/);
      expect(card.rotation).toMatch(/^-?\d+(\.\d+)?deg$/);
    });
  });

  it("caches the layout in localStorage and reuses it on subsequent calls", () => {
    const firstCall = getLandingTemplatesLayout(20);
    const secondCall = getLandingTemplatesLayout(20);

    expect(secondCall).toEqual(firstCall);

    // Verify localStorage has the raw JSON
    const stored = localStorage.getItem("mememaker_landing_layout_v2");
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored!)).toEqual(firstCall);
  });

  it("regenerates gracefully if localStorage has corrupted or wrong-length data", () => {
    localStorage.setItem("mememaker_landing_layout_v2", "corrupted-json{");
    const layout = getLandingTemplatesLayout(20);
    expect(layout).toHaveLength(20);

    // Wrong length
    localStorage.setItem(
      "mememaker_landing_layout_v2",
      JSON.stringify([{ templateId: 1 }])
    );
    const regenerated = getLandingTemplatesLayout(20);
    expect(regenerated).toHaveLength(20);
  });

  it("persists trending templates in localStorage", () => {
    const trending1 = getTrendingTemplates(10);
    expect(trending1).toHaveLength(10);

    const trending2 = getTrendingTemplates(10);
    expect(trending2).toEqual(trending1);
  });
});
