# 🏥 نظام إدارة مستشفى المشروع الأول الطبي - Frontend

نظام إدارة شامل ومتطور للمستشفيات مبني بأحدث التقنيات لتوفير تجربة مستخدم استثنائية.

## ✨ المميزات

### 🎨 التصميم والواجهة

- **تصميم عصري ومتجاوب**: واجهة مستخدم جميلة تعمل على جميع الأجهزة
- **دعم RTL كامل**: مخصص للغة العربية مع دعم كامل للكتابة من اليمين إلى اليسار
- **رسوم متحركة سلسة**: انتقالات جميلة باستخدام Framer Motion
- **Sidebar ذكي**: قابل للطي والتوسع مع إحصائيات سريعة
- **نظام ألوان طبي**: ألوان مخصصة لبيئة المستشفيات

### 🚀 الأداء والتقنية

- **Vite**: أسرع أداة تطوير لـ React
- **React 18**: أحدث إصدار من React
- **Tailwind CSS**: تصميم سريع ومرن
- **TypeScript Ready**: جاهز لدعم TypeScript
- **Hot Module Replacement**: تحديث فوري بدون إعادة تحميل الصفحة

### 📱 الوظائف الأساسية

- **لوحة تحكم تفاعلية**: إحصائيات شاملة ونشاط حديث
- **إدارة المرضى**: إضافة وتعديل وبحث في بيانات المرضى
- **إدارة الأطباء**: إدارة شاملة لبيانات الأطباء
- **نظام المواعيد**: جدولة وإدارة المواعيد
- **السجلات الطبية**: إدارة السجلات الطبية الشاملة
- **نظام الفواتير**: إنشاء وإدارة الفواتير

## 🛠️ التقنيات المستخدمة

### Frontend Framework

- **React 18.3.1** - مكتبة JavaScript لبناء واجهات المستخدم
- **Vite 5.4.10** - أداة تطوير سريعة وحديثة

### UI & Styling

- **Tailwind CSS 3.4.15** - إطار عمل CSS utility-first
- **Lucide React** - مكتبة أيقونات عصرية
- **Framer Motion** - مكتبة الرسوم المتحركة

### Routing & State

- **React Router 6.28.0** - التنقل بين الصفحات
- **Axios** - HTTP client للتفاعل مع API

### User Experience

- **React Hot Toast** - إشعارات جميلة وسهلة الاستخدام
- **clsx** - إدارة CSS classes بطريقة ديناميكية

## 🚀 البدء السريع

### متطلبات النظام

- Node.js 16+
- npm أو yarn

### التثبيت

```bash
# استنساخ المشروع
git clone [repository-url]
cd hospital-management-system/frontend

# تثبيت الحزم
npm install

# تشغيل الخادم التطويري
npm run dev

# فتح المتصفح على
http://localhost:3000
```

### أوامر التطوير

```bash
# تشغيل الخادم التطويري
npm run dev

# بناء المشروع للإنتاج
npm build

# معاينة النسخة النهائية
npm run preview
```

## 📁 هيكل المشروع

```
src/
├── components/          # المكونات المشتركة
│   ├── Layout.jsx      # تخطيط الصفحة الرئيسي
│   └── ...
├── pages/              # صفحات التطبيق
│   ├── Dashboard.jsx   # لوحة التحكم
│   ├── Patients.jsx    # إدارة المرضى
│   ├── Doctors.jsx     # إدارة الأطباء
│   ├── Appointments.jsx # إدارة المواعيد
│   ├── MedicalRecords.jsx # السجلات الطبية
│   ├── Invoices.jsx    # إدارة الفواتير
│   └── NotFound.jsx    # صفحة 404
├── services/           # خدمات API
│   └── api.js         # إعدادات Axios والـ endpoints
├── hooks/             # React Hooks مخصصة
├── utils/             # دوال مساعدة
├── App.jsx            # المكون الرئيسي
├── main.jsx          # نقطة دخول التطبيق
└── index.css         # أنماط Tailwind والـ CSS المخصص
```

## 🎨 نظام التصميم

### الألوان

- **Primary**: `#3b82f6` - أزرق طبي
- **Secondary**: `#0ea5e9` - أزرق سماوي
- **Success**: `#22c55e` - أخضر نجاح
- **Warning**: `#f59e0b` - كهرماني تحذير
- **Danger**: `#ef4444` - أحمر خطر

### الخطوط

- **Arabic**: Cairo - خط عربي جميل وواضح
- **English**: Inter - خط إنجليزي عصري

### المكونات

- **Cards**: بطاقات مع ظلال ناعمة
- **Buttons**: أزرار بأنماط متعددة
- **Forms**: حقول إدخال متسقة
- **Badges**: تسميات ملونة للحالات

## 🔌 API Integration

### إعداد Axios

```javascript
// Base URL configuration
baseURL: '/api'
timeout: 10000

// Automatic token handling
Authorization: Bearer ${token}

// Error handling with toast notifications
401: غير مصرح لك بالوصول
403: ليس لديك صلاحية للوصول
404: البيانات غير موجودة
500: خطأ في الخادم
```

### API Endpoints

- `GET /patients` - جلب جميع المرضى
- `POST /patients` - إضافة مريض جديد
- `PUT /patients/:id` - تعديل بيانات مريض
- `DELETE /patients/:id` - حذف مريض
- وهكذا لباقي الكيانات...

## 🌐 دعم RTL

التطبيق مصمم بالكامل لدعم اللغة العربية:

- **Direction**: `rtl` في جميع العناصر
- **Text Alignment**: محاذاة نصوص لليمين
- **Layout**: تخطيط معكوس للعناصر
- **Icons**: أيقونات متوافقة مع RTL

## 📱 Responsive Design

- **Mobile First**: تصميم يبدأ من الهاتف المحمول
- **Breakpoints**: نقاط توقف مخصصة للأجهزة المختلفة
- **Flexible Grid**: شبكة مرنة تتكيف مع جميع الأحجام
- **Touch Friendly**: أزرار وعناصر مناسبة للمس

## 🚀 الإنتاج والنشر

### البناء للإنتاج

```bash
npm run build
```

### متغيرات البيئة

```env
VITE_API_URL=https://api.example.com
VITE_APP_NAME=مستشفى المشروع الأول الطبي
```

### النشر

- **Vercel**: نشر سريع ومجاني
- **Netlify**: استضافة قوية للمواقع الثابتة
- **GitHub Pages**: نشر من GitHub مباشرة

## 🤝 المساهمة

نرحب بمساهماتكم! يرجى اتباع الخطوات التالية:

1. Fork المشروع
2. إنشاء branch جديد (`git checkout -b feature/amazing-feature`)
3. Commit تغييراتك (`git commit -m 'Add amazing feature'`)
4. Push إلى البranch (`git push origin feature/amazing-feature`)
5. فتح Pull Request

## 📝 الترخيص

هذا المشروع مرخص تحت رخصة MIT - راجع ملف [LICENSE](LICENSE) للتفاصيل.

## 📞 الدعم والاتصال

- **المطورون**: Hospital Management Team
- **البريد الإلكتروني**: support@hospital-system.com
- **الدعم الفني**: [فتح تذكرة دعم](https://github.com/your-repo/issues)

---

**مطور بـ ❤️ في السعودية 🇸🇦**
