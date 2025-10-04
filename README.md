# نظام إدارة السجلات القانونية - Frontend Only

نظام شامل لإدارة السجلات القانونية بالعربية، يعمل بالكامل على frontend ويتصل مباشرة بـ Google Sheets.

## 🚀 المميزات

- **Frontend Only**: لا يحتاج backend - يعمل بالكامل في المتصفح
- **Google Sheets Integration**: اتصال مباشر بـ Google Sheets لقراءة وتحديث البيانات
- **Dynamic Headers**: يسحب أسماء الأعمدة تلقائياً من الشيت
- **Role-Based Access**: نظام صلاحيات (Admin/User) مبني على localStorage
- **Arabic RTL**: تصميم كامل بالعربية مع دعم RTL

## 📋 المتطلبات

1. **Node.js 18+**
2. **Google Sheets API Key** - احصل عليه من [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
3. **Google Sheet** - يجب أن يكون الشيت متاح للقراءة/الكتابة عبر API

## 🛠 التثبيت

```bash
# تثبيت المكتبات
npm install

# نسخ ملف البيئة
cp .env.example .env

# أضف Google Sheets API Key في ملف .env
# VITE_GOOGLE_SHEETS_API_KEY=your_api_key_here
```

## 🔑 إعداد Google Sheets API

1. افتح [Google Cloud Console](https://console.cloud.google.com/)
2. أنشئ مشروع جديد أو اختر موجود
3. فعّل Google Sheets API
4. أنشئ API Key من Credentials
5. ضع الـ API Key في ملف `.env`:
   ```
   VITE_GOOGLE_SHEETS_API_KEY=YOUR_API_KEY_HERE
   ```
6. تأكد أن الشيت متاح للقراءة/الكتابة عبر API

## 🎯 التشغيل

### Development
```bash
npm run dev
```
سيعمل الموقع على: http://localhost:5000

### Production Build
```bash
npm run build
npm run preview
```

## 🔐 بيانات الدخول

### حساب المدير
- **اسم المستخدم**: `admin`
- **كلمة المرور**: `admin123`

### حساب المستخدم العادي
- **اسم المستخدم**: `user`
- **كلمة المرور**: `user123`

## 🌐 Deploy على Vercel

المشروع جاهز للرفع على Vercel:

```bash
# تثبيت Vercel CLI
npm i -g vercel

# Deploy
vercel
```

أو:
1. ارفع المشروع على GitHub
2. استورد في Vercel
3. أضف Environment Variable: `VITE_GOOGLE_SHEETS_API_KEY`

## 📊 كيفية الاستخدام

1. **تسجيل الدخول**: استخدم أحد الحسابات أعلاه
2. **عرض السجلات**: تُجلب مباشرة من Google Sheets
3. **تعديل سجل**: 
   - **Admin**: يمكنه تعديل كل الحقول
   - **User**: يمكنه إضافة بيانات فقط (append-only)
4. **التحليلات**: إحصائيات تلقائية من السجلات

## 🔧 تعديل Sheet ID

عدّل في `client/src/lib/googleSheets.ts`:

```typescript
const SPREADSHEET_ID = 'YOUR_SHEET_ID_HERE';
```

## 🏗 البنية

```
client/
├── src/
│   ├── components/     # مكونات UI
│   ├── contexts/       # Auth Context (localStorage)
│   ├── hooks/          # Custom hooks (useSheetRecords)
│   ├── lib/            # Google Sheets service
│   └── pages/          # الصفحات
vercel.json             # تهيئة Vercel
vite.config.ts          # تهيئة Vite
```

## 📝 ملاحظات

- **Demo Data**: إذا لم يتم توفير API key، سيستخدم بيانات تجريبية
- **Headers**: يسحب النظام أسماء الأعمدة من الصف الأول في الشيت
- **Security**: API key معرّض في frontend - استخدم API key restrictions في Google Cloud Console

## 🤝 المساهمة

المشروع مفتوح المصدر ونرحب بالمساهمات!

## 📄 الترخيص

MIT License
