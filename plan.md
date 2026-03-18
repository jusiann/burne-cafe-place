# Plan: Brune Cafe PERN Stack Dönüşümü

## TL;DR

Mevcut React frontend'i (localStorage tabanlı) tam PERN stack'e taşıyacağız.
PostgreSQL + Express + React + Node.js + Docker Compose (full stack).
3 rol: Customer (guest + kayıtlı), Staff (şube atamalı), Admin (tüm yönetim).
Sipariş modeli: Dine-in / Take-away (müşteri konumuna göre şube seçer, siparişi o şubeden alır).

---

## Kararlar

- Sipariş modeli: Dine-in/Take-away — adres yok, şube seçimi var
- Ürünler: Seed SQL ile yüklenecek; Admin UI'dan availability toggle + basit CRUD
- Ödeme: Mock (seçim yapılır, gerçek işlem yok)
- Real-time: Polling (30 sn) — WebSocket yok
- Docker: PostgreSQL + API (Node) + Web (Nginx) — tam stack
  _-_ Auth: Guest checkout (geçmiş yok) + email/şifre kayıt (geçmiş var)
- Konum: Onboarding modal → header'da "Konum: İstanbul / Kartal" gibi
- ILK15: sadece kayıtlı kullanıcılar için (order count check)
- Raporlama: Günlük/haftalık/aylık ciro, şube bazında, personel performansı
- UML: Activity Diagram (sipariş akışı + personel akışı)

---

## Faz 1: Altyapı & Veritabanı

### 1.1 PostgreSQL Schema (`api/src/lib/db/schema.sql`)

**Ürün yapısı (genişletilebilirlik ve performans için optimize edilmiş relasyonel model):**

```
categories  →  products  →  product_options
(Sıcak Kahveler...)   (Miel, Latte...)   (Boyut, Süt, Ekstra)
```

Tüm ürün varyasyonları (boyut, süt, ekstra malzemeler) tek bir `product_options` tablosunda toplanmıştır.
Bu sayede yeni bir ürün tipi eklendiğinde tablo yapısını değiştirmeye gerek kalmaz.

Tablolar:

- `users` — id, name, email, phone, password_hash, role (customer|staff|admin), is_active, created_at, updated_at
- `branches` — id, name, city, district, address, is_active, created_at
- `staff_branches` — user_id FK, branch_id FK (staff ↔ branch M:1)
- `categories` — id, name, description, sort_order, is_active
- `products` — id, category_id FK, name, description, image_url, base_price, nutrition_calories, nutrition_protein, nutrition_carbs, nutrition_fat, is_popular, is_new, discount, is_available, created_at, updated_at
- `product_options` — id, product_id FK, option_type ENUM(size|milk|extra), name, extra_price, is_available, created_at
- `coupons` — id, code UNIQUE, discount_type (percentage|fixed), discount_value, min_order_amount, conditions JSONB, is_active, description, created_at
- `carts` — id, user_id FK (NULL=guest), session_id (guestler için), created_at, updated_at
- `cart_items` — id, cart_id FK, product_id FK (ON DELETE CASCADE), quantity, size_name, size_extra_price, milk_option_name, milk_option_extra_price, extras JSONB, unit_price, total_price, note
- `orders` — id, order_number UNIQUE, user_id FK (NULL=guest), branch_id FK, customer_name, customer_phone, status (preparing|ready|completed|cancelled), scheduled_time, payment_method, order_note, staff_note, subtotal, tax, discount, coupon_id FK, total, completed_by FK (user_id nullable), created_at, updated_at
- `order_items` — id, order_id FK, product_id FK (ON DELETE SET NULL), product_name (snapshot), quantity, size_name, size_extra_price, milk_option_name, milk_option_extra_price, extras JSONB (snapshot array), unit_price, total_price, note

### 1.2 Seed Data (`api/src/lib/db/seed.sql`)

- Kategoriler: Sıcak Kahveler, Soğuk Kahveler, Soğuk İçecekler, Pastane, Kurabiye
- 15 ürün (mevcut products.json'dan) ve bu ürünlere ait boyut, süt ve ekstra seçenekleri (`product_options` tablosuna)
- Tüm sizes/milk_options/extras
- 3 kupon (ILK15, IKILIM20, MIEL10) + conditions JSONB
- 5 İstanbul şubesi (Kadıköy, Beşiktaş, Şişli, Üsküdar, Maltepe)
- 1 admin hesabı, 2 personel hesabı (test)
- 2 customer hesabı (test)

### 1.3 Docker Compose (`docker-compose.yml`)

Servisler:

- `postgres` — postgres:16-alpine, volume: pgdata, port 5432
- `api` — Dockerfile (Node 20 alpine), depends_on postgres, port 3001, env dosyası
- `web` — Dockerfile multi-stage (build React → Nginx alpine), port 80, nginx.conf ile /api/\* → api:3001 proxy

### 1.4 Dockerfile'lar

- `api/Dockerfile` — node:20-alpine, npm install, EXPOSE 3001
- `web/Dockerfile` — stage1: node:20 build; stage2: nginx:alpine serve + nginx.conf
- `web/nginx.conf` — root /usr/share/nginx/html, try_files SPA routing, /api → proxy_pass http://api:3001

---

## Faz 2: Backend — Auth & Core Middleware

### 2.1 DB Bağlantısı

- `api/src/lib/db/index.js` — pg Pool, DATABASE_URL'den config

### 2.2 JWT Utility

- `api/src/utils/jwt.js` — sign(payload), verify(token) yardımcıları

### 2.3 Auth Controller & Routes

Endpoints:

- POST /api/auth/register — email, şifre, isim, tel, city, district → bcrypt hash → user oluştur (role=customer) → JWT döner
- POST /api/auth/login — email/şifre → JWT döner
- GET /api/auth/me — token zorunlu → kullanıcı bilgisi döner

### 2.4 Middleware

- `api/src/middlewares/auth.js` — Authorization Bearer token verify → req.user
- `api/src/middlewares/roles.js` — requireRole(...roles) factory

---

## Faz 3: Backend — Public API'lar

### 3.1 Products

- GET /api/products?type=&category=&search= — is_available ürünler; type flag'e göre sizes/milkOptions join'leri dahil edilir ya da atlanır
- GET /api/products/:id — tek ürün detayı (type bilgisiyle birlikte)

### 3.2 Categories

- GET /api/categories — tüm kategoriler, yanında type bilgisi (name + has_sizes + has_milk_options) join'lenmiş olarak gelir
  → Frontend bu veriyi kullanarak Menü sayfasında "İçecekler" / "Tatlılar" gibi üst başlıklar oluşturabilir

### 3.3 Branches

> **`branch.controller.js` ne yapar?**
> Admin'in şube CRUD'u `admin.routes.js` içindedir. `branch.controller.js` ise kimlik doğrulama gerektirmeyen
> **public** okuma endpoint'lerini barındırır. Bu 2 yerde kullanılır:
>
> 1. **OnboardingModal** — "İstanbul/Kadıköy" gibi seçim için aktif şube listesi çekilir
> 2. **Checkout** — Location Store'daki il/ilçeye göre eşleşen şube gösterilir ("Siparişin buraya gelecek")

- GET /api/branches?city=&district= — aktif şubeler (public)
- GET /api/branches/:id — şube detay

### 3.4 Coupons (validate)

- POST /api/coupons/validate — { code, cartId, userId? } → sunucu tarafında doğrulama (Backend cart'ı DB'den çektiğinde veya id ile gönderildiğinde kontrol eder)
  - ILK15: userId varsa order count=0 kontrolü, guest için false
  - IKILIM20: Sepette productId 11 ve 12 var mı
  - MIEL10: Sepette productId 1 var mı
  - minOrderAmount kontrolü

### 3.5 Cart (Sepet) API'ları

- GET /api/cart — user_id veya session_id'ye göre mevcut sepeti ve içerisindeki ürünleri getirir. Yoksa oluşturur.
- POST /api/cart/items — Sepete yeni ürün ekler (örn: { productId, quantity, size, milk, extras, note }).
- PUT /api/cart/items/:itemId — Sepetteki ürünün miktarını veya özelliklerini günceller.
- DELETE /api/cart/items/:itemId — Sepetten ürün çıkarır.
- DELETE /api/cart — Sepeti tamamen temizler.

---

## Faz 4: Backend — Orders API

- POST /api/orders — hem guest hem auth. Body: branchId, customerName, customerPhone, scheduledTime?, paymentMethod, orderNote?, couponCode?, cartId
  - Sipariş detaylarını (`order_items`) direkt DB'deki belirtilen sepetten (cart) alır. Sipariş başarılı olduğunda `cart` temizlenir/kapatılır.
  - Coupon validate yeniden kontrol (server-side)
  - order_number = `#${Date.now()}`
  - Status = 'preparing'
  - order_items + extras JSONB saved
- GET /api/orders/my — Auth (customer) → kendi siparişleri (pagination opsiyonel)
- GET /api/orders — Auth (staff) → kendi branch_id'sinin tüm siparişleri; Auth (admin) → tüm siparişler; query: status, date
- GET /api/orders/:id — Auth (staff/admin) veya siparişi veren customer
- PATCH /api/orders/:id/status — Auth (staff/admin) → { status } → preparing|ready|completed; completed_by güncellenir
- PATCH /api/orders/:id/cancel — Auth (staff/admin) → { staffNote } → status=cancelled

---

## Faz 5: Backend — Admin API'lar

### 5.1 Branch CRUD

- POST /api/admin/branches
- PUT /api/admin/branches/:id
- PATCH /api/admin/branches/:id/status — toggle is_active
- DELETE /api/admin/branches/:id

### 5.2 Staff Yönetimi

- GET /api/admin/users?role=staff
- POST /api/admin/users — Admin personel hesabı oluşturur (role=staff, branch ataması)
- PUT /api/admin/users/:id
- DELETE /api/admin/users/:id
- PATCH /api/admin/users/:id/branch — { branchId }

### 5.3 Product CRUD (Admin)

- POST /api/admin/products
- PUT /api/admin/products/:id
- PATCH /api/admin/products/:id/availability
- DELETE /api/admin/products/:id

### 5.4 Coupon CRUD (Admin)

- GET /api/admin/coupons
- POST /api/admin/coupons
- PUT /api/admin/coupons/:id
- DELETE /api/admin/coupons/:id

### 5.5 Raporlar

- GET /api/admin/reports/revenue?period=daily|weekly|monthly → toplam ciro, sipariş sayısı
- GET /api/admin/reports/branches → şube bazında sipariş ve ciro
- GET /api/admin/reports/staff → personel bazında işlediği sipariş sayısı, toplam ciro (completed_by üzerinden)

---

## Faz 6: Frontend — Auth & Location

### 6.1 Auth Store (Zustand) (`web/src/stores/authStore.js`)

- State: user, token, isLoading
- Methods: login(), register(), logout()
- Token: localStorage'da tutulur, axios interceptor ile header'a eklenir

### 6.2 Location Store (Zustand) (`web/src/stores/locationStore.js`)

- State: { city, district }
- localStorage persist
- Onboarding modal tetikler (henüz seçilmemişse)

### 6.3 OnboardingModal Component

- İl ve ilçe seçimi (API'dan branches unique city/district çekilir)
- Seçim yapılınca Location Store günceller

### 6.4 Login.jsx & Register.jsx Pages

- Login: email + şifre → POST /api/auth/login → useAuthStore.getState().login()
- Register: isim, email, şifre, telefon → POST /api/auth/register → otomatik login

### 6.5 Navbar Güncellemesi

- Location Store'dan konum göster: "📍 İstanbul / Kartal"
- Auth Store'a göre: login/register butonları veya kullanıcı adı + logout
- Konum tıklanınca OnboardingModal açılır

### 6.6 ProtectedRoute Component

- role prop alır
- Auth Store'dan user.role kontrolü
- Yetkisiz erişimde redirect

---

## Faz 7: Frontend — Customer Flow Güncellemesi

### 7.1 HTTP Service Layer

- `web/src/services/api.js` — axios instance, baseURL, auth interceptor
- `web/src/services/productService.js`
- `web/src/services/orderService.js`
- `web/src/services/branchService.js`
- `web/src/services/couponService.js`
- `web/src/services/cartService.js` — YENİ: Sepet işlemlerini backend ile eşler (API çağrıları)

### 7.2 Cart Store (Zustand) Güncellemesi

- Cart State: İlk yüklendiğinde `GET /api/cart` (auth token veya guest localStorage'daki sessionId ile) çağrılarak sepet çekilir. Frontend'deki her "Sepete Ekle/Çıkar" işlemi localStorage yerine backend'e (POST/PUT/DELETE /api/cart/items) yansır ve Zustand store güncellenir.
- `createOrder()` → `POST /api/orders` çağrısı, `cartId`'yi yollayarak siparişe dönüştürür.
- `validateCoupon()` → `POST /api/coupons/validate`
- `fetchOrders()` → GET /api/orders/my (sadece auth kullanıcı için)

### 7.3 CheckoutSection Güncellemesi

- Adres formu kaldırılır (city/district/neighborhood/fullAddress)
- Şube gösterimi eklenir (Location Store'dan otomatik → matching branch gösterilir)
- Kalan: customerName, customerPhone, scheduledTime, paymentMethod, orderNote
- Guest kullanıcı için checkout çalışır (sipariş geçmişi gösterilmez)

### 7.4 OrderHistory Güncellemesi

- Auth kullanıcısı: GET /api/orders/my → API'dan çek
- Guest: "Güncelleme görmek için giriş yapın" mesajı
- Mevcut cancel özelliği API çağrısına bağlanır

### 7.5 ProductDetail & Menu Sayfaları

- Ürünler API'dan çekilir (GET /api/products)
- Lokale yazılmış hooks: `useFetchProducts`, `useFetchProduct(id)`

---

## Faz 8: Frontend — Staff Paneli

### 8.1 Staff Routes (App.jsx'e eklenir)

- `/staff` → redirect to /staff/orders
- `/staff/orders` → ProtectedRoute role=staff

### 8.2 StaffOrders.jsx (`web/src/pages/staff/StaffOrders.jsx`)

- GET /api/orders → kendi branch siparişleri
- Polling: setInterval 30 sn
- Filtre: status (preparing / ready / completed / cancelled / all)
- Her sipariş kartında: müşteri adı, ürünler, toplam, zaman, durum + aksiyonlar

### 8.3 StaffOrderDetail.jsx

- Sipariş detayı (tüm ürünler, extras, notlar)
- "Hazır" butonu → PATCH /status ready
- "Alındı/Teslim" butonu → PATCH /status completed
- "İptal Et" → modal + not girişi → PATCH /cancel

### 8.4 Staff'ın Customer Sayfalarına Erişimi

- Staff, / (Home), /menu, /product/:id, /cart sayfalarına erişebilir
- Navbar'da "Sipariş Paneli" linki eklenir (sadece staff/admin görür)

---

## Faz 9: Frontend — Admin Paneli

### 9.1 Admin Routes

- `/admin` → AdminDashboard
- `/admin/branches` → AdminBranches
- `/admin/branches/:id` → AdminBranchDetail
- `/admin/staff` → AdminStaff
- `/admin/products` → AdminProducts
- `/admin/coupons` → AdminCoupons
- `/admin/reports` → AdminReports
  Hepsi ProtectedRoute role=admin

### 9.2 AdminDashboard.jsx

- Özet: toplam sipariş sayısı, bugünkü ciro, aktif şube sayısı, toplam personel
- Son 5 sipariş listesi

### 9.3 AdminBranches.jsx

- Şube listesi (city/district, durum badge, personel sayısı)
- Yeni şube modal: name, city, district, address
- Düzenleme, açma/kapama (toggle), silme

### 9.4 AdminBranchDetail.jsx

- Şube detayı + bu şubedeki sipariş özeti
- Personel listesi + "Personel Ekle" (mevcut staff'lardan seç veya yeni oluştur)
- Personel çıkarma

### 9.5 AdminStaff.jsx

- Tüm personel listesi: isim, email, atandığı şube, aktif/pasif
- Yeni personel oluştur modal: isim, email, şifre, telefon, şube ata
- Düzenle, sil

### 9.6 AdminProducts.jsx

- Ürün listesi + kategori filtresi
- Availability toggle (switch)
- Yeni ürün / düzenle modal: tüm ürün alanları (size/milk/extras için dinamik liste)
- Soft delete (is_available=false) veya gerçek silme

### 9.7 AdminCoupons.jsx

- Kupon listesi
- Aktif/pasif toggle
- Yeni kupon / düzenle: code, type, value, minAmount, description
- Sil

### 9.8 AdminReports.jsx

- Gelir Raporu: period seçici (günlük/haftalık/aylık) → tablo (tarih | sipariş sayısı | ciro)
- Şube Raporu: tablo (şube adı | sipariş sayısı | ciro | ortalama)
- Personel Performansı: tablo (personel | tamamladığı sipariş | ciro)
- Export: HTML print veya basit tablo yeterli (chart opsiyonel)

---

## Proje Yapısı (Final)

```
/
├── docker-compose.yml
├── api/
│   ├── Dockerfile
│   ├── .env
│   ├── app.js
│   ├── package.json
│   ├── src/
│   │   └──lib/
│   │       └── db/
│   │            ├── index.js          ← pg Pool
│   │            ├── schema.sql
│   │            └── seed.sql
│   └── src/
│       ├── controllers/
│       │   ├── auth.controller.js
│       │   ├── branch.controller.js
│       │   ├── product.controller.js
│       │   ├── order.controller.js
│       │   ├── coupon.controller.js
│       │   ├── admin.controller.js
│       │   └── cart.controller.js
│       ├── middlewares/
│       │   ├── auth.js           ← JWT verify
│       │   └── roles.js          ← requireRole factory
│       ├── routes/
│       │   ├── auth.routes.js
│       │   ├── branch.routes.js
│       │   ├── product.routes.js
│       │   ├── order.routes.js
│       │   ├── coupon.routes.js
│       │   ├── admin.routes.js
│       │   └── cart.routes.js
│       └── utils/
│           ├── error.js
│           └── jwt.js
└── web/
    ├── Dockerfile
    ├── nginx.conf
    └── src/
        ├── App.jsx               ← route'lar güncellenir
        ├── stores/               ← CONTEXT YERİNE ZUSTAND STORES
        │   ├── cartStore.js      ← API entegrasyonu
        │   ├── authStore.js      ← YENİ
        │   └── locationStore.js  ← YENİ
        ├── services/
        │   ├── api.js            ← YENİ axios instance
        │   ├── productService.js ← YENİ
        │   ├── orderService.js   ← YENİ
        │   ├── branchService.js  ← YENİ
        │   └── couponService.js  ← YENİ
        ├── components/
        │   ├── OnboardingModal.jsx ← YENİ
        │   ├── ProtectedRoute.jsx  ← YENİ
        │   ├── Navbar.jsx         ← GÜNCELLEME
        │   └── CheckoutSection.jsx ← GÜNCELLEME
        └── pages/
            ├── Login.jsx          ← YENİ
            ├── Register.jsx       ← YENİ
            ├── staff/
            │   ├── StaffOrders.jsx    ← YENİ
            │   └── StaffOrderDetail.jsx ← YENİ
            └── admin/
                ├── AdminDashboard.jsx  ← YENİ
                ├── AdminBranches.jsx   ← YENİ
                ├── AdminBranchDetail.jsx ← YENİ
                ├── AdminStaff.jsx      ← YENİ
                ├── AdminProducts.jsx   ← YENİ
                ├── AdminCoupons.jsx    ← YENİ
                └── AdminReports.jsx    ← YENİ
```

---

## Veritabanı İlişki Özeti (ER)

- product_types 1—\* categories (type_id)
- categories 1—\* products (category_id)
- products 1—\* product_sizes
- products 1—\* product_milk_options
- products 1—\* product_extras
- users 1—\* orders (user_id nullable)
- branches 1—\* orders
- users _—_ branches (staff_branches join table)
- orders 1—\* order_items
- order_items \*—1 products (ON DELETE SET NULL)
- orders \*—1 coupons (coupon_id nullable)
- orders \*—1 users (completed_by nullable, personel performansı için)

**Genişletme senaryosu:** Yeni ürün tipi eklemek → sadece `product_types`'a kayıt + yeni `categories` + `products` — mevcut tablo yapısı değişmez.

---

## Doğrulama Adımları

1. `docker compose up` → tüm servisler ayağa kalkar
2. `GET http://localhost/api/health` → 200 OK
3. `GET http://localhost/api/products` → 15 ürün döner
4. Register → Login → JWT alınır
5. Guest checkout → sipariş oluşur, branch_id doğru
6. Auth customer → sipariş geçmişi görünür
7. Staff login → sadece kendi şubesinin siparişleri, durum güncelleyebilir
8. Admin login → tüm panele erişim, raporlar veri döner
9. Yetkisiz istek (ör. guest /api/admin/\*) → 403
10. Docker logs temiz (hata yok)

---

## Yazılım Mühendisliği Gereksinimleri Karşılaması

- ✅ 3 kullanıcı rolü: Customer, Staff, Admin
- ✅ Kimlik doğrulama: JWT + bcrypt
- ✅ Veri kalıcılığı: PostgreSQL
- ✅ 6-8+ fonksiyonel gereksinim (sipariş, ürün, şube, kupon, auth, raporlama, personel yönetimi)
- ✅ 3+ fonksiyonel olmayan: güvenlik (JWT/bcrypt/RBAC), ölçeklenebilirlik (Docker), sürdürülebilirlik (modüler MVC)
- ✅ Sorumlulukların ayrılması: controllers/routes/middlewares/services katmanları
- ✅ Güvenlik: rol-tabanlı erişim, bcrypt, JWT, SQL injection koruması (parameterized queries)
- ✅ Activity Diagram: sipariş akışı + personel işlem akışı

---

## Açık Sorular (Netleştirilecek)

1. **Guest order takibi** — Guest sipariş verince sadece order confirmation sayfasında order number gösterilecek. "Sipariş sorgulama" (order number + telefon) eklensin mi?
2. **Ürün yönetimi kapsamı** — Admin panelinde sizes/milkOptions/extras de dinamik düzenlenebilsin mi (daha karmaşık UI), yoksa bu alt tablolar seed'de sabit mi?
3. **completed_by** — Personel "Alındı" yaptığında kendi ID'si kaydedilecek → raporlama için yeterli mi, yoksa daha detaylı aksiyon log'u gerekiyor mu?
