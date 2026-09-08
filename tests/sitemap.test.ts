import { describe, it, expect } from "vitest";
import { GET } from "../src/pages/sitemap.xml";

describe("Sitemap Generator (pages/sitemap.xml.ts)", () => {
  it("generates valid XML sitemap containing all critical routes", async () => {
    const response = await GET({} as any);
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/xml");

    const xml = await response.text();
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');

    const expectedRoutes = [
      "https://mememaker.com/",
      "https://mememaker.com/about/",
      "https://mememaker.com/contact/",
      "https://mememaker.com/edit/",
      "https://mememaker.com/privacy/",
      "https://mememaker.com/templates/",
      "https://mememaker.com/terms/",
    ];

    for (const route of expectedRoutes) {
      expect(xml).toContain(`<loc>${route}</loc>`);
    }
  });
});
