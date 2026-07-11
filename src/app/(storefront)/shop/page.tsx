import type { Metadata } from "next";
import Link from "next/link";
import {
  fetchGraphQL,
  GET_ALL_PRODUCTS_QUERY,
  WooProduct,
} from "@/lib/graphql";
import { getProductAttributes } from "@/lib/catalog";
import ProductCard from "@/app/components/ProductCard";

const PRODUCTS_PER_PAGE = 20;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mediumpurple-tarsier-577339.hostingersite.com";

interface ShopPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ searchParams }: ShopPageProps): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const after = typeof resolvedParams.after === "string" ? resolvedParams.after : undefined;
  const before = typeof resolvedParams.before === "string" ? resolvedParams.before : undefined;
  const pageNum = typeof resolvedParams.page === "string" ? parseInt(resolvedParams.page, 10) : 1;

  const isFirstPage = !after && !before;
  const pageLabel = !isFirstPage && pageNum > 1 ? ` - صفحة ${pageNum}` : "";

  const title = `المتجر – جميع المنتجات${pageLabel} | سحبة فيب`;
  const description =
    "تصفح جميع منتجات الفيب: سحبات جاهزة، بودات، نكهات سولت، نكهات فيب، كويلات، وأكثر. أسعار بالدينار الكويتي مع توصيل سريع.";

  // Canonical: page 1 → clean /shop, page 2+ → paginated URL
  const canonical = isFirstPage
    ? `${siteUrl}/shop`
    : `${siteUrl}/shop?after=${after || ""}&page=${pageNum}`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "سحبة فيب",
      locale: "ar_KW",
    },
  };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const resolvedParams = await searchParams;
  const after = typeof resolvedParams.after === "string" ? resolvedParams.after : undefined;
  const before = typeof resolvedParams.before === "string" ? resolvedParams.before : undefined;
  const pageNum = typeof resolvedParams.page === "string" ? parseInt(resolvedParams.page, 10) : 1;

  // Build GraphQL variables for cursor pagination
  const variables: Record<string, unknown> = {};
  if (before) {
    // Navigating backwards: use 'last' + 'before'
    variables.last = PRODUCTS_PER_PAGE;
    variables.before = before;
    variables.first = null;
  } else {
    // Forward navigation (default): use 'first' + 'after'
    variables.first = PRODUCTS_PER_PAGE;
    if (after) variables.after = after;
  }

  const [productsRes, attributes] = await Promise.all([
    fetchGraphQL(GET_ALL_PRODUCTS_QUERY, variables, undefined, { revalidate: 60 }),
    getProductAttributes(),
  ]);

  const products: WooProduct[] = productsRes.data?.products?.nodes ?? [];
  const pageInfo = productsRes.data?.products?.pageInfo;
  const hasNextPage = pageInfo?.hasNextPage ?? false;
  const hasPreviousPage = pageInfo?.hasPreviousPage ?? false;
  const endCursor = pageInfo?.endCursor ?? null;
  const startCursor = pageInfo?.startCursor ?? null;
  const activeAttributes = attributes.filter(attr => attr.terms && attr.terms.length > 0);

  return (
    <div className="container">
      {/* ─── Shop Header ─── */}
      <div className="shop-header" id="shop-header">
        <h1>جميع المنتجات</h1>
        <p>تصفح تشكيلتنا الكاملة من أجهزة ونكهات الفيب</p>
        <div className="shop-stats">
          <div className="shop-stat">
            الأسعار بالـ <strong>دينار كويتي</strong>
          </div>
          <div className="shop-divider" />
          <div className="shop-stat">
            توصيل <strong>سريع</strong> لجميع مناطق الكويت
          </div>
        </div>
      </div>

      {/* ─── Shop Layout with Sidebar & Product Grid ─── */}
      <div className="shop-content" id="shop-products">
        <div className="shop-layout">
          {/* Attributes Sidebar */}
          {activeAttributes.length > 0 && (
            <aside className="shop-sidebar" aria-label="فلاتر تصنيف المنتجات">
              {activeAttributes.map((attr) => (
                <div key={attr.slug} className="sidebar-widget">
                  <h3 className="sidebar-widget-title">{attr.label}</h3>
                  <ul className="sidebar-terms-list">
                    {attr.terms.map((term) => (
                      <li key={term.slug} className="sidebar-term-item">
                        <Link href={`/search?q=${encodeURIComponent(term.name)}`}>
                          {term.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </aside>
          )}

          {/* Main Products Grid */}
          <div style={{ width: "100%" }}>
            {products.length > 0 ? (
              <div className="products-grid">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">🔍</div>
                <p>لا توجد منتجات حالياً</p>
              </div>
            )}

            {/* ─── Pagination Controls ─── */}
            {(hasPreviousPage || hasNextPage) && (
              <nav className="pagination" aria-label="التنقل بين الصفحات">
                {hasPreviousPage && startCursor ? (
                  <Link
                    href={pageNum <= 2 ? "/shop" : `/shop?before=${startCursor}&page=${pageNum - 1}`}
                    className="pagination-btn pagination-btn-prev"
                  >
                    ← السابق
                  </Link>
                ) : (
                  <span className="pagination-btn pagination-btn-prev pagination-btn-disabled">
                    ← السابق
                  </span>
                )}

                <span className="pagination-current">
                  صفحة {pageNum}
                </span>

                {hasNextPage && endCursor ? (
                  <Link
                    href={`/shop?after=${endCursor}&page=${pageNum + 1}`}
                    className="pagination-btn pagination-btn-next"
                  >
                    التالي →
                  </Link>
                ) : (
                  <span className="pagination-btn pagination-btn-next pagination-btn-disabled">
                    التالي →
                  </span>
                )}
              </nav>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
