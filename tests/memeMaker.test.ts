import { describe, it, expect } from "vitest";
import { TEMPLATE_NAMES, TEMPLATE_ALIAS_MAP } from "../src/components/MemeMaker";

describe("MemeMaker Template & Logic (components/MemeMaker.tsx)", () => {
  it("contains 20 predefined template names", () => {
    expect(Object.keys(TEMPLATE_NAMES).length).toBe(20);
    for (let i = 1; i <= 20; i++) {
      expect(TEMPLATE_NAMES[i]).toBeDefined();
      expect(typeof TEMPLATE_NAMES[i]).toBe("string");
      expect(TEMPLATE_NAMES[i].length).toBeGreaterThan(0);
    }
  });

  it("maps 'doge' to Buff Doge vs. Cheems (id: 8), NOT Harold (id: 20)", () => {
    expect(TEMPLATE_ALIAS_MAP["doge"]).toBe(8);
  });

  it("maps 'harold' and 'hide-the-pain-harold' to id: 20", () => {
    expect(TEMPLATE_ALIAS_MAP["harold"]).toBe(20);
    expect(TEMPLATE_ALIAS_MAP["hide-the-pain-harold"]).toBe(20);
  });

  it("maps all aliases to valid template ids between 1 and 20", () => {
    for (const [alias, id] of Object.entries(TEMPLATE_ALIAS_MAP)) {
      expect(id).toBeGreaterThanOrEqual(1);
      expect(id).toBeLessThanOrEqual(20);
      expect(TEMPLATE_NAMES[id]).toBeDefined();
    }
  });

  it("includes aliases for popular templates", () => {
    expect(TEMPLATE_ALIAS_MAP["disaster-girl"]).toBe(18);
    expect(TEMPLATE_ALIAS_MAP["expanding-brain"]).toBe(16);
    expect(TEMPLATE_ALIAS_MAP["change-my-mind"]).toBe(5);
    expect(TEMPLATE_ALIAS_MAP["distracted-boyfriend"]).toBe(6);
    expect(TEMPLATE_ALIAS_MAP["woman-yelling-at-cat"]).toBe(7);
  });
});
