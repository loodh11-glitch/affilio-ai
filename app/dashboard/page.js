"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const stores = ["تلقائي", "Amazon", "SHEIN", "AliExpress", "Temu", "Noon", "Etsy", "eBay", "Walmart", "متجر آخر"];
const tabs = [
  ["pinterestTitles", "📌 Pinterest"],
  ["tiktokHooks", "🎬 TikTok"],
  ["instagramCaption", "📸 Instagram"],
  ["keywords", "🔍 SEO"],
  ["analysis", "📊 Analysis"],
  ["campaignPlan", "📅 Campaign"]
];

function Output({ value }) {
  if (Array.isArray(value)) return <ol>{value.map((x, i) => <li key={i}>{x}</li>)}</ol>;
  return <p>{value}</p>;
}

export default function Dashboard() {
  const [form, setForm] = useState({
    productName: "",
    productUrl: "",
    benefit: "",
    store: "تلقائي",
    market: "السعودية",
    language: "العربية"
  });
  const [active, setActive] = useState("pinterestTitles");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");


  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("url") || "";
    if (value) setForm((old) => ({ ...old, productUrl: value }));
  }, []);

  const ready = useMemo(() => form.productName.trim() || form.productUrl.trim(), [form]);

  function update(key, value) {
    setForm((old) => ({ ...old, [key]: value }));
  }

  async function generate(e) {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "تعذر إنشاء المحتوى");
      setResult(data);
      setActive("pinterestTitles");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function copyCurrent() {
    if (!result) return;
    const value = result[active];
    await navigator.clipboard.writeText(Array.isArray(value) ? value.join("\n") : String(value || ""));
    setMessage("تم نسخ المحتوى ✓");
  }

  return (
    <main className="dashboard-shell">
      <aside className="sidebar">
        <Link href="/" className="brand">
          <span className="brand-mark">A</span>
          <div><b>Affilio AI</b><small>Workspace</small></div>
        </Link>
        <nav>
          <a className="active">✨ مشروع جديد</a>
          <a>📁 المشاريع</a>
          <a>📅 الحملات</a>
          <a>📊 التحليلات</a>
          <a>⚙️ الإعدادات</a>
        </nav>
        <div className="sidebar-card">
          <b>نسخة Alpha</b>
          <span>جربي رحلة المنتج كاملة قبل إضافة الحسابات والاشتراكات.</span>
        </div>
      </aside>

      <section className="workspace">
        <header className="workspace-header">
          <div><span className="pill">New Project</span><h1>أنشئي حملة أفلييت جديدة</h1></div>
          <Link href="/" className="ghost-btn">الصفحة الرئيسية</Link>
        </header>

        <div className="workspace-grid">
          <form className="form-card" onSubmit={generate}>
            <h2>بيانات المنتج</h2>
            <label>رابط الأفلييت
              <input value={form.productUrl} onChange={(e) => update("productUrl", e.target.value)} placeholder="https://..." />
            </label>
            <label>اسم المنتج
              <input value={form.productName} onChange={(e) => update("productName", e.target.value)} placeholder="مثال: PUMA Speedcat Ballet" />
            </label>
            <label>أهم فائدة <small>اختياري</small>
              <input value={form.benefit} onChange={(e) => update("benefit", e.target.value)} placeholder="مريح، أنيق، مناسب يوميًا..." />
            </label>
            <div className="form-row">
              <label>المتجر
                <select value={form.store} onChange={(e) => update("store", e.target.value)}>
                  {stores.map((x) => <option key={x}>{x}</option>)}
                </select>
              </label>
              <label>السوق
                <select value={form.market} onChange={(e) => update("market", e.target.value)}>
                  <option>السعودية</option><option>أمريكا</option><option>الإمارات</option><option>الخليج</option><option>عالمي</option>
                </select>
              </label>
            </div>
            <label>اللغة
              <select value={form.language} onChange={(e) => update("language", e.target.value)}>
                <option>العربية</option><option>الإنجليزية</option><option>العربية والإنجليزية</option>
              </select>
            </label>
            <button className="primary-btn full" disabled={!ready || loading}>
              {loading ? "جاري تحليل المنتج..." : "✨ إنشاء الحملة"}
            </button>
            {message && <div className="notice">{message}</div>}
          </form>

          <section className="result-panel">
            {!result ? (
              <div className="empty-state">
                <span>🪄</span>
                <h2>نتائج الحملة ستظهر هنا</h2>
                <p>الصقي الرابط أو اكتبي اسم المنتج ثم اضغطي إنشاء الحملة.</p>
              </div>
            ) : (
              <>
                <div className="score-strip">
                  <div className="score-circle">{result.score}<small>/100</small></div>
                  <div><b>{result.product || "تحليل المنتج"}</b><span>{result.scoreReason}</span></div>
                  {result.demo && <em>Demo</em>}
                </div>

                <div className="tab-row">
                  {tabs.map(([key, label]) => (
                    <button key={key} className={active === key ? "active" : ""} onClick={() => setActive(key)}>{label}</button>
                  ))}
                </div>

                <article className="output-card">
                  <div className="output-head">
                    <h3>{tabs.find(([key]) => key === active)?.[1]}</h3>
                    <button className="copy-btn" onClick={copyCurrent}>نسخ</button>
                  </div>
                  <Output value={result[active]} />
                  {active === "pinterestTitles" && <>
                    <hr />
                    <h4>وصف Pinterest</h4><p>{result.pinterestDescription}</p>
                    <h4>Alt Text</h4><p>{result.altText}</p>
                  </>}
                </article>
              </>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
