import Link from "next/link";
import Image from "next/image";
import {
  fetchGraphQL,
  GET_LATEST_PRODUCTS_QUERY,
  GET_CATEGORIES_QUERY,
  WooProduct,
  WooCategory,
} from "@/lib/graphql";
import ProductCard from "@/app/components/ProductCard";
import HeroBanner from "@/app/components/HeroBanner";
import ShishtiProducts from "@/app/components/ShishtiProducts";

/* ─── Homepage Categories Config ─── */
const HOMEPAGE_CATEGORIES = [
  {
    name: "اجهزة فيب",
    slug: "vape",
    url: "https://mediumpurple-tarsier-577339.hostingersite.com/category/vape",
    image: "/categories-icons/vape-devices.webp",
  },
  {
    name: "سحبات زقارة",
    slug: "pod-system",
    url: "https://mediumpurple-tarsier-577339.hostingersite.com/category/pod-system",
    image: "/categories-icons/pod-systems.webp",
  },
  {
    name: "سحبات جاهزة",
    slug: "disposable",
    url: "https://mediumpurple-tarsier-577339.hostingersite.com/category/disposable",
    image: "/categories-icons/disposable-vape.webp",
  },
  {
    name: "نكهات شيشة",
    slug: "freebase-eliquids",
    url: "https://mediumpurple-tarsier-577339.hostingersite.com/category/freebase",
    image: "/categories-icons/freebase-eliquids.webp",
  },
  {
    name: "نكهات سولت",
    slug: "saltnic-flavors",
    url: "https://mediumpurple-tarsier-577339.hostingersite.com/category/saltnic",
    image: "/categories-icons/saltnic-eliquids.webp",
  },
  {
    name: "ايقوص",
    slug: "iqos",
    url: "https://mediumpurple-tarsier-577339.hostingersite.com/category/%D8%A7%D8%AC%D9%87%D8%B2%D8%A9-%D8%A7%D9%84%D8%AA%D8%B3%D8%AE%D9%8A%D9%86",
    image: "/categories-icons/iqos.webp",
  },
];

export default async function HomePage() {
  /* Fetch data in parallel */
  const [productsRes, categoriesRes] = await Promise.all([
    fetchGraphQL(GET_LATEST_PRODUCTS_QUERY, { first: 12 }, undefined, { revalidate: 60 }),
    fetchGraphQL(GET_CATEGORIES_QUERY, {}, undefined, { revalidate: false, tags: ["categories"] }),
  ]);

  const products: WooProduct[] = productsRes.data?.products?.nodes ?? [];
  const allCategories: WooCategory[] =
    categoriesRes.data?.productCategories?.nodes ?? [];

  return (
    <>
      {/* ═══ Hero Banner Section ═══ */}
      <HeroBanner />
 
      {/* ═══ Featured Categories ═══ */}
      <section className="section" id="categories">
        <div className="container">
          <div className="home-categories-grid">
            {HOMEPAGE_CATEGORIES.map((cat) => (
              <Link
                href={cat.url}
                key={cat.slug}
                className="home-category-card"
                id={`category-${cat.slug}`}
              >
                <div className="home-category-icon">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    width={80}
                    height={80}
                    unoptimized
                    className="home-category-image"
                  />
                </div>
                <h3 className="home-category-title">{cat.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ My Shishti Products Section ═══ */}
      <ShishtiProducts />

      {/* ═══ Latest Products ═══ */}
      <section className="section" id="latest-products">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">أحدث المنتجات</h2>
            <Link href="/shop" className="section-link">
              عرض الكل
            </Link>
          </div>

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
      </section>
    </>
  );
}
