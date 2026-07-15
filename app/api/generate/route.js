import { NextResponse } from "next/server";

function detectStore(url = "", chosen = "") {
  if (chosen && chosen !== "تلقائي") return chosen;
  const value = url.toLowerCase();
  const rules = [
    ["Amazon", ["amazon.", "amzn.to"]],
    ["SHEIN", ["shein.", "onelink.shein.com"]],
    ["AliExpress", ["aliexpress.", "s.click.aliexpress.com"]],
    ["Temu", ["temu."]],
    ["Noon", ["noon."]],
    ["Etsy", ["etsy."]],
    ["eBay", ["ebay."]],
    ["Walmart", ["walmart."]]
  ];
  for (const [name, domains] of rules) {
    if (domains.some((domain) => value.includes(domain))) return name;
  }
  return "متجر عام";
}

function demo(body) {
  const product = body.productName || "المنتج المختار";
  const store = detectStore(body.productUrl, body.store);
  return {
    demo: true,
    product,
    store,
    score: 91,
    scoreReason: `منتج بصري مناسب لمحتوى الاكتشاف والتسوق، مع فرصة جيدة على Pinterest وTikTok ضمن سوق ${body.market || "المستهدف"}.`,
    pinterestTitles: [
      `${product} — اكتشاف أنيق يستحق الحفظ`,
      `ليش ${product} صار من المنتجات الملفتة؟`,
      `${product}: اختيار مناسب لقائمة مشترياتك`,
      `منتج ترند من ${store} يستحق المشاهدة`,
      `احفظي هذا المنتج قبل ما تنسينه`
    ],
    pinterestDescription: `اكتشفي ${product} من ${store}. منتج مناسب لمحتوى التسوق والإلهام اليومي. احفظي المنشور للرجوع إليه واضغطي رابط الأفلييت لمشاهدة التفاصيل المتاحة.`,
    altText: `صورة ${product} معروضة كاقتراح تسوق من ${store}.`,
    tiktokHooks: [
      "وقفي السكرول… هذا المنتج شدني من أول نظرة!",
      `لقيت لكم ${product} وأحس بيصير ترند.`,
      "القطعة اللي ترفع الإطلالة بدون مجهود ✨",
      "هذا من الاكتشافات اللي تنحفظ فورًا.",
      "هل يستحق الشراء؟ شوفوا التفاصيل أول."
    ],
    instagramCaption: `اكتشاف اليوم ✨\n${product}\nاختيار ملفت وسهل تقديمه ضمن تنسيقات ومحتوى تسوق. هل تضيفينه لقائمة مشترياتك؟`,
    keywords: [product, `${product} ${store}`, "اكتشافات أفلييت", "منتجات ترند", "أفكار تسوق", "عروض أونلاين", "منتجات تستحق", "محتوى Pinterest", "تسوق نسائي", "مشتريات أونلاين", "تنسيقات", "منتج اليوم", "رابط أفلييت", "أفضل المنتجات", "توصيات تسوق"],
    analysis: `الجمهور المقترح: مهتمات بالتسوق والموضة والمنتجات الرائجة.\nالمنصة الأقوى: Pinterest للمحتوى طويل العمر، ثم TikTok للاكتشاف السريع.\nزاوية التسويق: ركزي على الشكل، سهولة الاستخدام، ولماذا يستحق الحفظ.`,
    campaignPlan: [
      "اليوم 1: Pin بصورة المنتج وعنوان فضولي.",
      "اليوم 2: TikTok قصير بهوك سريع وتفاصيل المنتج.",
      "اليوم 3: Instagram Reel مع سؤال تفاعلي.",
      "اليوم 4: Pin ثانٍ بكلمة مفتاحية مختلفة.",
      "اليوم 5: Story مع تصويت: يستحق أو لا؟",
      "اليوم 6: منشور مقارنة أو تنسيق.",
      "اليوم 7: إعادة نشر أفضل زاوية مع CTA للرابط."
    ]
  };
}

function clean(text) {
  return text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.productName?.trim() && !body.productUrl?.trim()) {
      return NextResponse.json({ error: "أضيفي رابط المنتج أو اسمه." }, { status: 400 });
    }

    const key = process.env.OPENAI_API_KEY;
    if (!key) return NextResponse.json(demo(body));

    const store = detectStore(body.productUrl, body.store);
    const prompt = `أنت خبير تسويق أفلييت وSEO. أنشئ محتوى دقيقًا وقابلًا للنشر للمنتج التالي:
اسم المنتج: ${body.productName || "غير متوفر"}
الرابط: ${body.productUrl || "غير متوفر"}
المتجر: ${store}
الفائدة: ${body.benefit || "استنتجها دون اختلاق مواصفات"}
السوق: ${body.market}
اللغة: ${body.language}

أعد JSON فقط بهذه المفاتيح:
product string
score number
scoreReason string
pinterestTitles array من 5
pinterestDescription string
altText string
tiktokHooks array من 5
instagramCaption string
keywords array من 15
analysis string
campaignPlan array من 7

لا تخترع سعرًا أو خصمًا أو تقييمًا أو مواصفات غير معروفة. لا تغيّر رابط الأفلييت.`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-5-mini",
        input: prompt,
        text: { format: { type: "json_object" } }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: data?.error?.message || "تعذر الاتصال بالذكاء الاصطناعي." }, { status: 500 });
    }

    const output = data.output_text || data.output?.flatMap((x) => x.content || []).find((x) => x.type === "output_text")?.text;
    if (!output) throw new Error("لم يصل رد من النموذج.");
    return NextResponse.json(JSON.parse(clean(output)));
  } catch (error) {
    return NextResponse.json({ error: error.message || "حدث خطأ غير متوقع." }, { status: 500 });
  }
}
