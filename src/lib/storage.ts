import { supabase, isSupabaseConfigured } from "./supabase";

export const DEFAULT_BUCKET_NAME = "agrolink-uploads";

/**
 * Uploads an image file to Supabase Storage.
 * Falls back to high-res data URL if bucket is not yet provisioned so user experience never fails.
 */
export async function uploadImage(
  file: File | Blob,
  folder: "produce" | "kyb" | "disputes" | "shipments" | "diagnostics" = "produce",
): Promise<{ success: boolean; url: string; error?: string }> {
  const fileName = file instanceof File ? file.name : "upload.jpg";
  const fileExt = fileName.split(".").pop() || "jpg";
  const uniqueName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;

  // 1. Try Supabase Storage if configured
  if (supabase && isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.storage
        .from(DEFAULT_BUCKET_NAME)
        .upload(uniqueName, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (!error && data?.path) {
        const { data: publicUrlData } = supabase.storage
          .from(DEFAULT_BUCKET_NAME)
          .getPublicUrl(data.path);

        if (publicUrlData?.publicUrl) {
          return { success: true, url: publicUrlData.publicUrl };
        }
      }
    } catch (storageErr) {
      console.warn("Supabase storage direct upload fallback:", storageErr);
    }
  }

  // 2. Client-side fallback: Convert file to Web Data URL
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve({ success: true, url: reader.result });
      } else {
        resolve({
          success: false,
          url: "",
          error: "Failed to read file contents",
        });
      }
    };
    reader.onerror = () => {
      resolve({
        success: false,
        url: "",
        error: "Error loading image file",
      });
    };
    reader.readAsDataURL(file);
  });
}
