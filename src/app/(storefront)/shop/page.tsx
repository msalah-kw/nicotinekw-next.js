import type { Metadata } from "next";
import Link from "next/link";
import {
  fetchGraphQL,
  GET_ALL_PRODUCTS_QUERY,
  WooProduct,
} from "@/lib/graphql";
import { getProductAttributes } from "@/lib/catalog";
import ProductCard from "@/app/components/ProductCard";

export const metadata: Metadata = {
  title: "المتجر – جميع المنتجات | سحبة فيب",
  description:
    "تصفح جميع منتجات الفيب: سحبات جاهزة، بودات، نكهات سولت، نكهات فيب، كويلات، وأكثر. أسعار بالدينار الكويتي مع توصيل سريع.",
  alternates: {
    canonical: "/shop",
  },
};

export default async function ShopPage() {
  const [productsRes, attributes] = await Promise.all([
    fetchGraphQL(GET_ALL_PRODUCTS_QUERY, { first: 100 }, undefined, { revalidate: 60 }),
    getProductAttributes(),
  ]);

  const products: WooProduct[] = productsRes.data?.products?.nodes ?? [];
  const activeAttributes = attributes.filter(attr => attr.terms && attr.terms.length > 0);

  return (
    <div className="container">
      {/* ─── Shop Header ─── */}
      <div className="shop-header" id="shop-header">
        <h1>جميع المنتجات</h1>
        <p>تصفح تشكيلتنا الكاملة من أجهزة ونكهات الفيب</p>
        <div className="shop-stats">
          <div className="shop-stat">
            <strong>{products.length}</strong> منتج متوفر
          </div>
          <div className="shop-divider" />
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
          </div>
        </div>
      </div>
    </div>
  );
}
