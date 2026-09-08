import { describe, it, expect } from "vitest";
import { generateAvatarUrl, getUserAvatarUrl } from "../src/lib/avatar";

describe("Avatar Generation (lib/avatar.ts)", () => {
  it("generates deterministic avatar URLs for a given seed", () => {
    const url1 = generateAvatarUrl("test@example.com");
    const url2 = generateAvatarUrl("test@example.com");
    expect(url1).toBe(url2);
    expect(url1).toContain("https://api.dicebear.com/9.x/");
    expect(url1).toContain("seed=test%40example.com");
    expect(url1).toContain("radius=50");
    expect(url1).toContain("size=128");
  });

  it("supports explicit avatar styles", () => {
    const url = generateAvatarUrl("alice", "lorelei");
    expect(url).toContain("/lorelei/svg");
  });

  it("prefers Google OAuth picture over generated avatar", () => {
    const user = {
      email: "googleuser@gmail.com",
      user_metadata: {
        picture: "https://lh3.googleusercontent.com/a/custom-photo",
      },
    };
    const avatar = getUserAvatarUrl(user);
    expect(avatar).toBe("https://lh3.googleusercontent.com/a/custom-photo");
  });

  it("prefers avatar_url over generated avatar if provided", () => {
    const user = {
      email: "user@example.com",
      user_metadata: {
        avatar_url: "https://example.com/avatar.jpg",
      },
    };
    const avatar = getUserAvatarUrl(user);
    expect(avatar).toBe("https://example.com/avatar.jpg");
  });

  it("generates avatar from email when metadata has no photo", () => {
    const user = {
      email: "hello@mememaker.com",
      user_metadata: {},
    };
    const avatar = getUserAvatarUrl(user);
    expect(avatar).not.toBeNull();
    expect(avatar).toContain("https://api.dicebear.com/9.x/");
  });

  it("returns null when neither photo nor email is available", () => {
    const user = {
      email: null,
      user_metadata: {},
    };
    expect(getUserAvatarUrl(user)).toBeNull();
  });
});
