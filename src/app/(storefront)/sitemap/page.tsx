import type { Metadata } from "next";
import Link from "next/link";
import { fetchGraphQL, GET_CATEGORIES_QUERY } from "@/lib/graphql";

export const revalidate = 3600; // Cache sitemap for 1 hour

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sahbavape.com";
  return {
    title: "خريطة الموقع | دليل المتجر",
    description: "دليل شامل لجميع أقسام وتصنيفات المتجر لتسهيل تصفح منتجاتنا.",
    alternates: {
      canonical: `${siteUrl}/sitemap`,
    },
    openGraph: {
      title: "خريطة الموقع | دليل المتجر",
      description: "دليل شامل لجميع أقسام وتصنيفات المتجر لتسهيل تصفح منتجاتنا.",
      url: `${siteUrl}/sitemap`,
      siteName: "سحبة فيب",
      locale: "ar_KW",
    },
  };
}

interface CategoryNode {
  slug: string;
  name: string;
}

export default async function SitemapPage() {
  const categoriesRes = await fetchGraphQL(GET_CATEGORIES_QUERY, {}, undefined, { revalidate: 3600 }).catch(err => {
    console.error("[HTML Sitemap] Error fetching categories:", err);
    return { data: { productCategories: { nodes: [] } } };
  });

  const categories: CategoryNode[] = categoriesRes.data?.productCategories?.nodes ?? [];

  return (
    <main className="html-sitemap-container container">
      {/* Scoped CSS styling using design system variables */}
      <style dangerouslySetInnerHTML={{ __html: `
        .html-sitemap-container {
          padding-top: var(--space-2xl);
          padding-bottom: var(--space-3xl);
          max-width: 800px;
        }
        .sitemap-title {
          font-size: var(--font-size-3xl);
          font-weight: 700;
          color: var(--color-text-primary);
          margin-bottom: var(--space-xl);
          border-bottom: 2px solid var(--color-border);
          padding-bottom: var(--space-sm);
        }
        .sitemap-section {
          margin-bottom: var(--space-2xl);
        }
        .sitemap-section h2 {
          font-size: var(--font-size-xl);
          font-weight: 600;
          color: var(--color-text-primary);
          margin-bottom: var(--space-md);
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }
        .sitemap-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: var(--space-md);
          padding: 0;
          margin: 0;
          list-style: none;
        }
        .sitemap-item a {
          display: flex;
          align-items: center;
          padding: var(--space-md);
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          color: var(--color-text-primary);
          font-weight: 500;
          text-decoration: none;
          transition: all var(--transition-base);
        }
        .sitemap-item a:hover {
          border-color: var(--color-accent);
          background: var(--color-accent-dim);
          color: var(--color-accent);
          transform: translateY(-2px);
          box-shadow: var(--shadow-sm);
        }
        @media (max-width: 600px) {
          .sitemap-list {
            grid-template-columns: 1fr;
          }
        }
      `}} />

      <h1 className="sitemap-title">خريطة الموقع</h1>

      <section className="sitemap-section">
        <h2>🔗 الصفحات الرئيسية</h2>
        <ul className="sitemap-list">
          <li className="sitemap-item">
            <Link href="/">الرئيسية</Link>
          </li>
          <li className="sitemap-item">
            <Link href="/shop">المتجر</Link>
          </li>
          <li className="sitemap-item">
            <Link href="/cart">سلة المشتريات</Link>
          </li>
          <li className="sitemap-item">
            <Link href="/checkout">إتمام الطلب</Link>
          </li>
        </ul>
      </section>

      <section className="sitemap-section">
        <h2>📁 أقسام المتجر</h2>
        {categories.length > 0 ? (
          <ul className="sitemap-list">
            {categories.map((category) => (
              <li key={category.slug} className="sitemap-item">
                <Link href={`/category/${category.slug}`}>{category.name}</Link>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: "var(--color-text-secondary)" }}>لا توجد أقسام متوفرة حالياً.</p>
        )}
      </section>
    </main>
  );
}
