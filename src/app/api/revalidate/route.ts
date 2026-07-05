import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";

/**
 * GET Webhook Handler
 * Example: /api/revalidate?secret=YOUR_SECRET&tag=categories
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const tag = searchParams.get("tag");

  const expectedSecret = process.env.REVALIDATION_SECRET;

  if (expectedSecret && secret !== expectedSecret) {
    return Response.json({ error: "Invalid revalidation secret key" }, { status: 401 });
  }

  if (tag) {
    // Next.js 16 requires a 2-argument signature: tag and options/profile
    revalidateTag(tag, { expire: 0 });
    return Response.json({ revalidated: true, tag, now: Date.now() });
  }

  // By default, revalidate both categories and attributes if no specific tag is requested
  revalidateTag("categories", { expire: 0 });
  revalidateTag("attributes", { expire: 0 });

  return Response.json({
    revalidated: true,
    tags: ["categories", "attributes"],
    now: Date.now(),
  });
}

/**
 * POST Webhook Handler
 * Accepts JSON body with tags list: { "tags": ["categories", "attributes"] }
 */
export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret") || request.headers.get("x-revalidation-secret");
  const expectedSecret = process.env.REVALIDATION_SECRET;

  if (expectedSecret && secret !== expectedSecret) {
    return Response.json({ error: "Invalid revalidation secret key" }, { status: 401 });
  }

  let body: any = {};
  try {
    body = await request.json();
  } catch (e) {
    // Ignore JSON parsing errors for empty webhook bodies
  }

  const tags = body?.tags || ["categories", "attributes"];

  for (const tag of tags) {
    revalidateTag(tag, { expire: 0 });
  }

  return Response.json({
    revalidated: true,
    tags,
    now: Date.now(),
  });
}
