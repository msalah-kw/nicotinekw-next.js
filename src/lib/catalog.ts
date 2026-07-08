import { fetchGraphQL } from "./graphql";
import { FALLBACK_CATEGORIES, CategoryNode } from "./navigation";

export interface AttributeTerm {
  name: string;
  slug: string;
}

export interface AttributeGroup {
  name: string;
  label: string;
  slug: string;
  terms: AttributeTerm[];
}

const ICON_MAP: Record<string, string> = {
  vape: "💨",
  "pod-system": "🔌",
  disposable: "🔋",
  iqos: "🚬",
  "nicotine-pouches": "📦",
  flavors: "🧪",
  "freebase-eliquids": "🧪",
  "saltnic-flavors": "🧂",
  pods: "📦",
  "closed-pods": "📦",
  "refillable-pods": "🔄",
  coils: "⚡",
  tobacco: "🍂",
  hookah: "🫧",
};

const CATEGORY_SORT_ORDER = [
  "اجهزة",
  "نكه",      // Catches both 'نكهات' and 'نكهة'
  "بود",      // Catches 'بودات'
  "كويل",     // Catches 'كويلات'
  "تانك",     // Catches 'تانكات'
  "شيشة",     // Catches 'شيشة ومعسل'
  "زقاير",    // Catches 'زقاير وتبغ'
  "اكياس",    // Catches 'اكياس نيكوتين'
  "اكسسوارات",
];

/**
 * Translate/Replace database content to conform with strict terminology requirements
 */
function sanitizeTerminology(text: string): string {
  if (!text) return "";
  return text
    .replace(/تبريد/g, "ايس")
    .replace(/موشة/g, "سحبة")
    .replace(/حسب التوفر/g, "")
    .replace(/غيومك/g, "")
    .replace(/Ikon/gi, "Icon")
    .replace(/بطيخ/g, "رقي")
    .replace(/خراطيش/g, "بودات")
    .replace(/السائل الالكتروني/g, "النكهة")
    .replace(/أنظمة البود/g, "بودات")
    .replace(/بنك طاقة/gi, "باور بانك");
}

/**
 * Fetch all categories dynamically with 'categories' cache tag and build a hierarchical category tree.
 * Fail-safe falls back to static categories in case of error.
 */
export async function getNavigationCategories(): Promise<CategoryNode[]> {
  try {
    const res = await fetchGraphQL(
      `query GetNavigationCategories {
        productCategories(first: 100, where: { hideEmpty: true }) {
          nodes {
            id
            databaseId
            name
            slug
            count
            parent {
              node {
                databaseId
                name
                slug
              }
            }
          }
        }
      }`,
      {},
      undefined,
      { revalidate: false, tags: ["categories"] } // Cached indefinitely until on-demand revalidation tag is purged
    );

    const nodes = res?.data?.productCategories?.nodes || [];
    if (nodes.length === 0) {
      console.warn("[getNavigationCategories] WooCommerce returned 0 categories. Using fallback config.");
      return FALLBACK_CATEGORIES;
    }

    const categoryMap = new Map<string, CategoryNode & { parentSlug?: string }>();

    for (const node of nodes) {
      const sanitizedName = sanitizeTerminology(node.name);
      categoryMap.set(node.slug, {
        name: sanitizedName,
        slug: node.slug,
        url: `/category/${node.slug}`,
        icon: ICON_MAP[node.slug] || "📦",
        subcategories: [],
        parentSlug: node.parent?.node?.slug,
      });
    }

    const tree: CategoryNode[] = [];

    for (const [slug, cat] of categoryMap.entries()) {
      if (cat.parentSlug && categoryMap.has(cat.parentSlug)) {
        const parent = categoryMap.get(cat.parentSlug);
        parent?.subcategories?.push({
          name: cat.name,
          slug: cat.slug,
          url: cat.url,
          icon: cat.icon,
        });
      } else {
        tree.push({
          name: cat.name,
          slug: cat.slug,
          url: cat.url,
          icon: cat.icon,
          subcategories: cat.subcategories,
        });
      }
    }

    // Clean up empty subcategories arrays
    for (const item of tree) {
      if (item.subcategories && item.subcategories.length === 0) {
        delete item.subcategories;
      }
    }

    // Sort the top-level categories based on priority order
    tree.sort((a, b) => {
      const indexA = CATEGORY_SORT_ORDER.findIndex((keyword) => a.name.includes(keyword));
      const indexB = CATEGORY_SORT_ORDER.findIndex((keyword) => b.name.includes(keyword));
      const rankA = indexA === -1 ? 999 : indexA;
      const rankB = indexB === -1 ? 999 : indexB;
      return rankA - rankB;
    });

    return tree;
  } catch (error) {
    console.error("[getNavigationCategories] ✖ Fail-safe triggered: Categories failed to load. Using fallback.", error);
    return FALLBACK_CATEGORIES;
  }
}

/**
 * Fetch all product attributes dynamically with 'attributes' cache tag.
 * Filter out translation duplicate terms (e.g. trailing '-en').
 */
export async function getProductAttributes(): Promise<AttributeGroup[]> {
  try {
    const res = await fetchGraphQL(
      `query GetProductAttributes {
        productAttributes {
          nodes {
            name
            label
            slug
            terms {
              nodes {
                name
                slug
              }
            }
          }
        }
      }`,
      {},
      undefined,
      { revalidate: false, tags: ["attributes"] } // Cached indefinitely until on-demand revalidation tag is purged
    );

    const nodes = res?.data?.productAttributes?.nodes || [];

    return nodes.map((node: any) => {
      const sanitizedLabel = sanitizeTerminology(node.label || node.name.replace("pa_", ""));
      return {
        name: node.name,
        label: sanitizedLabel,
        slug: node.slug,
        terms: (node.terms?.nodes || [])
          .filter((term: any) => !term.slug.endsWith("-en") && !term.slug.includes("-en-"))
          .map((term: any) => ({
            name: sanitizeTerminology(term.name),
            slug: term.slug,
          })),
      };
    });
  } catch (error) {
    console.error("[getProductAttributes] ✖ Fail-safe triggered: Attributes failed to load.", error);
    return [];
  }
}
