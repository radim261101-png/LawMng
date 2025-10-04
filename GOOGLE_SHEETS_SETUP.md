# إعداد Google Sheets API

## المشكلة الحالية
التطبيق يحاول قراءة البيانات من Google Sheet ولكن لا يوجد مفتاح API مُعد بشكل صحيح، مما يسبب أخطاء 403 و 400.

## معلومات الشيت
- **Spreadsheet ID**: `1osNFfmWeDLb39IoAcylhxkMmxVoj0WTIAFxpkA1ghO4`
- **رابط الشيت**: https://docs.google.com/spreadsheets/d/1osNFfmWeDLb39IoAcylhxkMmxVoj0WTIAFxpkA1ghO4/edit

## الحل: الحصول على API Key

### الخطوة 1: إنشاء API Key في Google Cloud Console

1. افتح [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
2. إذا لم يكن لديك مشروع، اضغط "Create Project" وأنشئ مشروع جديد
3. اذهب إلى "APIs & Services" → "Library"
4. ابحث عن "Google Sheets API" وفعّله (Enable)
5. ارجع إلى "Credentials"
6. اضغط "Create Credentials" → "API Key"
7. **انسخ المفتاح** - سنحتاجه في الخطوة التالية

### الخطوة 2: جعل الشيت قابل للقراءة

**مهم جداً**: يجب أن يكون الشيت قابل للقراءة بواسطة أي شخص لديه الرابط

1. افتح [الشيت](https://docs.google.com/spreadsheets/d/1osNFfmWeDLb39IoAcylhxkMmxVoj0WTIAFxpkA1ghO4/edit)
2. اضغط زر "Share" أو "مشاركة" (في أعلى اليمين)
3. في قسم "Get link" أو "الحصول على رابط":
   - اختر "Anyone with the link" أو "أي شخص لديه الرابط"
   - اختر "Viewer" أو "مشاهد" (للقراءة فقط)
4. اضغط "Copy link" أو "Done"

### الخطوة 3: إضافة API Key في Replit

1. في Replit، اضغط على أيقونة 🔒 "Secrets" في القائمة الجانبية اليسرى
2. اضغط "New Secret" أو "+ New Secret"
3. أدخل:
   - **Key**: `VITE_GOOGLE_SHEETS_API_KEY`
   - **Value**: [المفتاح الذي نسخته من Google Cloud Console]
4. اضغط "Add new secret"
5. **أعد تشغيل التطبيق** بالضغط على زر "Stop" ثم "Run"

## التحقق من نجاح الإعداد

بعد إضافة API Key وإعادة تشغيل التطبيق:

1. سجّل دخول إلى التطبيق (admin / admin123 أو user / user123)
2. يجب أن ترى جميع السجلات من Google Sheet
3. لن ترى أخطاء 403 أو 400 في Console

## إذا استمرت المشكلة

إذا استمرت رسائل الخطأ:

1. تأكد أن API Key صحيح ومنسوخ بالكامل
2. تأكد أن Google Sheets API مفعّل في مشروعك
3. تأكد أن الشيت قابل للقراءة (Anyone with the link can view)
4. تأكد من إعادة تشغيل التطبيق بعد إضافة Secret
5. افتح Developer Console (F12) وتحقق من رسائل الخطأ

## الخيار البديل: Service Account (أكثر أماناً)

إذا أردت طريقة أكثر أماناً (لا تتطلب جعل الشيت عام):

1. أنشئ Service Account في Google Cloud Console
2. حمّل ملف JSON credentials
3. شارك الشيت مع البريد الإلكتروني للـ Service Account
4. أضف Secret في Replit:
   - Key: `GOOGLE_CREDENTIALS`
   - Value: [محتوى ملف JSON بالكامل]

**ملاحظة**: هذا الخيار يتطلب تشغيل Backend، بينما الخيار الأول (API Key) يعمل مع Frontend فقط.

## معلومات إضافية

- التطبيق حالياً يعمل في وضع Frontend-only
- يستخدم Vite dev server على المنفذ 5000
- البيانات التجريبية تظهر عند عدم وجود API Key
