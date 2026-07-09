import Link from "next/link";
import Image from "next/image";
import Header from "@/app/components/Header";
import CartToast from "@/app/components/CartToast";
import MobileBottomNav from "@/app/components/MobileBottomNav";
import { getNavigationCategories } from "@/lib/catalog";

export default async function StorefrontLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await getNavigationCategories();

  return (
    <div className="page-wrapper">
      {/* ─── Header ─── */}
      <Header categories={categories} />

      {/* ─── Cart Toast Popup ─── */}
      <CartToast />

      {/* ─── Main Content ─── */}
      <div className="main-content">{children}</div>

      {/* ─── Mobile Bottom Navigation ─── */}
      <MobileBottomNav />

      {/* ─── Footer ─── */}
      <footer className="site-footer">
        <div className="container footer-container">
          {/* Column 1: Brand Info */}
          <div className="footer-col footer-brand-col">
            <Link href="/" className="footer-logo">
              <Image 
                src="https://aliceblue-gnu-460662.hostingersite.com/wp-content/uploads/2025/03/nicotine-logo-white.webp" 
                alt="Nicotine Kuwait Logo" 
                width={240}
                height={80}
              />
            </Link>
            {/* BRANDING_TODO: Customize brand description paragraph */}
            <p className="footer-desc">متجر سحبة فيب الأول لجميع سحبات وبودات ونكهات الفيب في الكويت.</p>
          </div>

          {/* Column 2: Additional Info */}
          <div className="footer-col">
            <h3>معلومات إضافية</h3>
            <ul>
              <li><Link href="/about-us">من نحن</Link></li>
              <li><Link href="/faq">الأسئلة المتكررة</Link></li>
              <li><Link href="/disclaimer">إخلاء المسؤولية</Link></li>
              <li><Link href="/sitemap">خريطة الموقع</Link></li>
            </ul>
          </div>

          {/* Column 3: Policies */}
          <div className="footer-col">
            <h3>السياسات والقوانين</h3>
            <ul>
              <li><Link href="/privacy-policy">سياسة الخصوصية</Link></li>
              <li><Link href="/refund_returns">سياسة الاستبدال والاسترجاع</Link></li>
              <li><Link href="/terms-conditions">الشروط والأحكام</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact/Support */}
          <div className="footer-col">
            <h3>تواصل معنا</h3>
            <ul>
              <li>أوقات العمل: طوال أيام الأسبوع</li>
              <li>ساعات الخدمة: 24 ساعة خدمة سريعة</li>
              <li>
                {/* BRANDING_TODO: Replace WhatsApp API url link and display number */}
                <a href="https://wa.me/96555727313" target="_blank" rel="noopener noreferrer" className="footer-whatsapp-link">
                  💬 دعم واتساب: 96555727313+
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="container">
            {/* BRANDING_TODO: Customize bottom copyright store name */}
            <p>© {new Date().getFullYear()} سحبة فيب – جميع الحقوق محفوظة</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
