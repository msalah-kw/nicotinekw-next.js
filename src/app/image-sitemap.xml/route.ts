import { fetchGraphQL } from "@/lib/graphql";

export const dynamic = "force-dynamic";

const GET_PRODUCTS_IMAGES_QUERY = `
  query GetProductsImages($first: Int = 500) {
    products(first: $first) {
      nodes {
        slug
        name
        image {
          sourceUrl
          altText
        }
      }
    }
  }
`;

interface ProductImageNode {
  slug: string;
  name: string;
  image?: {
    sourceUrl: string;
    altText?: string;
  } | null;
}

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sahbavape.com";
  let xmlString = "";

  try {
    const productsRes = await fetchGraphQL(GET_PRODUCTS_IMAGES_QUERY, { first: 500 }, undefined, { revalidate: 3600 });
    const products: ProductImageNode[] = productsRes.data?.products?.nodes ?? [];

    const urlBlocks = products
      .filter((p) => p.image?.sourceUrl)
      .map((p) => {
        const productUrl = `${siteUrl}/product/${p.slug}`;
        const imageUrl = p.image!.sourceUrl;
        // Escape special XML characters in title/alt and URLs
        const title = escapeXml(p.image?.altText || p.name || "");
        const escapedLoc = escapeXml(productUrl);
        const escapedImgLoc = escapeXml(imageUrl);

        return `  <url>
    <loc>${escapedLoc}</loc>
    <image:image>
      <image:loc>${escapedImgLoc}</image:loc>
      <image:title>${title}</image:title>
    </image:image>
  </url>`;
      })
      .join("\n");

    xmlString = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlBlocks}
</urlset>`;
  } catch (error) {
    console.error("[Image Sitemap] Error generating sitemap:", error);
    // Return an empty but valid XML structure
    xmlString = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
</urlset>`;
  }

  return new Response(xmlString, {
    headers: {
      "Content-Type": "text/xml",
      "Cache-Control": "s-maxage=86400, stale-while-revalidate",
    },
  });
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}
