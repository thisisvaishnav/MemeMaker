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
});
