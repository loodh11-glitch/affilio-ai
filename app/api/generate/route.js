import { NextResponse } from "next/server";

const GEMINI_MODELS = [
  "gemini-3.1-flash-lite-preview",
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash",
  "gemini-2.5-flash-lite",
];

const RETRYABLE_STATUS_CODES = [429, 500, 502, 503, 504];

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

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

function createDemoResult(body, reason = "") {
  const product = body.productName || "المنتج المختار";
  const store = detectStore(body.productUrl, body.store);

  return {
    demo: true,
    temporaryFallback: Boolean(reason),
    fallbackReason: reason,
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

function cleanJsonText(text) {
  return String(text)
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function buildPrompt(body, store, productName, productUrl) {
  return `
أنت خبير تسويق أفلييت وSEO وصناعة محتوى للسوشيال ميديا.

أنشئ حملة تسويقية احترافية للمنتج التالي.

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
- لا تدّعي أنك فتحت الرابط أو قرأت صفحة المنتج.
- اجعل المحتوى طبيعيًا ومناسبًا للسوق.
- اجعل العناوين جذابة دون تضليل.
- أعد JSON صحيحًا فقط.
- لا تضع Markdown.
- لا تضع أي شرح خارج JSON.

أعد JSON بهذه المفاتيح فقط:

{
  "product": "اسم المنتج",
  "store": "اسم المتجر",
  "score": 90,
  "scoreReason": "سبب مختصر للتقييم",
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
}

async function callGemini({ apiKey, model, prompt }) {
  const endpoint =
    `https://generativelanguage.googleapis.com/v1beta/models/` +
    `${model}:generateContent`;

  return fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7,
        maxOutputTokens: 4096,
      },
    }),
  });
}

async function generateWithFallback({ apiKey, prompt }) {
  const errors = [];

  for (const model of GEMINI_MODELS) {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const response = await callGemini({
          apiKey,
          model,
          prompt,
        });

        const data = await response.json();

        if (response.ok) {
          const text = extractGeminiText(data);

          if (!text) {
            errors.push(`${model}: رد فارغ`);
            break;
          }

          return {
            model,
            text,
          };
        }

        const message =
          data?.error?.message ||
          `تعذر استخدام الموديل ${model}.`;

        errors.push(`${model}: ${message}`);

        const retryable =
          RETRYABLE_STATUS_CODES.includes(response.status);

        if (!retryable) {
          break;
        }

        if (attempt < 2) {
          const delay = 1000 * 2 ** attempt;
          await sleep(delay);
        }
      } catch (error) {
        errors.push(
          `${model}: ${error?.message || "خطأ في الاتصال"}`
        );

        if (attempt < 2) {
          const delay = 1000 * 2 ** attempt;
          await sleep(delay);
        }
      }
    }
  }

  throw new Error(errors.join(" | "));
}

export async function POST(request) {
  try {
    const body = await request.json();

    const productName = String(
      body.productName || ""
    ).trim();

    const productUrl = String(
      body.productUrl || ""
    ).trim();

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
      return NextResponse.json(
        createDemoResult(
          body,
          "مفتاح Gemini غير مضاف إلى Vercel."
        )
      );
    }

    const store = detectStore(
      productUrl,
      body.store
    );

    const prompt = buildPrompt(
      body,
      store,
      productName,
      productUrl
    );

    let generated;

    try {
      generated = await generateWithFallback({
        apiKey,
        prompt,
      });
    } catch (error) {
      console.error(
        "All Gemini models failed:",
        error
      );

      return NextResponse.json(
        createDemoResult(
          body,
          "خدمة Gemini مزدحمة مؤقتًا؛ تم عرض نتيجة احتياطية."
        )
      );
    }

    const cleanText = cleanJsonText(
      generated.text
    );

    let result;

    try {
      result = JSON.parse(cleanText);
    } catch (error) {
      console.error(
        "Gemini JSON parse error:",
        error
      );

      console.error(
        "Gemini response:",
        cleanText
      );

      return NextResponse.json(
        createDemoResult(
          body,
          "تعذر قراءة رد Gemini؛ تم عرض نتيجة احتياطية."
        )
      );
    }

    return NextResponse.json({
      ...result,
      demo: false,
      temporaryFallback: false,
      modelUsed: generated.model,
      store: result.store || store,
    });
  } catch (error) {
    console.error(
      "Generate route error:",
      error
    );

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
