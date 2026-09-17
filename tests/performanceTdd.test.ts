import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  fetchTemplates,
  clearTemplateCache,
  saveTemplate,
  createTemplate,
  FALLBACK_TEMPLATES,
} from "../src/lib/templatesDb";
import { hasActiveSupabaseSession } from "../src/lib/authUtils";
import { paginateItems } from "../src/lib/pagination";
import { matchesTemplateSearch } from "../src/lib/templateSearch";
import { TEMPLATE_NAMES, TEMPLATE_ALIAS_MAP } from "../src/components/MemeMaker";

describe("TDD Workflow: Performance & Caching Guarantees", () => {
  beforeEach(() => {
    clearTemplateCache();
    sessionStorage.clear();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /* ─────────────────────────────────────────────────────────────
     Journey 1: Template Caching & Invalidation
     ───────────────────────────────────────────────────────────── */
  describe("Journey 1: Template Response Caching & Invalidation", () => {
    it("caches template responses and returns identical results on subsequent calls", async () => {
      const first = await fetchTemplates();
      expect(first.length).toBeGreaterThanOrEqual(20);

      const second = await fetchTemplates();
      expect(second).toEqual(first);
    });

    it("persists cached templates in sessionStorage for instant cross-tab/reload recovery", async () => {
      await fetchTemplates();
      const raw = sessionStorage.getItem("mememaker_db_templates_cache");
      expect(raw).not.toBeNull();
      const parsed = JSON.parse(raw!);
      expect(Array.isArray(parsed.data)).toBe(true);
      expect(parsed.data.length).toBeGreaterThanOrEqual(20);
      expect(parsed.timestamp).toBeGreaterThan(0);
    });

    it("clearTemplateCache() flushes in-memory and sessionStorage cache", async () => {
      await fetchTemplates();
      expect(sessionStorage.getItem("mememaker_db_templates_cache")).not.toBeNull();

      clearTemplateCache();
      expect(sessionStorage.getItem("mememaker_db_templates_cache")).toBeNull();
    });

    it("forceRefresh=true bypasses the cache and fetches fresh data", async () => {
      await fetchTemplates();
      const fresh = await fetchTemplates(true);
      expect(fresh.length).toBeGreaterThanOrEqual(20);
    });

    it("saveTemplate invalidates the template cache so updates are never stale", async () => {
      await fetchTemplates();
      expect(sessionStorage.getItem("mememaker_db_templates_cache")).not.toBeNull();

      await saveTemplate({
        id: 1,
        name: "Confused Nick Young (Updated)",
      });

      expect(sessionStorage.getItem("mememaker_db_templates_cache")).toBeNull();
    });

    it("createTemplate invalidates the template cache", async () => {
      await fetchTemplates();
      expect(sessionStorage.getItem("mememaker_db_templates_cache")).not.toBeNull();

      await createTemplate({
        name: "New TDD Template",
        slug: "new-tdd-template",
        image_url: "/templates/cdn/1.webp",
        boxes: [],
        is_active: true,
        display_order: 99,
      });

      expect(sessionStorage.getItem("mememaker_db_templates_cache")).toBeNull();
    });
  });

  /* ─────────────────────────────────────────────────────────────
     Journey 2: Debounced Template Search
     ───────────────────────────────────────────────────────────── */
  describe("Journey 2: Template Search Matching Logic", () => {
    it("matches templates by id number", () => {
      expect(matchesTemplateSearch(8, "8", TEMPLATE_NAMES, TEMPLATE_ALIAS_MAP)).toBe(true);
      expect(matchesTemplateSearch(8, "9", TEMPLATE_NAMES, TEMPLATE_ALIAS_MAP)).toBe(false);
    });

    it("matches templates by title case-insensitively", () => {
      expect(matchesTemplateSearch(18, "disaster", TEMPLATE_NAMES, TEMPLATE_ALIAS_MAP)).toBe(true);
      expect(matchesTemplateSearch(18, "DISASTER GIRL", TEMPLATE_NAMES, TEMPLATE_ALIAS_MAP)).toBe(true);
      expect(matchesTemplateSearch(18, "drake", TEMPLATE_NAMES, TEMPLATE_ALIAS_MAP)).toBe(false);
    });

    it("matches templates by alias", () => {
      expect(matchesTemplateSearch(8, "doge", TEMPLATE_NAMES, TEMPLATE_ALIAS_MAP)).toBe(true);
      expect(matchesTemplateSearch(8, "cheems", TEMPLATE_NAMES, TEMPLATE_ALIAS_MAP)).toBe(true);
      expect(matchesTemplateSearch(20, "harold", TEMPLATE_NAMES, TEMPLATE_ALIAS_MAP)).toBe(true);
      expect(matchesTemplateSearch(15, "panik", TEMPLATE_NAMES, TEMPLATE_ALIAS_MAP)).toBe(true);
    });

    it("returns true for empty or whitespace query", () => {
      expect(matchesTemplateSearch(1, "", TEMPLATE_NAMES, TEMPLATE_ALIAS_MAP)).toBe(true);
      expect(matchesTemplateSearch(1, "   ", TEMPLATE_NAMES, TEMPLATE_ALIAS_MAP)).toBe(true);
    });
  });

  /* ─────────────────────────────────────────────────────────────
     Journey 3: Large Template List Pagination / Slicing
     ───────────────────────────────────────────────────────────── */
  describe("Journey 3: List Pagination / Slicing Helper", () => {
    const sampleItems = Array.from({ length: 25 }, (_, i) => ({ id: i + 1, name: `Template ${i + 1}` }));

    it("slices items correctly for first page", () => {
      const result = paginateItems(sampleItems, 1, 10);
      expect(result.items.length).toBe(10);
      expect(result.items[0].id).toBe(1);
      expect(result.items[9].id).toBe(10);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(3);
      expect(result.hasNext).toBe(true);
      expect(result.hasPrev).toBe(false);
      expect(result.totalItems).toBe(25);
    });

    it("slices items correctly for last partial page", () => {
      const result = paginateItems(sampleItems, 3, 10);
      expect(result.items.length).toBe(5);
      expect(result.items[0].id).toBe(21);
      expect(result.items[4].id).toBe(25);
      expect(result.hasNext).toBe(false);
      expect(result.hasPrev).toBe(true);
    });

    it("clamps out-of-range page numbers gracefully", () => {
      const resultUnder = paginateItems(sampleItems, 0, 10);
      expect(resultUnder.page).toBe(1);

      const resultOver = paginateItems(sampleItems, 999, 10);
      expect(resultOver.page).toBe(3);
      expect(resultOver.items.length).toBe(5);
    });

    it("handles empty items array without throwing", () => {
      const result = paginateItems([], 1, 10);
      expect(result.items).toEqual([]);
      expect(result.totalItems).toBe(0);
      expect(result.totalPages).toBe(1);
      expect(result.hasNext).toBe(false);
      expect(result.hasPrev).toBe(false);
    });
  });

  /* ─────────────────────────────────────────────────────────────
     Journey 4: Session Detection & Lazy Auth Initialization
     ───────────────────────────────────────────────────────────── */
  describe("Journey 4: Session Detection Helper (hasActiveSupabaseSession)", () => {
    it("returns false when localStorage is empty", () => {
      expect(hasActiveSupabaseSession()).toBe(false);
    });

    it("returns true when a Supabase auth token is present in localStorage", () => {
      localStorage.setItem("sb-xmlcrgqhyxzmxwzuyaum-auth-token", JSON.stringify({ access_token: "xyz" }));
      expect(hasActiveSupabaseSession()).toBe(true);
    });

    it("ignores unrelated localStorage items", () => {
      localStorage.setItem("theme", "dark");
      localStorage.setItem("user_preferences", "compact");
      expect(hasActiveSupabaseSession()).toBe(false);
    });

    it("handles storage exceptions gracefully", () => {
      const mockStorage = {
        get length() {
          throw new Error("Storage access denied");
        },
        key: () => {
          throw new Error("Storage access denied");
        },
      } as unknown as Storage;

      expect(hasActiveSupabaseSession(mockStorage)).toBe(false);
    });
  });
});
