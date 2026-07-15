# Affilio AI v0.1

منصة عربية لتحويل روابط الأفلييت إلى محتوى جاهز للنشر.

## الموجود في هذا الإصدار

- Landing page احترافية
- Dashboard
- دعم إدخال رابط أو اسم منتج
- اختيار المتجر والمنصة والسوق واللغة
- مخرجات Pinterest وTikTok وInstagram وSEO والتحليل
- وضع تجريبي يعمل بدون مفتاح API
- ربط OpenAI من جهة الخادم
- تصميم متجاوب مع الآيفون

## التشغيل

```bash
npm install
npm run dev
```

انسخي `.env.example` إلى `.env.local` ثم أضيفي:

```bash
OPENAI_API_KEY=ضع_المفتاح_هنا
```

## النشر على Vercel

1. ارفعي المشروع إلى مستودع `affilio-ai` في GitHub.
2. اربطي المستودع بـ Vercel.
3. أضيفي `OPENAI_API_KEY` من Project Settings > Environment Variables.
4. اضغطي Deploy.

## ملاحظة

بعض روابط الأفلييت المختصرة أو الصفحات المحمية لا تسمح باستخراج بيانات المنتج. في هذه الحالة اكتبي اسم المنتج أو ارفعي صورته.
