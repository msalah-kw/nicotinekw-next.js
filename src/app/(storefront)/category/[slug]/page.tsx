import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  fetchGraphQL,
  GET_PRODUCTS_BY_CATEGORY_QUERY,
  WooProduct,
} from "@/lib/graphql";
import { truncateText } from "@/lib/formatters";
import ProductCard from "@/app/components/ProductCard";

const PRODUCTS_PER_PAGE = 20;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mediumpurple-tarsier-577339.hostingersite.com";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Translate/Replace database content to conform with strict terminology requirements
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

export async function generateMetadata({
  params,
  searchParams,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const resolvedSearch = await searchParams;
  const decodedSlug = decodeURIComponent(slug);

  const after = typeof resolvedSearch.after === "string" ? resolvedSearch.after : undefined;
  const before = typeof resolvedSearch.before === "string" ? resolvedSearch.before : undefined;
  const pageNum = typeof resolvedSearch.page === "string" ? parseInt(resolvedSearch.page, 10) : 1;
  const isFirstPage = !after && !before;

  try {
    const { data } = await fetchGraphQL(GET_PRODUCTS_BY_CATEGORY_QUERY, {
      categorySlugId: decodedSlug,
      categorySlugStr: decodedSlug,
      first: 1,
    }, undefined, { revalidate: 60 });

    const category = data?.productCategory;

    if (!category) {
      return {
        title: "القسم غير موجود | سحبة فيب",
        description: "عذراً، هذا القسم غير متوفر حالياً.",
      };
    }

    const cleanTitle = sanitizeTerminology(category.name);
    const cleanDesc = category.description
      ? sanitizeTerminology(category.description)
      : `تصفح منتجات قسم ${cleanTitle} في متجر سحبة فيب بأفضل الأسعار وتوصيل سريع في الكويت.`;

    const pageLabel = !isFirstPage && pageNum > 1 ? ` - صفحة ${pageNum}` : "";
    const title = `${cleanTitle}${pageLabel} – سحبة فيب`;
    const description = truncateText(cleanDesc, 160);

    // Canonical: page 1 → clean URL, page 2+ → paginated URL
    const canonical = isFirstPage
      ? `${siteUrl}/category/${decodedSlug}`
      : `${siteUrl}/category/${decodedSlug}?after=${after || ""}&page=${pageNum}`;

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
        images: [],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
    };
  } catch (error) {
    console.error("Error generating metadata for category page:", error);
    return {
      title: "تصفح القسم | سحبة فيب",
      description: "تصفح منتجات الفيب حسب القسم.",
    };
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const { slug } = resolvedParams;
  const decodedSlug = decodeURIComponent(slug);

  const after = typeof resolvedSearch.after === "string" ? resolvedSearch.after : undefined;
  const before = typeof resolvedSearch.before === "string" ? resolvedSearch.before : undefined;
  const pageNum = typeof resolvedSearch.page === "string" ? parseInt(resolvedSearch.page, 10) : 1;

  let products: WooProduct[] = [];
  let categoryName = "";
  let categoryDescription = "";
  let productCount = 0;
  let isFound = false;
  let hasError = false;

  // Pagination state
  let hasNextPage = false;
  let hasPreviousPage = false;
  let endCursor: string | null = null;
  let startCursor: string | null = null;

  try {
    // Build GraphQL variables for cursor pagination
    const variables: Record<string, unknown> = {
      categorySlugId: decodedSlug,
      categorySlugStr: decodedSlug,
    };
    if (before) {
      variables.last = PRODUCTS_PER_PAGE;
      variables.before = before;
      variables.first = null;
    } else {
      variables.first = PRODUCTS_PER_PAGE;
      if (after) variables.after = after;
    }

    const { data } = await fetchGraphQL(GET_PRODUCTS_BY_CATEGORY_QUERY, variables, undefined, { revalidate: 60 });

    if (data?.productCategory) {
      isFound = true;
      categoryName = sanitizeTerminology(data.productCategory.name);
      categoryDescription = sanitizeTerminology(
        data.productCategory.description || ""
      );
      productCount = data.productCategory.count || 0;
      products = data.products?.nodes ?? [];

      const pageInfo = data.products?.pageInfo;
      hasNextPage = pageInfo?.hasNextPage ?? false;
      hasPreviousPage = pageInfo?.hasPreviousPage ?? false;
      endCursor = pageInfo?.endCursor ?? null;
      startCursor = pageInfo?.startCursor ?? null;
    }
  } catch (error) {
    console.error("[CategoryPage] ✖ Error fetching category products:", error);
    hasError = true;
  }

  if (!isFound) {
    if (hasError) {
      return (
        <div className="container">
          <div className="empty-state" style={{ margin: "4rem auto", textAlign: "center" }}>
            <div className="empty-state-icon" style={{ fontSize: "3rem" }}>⚠️</div>
            <p>حدث خطأ أثناء تحميل المنتجات. الرجاء المحاولة مرة أخرى لاحقاً.</p>
          </div>
        </div>
      );
    }
    notFound();
  }

  const basePath = `/category/${decodedSlug}`;

  // BreadcrumbList JSON-LD
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "الرئيسية",
        "item": siteUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "المتجر",
        "item": `${siteUrl}/shop`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": categoryName,
        "item": `${siteUrl}${basePath}`
      }
    ]
  };

  return (
    <div className="container">
      {/* Breadcrumb JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      {/* Breadcrumbs */}
      <nav className="breadcrumbs" aria-label="مسار التنقل">
        <Link href="/">الرئيسية</Link>
        <span className="separator">/</span>
        <Link href="/shop">المتجر</Link>
        <span className="separator">/</span>
        <span className="current" aria-current="page">
          {categoryName}
        </span>
      </nav>

      {/* Category Header */}
      <div className="shop-header" id="category-header">
        <h1>القسم: {categoryName}</h1>
        {categoryDescription && <p>{categoryDescription}</p>}
        <div className="shop-stats">
          <div className="shop-stat">
            <strong>{productCount}</strong> منتج في هذا القسم
          </div>
          <div className="shop-divider" />
          <div className="shop-stat">
            توصيل سريع <strong>خلال ساعات</strong>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="shop-content" id="category-products">
        {products.length > 0 ? (
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <p>لا توجد منتجات حالياً في هذا القسم</p>
          </div>
        )}

        {/* ─── Pagination Controls ─── */}
        {(hasPreviousPage || hasNextPage) && (
          <nav className="pagination" aria-label="التنقل بين الصفحات">
            {hasPreviousPage && startCursor ? (
              <Link
                href={pageNum <= 2 ? basePath : `${basePath}?before=${startCursor}&page=${pageNum - 1}`}
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
                href={`${basePath}?after=${endCursor}&page=${pageNum + 1}`}
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
  );
}
