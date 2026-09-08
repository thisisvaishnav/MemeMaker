import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  saveImage,
  loadImage,
  clearImage,
  saveTemplateUrl,
  loadTemplateUrl,
  clearTemplateUrl,
  saveCustomTemplate,
  getCustomTemplates,
  getCustomTemplateById,
  deleteCustomTemplate,
  type CustomTemplate,
} from "../src/lib/imageStore";

describe("Client Image & Template Storage (lib/imageStore.ts)", () => {
  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();
    await clearImage();
    await clearTemplateUrl();

    // Clear indexedDB stores
    const templates = await getCustomTemplates();
    for (const t of templates) {
      await deleteCustomTemplate(t.id);
    }
  });

  it("saves and loads pending meme image across storages", async () => {
    const dataUrl = "data:image/png;base64,samplePendingImage";
    await saveImage(dataUrl);

    const loaded = await loadImage();
    expect(loaded).toBe(dataUrl);
  });

  it("clears pending meme image from all storages", async () => {
    const dataUrl = "data:image/png;base64,samplePendingImage";
    await saveImage(dataUrl);
    await clearImage();

    const loaded = await loadImage();
    expect(loaded).toBeNull();
    expect(localStorage.getItem("pending-meme-image")).toBeNull();
  });

  it("saves, loads, and clears template URLs", async () => {
    const tplUrl = "/templates/cdn/5.webp";
    await saveTemplateUrl(tplUrl);

    const loaded = await loadTemplateUrl();
    expect(loaded).toBe(tplUrl);

    await clearTemplateUrl();
    expect(await loadTemplateUrl()).toBeNull();
  });

  it("saves, retrieves, and deletes custom templates", async () => {
    const template: CustomTemplate = {
      id: "test-tpl-1",
      name: "My Meme Template",
      dataUrl: "data:image/webp;base64,abc123",
      createdAt: Date.now(),
    };

    await saveCustomTemplate(template);

    const all = await getCustomTemplates();
    expect(all).toHaveLength(1);
    expect(all[0].name).toBe("My Meme Template");

    const single = await getCustomTemplateById("test-tpl-1");
    expect(single).not.toBeNull();
    expect(single?.name).toBe("My Meme Template");

    await deleteCustomTemplate("test-tpl-1");
    const afterDelete = await getCustomTemplates();
    expect(afterDelete).toHaveLength(0);
    expect(await getCustomTemplateById("test-tpl-1")).toBeNull();
  });

  it("filters custom templates by userId", async () => {
    const tplUser1: CustomTemplate = {
      id: "u1-tpl",
      name: "User 1 Template",
      dataUrl: "data:image/png;base64,user1",
      userId: "user-123",
      createdAt: Date.now(),
    };
    const tplUser2: CustomTemplate = {
      id: "u2-tpl",
      name: "User 2 Template",
      dataUrl: "data:image/png;base64,user2",
      userId: "user-456",
      createdAt: Date.now() + 10,
    };
    const tplPublic: CustomTemplate = {
      id: "pub-tpl",
      name: "Public Template",
      dataUrl: "data:image/png;base64,pub",
      createdAt: Date.now() + 20,
    };

    await saveCustomTemplate(tplUser1);
    await saveCustomTemplate(tplUser2);
    await saveCustomTemplate(tplPublic);

    const user1Templates = await getCustomTemplates("user-123");
    expect(user1Templates.map((t) => t.id)).toContain("u1-tpl");
    expect(user1Templates.map((t) => t.id)).toContain("pub-tpl");
    expect(user1Templates.map((t) => t.id)).not.toContain("u2-tpl");
  });

  it("ensures getCustomTemplates returns empty array when IndexedDB is empty rather than reviving stale localStorage", async () => {
    // Put a stale template into localStorage directly
    localStorage.setItem(
      "mememaker_custom_templates",
      JSON.stringify([
        {
          id: "stale-tpl",
          name: "Stale Template",
          dataUrl: "stale-data",
          createdAt: Date.now() - 1000,
        },
      ])
    );

    // If IndexedDB is empty (e.g. after deletion), it should return empty array and not revive stale localStorage!
    const templates = await getCustomTemplates();
    expect(templates).toEqual([]);
  });

  it("recovers and does not return stale image when localStorage quota is exceeded", async () => {
    // 1. Store small image 1 in localStorage
    const oldImage = "data:image/png;base64,oldImage1";
    await saveImage(oldImage);
    expect(await loadImage()).toBe(oldImage);

    // 2. Now simulate localStorage throwing QuotaExceededError for large new image
    const newImage = "data:image/png;base64,newVeryLargeImage2";
    const originalSetItem = Storage.prototype.setItem;
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key: string, val: string) {
      if (key === "pending-meme-image" && val === newImage) {
        throw new DOMException("QuotaExceededError", "QuotaExceededError");
      }
      return originalSetItem.call(this, key, val);
    });

    try {
      await saveImage(newImage);
      // loadImage should return the NEW image (from IndexedDB), NOT the old stale image!
      const loaded = await loadImage();
      expect(loaded).toBe(newImage);
    } finally {
      spy.mockRestore();
    }
  });
});
