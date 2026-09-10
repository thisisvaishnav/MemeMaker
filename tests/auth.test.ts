import { describe, it, expect } from "vitest";
import {
  getOAuthRedirectUrl,
  parseOAuthUrlParams,
  getOAuthErrorMessage,
} from "../src/lib/authUtils";

describe("OAuth Utilities (lib/authUtils.ts)", () => {
  describe("getOAuthRedirectUrl", () => {
    it("strips query parameters and hash fragments", () => {
      const url = "http://localhost:4321/templates?sort=popular#section2";
      expect(getOAuthRedirectUrl(url)).toBe("http://localhost:4321/templates");
    });

    it("works with root path", () => {
      const url = "https://realmememaker.com/?code=123";
      expect(getOAuthRedirectUrl(url)).toBe("https://realmememaker.com/");
    });

    it("handles plain URL without query or hash", () => {
      const url = "http://localhost:4321/edit";
      expect(getOAuthRedirectUrl(url)).toBe("http://localhost:4321/edit");
    });
  });

  describe("parseOAuthUrlParams", () => {
    it("detects error in query parameters", () => {
      const url =
        "http://localhost:4321/?error=access_denied&error_code=403&error_description=User+denied+access";
      const result = parseOAuthUrlParams(url);

      expect(result.hasAuthParams).toBe(true);
      expect(result.error).toBe("access_denied");
      expect(result.errorCode).toBe("403");
      expect(result.errorDescription).toBe("User denied access");
      expect(result.cleanUrl).toBe("http://localhost:4321/");
    });

    it("detects code in query parameters and produces cleanUrl", () => {
      const url = "http://localhost:4321/?code=abcdef-123456";
      const result = parseOAuthUrlParams(url);

      expect(result.hasAuthParams).toBe(true);
      expect(result.code).toBe("abcdef-123456");
      expect(result.cleanUrl).toBe("http://localhost:4321/");
    });

    it("preserves non-auth query parameters in cleanUrl", () => {
      const url =
        "http://localhost:4321/templates?template=drake&error=access_denied&page=2";
      const result = parseOAuthUrlParams(url);

      expect(result.hasAuthParams).toBe(true);
      expect(result.error).toBe("access_denied");
      expect(result.cleanUrl).toBe(
        "http://localhost:4321/templates?template=drake&page=2"
      );
    });

    it("detects error in hash fragments (implicit flow fallback)", () => {
      const url =
        "http://localhost:4321/#error=unauthorized_client&error_description=App+unauthorized";
      const result = parseOAuthUrlParams(url);

      expect(result.hasAuthParams).toBe(true);
      expect(result.error).toBe("unauthorized_client");
      expect(result.errorDescription).toBe("App unauthorized");
      expect(result.cleanUrl).toBe("http://localhost:4321/");
    });

    it("returns hasAuthParams: false for clean URLs", () => {
      const url = "http://localhost:4321/templates?category=trending";
      const result = parseOAuthUrlParams(url);

      expect(result.hasAuthParams).toBe(false);
      expect(result.error).toBeUndefined();
      expect(result.cleanUrl).toBe(url);
    });
  });

  describe("getOAuthErrorMessage", () => {
    it("provides helpful message for access_denied", () => {
      const msg = getOAuthErrorMessage("access_denied");
      expect(msg).toContain("Google sign-in was canceled or access was denied");
      expect(msg).toContain("Testing mode");
    });

    it("provides helpful message for unauthorized_client", () => {
      const msg = getOAuthErrorMessage("unauthorized_client");
      expect(msg).toContain("not authorized for Google sign-in");
    });

    it("uses description if provided and no specific code matched", () => {
      const msg = getOAuthErrorMessage(
        "custom_error",
        "Something specific happened"
      );
      expect(msg).toBe("Something specific happened");
    });

    it("returns default message when no error given", () => {
      const msg = getOAuthErrorMessage();
      expect(msg).toBe("Sign in with Google could not be completed.");
    });
  });
});
