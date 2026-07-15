import { NextResponse } from "next/server";

const GEMINI_MODEL = "gemini-3-flash-preview";

function detectStore(url = "", chosen = "") {
  if (chosen && chosen !== "تلقائي") {
    return chosen;
  }

  const value = String(url).toLowerCase();

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
      "احفظي هذا المنتج قبل ما تنسينه",
    ],
    pinterestDescription:
      `اكتشفي ${product} من ${store}. ` +
      "منتج مناسب لمحتوى التسوق والإلهام اليومي. " +
      "احفظي المنشور للرجوع إليه واضغطي رابط الأفلييت لمشاهدة التفاصيل.",
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
      "الجمهور المقترح: المهتمات بالتسوق والمنتجات الجديدة.\n" +
      "المنصة الأقوى: Pinterest للمحتوى طويل العمر، ثم TikTok للاكتشاف السريع.\n" +
      "زاوية التسويق: ركزي على الفائدة والشكل وسبب استحقاق المنتج للحفظ.",
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
  const parts = data?.candidates?.[0]?.content?.parts;

  if (!Array.isArray(parts)) {
    return "";
  }

  return parts
    .map((part) => part?.text || "")
    .join("")
    .trim();
}

function removeMarkdownCodeBlock(text) {
  return text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

export async function POST(request) {
  try {
    const body = await request.json();

    const productName = String(body.productName || "").trim();
    const productUrl = String(body.productUrl || "").trim();

    if (!productName && !productUrl) {
      return NextResponse.json(
        {
          error: "أضيفي رابط المنتج أو اسم المنتج.",
        },
        {
          status: 400,
        }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(createDemoResult(body));
    }

    const store = detectStore(productUrl, body.store);

    const prompt = `
أنت خبير تسويق أفلييت وSEO وصناعة محتوى للسوشيال ميديا.

أنشئ حملة تسويقية احترافية للمنتج التالي.

بيانات المنتج:

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

اللغة المطلوبة:
${body.language || "العربية"}

تعليمات إلزامية:

- لا تخترع سعرًا أو خصمًا أو تقييمًا.
- لا تخترع مواصفات غير مذكورة.
- لا تقل إن المنتج ترند كحقيقة مؤكدة.
- لا تدّعي أنك فتحت الرابط أو قرأت الصفحة.
- اجعل المحتوى طبيعيًا ومناسبًا للسوق المستهدف.
- اجعل العناوين جذابة دون مبالغة أو تضليل.
- أعد النتيجة بصيغة JSON صحيحة فقط.
- لا تضع Markdown.
- لا تضع علامات \`\`\`.
- لا تضع أي شرح خارج JSON.

أعد JSON بالمفاتيح التالية فقط:

{
  "product": "اسم المنتج",
  "store": "اسم المتجر",
  "score": 90,
  "scoreReason": "سبب مختصر للتقييم",
  "pinterestTitles": [
    "عنوان Pinterest الأول",
    "عنوان Pinterest الثاني",
    "عنوان Pinterest الثالث",
    "عنوان Pinterest الرابع",
    "عنوان Pinterest الخامس"
  ],
  "pinterestDescription": "وصف Pinterest مناسب للبحث والحفظ",
  "altText": "نص بديل واضح للصورة",
  "tiktokHooks": [
    "هوك TikTok الأول",
    "هوك TikTok الثاني",
    "هوك TikTok الثالث",
    "هوك TikTok الرابع",
    "هوك TikTok الخامس"
  ],
  "instagramCaption": "كابشن Instagram مع دعوة تفاعل مناسبة",
  "keywords": [
    "كلمة مفتاحية 1",
    "كلمة مفتاحية 2",
    "كلمة مفتاحية 3",
    "كلمة مفتاحية 4",
    "كلمة مفتاحية 5",
    "كلمة مفتاحية 6",
    "كلمة مفتاحية 7",
    "كلمة مفتاحية 8",
    "كلمة مفتاحية 9",
    "كلمة مفتاحية 10",
    "كلمة مفتاحية 11",
    "كلمة مفتاحية 12",
    "كلمة مفتاحية 13",
    "كلمة مفتاحية 14",
    "كلمة مفتاحية 15"
  ],
  "analysis": "تحليل الجمهور والمنصة الأفضل وزاوية التسويق",
  "campaignPlan": [
    "خطة اليوم 1",
    "خطة اليوم 2",
    "خطة اليوم 3",
    "خطة اليوم 4",
    "خطة اليوم 5",
    "خطة اليوم 6",
    "خطة اليوم 7"
  ]
}
`;

    const endpoint =
      `https://generativelanguage.googleapis.com/v1beta/models/` +
      `${GEMINI_MODEL}:generateContent`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
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
          maxOutputTokens: 4096,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage =
        data?.error?.message ||
        "تعذر الاتصال بخدمة Gemini حاليًا.";

      return NextResponse.json(
        {
          error: errorMessage,
        },
        {
          status: response.status || 500,
        }
      );
    }

    const generatedText = extractGeminiText(data);

    if (!generatedText) {
      return NextResponse.json(
        {
          error: "لم تصل نتيجة من Gemini. أعيدي المحاولة.",
        },
        {
          status: 502,
        }
      );
    }

    const cleanText = removeMarkdownCodeBlock(generatedText);

    let result;

    try {
      result = JSON.parse(cleanText);
    } catch (parseError) {
      console.error("Gemini JSON parse error:", parseError);
      console.error("Gemini response:", cleanText);

      return NextResponse.json(
        {
          error:
            "وصلت نتيجة غير منظمة من Gemini. أعيدي المحاولة.",
        },
        {
          status: 502,
        }
      );
    }

    return NextResponse.json({
      ...result,
      demo: false,
      store: result.store || store,
    });
  } catch (error) {
    console.error("Generate route error:", error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          "حدث خطأ غير متوقع أثناء إنشاء الحملة.",
      },
      {
        status: 500,
      }
    );
  }
}
