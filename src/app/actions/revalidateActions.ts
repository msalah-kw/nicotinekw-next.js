"use server";

import { revalidateTag } from "next/cache";

/**
 * Server Action to trigger on-demand revalidation of categories and attributes
 */
export async function revalidateCatalog() {
  try {
    // Next.js 16 requires a 2-argument signature: tag and options/profile
    revalidateTag("categories", { expire: 0 });
    revalidateTag("attributes", { expire: 0 });
    return { success: true, message: "Catalog cache successfully invalidated" };
  } catch (error) {
    console.error("[revalidateCatalog] ✖ Error during manual cache revalidation:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}
