import { supabase } from "./supabase";

export interface AdminUser {
  id: string;
  email: string;
}

/**
 * Signs in as admin using email and password
 */
export async function adminSignIn(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; user?: AdminUser }> {
  try {
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    if (authError || !authData.user) {
      return { success: false, error: authError?.message || "Invalid credentials" };
    }

    const user = authData.user;

    // Check admin table in database
    const { data: adminRow, error: adminErr } = await supabase
      .from("admin_users")
      .select("id, email")
      .eq("id", user.id)
      .maybeSingle();

    // If admin_users table exists and user is not in it:
    if (!adminErr && !adminRow) {
      // Check if admin_users is empty - if so, allow first user or check email
      const { count } = await supabase
        .from("admin_users")
        .select("*", { count: "exact", head: true });

      if (count !== null && count > 0) {
        await supabase.auth.signOut();
        return {
          success: false,
          error: "Access denied. This account does not have admin privileges.",
        };
      }
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("mememaker_admin_logged_in", "true");
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email || email,
      },
    };
  } catch (err: any) {
    return { success: false, error: err?.message || "Sign in failed" };
  }
}

/**
 * Signs out admin
 */
export async function adminSignOut(): Promise<void> {
  if (typeof window !== "undefined") {
    localStorage.removeItem("mememaker_admin_logged_in");
  }
  await supabase.auth.signOut();
}

/**
 * Checks if current active session belongs to an admin
 */
export async function getAdminSession(): Promise<AdminUser | null> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session || !session.user) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("mememaker_admin_logged_in");
      }
      return null;
    }

    return {
      id: session.user.id,
      email: session.user.email || "",
    };
  } catch {
    return null;
  }
}
