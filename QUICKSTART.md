# دليل البدء السريع مع AILA
## AILA Quick Start Guide

---

## 🚀 البدء السريع

### 1. استنساخ المشروع

```bash
git clone https://github.com/aila-ai/aila.git
cd aila
```

### 2. تثبيت التبعيات

```bash
npm install
```

### 3. تشغيل في وضع التطوير

```bash
npm run dev
```

### 4. البناء للإنتاج

```bash
npm run build
```

---

## ⚙️ الإعداد الأولي

### إنشاء ملف الإعدادات

أنشئ ملف `.env` في جذر المشروع:

```env
# Groq API (مجاني)
GROQ_API_KEY=your_groq_api_key

# OpenAI (اختياري)
OPENAI_API_KEY=your_openai_api_key

# Firebase (اختياري للـ sync)
FIREBASE_API_KEY=your_firebase_api_key
```

### الحصول على API Key

| المزود | الرابط | ملاحظات |
|--------|--------|---------|
| Groq | [console.groq.com](https://console.groq.com) | ✅ مجاني للمبتدئين |
| OpenAI | [platform.openai.com](https://platform.openai.com) | pay-as-you-go |
| Anthropic | [console.anthropic.com](https://console.anthropic.com) | $5 مجاني |

---

## 📁 هيكل المشروع

```
AILA/
├── src/
│   ├── core/           # النواة الأساسية
│   │   ├── event-bus/  # نظام الأحداث
│   │   ├── config/     # إدارة الإعدادات
│   │   ├── logger/     # نظام التسجيل
│   │   └── plugin-system/ # نظام الإضافات
│   ├── providers/       # مزودو الذكاء الاصطناعي
│   │   └── ai/        # Groq, OpenAI, etc.
│   ├── memory/         # نظام الذاكرة
│   ├── tools/          # الأدوات
│   ├── voice/          # معالجة الصوت
│   ├── security/        # الأنظمة الأمنية
│   ├── ui/             # واجهة المستخدم
│   │   └── components/ # مكونات Lit
│   └── iot/            # إنترنت الأشياء
├── public/             # الملفات الثابتة
├── docs/               # التوثيق
└── tests/              # الاختبارات
```

---

## 🎯 الاستخدام الأساسي

### في المتصفح

```typescript
import { AILA, AILA_EVENTS } from 'aila';

// الحصول على مثيل AILA
const aila = AILA.getInstance();

// انتظار التهيئة
await aila.initialize();

// إرسال رسالة
const response = await aila.chat('مرحباً، كيف حالك؟');

// الاستماع للأحداث
aila.getEventBus().subscribe(AILA_EVENTS.MESSAGE_RECEIVED, (event) => {
  console.log('رسالة جديدة:', event.payload);
});
```

### استخدام مكونات الويب

```html
<!-- في HTML -->
<aila-app 
  mode="chat"
  theme="dark"
  locale="ar">
</aila-app>

<script type="module">
  import 'aila/ui';
  
  const app = document.querySelector('aila-app');
  
  app.addEventListener('message', (e) => {
    console.log('رسالة:', e.detail);
  });
</script>
```

---

## 🎤 الوضع الصوتي

### تفعيل Wake Word

```typescript
import { getConfigManager } from 'aila/core/config';

const config = getConfigManager();
config.set('voice.wakeWord.enabled', true);
config.set('voice.wakeWord.words', ['hey aila', 'aila']);
```

### استخدام Voice Mode

```typescript
// تحويل النص إلى صوت
await aila.voice.speak('مرحباً! أنا AILA');

// الاستماع للصوت
aila.voice.listen((transcript) => {
  console.log('تم التعرف على:', transcript);
});
```

---

## 🔧 التخصيص

### تغيير الثيم

```typescript
config.set('ui.theme', 'dark'); // أو 'light'
```

### تغيير اللغة

```typescript
config.set('ui.locale', 'ar');  // العربية
config.set('ui.locale', 'ar-EG'); // المصرية
config.set('ui.locale', 'en');  // الإنجليزية
```

### تغيير مزود AI

```typescript
config.set('ai.provider', 'groq');
config.set('ai.model', 'llama-3.3-70b-versatile');
```

---

## 📦 النشر

### Cloudflare Pages

```bash
npm run build
# ارفع مجلد dist إلى Cloudflare Pages
```

### Firebase Hosting

```bash
npm run build
firebase deploy --only hosting
```

### Netlify

```bash
npm run build
# اسحب مجلد dist إلى Netlify
```

---

## 🧪 الاختبارات

```bash
# تشغيل الاختبارات
npm run test

# مع التغطية
npm run test:coverage

# وضع المراقبة
npm run test:watch
```

---

## 📚 الوثائق

| الوثيقة | الوصف |
|---------|-------|
| [README](README.md) | نظرة عامة على المشروع |
| [SPEC](SPEC.md) | المواصفات التقنية الكاملة |
| [ARCHITECTURE](ARCHITECTURE.md) | مخططات النظام |
| [ROADMAP](ROADMAP.md) | خطة التطوير |
| [CONTRIBUTING](CONTRIBUTING.md) | دليل المساهمة |

---

## 🆘 الدعم

- 📖 [الوثائق](docs/)
- 🐛 [المشاكل](https://github.com/aila-ai/aila/issues)
- 💬 [النقاشات](https://github.com/aila-ai/aila/discussions)

---

## 📄 الرخصة

MIT License - راجع [LICENSE](LICENSE)

---

<div align="center">
  <p>صُنع بـ ❤️ للمجتمع العربي والعالمي</p>
  <p>AILA - Your Intelligent Life Companion</p>
</div>
