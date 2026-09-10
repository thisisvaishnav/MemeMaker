import { supabase } from "./supabase";
import {
  TEMPLATE_BOXES,
  type TemplateTextBox,
  DEFAULT_BOXES,
} from "./templateBoxes";

export interface DbTemplate {
  id: number;
  slug: string;
  name: string;
  image_url: string;
  boxes: TemplateTextBox[];
  is_active: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export const FALLBACK_TEMPLATES: DbTemplate[] = Object.entries(TEMPLATE_BOXES).map(
  ([idStr, boxes]) => {
    const id = parseInt(idStr, 10);
    const names: Record<number, string> = {
      1: "Confused Nick Young",
      2: "Left Exit 12 - Car Swerving",
      3: "Two Buttons",
      4: "Epic Handshake",
      5: "Change My Mind",
      6: "Distracted Boyfriend",
      7: "Woman Yelling at Cat",
      8: "Buff Doge vs. Cheems",
      9: "Bernie I Am Once Again Asking",
      10: "Always Has Been",
      11: "Jim Halpert Explaining to Whiteboard",
      12: "Leonardo DiCaprio Laughing",
      13: "Anakin and Padme",
      14: "Trade Offer",
      15: "Panik Kalm Panik",
      16: "Expanding Brain",
      17: "Is This a Pigeon?",
      18: "Disaster Girl",
      19: "They're the Same Picture",
      20: "Hide the Pain Harold",
    };
    return {
      id,
      slug: `template-${id}`,
      name: names[id] || `Template ${id}`,
      image_url: `/templates/cdn/${id}.webp`,
      boxes,
      is_active: true,
      display_order: id,
    };
  }
);

async function queryWithTimeout<T>(
  queryFn: () => Promise<T>,
  fallback: T,
  timeoutMs = 1500
): Promise<T> {
  const isPlaceholder = (supabase as any).supabaseUrl?.includes("placeholder");
  if (isPlaceholder) return fallback;

  let timer: any;
  const timeoutPromise = new Promise<T>((resolve) => {
    timer = setTimeout(() => resolve(fallback), timeoutMs);
  });

  return Promise.race([
    queryFn()
      .then((res) => {
        clearTimeout(timer);
        return res;
      })
      .catch(() => {
        clearTimeout(timer);
        return fallback;
      }),
    timeoutPromise,
  ]);
}

const LOCAL_STORAGE_KEY = "mememaker_template_overrides";

function getLocalOverrides(): Record<number, Partial<DbTemplate>> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalOverride(template: Partial<DbTemplate> & { id: number }) {
  if (typeof window === "undefined") return;
  try {
    const current = getLocalOverrides();
    current[template.id] = { ...current[template.id], ...template };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));
  } catch (err) {
    console.warn("Could not save to localStorage", err);
  }
}

function applyLocalOverrides(templates: DbTemplate[]): DbTemplate[] {
  const overrides = getLocalOverrides();
  return templates.map((t) => {
    if (overrides[t.id]) {
      return { ...t, ...overrides[t.id] };
    }
    return t;
  });
}

/**
 * Fetches all active templates from Supabase, falling back to local defaults if DB not initialized
 */
export async function fetchTemplates(): Promise<DbTemplate[]> {
  const baseList = await queryWithTimeout(async () => {
    const { data, error } = await supabase
      .from("templates")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return FALLBACK_TEMPLATES;
    }

    return data as DbTemplate[];
  }, FALLBACK_TEMPLATES);

  return applyLocalOverrides(baseList);
}

/**
 * Fetches all templates (active and inactive) for the admin panel
 */
export async function fetchAllAdminTemplates(): Promise<DbTemplate[]> {
  const baseList = await queryWithTimeout(async () => {
    const { data, error } = await supabase
      .from("templates")
      .select("*")
      .order("display_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return FALLBACK_TEMPLATES;
    }

    return data as DbTemplate[];
  }, FALLBACK_TEMPLATES);

  return applyLocalOverrides(baseList);
}

/**
 * Updates a template's default boxes and settings
 */
export async function saveTemplate(
  template: Partial<DbTemplate> & { id: number }
): Promise<{ success: boolean; savedLocally?: boolean; error?: string }> {
  // Always save to browser localStorage first so changes work immediately
  saveLocalOverride(template);

  try {
    const isPlaceholder = (supabase as any).supabaseUrl?.includes("placeholder");
    if (isPlaceholder) {
      return { success: true, savedLocally: true };
    }

    const { error } = await supabase
      .from("templates")
      .upsert({
        id: template.id,
        slug: template.slug || `template-${template.id}`,
        name: template.name,
        image_url: template.image_url,
        boxes: template.boxes || DEFAULT_BOXES,
        is_active: template.is_active ?? true,
        display_order: template.display_order ?? template.id,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      return { success: false, savedLocally: true, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, savedLocally: true, error: err?.message || "Unknown error" };
  }
}

/**
 * Creates a brand new template in Supabase
 */
export async function createTemplate(
  newTemplate: Omit<DbTemplate, "id"> & { id?: number }
): Promise<{ success: boolean; template?: DbTemplate; error?: string }> {
  try {
    // Generate next ID if not provided
    let nextId = newTemplate.id;
    if (!nextId) {
      const { data } = await supabase
        .from("templates")
        .select("id")
        .order("id", { ascending: false })
        .limit(1);
      nextId = (data?.[0]?.id || 20) + 1;
    }

    const payload = {
      id: nextId,
      slug: newTemplate.slug || `template-${nextId}`,
      name: newTemplate.name,
      image_url: newTemplate.image_url,
      boxes: newTemplate.boxes || DEFAULT_BOXES,
      is_active: newTemplate.is_active ?? true,
      display_order: newTemplate.display_order ?? nextId,
    };

    const { data, error } = await supabase
      .from("templates")
      .insert(payload)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, template: data as DbTemplate };
  } catch (err: any) {
    return { success: false, error: err?.message || "Unknown error" };
  }
}

/**
 * Uploads a template image to Supabase Storage bucket 'template-images'
 * Falls back to base64 DataURL if storage bucket is not created
 */
export async function uploadTemplateImage(
  file: File
): Promise<{ url: string; error?: string }> {
  try {
    const cleanFileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const { data, error } = await supabase.storage
      .from("template-images")
      .upload(cleanFileName, file, {
        cacheControl: "31536000",
        upsert: false,
      });

    if (error) {
      console.warn("Supabase Storage upload failed, converting to DataURL fallback:", error);
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ url: reader.result as string });
        reader.onerror = () => resolve({ url: "", error: "File read error" });
        reader.readAsDataURL(file);
      });
    }

    const { data: publicUrlData } = supabase.storage
      .from("template-images")
      .getPublicUrl(data.path);

    return { url: publicUrlData.publicUrl };
  } catch (err: any) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ url: reader.result as string });
      reader.onerror = () => resolve({ url: "", error: err?.message || "File read error" });
      reader.readAsDataURL(file);
    });
  }
}
