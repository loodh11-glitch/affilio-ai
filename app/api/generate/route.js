import { NextResponse } from "next/server";

function detectStore(url = "", chosen = "") {
  if (chosen && chosen !== "تلقائي") return chosen;

  const value = url.toLowerCase();

  const stores = [
    ["Amazon", ["amazon.", "amzn.to"]],
    ["SHEIN", ["shein.", "onelink.shein.com"]],
    ["AliExpress", ["aliexpress.", "s.click.aliexpress.com"]],
    ["Temu", ["temu."]],
    ["Noon", ["noon."]],
    ["Etsy", ["etsy."]],
    ["eBay", ["ebay."]],
    ["Walmart", ["walmart."]],
  ];

  for (const [name, domains] of stores) {
    if (domains.some((domain) => value.includes(domain))) {
      return name;
    }
  }

  return "متجر عام";
}

function createDemoResult(body) {
  const product = body.productName || "المنتج المختار";
  const store = detectStore(body.productUrl, body.store);

  return {
    demo: true,
    product,
    store,
    score: 91,
    scoreReason:
      "منتج مناسب لمحتوى التسوق والاكتشاف، مع فرصة جيدة على Pinterest وTikTok.",
    pinterestTitles: [
      `${product} — اكتشاف يستحق الحفظ`,
      `ليش ${product} من المنتجات الملفتة؟`,
      `${product}: اختيار مناسب لقائمة مشترياتك`,
      `منتج من ${store} يستحق المشاهدة`,
      `احفظي هذا المنتج قبل ما تنسينه`,
    ],
    pinterestDescription: `اكتشفي ${product} من ${store}. منتج مناسب لمحتوى التسوق والإلهام اليومي. احفظي المنشور للرجوع إليه واضغطي رابط الأفلييت لمشاهدة التفاصيل.`,
    altText: `صورة ${product} معروضة كاقتراح تسوق من ${store}.`,
    tiktokHooks: [
      "وقفي السكرول… هذا المنتج شدني من أول نظرة!",
      `لقيت لكم ${product} وأحس يستحق المشاهدة.`,
      "هذا من الاكتشافات اللي تنحفظ فورًا.",
      "هل يستحق الشراء؟ شوفوا التفاصيل أول.",
      "منتج بسيط لكن ممكن يفرق معك كثير.",
    ],
    instagramCaption: `اكتشاف اليوم ✨

${product}

اختيار ملفت ومناسب لمحتوى التسوق. هل تضيفينه لقائمة مشترياتك؟`,
    keywords: [
      product,
      `${product} ${store}`,
      "منتجات أفلييت",
      "أفكار تسوق",
      "منتجات تستحق",
      "محتوى Pinterest",
      "تسوق أونلاين",
      "مشتريات أونلاين",
      "منتج اليوم",
      "رابط أفلييت",
      "أفضل المنتجات",
      "توصيات تسوق",
      "منتجات رائجة",
      "عروض أونلاين",
      "اكتشافات تسوق",
    ],
    analysis:
      "الجمهور المقترح: المهتمات بالتسوق والمنتجات الجديدة.\nالمنصة الأقوى: Pinterest للمحتوى طويل العمر، ثم TikTok للاكتشاف السريع.\nزاوية التسويق: ركزي على الفائدة والشكل وسبب استحقاق المنتج للحفظ.",
    campaignPlan: [
      "اليوم 1: Pin بصورة المنتج وعنوان فضولي.",
      "اليوم 2: TikTok قصير بهوك سريع.",
      "اليوم 3: Instagram Reel مع سؤال تفاعلي.",
      "اليوم 4: Pin ثانٍ بكلمة مفتاحية مختلفة.",
      "اليوم 5: Story مع تصويت.",
      "اليوم 6: منشور مقارنة أو استخدام.",
      "اليوم 7: إعادة نشر أفضل زاوية مع دعوة للرابط.",
    ],
  };
}

function extractGeminiText(data) {
  return (
    data?.candidates?.[0]?.content?.parts
      ?.map((part) => part?.text || "")
      .join("")
      .trim() || ""
  );
}

export async function POST(request) {
  try {
    const body = await request.json();

    const productName = body.productName?.trim() || "";
    const productUrl = body.productUrl?.trim() || "";

    if (!productName && !productUrl) {
      return NextResponse.json(
        { error: "أضيفي رابط المنتج أو اسم المنتج." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(createDemoResult(body));
    }

    const store = detectStore(productUrl, body.store);

    const prompt = `
أنت خبير تسويق أفلييت وSEO وصناعة محتوى للسوشيال ميديا.

أنشئ حملة تسويقية للمنتج التالي:

اسم المنتج:
${productName || "غير متوفر"}

رابط الأفلييت:
${productUrl || "غير متوفر"}

المتجر:
${store}

أهم فائدة:
${body.benefit || "غير متوفرة"}

السوق المستهدف:
${body.market || "السعودية"}

اللغة:
${body.language || "العربية"}

التعليمات:
- لا تخترع سعرًا أو خصمًا أو تقييمًا.
- لا تخترع مواصفات غير مذكورة.
- لا تقل إن المنتج ترند كحقيقة مؤكدة.
- اجعل المحتوى طبيعيًا ومناسبًا للسوق.
- أعد النتيجة بصيغة JSON فقط.
- لا تضع Markdown.
- لا تضع أي كلام خارج JSON.

أعد JSON بالمفاتيح التالية فقط:

{
  "product": "اسم المنتج",
  "store": "اسم المتجر",
  "score": 90,
  "scoreReason": "سبب التقييم",
  "pinterestTitles": [
    "عنوان 1",
    "عنوان 2",
    "عنوان 3",
    "عنوان 4",
    "عنوان 5"
  ],
  "pinterestDescription": "وصف Pinterest",
  "altText": "النص البديل للصورة",
  "tiktokHooks": [
    "هوك 1",
    "هوك 2",
    "هوك 3",
    "هوك 4",
    "هوك 5"
  ],
  "instagramCaption": "كابشن Instagram",
  "keywords": [
    "كلمة 1",
    "كلمة 2",
    "كلمة 3",
    "كلمة 4",
    "كلمة 5",
    "كلمة 6",
    "كلمة 7",
    "كلمة 8",
    "كلمة 9",
    "كلمة 10",
    "كلمة 11",
    "كلمة 12",
    "كلمة 13",
    "كلمة 14",
    "كلمة 15"
  ],
  "analysis": "تحليل الجمهور والمنصة وزاوية التسويق",
  "campaignPlan": [
    "اليوم 1",
    "اليوم 2",
    "اليوم 3",
    "اليوم 4",
    "اليوم 5",
    "اليوم 6",
    "اليوم 7"
  ]
}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(
        apiKey
      )}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.7,
            maxOutputTokens: 4096,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const errorMessage =
        data?.error?.message || "تعذر الاتصال بخدمة Gemini.";

      return NextResponse.json(
        { error: errorMessage },
        { status: response.status || 500 }
      );
    }

    const generatedText = extractGeminiText(data);

    if (!generatedText) {
      return NextResponse.json(
        { error: "لم تصل نتيجة من Gemini. أعيدي المحاولة." },
        { status: 502 }
      );
    }

    let result;

    try {
      result = JSON.parse(generatedText);
    } catch {
      return NextResponse.json(
        { error: "وصلت نتيجة غير منظمة من Gemini. أعيدي المحاولة." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ...result,
      demo: false,
      store: result.store || store,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error?.message || "حدث خطأ غير متوقع.",
      },
      { status: 500 }
    );
  }
}
