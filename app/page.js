"use client";

import { useMemo, useState } from "react";

const STORES = [
  "تلقائي",
  "Amazon",
  "SHEIN",
  "AliExpress",
  "Temu",
  "Noon",
  "Etsy",
  "eBay",
  "Walmart",
];

const RESULT_TABS = [
  {
    key: "pinterestTitles",
    label: "📌 Pinterest",
  },
  {
    key: "tiktokHooks",
    label: "🎬 TikTok",
  },
  {
    key: "instagramCaption",
    label: "📸 Instagram",
  },
  {
    key: "keywords",
    label: "🔍 SEO",
  },
  {
    key: "analysis",
    label: "📊 التحليل",
  },
  {
    key: "campaignPlan",
    label: "📅 خطة النشر",
  },
];

function ResultContent({ value }) {
  if (Array.isArray(value)) {
    return (
      <ol className="result-list">
        {value.map((item, index) => (
          <li key={`${item}-${index}`}>{item}</li>
        ))}
      </ol>
    );
  }

  return <p className="result-text">{value || "لا توجد نتيجة."}</p>;
}

export default function HomePage() {
  const [form, setForm] = useState({
    productUrl: "",
    productName: "",
    benefit: "",
    store: "تلقائي",
    market: "السعودية",
    language: "العربية",
  });

  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState("pinterestTitles");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const canGenerate = useMemo(() => {
    return Boolean(
      form.productUrl.trim() ||
      form.productName.trim()
    );
  }, [form.productUrl, form.productName]);

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function generateCampaign(event) {
    event.preventDefault();

    setError("");
    setCopied(false);

    if (!canGenerate) {
      setError("الصقي رابط المنتج أو اكتبي اسم المنتج.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "تعذر إنشاء الحملة."
        );
      }

      setResult(data);
      setActiveTab("pinterestTitles");

      setTimeout(() => {
        document
          .getElementById("campaign-results")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }, 100);
    } catch (requestError) {
      setError(
        requestError?.message ||
        "حدث خطأ أثناء إنشاء الحملة."
      );
    } finally {
      setLoading(false);
    }
  }

  async function copyCurrentResult() {
    if (!result) return;

    const value = result[activeTab];

    const text = Array.isArray(value)
      ? value.join("\n")
      : String(value || "");

    await navigator.clipboard.writeText(text);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1500);
  }

  async function copyEverything() {
    if (!result) return;

    const allContent = `
المنتج:
${result.product || ""}

المتجر:
${result.store || ""}

التقييم:
${result.score || ""}/100

سبب التقييم:
${result.scoreReason || ""}

عناوين Pinterest:
${(result.pinterestTitles || []).join("\n")}

وصف Pinterest:
${result.pinterestDescription || ""}

Alt Text:
${result.altText || ""}

هوكات TikTok:
${(result.tiktokHooks || []).join("\n")}

Instagram:
${result.instagramCaption || ""}

الكلمات المفتاحية:
${(result.keywords || []).join("\n")}

التحليل:
${result.analysis || ""}

خطة النشر:
${(result.campaignPlan || []).join("\n")}
    `.trim();

    await navigator.clipboard.writeText(allContent);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1500);
  }

  const activeTabLabel =
    RESULT_TABS.find(
      (tab) => tab.key === activeTab
    )?.label || "";

  return (
    <main className="site">
      <nav className="top-nav">
        <div className="brand">
          <span className="brand-logo">A</span>

          <div>
            <strong>Affilio AI</strong>
            <small>Affiliate Marketing Workspace</small>
          </div>
        </div>

        <span className="version-badge">
          V2
        </span>
      </nav>

      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-label">
            ✨ رابط واحد، حملة كاملة
          </span>

          <h1>
            حوّلي رابط الأفلييت إلى محتوى جاهز للنشر
          </h1>

          <p>
            الصقي رابط Amazon أو SHEIN أو AliExpress أو
            Temu، وسنحاول استخراج بيانات المنتج ثم إنشاء
            محتوى Pinterest وTikTok وInstagram وSEO.
          </p>

          <div className="supported-stores">
            {STORES.slice(1).map((store) => (
              <span key={store}>{store}</span>
            ))}
          </div>
        </div>

        <form
          className="campaign-form"
          onSubmit={generateCampaign}
        >
          <div className="form-heading">
            <span>🚀</span>

            <div>
              <h2>إنشاء حملة جديدة</h2>
              <p>
                أدخلي الرابط أو اسم المنتج للبدء.
              </p>
            </div>
          </div>

          <label className="field">
            <span>رابط الأفلييت</span>

            <input
              type="url"
              inputMode="url"
              placeholder="https://..."
              value={form.productUrl}
              onChange={(event) =>
                updateField(
                  "productUrl",
                  event.target.value
                )
              }
            />
          </label>

          <label className="field">
            <span>
              اسم المنتج
              <small>
                اختياري، لكنه يساعد إذا منع المتجر قراءة الرابط
              </small>
            </span>

            <input
              type="text"
              placeholder="مثال: حذاء PUMA Speedcat Ballet"
              value={form.productName}
              onChange={(event) =>
                updateField(
                  "productName",
                  event.target.value
                )
              }
            />
          </label>

          <label className="field">
            <span>
              أهم ميزة
              <small>اختياري</small>
            </span>

            <input
              type="text"
              placeholder="مريح، أنيق، مناسب للاستخدام اليومي..."
              value={form.benefit}
              onChange={(event) =>
                updateField(
                  "benefit",
                  event.target.value
                )
              }
            />
          </label>

          <div className="form-grid">
            <label className="field">
              <span>المتجر</span>

              <select
                value={form.store}
                onChange={(event) =>
                  updateField(
                    "store",
                    event.target.value
                  )
                }
              >
                {STORES.map((store) => (
                  <option key={store}>
                    {store}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>السوق المستهدف</span>

              <select
                value={form.market}
                onChange={(event) =>
                  updateField(
                    "market",
                    event.target.value
                  )
                }
              >
                <option>السعودية</option>
                <option>الخليج</option>
                <option>الإمارات</option>
                <option>أمريكا</option>
                <option>عالمي</option>
              </select>
            </label>
          </div>

          <label className="field">
            <span>لغة المحتوى</span>

            <select
              value={form.language}
              onChange={(event) =>
                updateField(
                  "language",
                  event.target.value
                )
              }
            >
              <option>العربية</option>
              <option>الإنجليزية</option>
              <option>العربية والإنجليزية</option>
            </select>
          </label>

          {error && (
            <div className="form-error">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            className="generate-button"
            disabled={!canGenerate || loading}
          >
            {loading
              ? "جاري قراءة المنتج وإنشاء الحملة..."
              : "✨ إنشاء الحملة"}
          </button>

          <p className="privacy-note">
            🔒 مفتاح Gemini محفوظ داخل Vercel ولا يظهر
            للمستخدمين.
          </p>
        </form>
      </section>

      <section className="quick-features">
        <article>
          <strong>8+</strong>
          <span>متاجر مدعومة</span>
        </article>

        <article>
          <strong>6</strong>
          <span>حزم محتوى</span>
        </article>

        <article>
          <strong>1</strong>
          <span>ضغطة للتوليد</span>
        </article>

        <article>
          <strong>100%</strong>
          <span>واجهة عربية</span>
        </article>
      </section>

      {result && (
        <section
          id="campaign-results"
          className="campaign-results"
        >
          <div className="results-heading">
            <div>
              <span className="hero-label">
                تم إنشاء الحملة
              </span>

              <h2>نتائج المنتج جاهزة 🎉</h2>
            </div>

            <button
              type="button"
              className="secondary-button"
              onClick={copyEverything}
            >
              {copied ? "تم النسخ ✓" : "نسخ الكل"}
            </button>
          </div>

          <article className="product-card">
            {result.productImage ? (
              <img
                src={result.productImage}
                alt={result.product || "صورة المنتج"}
              />
            ) : (
              <div className="product-placeholder">
                🛍️
              </div>
            )}

            <div className="product-information">
              <span className="store-badge">
                {result.store || "متجر عام"}
              </span>

              <h2>
                {result.product || "المنتج المختار"}
              </h2>

              <p>
                {result.productDescription ||
                  result.scoreReason}
              </p>

              <div className="product-meta">
                {result.detectedBrand && (
                  <span>
                    العلامة: {result.detectedBrand}
                  </span>
                )}

                {result.detectedPrice && (
                  <span>
                    السعر الظاهر:{" "}
                    {result.detectedPrice}{" "}
                    {result.detectedCurrency}
                  </span>
                )}

                {result.extractionStatus && (
                  <span>
                    حالة القراءة:{" "}
                    {result.extractionStatus}
                  </span>
                )}

                {result.modelUsed && (
                  <span>
                    AI: {result.modelUsed}
                  </span>
                )}
              </div>
            </div>

            <div className="product-score">
              {result.score || 0}
              <small>/100</small>
            </div>
          </article>

          {result.temporaryFallback && (
            <div className="fallback-warning">
              ⚠️{" "}
              {result.fallbackReason ||
                "تم عرض نتيجة احتياطية."}
            </div>
          )}

          <div className="result-tabs">
            {RESULT_TABS.map((tab) => (
              <button
                type="button"
                key={tab.key}
                className={
                  activeTab === tab.key
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveTab(tab.key)
                }
              >
                {tab.label}
              </button>
            ))}
          </div>

          <article className="result-card">
            <div className="result-card-heading">
              <h3>{activeTabLabel}</h3>

              <button
                type="button"
                onClick={copyCurrentResult}
              >
                {copied ? "تم النسخ ✓" : "نسخ"}
              </button>
            </div>

            <ResultContent
              value={result[activeTab]}
            />

            {activeTab ===
              "pinterestTitles" && (
              <>
                <hr />

                <h4>وصف Pinterest</h4>

                <p className="result-text">
                  {result.pinterestDescription}
                </p>

                <h4>Alt Text</h4>

                <p className="result-text">
                  {result.altText}
                </p>
              </>
            )}
          </article>
        </section>
      )}

      <footer>
        Affilio AI V2 — مساعد صناعة محتوى الأفلييت.
      </footer>
    </main>
  );
}
