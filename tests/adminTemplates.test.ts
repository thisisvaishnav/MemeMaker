import { describe, it, expect, beforeEach } from "vitest";
import {
  FALLBACK_TEMPLATES,
  fetchTemplates,
  fetchAllAdminTemplates,
} from "../src/lib/templatesDb";
import { adminSignIn, adminSignOut, getAdminSession } from "../src/lib/adminAuth";

describe("Admin & Database Templates (lib/templatesDb.ts & lib/adminAuth.ts)", () => {
  it("FALLBACK_TEMPLATES contains 20 pre-configured templates with boxes", () => {
    expect(FALLBACK_TEMPLATES.length).toBe(20);
    for (const tpl of FALLBACK_TEMPLATES) {
      expect(tpl.id).toBeGreaterThanOrEqual(1);
      expect(tpl.name).toBeDefined();
      expect(tpl.image_url).toBeDefined();
      expect(tpl.boxes).toBeDefined();
      expect(tpl.boxes.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("fetchTemplates returns fallback templates when database is uninitialized", async () => {
    const templates = await fetchTemplates();
    expect(templates).toBeDefined();
    expect(templates.length).toBeGreaterThanOrEqual(20);
    expect(templates[0].boxes).toBeDefined();
  });

  it("fetchAllAdminTemplates returns list of templates", async () => {
    const templates = await fetchAllAdminTemplates();
    expect(templates).toBeDefined();
    expect(templates.length).toBeGreaterThanOrEqual(20);
  });

  it("adminSignIn returns clean error on bad credentials without crashing", async () => {
    const res = await adminSignIn("invalid@admin.test", "badpassword123");
    expect(res.success).toBe(false);
    expect(res.error).toBeDefined();
  });

  it("adminSignOut cleanly removes session flag", async () => {
    await adminSignOut();
    const session = await getAdminSession();
    expect(session).toBeNull();
  });

  it("saveTemplate preserves box rotation, maxWidthRatio, and fontSizeRatio", async () => {
    const { saveTemplate } = await import("../src/lib/templatesDb");
    const testBoxes = [
      {
        id: "box-rot",
        label: "Text #1",
        placeholder: "Text #1",
        x: 0.45,
        y: 0.25,
        rotation: 45,
        maxWidthRatio: 0.65,
        fontSizeRatio: 1.25,
        fontSize: 48,
        fontFamily: "Anton, Impact, sans-serif",
        textAlign: "center" as const,
      },
      {
        id: "box-straight",
        label: "Text #2",
        placeholder: "Text #2",
        x: 0.5,
        y: 0.8,
        rotation: 0,
        maxWidthRatio: 0.8,
        fontSizeRatio: 1.0,
        fontSize: 32,
        fontFamily: "'Comic Sans MS', cursive, sans-serif",
        textAlign: "center" as const,
      },
    ];

    const result = await saveTemplate({
      id: 1,
      name: "Confused Nick Young",
      boxes: testBoxes,
    });

    expect(result.success).toBe(true);

    const all = await fetchTemplates();
    const updated = all.find((t) => t.id === 1);
    expect(updated).toBeDefined();
    expect(updated?.boxes).toBeDefined();
    const rotBox = updated?.boxes.find((b) => b.id === "box-rot");
    expect(rotBox).toBeDefined();
    expect(rotBox?.rotation).toBe(45);
    expect(rotBox?.maxWidthRatio).toBe(0.65);
    expect(rotBox?.fontSizeRatio).toBe(1.25);
    expect(rotBox?.fontSize).toBe(48);
    expect(rotBox?.fontFamily).toBe("Anton, Impact, sans-serif");
    expect(rotBox?.label).toBe("Text #1");

    const straightBox = updated?.boxes.find((b) => b.id === "box-straight");
    expect(straightBox?.fontFamily).toBe("'Comic Sans MS', cursive, sans-serif");
  });

  it("AVAILABLE_MEME_FONTS provides curated meme and typography fonts including plain black slim text", async () => {
    const { AVAILABLE_MEME_FONTS, isPlainBoxStyle } = await import("../src/lib/templateBoxes");
    expect(AVAILABLE_MEME_FONTS).toBeDefined();
    expect(AVAILABLE_MEME_FONTS.length).toBeGreaterThanOrEqual(9);
    const fontIds = AVAILABLE_MEME_FONTS.map((f) => f.id);
    expect(fontIds).toContain("impact");
    expect(fontIds).toContain("plain-black");
    expect(fontIds).toContain("anton");
    expect(fontIds).toContain("bebas-neue");
    expect(fontIds).toContain("montserrat");
    expect(fontIds).toContain("comic-sans");

    expect(isPlainBoxStyle({ isPlain: true })).toBe(true);
    expect(isPlainBoxStyle({ fontFamily: "Inter, system-ui, -apple-system, sans-serif" })).toBe(true);
    expect(isPlainBoxStyle({ fontFamily: "Impact, 'Arial Black', sans-serif" })).toBe(false);
  });
});
