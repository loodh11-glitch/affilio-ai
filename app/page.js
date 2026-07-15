"use client";

import Link from "next/link";
import { useState } from "react";

const stores = ["Amazon", "SHEIN", "AliExpress", "Temu", "Noon", "Etsy", "eBay", "Walmart"];

export default function Home() {
  const [link, setLink] = useState("");

  return (
    <main className="site-shell">
      <nav className="nav container">
        <div className="brand">
          <span className="brand-mark">A</span>
          <div><b>Affilio AI</b><small>Affiliate Marketing OS</small></div>
        </div>
        <Link href="/dashboard" className="ghost-btn">فتح لوحة التحكم</Link>
      </nav>

      <section className="hero container">
        <div className="hero-copy">
          <span className="pill">✨ رابط واحد، حملة كاملة</span>
          <h1>حوّلي أي رابط أفلييت إلى محتوى يبيع</h1>
          <p>منصة واحدة لإنشاء محتوى Pinterest وTikTok وInstagram وSEO مع تحليل فرصة المنتج والجمهور المناسب.</p>

          <div className="hero-form">
            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="الصقي رابط Amazon أو SHEIN أو AliExpress..."
            />
            <Link href={`/dashboard${link ? `?url=${encodeURIComponent(link)}` : ""}`} className="primary-btn">
              إنشاء الحملة
            </Link>
          </div>

          <div className="store-row">
            {stores.map((store) => <span key={store}>{store}</span>)}
          </div>
        </div>

        <div className="hero-preview">
          <div className="preview-top">
            <span>مشروع جديد</span><span className="status">جاهز</span>
          </div>
          <div className="preview-product">
            <div className="preview-image">🛍️</div>
            <div><b>منتج أفلييت</b><small>تم تحليل الرابط تلقائيًا</small></div>
            <strong>92/100</strong>
          </div>
          <div className="preview-grid">
            <div><b>📌 Pinterest</b><span>5 عناوين + وصف SEO</span></div>
            <div><b>🎬 TikTok</b><span>5 هوكات + سكربت</span></div>
            <div><b>📸 Instagram</b><span>كابشن + CTA</span></div>
            <div><b>🔍 SEO</b><span>15 كلمة مفتاحية</span></div>
          </div>
        </div>
      </section>

      <section className="metrics container">
        <div><strong>8+</strong><span>متاجر مدعومة</span></div>
        <div><strong>6</strong><span>حزم محتوى</span></div>
        <div><strong>1</strong><span>ضغطة للتوليد</span></div>
        <div><strong>100%</strong><span>واجهة عربية</span></div>
      </section>

      <section className="feature-section container">
        <div className="section-heading">
          <span className="pill">Affilio Workspace</span>
          <h2>كل ما يحتاجه مسوق الأفلييت في مكان واحد</h2>
        </div>
        <div className="feature-grid">
          {[
            ["📦", "Smart Product Import", "رابط، اسم منتج، أو صورة — ثم نبدأ التحليل."],
            ["🧠", "AI Content Engine", "محتوى مخصص لكل منصة بدل نسخ نص واحد للجميع."],
            ["📊", "Product Score", "تقييم فرصة المنتج، الجمهور، والمنصة الأنسب."],
            ["📅", "Campaign Builder", "تحويل المنتج إلى خطة نشر مترابطة ومتعددة المنصات."],
            ["🔍", "SEO Studio", "كلمات مفتاحية، نية بحث، وصف، وAlt Text."],
            ["💾", "Project Workspace", "تنظيم المشاريع والحملات للعودة إليها بسهولة."]
          ].map(([icon, title, desc]) => (
            <article key={title}><span>{icon}</span><h3>{title}</h3><p>{desc}</p></article>
          ))}
        </div>
      </section>

      <footer className="container footer">Affilio AI v0.1 — البداية العملية للمشروع.</footer>
    </main>
  );
}
