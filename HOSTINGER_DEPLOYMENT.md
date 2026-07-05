# دليل الرفع على GitHub والتشغيل على Hostinger 🚀

يوضح هذا الدليل الخطوات اللازمة لرفع الكود البرمجي الخاص بمشروع **NicotineKW** إلى مستودع **GitHub**، ثم إعداد واستضافة التطبيق على خوادم **Hostinger** إما باستخدام لوحة تحكم Node.js (الاستضافة المشتركة أو السحابية) أو عبر خادم افتراضي خاص (VPS).

---

## 💻 أولاً: تهيئة المشروع ورفعه على GitHub

### 1. التأكد من تجاهل الملفات الحساسة
يحتوي المشروع على ملف `.gitignore` يمنع رفع الملفات الحالية أو الحساسة مثل مجلدات `node_modules` وملفات `.env` التي تحتوي على متغيرات البيئة. 
تم إنشاء ملف [.env.example](file:///.env.example) كقالب توضيحي، يرجى استخدامه لمعرفة المتغيرات المطلوبة دون رفع القيم الحساسة إلى GitHub.

### 2. رفع الكود إلى GitHub (الخطوات البرمجية)
افتح واجهة الأوامر (Terminal/PowerShell) في مجلد المشروع ونفذ الأوامر التالية:

1. **تهيئة مستودع Git محلي (إذا لم يكن مهيئاً):**
   ```bash
   git init
   ```
2. **إضافة كافة ملفات المشروع للمستودع:**
   ```bash
   git add .
   ```
3. **تسجيل التغييرات (Commit):**
   ```bash
   git commit -m "Initial commit: setup project for GitHub and Hostinger"
   ```
4. **تعيين الفرع الرئيسي باسم `main`:**
   ```bash
   git branch -M main
   ```
5. **ربط المستودع المحلي بمستودع GitHub:**
   (قم باستبدال الرابط أدناه برابط مستودعك الفارغ الذي أنشأته على GitHub)
   ```bash
   git remote add origin https://github.com/USERNAME/REPO_NAME.git
   ```
6. **رفع الكود البرمجي:**
   ```bash
   git push -u origin main
   ```

---

## 🌐 ثانياً: الاستضافة والتشغيل على Hostinger

يتيح Hostinger طريقتين لاستضافة تطبيقات Next.js حسب نوع خطة الاستضافة الخاصة بك:

### الطريقة الأولى: استضافة Node.js المشتركة أو السحابية (Hostinger hPanel Node.js)

توفر هذه الاستضافة لوحة تحكم مبسطة لتشغيل تطبيقات Node.js وتتطلب ملف تشغيل رئيسي (عادة `server.js`). بفضل تفعيل خيار `output: 'standalone'` في مشروعنا، سنحصل على ملف `server.js` جاهز ومستقل.

#### الخطوة 1: تهيئة تطبيق Node.js في لوحة Hostinger (hPanel)
1. قم بتسجيل الدخول إلى حسابك في Hostinger وانتقل إلى لوحة التحكم (hPanel).
2. في القائمة الجانبية أو شريط البحث، انتقل إلى **Advanced** ثم **Node.js**.
3. انقر على زر **Create Application** (إنشاء تطبيق) وعيّن الإعدادات كالتالي:
   - **Node.js Version:** اختر إصدار `18` أو `20`.
   - **Application Document Root:** اختر المجلد الذي تريد رفع الكود البرمجي إليه (مثل: `public_html/nicotinekw`).
   - **Application URL:** الدومين أو الرابط المخصص لموقعك.
   - **Application Entry File:** اكتب `server.js` بشكل صريح.
4. اضغط على **Save** لإنشاء التطبيق.

#### الخطوة 2: بناء المشروع محلياً ورفع الملفات
بسبب قيود الموارد في الاستضافات المشتركة، فإن الطريقة الأفضل والأكثر كفاءة لتشغيل Next.js هي **بناء التطبيق محلياً ثم رفع ملفات الـ standalone الجاهزة**:
1. في جهازك المحلي، قم بتشغيل أمر البناء:
   ```bash
   npm run build
   ```
   *سيقوم هذا الأمر ببناء المشروع، وتشغيل سكربت النسخ التلقائي الذي يدمج الملفات الساكنة `public` و `.next/static` مباشرة داخل مجلد البناء المستقل `.next/standalone/`.*
2. اذهب إلى مجلد المشروع محلياً، وافتح مجلد `.next/`.
3. ستجد مجلداً باسم `standalone`. قم بضغط محتويات مجلد `standalone` بالكامل (وليس المجلد نفسه، بل الملفات التي بداخله ومنها ملف `server.js`).
4. ارفع الملف المضغوط إلى مجلد التطبيق على الاستضافة (مثلاً عبر **File Manager** في Hostinger) وقم بفك الضغط هناك.
5. تأكد من أن الملفات تظهر مباشرة في المجلد الرئيسي للتطبيق (أي أن ملف `server.js` يقع في الجذر الرئيسي لمجلد الاستضافة المحدد للتطبيق).

#### الخطوة 3: تهيئة متغيرات البيئة وتشغيل التطبيق
1. في لوحة تحكم Node.js على Hostinger، انتقل إلى قسم **Environment Variables** (متغيرات البيئة).
2. أضف المتغيرات التالية وقيمها:
   - `WORDPRESS_API_URL` = `https://aliceblue-gnu-460662.hostingersite.com/graphql`
   - `NEXT_PUBLIC_SITE_URL` = `https://mediumpurple-tarsier-577339.hostingersite.com`
3. في لوحة التحكم، انقر على زر **Install npm dependencies** (لتثبيت التبعيات الخفيفة إن وُجدت).
4. انقر على **Start Application** (أو **Restart Application** إذا كان يعمل مسبقاً).

---

### الطريقة الثانية: الاستضافة على خادم افتراضي خاص (Hostinger VPS)

توفر خوادم الـ VPS تحكماً كاملاً بالخادم ونظام التشغيل، وهي الطريقة المفضلة للتطبيقات التجارية الكبيرة باستخدام **PM2** كمدير للعمليات و **Nginx** كخادم عكسي.

#### الخطوة 1: الاتصال بالخادم وتثبيت المتطلبات
1. اتصل بخادمك عبر بروتوكول SSH:
   ```bash
   ssh root@your_vps_ip
   ```
2. قم بتحديث الخادم وتثبيت Node.js (إصدار 20):
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```
3. قم بتثبيت أداة PM2 لإبقاء التطبيق يعمل في الخلفية بشكل دائم:
   ```bash
   npm install --global pm2
   ```

#### الخطوة 2: جلب الكود من GitHub
1. انتقل إلى مجلد خادم الويب (مثل `/var/www`):
   ```bash
   cd /var/www
   ```
2. قم بعمل clone للمستودع الخاص بك من GitHub:
   ```bash
   git clone https://github.com/USERNAME/REPO_NAME.git nicotinekw
   ```
3. ادخل لمجلد المشروع:
   ```bash
   cd nicotinekw
   ```

#### الخطوة 3: تهيئة متغيرات البيئة وبناء المشروع على الخادم
1. قم بإنشاء ملف متغيرات البيئة `.env`:
   ```bash
   nano .env
   ```
2. الصق القيم التالية في الملف ثم احفظ واغلق بالضغط على (`Ctrl+O` ثم `Enter` ثم `Ctrl+X`):
   ```env
   WORDPRESS_API_URL=https://aliceblue-gnu-460662.hostingersite.com/graphql
   NEXT_PUBLIC_SITE_URL=https://mediumpurple-tarsier-577339.hostingersite.com
   ```
3. قم بتثبيت المكتبات وبناء التطبيق:
   ```bash
   npm install
   npm run build
   ```

#### الخطوة 4: تشغيل التطبيق في الخلفية باستخدام PM2
يمكنك تشغيل التطبيق بكفاءة عالية جداً بالاعتماد على خيار الـ standalone الذي تم بناؤه:
```bash
pm2 start .next/standalone/server.js --name "nicotinekw"
```
أو تشغيله بالطريقة التقليدية لـ Next.js:
```bash
pm2 start npm --name "nicotinekw" -- start
```

لضمان إعادة تشغيل التطبيق تلقائياً في حال ريستارت الخادم:
```bash
pm2 save
pm2 startup
```

#### الخطوة 5: إعداد خادم Nginx كـ Reverse Proxy (خادم عكسي)
1. قم بتثبيت خادم Nginx:
   ```bash
   sudo apt install nginx -y
   ```
2. افتح ملف الإعدادات للموقع الافتراضي:
   ```bash
   sudo nano /etc/nginx/sites-available/default
   ```
3. استبدل محتويات الملف أو اضبط الـ `location` لتوجيه حركة المرور إلى منفذ تطبيق Next.js (المنفذ الافتراضي 3000):
   ```nginx
   server {
       listen 80;
       server_name mediumpurple-tarsier-577339.hostingersite.com www.mediumpurple-tarsier-577339.hostingersite.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
4. احفظ الملف واختبر صحة الإعدادات ثم أعد تشغيل Nginx:
   ```bash
   sudo nginx -t
   sudo systemctl restart nginx
   ```
5. (اختياري ولكنه هام جداً): تفعيل شهادة SSL مجانية لحماية الموقع باستخدام Certbot:
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d mediumpurple-tarsier-577339.hostingersite.com -d www.mediumpurple-tarsier-577339.hostingersite.com
   ```

---

## 🛠️ استكشاف الأخطاء وإصلاحها (Troubleshooting)
- **مشكلة اختفاء الصور والتصميم (CSS/JS 404):** تأكد من رفع مجلدات `public` و `.next/static` بنجاح داخل مجلد التطبيق. سكربت الـ postbuild المخصص لدينا يقوم بتجميعها تلقائياً داخل `.next/standalone/` لتفادي هذه المشكلة تماماً.
- **مشكلة 502 Bad Gateway:** في خوادم الـ VPS، تعني هذه المشكلة أن Nginx يعمل ولكن تطبيق Next.js متوقف. تحقق من حالة التطبيق عبر الأداة PM2 عن طريق تشغيل الأمر `pm2 status` أو رؤية سجل الأخطاء عبر `pm2 logs`.
