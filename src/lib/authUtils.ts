/**
 * authUtils.ts - Utility functions for Supabase OAuth URL handling, error parsing, and redirection
 */

export interface ParsedAuthParams {
  error?: string;
  errorCode?: string;
  errorDescription?: string;
  code?: string;
  hasAuthParams: boolean;
  cleanUrl: string;
}

/**
 * Returns a clean redirect URL for OAuth based on the current location.
 * Strips query parameters and hash fragments so user lands back cleanly on the current path.
 */
export function getOAuthRedirectUrl(currentHref: string): string {
  try {
    const url = new URL(currentHref);
    return `${url.origin}${url.pathname}`;
  } catch {
    return currentHref;
  }
}

/**
 * Parses OAuth parameters (error, error_code, error_description, code) from a URL string
 * checking both search query parameters and hash fragments.
 * Also generates a clean URL with all auth-related parameters removed while preserving other params.
 */
export function parseOAuthUrlParams(currentHref: string): ParsedAuthParams {
  try {
    const url = new URL(currentHref);
    const searchParams = url.searchParams;

    // Supabase can return errors or tokens in either query string or hash fragment
    const hashStr = url.hash.startsWith("#") ? url.hash.substring(1) : url.hash;
    const hashParams = new URLSearchParams(hashStr);

    const error =
      searchParams.get("error") || hashParams.get("error") || undefined;
    const errorCode =
      searchParams.get("error_code") ||
      hashParams.get("error_code") ||
      undefined;
    const errorDescription =
      searchParams.get("error_description") ||
      hashParams.get("error_description") ||
      undefined;
    const code =
      searchParams.get("code") || hashParams.get("code") || undefined;

    const hasAuthParams = Boolean(error || errorCode || errorDescription || code);

    // Build clean URL
    const clean = new URL(currentHref);
    clean.searchParams.delete("error");
    clean.searchParams.delete("error_code");
    clean.searchParams.delete("error_description");
    clean.searchParams.delete("code");

    // Also clean hash if it contains auth params
    if (
      hashParams.has("error") ||
      hashParams.has("error_code") ||
      hashParams.has("error_description") ||
      hashParams.has("access_token")
    ) {
      hashParams.delete("error");
      hashParams.delete("error_code");
      hashParams.delete("error_description");
      hashParams.delete("access_token");
      hashParams.delete("refresh_token");
      hashParams.delete("token_type");
      hashParams.delete("expires_in");
      hashParams.delete("expires_at");
      const remainingHash = hashParams.toString();
      clean.hash = remainingHash ? `#${remainingHash}` : "";
    }

    const cleanSearch = clean.searchParams.toString();
    const cleanUrl = `${clean.origin}${clean.pathname}${cleanSearch ? `?${cleanSearch}` : ""}${clean.hash}`;

    return {
      error,
      errorCode,
      errorDescription: errorDescription
        ? decodeURIComponent(errorDescription.replace(/\+/g, " "))
        : undefined,
      code,
      hasAuthParams,
      cleanUrl,
    };
  } catch {
    return {
      hasAuthParams: false,
      cleanUrl: currentHref,
    };
  }
}

/**
 * Returns a human-friendly error message for OAuth failures.
 */
export function getOAuthErrorMessage(
  error?: string,
  description?: string
): string {
  if (!error && !description) {
    return "Sign in with Google could not be completed.";
  }

  if (error === "access_denied") {
    return "Google sign-in was canceled or access was denied. If your Google OAuth app is in Testing mode, ensure your Google email is added as a Test User in the Google Cloud Console.";
  }

  if (error === "unauthorized_client") {
    return "This application is not authorized for Google sign-in. Check your Google Client ID configuration.";
  }

  if (error === "redirect_uri_mismatch") {
    return "Redirect URL mismatch. Ensure your site URL and callback URLs are configured in Supabase and Google Cloud Console.";
  }

  if (description) {
    return description;
  }

  return `Authentication error (${error}). Please try again.`;
}
