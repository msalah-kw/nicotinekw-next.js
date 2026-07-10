import Image from "next/image";

/**
 * HeroBanner – Responsive hero with separate desktop/mobile background images
 * and an RTL-aware text overlay.
 *
 * Desktop: text aligned center-right.
 * Mobile:  text aligned top-center.
 * Both images are priority-loaded for LCP optimization.
 */
export default function HeroBanner() {
  return (
    <section className="hero-banner-v2" id="hero-banner">
      {/* ─── Desktop Background ─── */}
      <div className="hero-img hero-img--desktop">
        <Image
          src="https://aliceblue-gnu-460662.hostingersite.com/wp-content/uploads/2025/07/توصيل-فيب-مجاني.webp"
          alt="توصيل فيب مجاني - نيكوتين الكويت"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "left center" }}
          unoptimized
        />
      </div>

      {/* ─── Mobile Background ─── */}
      <div className="hero-img hero-img--mobile">
        <Image
          src="https://aliceblue-gnu-460662.hostingersite.com/wp-content/uploads/2025/04/توصيل-فيب-مجاني.webp"
          alt="توصيل فيب مجاني - نيكوتين الكويت"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "top center" }}
          unoptimized
        />
      </div>

      {/* ─── Text Overlay ─── */}
      <div className="hero-overlay">
        <h2 className="hero-overlay__title">توصيل فيب مجاني</h2>
        <p className="hero-overlay__subtitle">للطلبات الأكثر من 20 دينار</p>
      </div>
    </section>
  );
}
