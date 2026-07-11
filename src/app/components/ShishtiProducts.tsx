import { fetchGraphQL, GET_PRODUCTS_BY_SLUGS_QUERY, WooProduct } from "@/lib/graphql";
import ProductCard from "@/app/components/ProductCard";

const SHISHTI_SLUGS = [
  "بنك-مان-كراميل-لاتيه",
  "فيب-مزايا-50000-سحبة",
  "شيشتي-ارتري-50k",
  "شيشتي-هوكا-بار-120-الف-سحبة",
  "shishti-lite",
  "يو-ويل-شيشتي-براون-كوكيز-سولت",
  "شيشتي-15k",
  "شيشتي-بلس-12k"
];

export default async function ShishtiProducts() {
  let products: WooProduct[] = [];
  try {
    const res = await fetchGraphQL(
      GET_PRODUCTS_BY_SLUGS_QUERY,
      { slugs: SHISHTI_SLUGS },
      undefined,
      { revalidate: 60 }
    );
    const fetched: WooProduct[] = res.data?.products?.nodes ?? [];
    
    // Sort products by their position in the SHISHTI_SLUGS array to maintain the exact order requested
    products = fetched.sort((a, b) => {
      const aIndex = SHISHTI_SLUGS.findIndex(slug => slug === decodeURIComponent(a.slug));
      const bIndex = SHISHTI_SLUGS.findIndex(slug => slug === decodeURIComponent(b.slug));
      return aIndex - bIndex;
    });
  } catch (error) {
    console.error("Error fetching shishti products:", error);
  }

  if (products.length === 0) return null;

  return (
    <section className="section" id="shishti-products">
      <div className="container">
        <h3 className="shishti-title">منتجات شيشتي</h3>
        <div className="shishti-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
