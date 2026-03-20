# Burne Cafe Backend API — Kapsamlı Analiz Raporu

---

## Görev 1: Plan.md vs İmplementasyon Karşılaştırması (Faz 1–5)

### Faz 1: Altyapı & Veritabanı

| Madde | Durum | Açıklama |
|---|---|---|
| PostgreSQL Schema ([schema.sql](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/lib/db/schema.sql)) | ✅ | Tüm tablolar mevcut: `users`, `branches`, `staff_branches`, `categories`, `products`, `product_options`, `coupons`, `carts`, `cart_items`, `cart_coupons`, `orders`, `order_items`. ENUM tipleri doğru tanımlanmış. |
| Seed Data — Kategoriler | ⚠️ | Plan'da 5 kategori (Sıcak Kahveler, Soğuk Kahveler, Soğuk İçecekler, Pastane, Kurabiye) belirtilmiş. Seed'de 6 farklı kategori var: Sıcak Kahveler, Soğuk Kahveler, Soğuk İçecekler, Kahvaltılık, Sandviç, Tatlı. Kategoriler farklı ama daha kapsamlı; **güncellenmiş olarak kabul edilebilir.** |
| Seed Data — Ürünler | ✅ | 15'ten fazla ürün mevcut (34 ürün). Plan'daki 15 üründen fazla. |
| Seed Data — Kuponlar | ✅ | 3 kupon (ILK15, IKILIM20, MIEL10) doğru conditions JSONB ile seed edilmiş. |
| Seed Data — Şubeler | ❌ | **Plan'da 5 İstanbul şubesi** belirtilmiş (Kadıköy, Beşiktaş, Şişli, Üsküdar, Maltepe). **Seed'de sadece 2 şube var:** Kartal Merkez ve Beşiktaş Sahil. |
| Seed Data — Kullanıcı Hesapları | ❌ | **Plan'da 1 admin, 2 staff, 2 customer** test hesabı belirtilmiş. **Seed'de hiçbir kullanıcı hesabı yok.** |
| Seed Data — Staff-Branch Ataması | ❌ | `staff_branches` tablosuna **hiç seed verisi eklenmemiş**. Staff sınav sırasında test edilemez. |
| Docker Compose | ✅ | [docker-compose.yml](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/docker-compose.yml) mevcut, PostgreSQL + API servisleri tanımlı. |
| DB Bağlantı Modülü | ✅ | [database.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/lib/db/database.js) — pg Pool, schema ve seed çalıştırma mevcut. |
| `carts.session_id` sütunu | ❌ | Plan'da `carts` tablosunda `session_id` (guest'ler için) belirtilmiş. **Schema'da bu sütun yok.** Guest cart desteği DB seviyesinde eksik. |

---

### Faz 2: Backend — Auth & Core Middleware

| Madde | Durum | Açıklama |
|---|---|---|
| JWT Utility ([jwt.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/utils/jwt.js)) | ✅ | [generateTokens()](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/utils/jwt.js#3-25) fonksiyonu access + refresh token üretiyor. Payload'a user bilgileri gömülmüş. |
| `POST /api/auth/register` | ⚠️ | Plan'da `POST /api/auth/register`, implementasyonda `POST /api/auth/sign-up`. **Endpoint ismi farklı.** Ayrıca plan'daki `city, district` parametreleri register'da **yok** — kullanıcıya bölge bilgisi kaydedilmiyor. |
| `POST /api/auth/login` | ⚠️ | Plan'da `POST /api/auth/login`, implementasyonda `POST /api/auth/sign-in`. **Endpoint ismi farklı.** |
| `GET /api/auth/me` | ✅ | Doğru implemente edilmiş, [verifyToken](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/middlewares/auth.js#5-47) middleware korunuyor. |
| Middleware — [auth.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/middlewares/auth.js) | ✅ | [verifyToken](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/middlewares/auth.js#5-47) middleware doğru çalışıyor. JWT verify → req.user set. Token payload'dan user bilgisi alınıyor (DB sorgusu yok, performanslı). |
| Middleware — [roles.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/middlewares/roles.js) | ⚠️ | [requireRole()](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/middlewares/roles.js#3-14) factory fonksiyonu var. **Ancak `throw` kullanıyor, `return res.status()` yapmıyor.** Express'te middleware'de throw yapılırsa ve try/catch yoksa uygulama crash olabilir. `next(error)` veya `return res.status().json()` paterni kullanılmalı. |
| Plan'da olmayan fazladan endpoint'ler | ℹ️ | `POST /api/auth/forgot-password`, `POST /api/auth/check-reset-code`, `POST /api/auth/reset-password`, `POST /api/auth/refresh-token`, `PUT /api/auth/update-profile`, `POST /api/auth/logout`, `DELETE /api/auth/delete` — bunlar plan'da yok ama projeyi güçlendiren eklemeler. |

---

### Faz 3: Backend — Public API'lar

| Madde | Durum | Açıklama |
|---|---|---|
| `GET /api/products` | ⚠️ | Çalışıyor ancak plan'daki `type` query parametresi yok. Plan'da `type` flag'e göre sizes/milkOptions join edilmesi belirtilmiş. Mevcut implementasyon sadece ürün listesi döndürüyor, **opsiyonları dahil etmiyor.** Frontend'in ayrı [getProductById](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/products.controller.js#57-95) çağrısı yapması gerekiyor. |
| `GET /api/products/:id` | ✅ | Ürün detayı + opsiyonlar (size, milk, extra) doğru join edilerek döndürülüyor. |
| `GET /api/categories` | ✅ | Kategoriler doğru şekilde `has_sizes` ve `has_milk_options` bilgisiyle döndürülüyor. |
| `GET /api/branches` | ✅ | Aktif şubeler, `city`/`district` filtresiyle döndürülüyor. |
| `GET /api/branches/:id` | ✅ | Şube detayı doğru. |
| `POST /api/coupons/validate` | ⚠️ | **Plan'da ayrı route** (`POST /api/coupons/validate`) olarak belirtilmiş. **İmplementasyonda** `POST /api/cart/coupons/validate` altında ve [cart.controller.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/cart.controller.js) içinde. Plan'la endpoint path'i farklı. Ayrıca plan'a göre public olmalı (veya en azından guest desteği olmalı), ama [verifyToken](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/middlewares/auth.js#5-47) middleware zorunlu kılınmış. |
| Cart API'ları | ✅ | `GET /api/cart`, `POST /api/cart/items`, `PUT /api/cart/items/:itemId`, `DELETE /api/cart/items/:itemId`, `DELETE /api/cart` — tümü mevcut ve [verifyToken](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/middlewares/auth.js#5-47) ile korunuyor. |
| Cart — Guest Desteği | ❌ | Plan'da `carts.session_id` ile guest cart desteği belirtilmiş. **İmplementasyonda guest desteği yok.** Tüm cart işlemleri `userId` zorunlu. Schema'da `session_id` sütunu da yok. |

---

### Faz 4: Backend — Orders API

| Madde | Durum | Açıklama |
|---|---|---|
| `POST /api/orders` | ⚠️ | Sipariş oluşturma implemente edilmiş. **Ancak [verifyToken](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/middlewares/auth.js#5-47) middleware yok** — herkes sipariş verebilir. Plan'da "hem guest hem auth" denmiş ama guest cart desteği de olmadığından bu endpoint fiilen kullanılamaz durumda. Eğer sadece auth kullanıcılar sipariş verecekse [verifyToken](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/middlewares/auth.js#5-47) eklenmeli. |
| `GET /api/orders/my` | ✅ | Auth + [requireRole('customer')](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/middlewares/roles.js#3-14) doğru. Pagination mevcut. |
| `GET /api/orders` | ✅ | Auth + [requireRole('staff', 'admin')](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/middlewares/roles.js#3-14). Staff için branch filtresi (`staff_branches` lookup) doğru implemente edilmiş. |
| `GET /api/orders/:id` | ✅ | Auth zorunlu. Staff → branch kontrolü, Customer → kendi siparişi kontrolü doğru. |
| `PATCH /api/orders/:id/status` | ✅ | Auth + [requireRole('staff', 'admin')](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/middlewares/roles.js#3-14). `completed_by` güncelleniyor. |
| `PATCH /api/orders/:id/cancel` | ✅ | Auth + [requireRole('staff', 'admin')](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/middlewares/roles.js#3-14). `staffNote` kaydediliyor. |
| Kupon doğrulamanın sipariş oluşturmada tekrarı | ✅ | [createOrder](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/orders.controller.js#4-282) içinde kupon doğrulama logik olarak tekrar edilmiş (server-side re-validate). |

---

### Faz 5: Backend — Admin API'lar

| Madde | Durum | Açıklama |
|---|---|---|
| Branch CRUD | ❌ | `admin.controller.js` ve `admin.routes.js` **dosyaları yok**. Tüm admin API'ları tamamen eksik. |
| Staff Yönetimi | ❌ | Tamamen eksik. |
| Product CRUD (Admin) | ❌ | Tamamen eksik. |
| Coupon CRUD (Admin) | ❌ | Tamamen eksik. |
| Raporlar | ❌ | Tamamen eksik. |

> [!CAUTION]
> **Faz 5'in tamamı implemente edilmemiştir.** Kullanıcının belirttiği üzere admin rolü şu an kapsam dışıdır — bu beklenen bir durumdur. Ancak eğer ileride eklenecekse, [app.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/app.js)'de route bağlama ve [requireRole('admin')](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/middlewares/roles.js#3-14) middleware zinciri hazırlanmalıdır.

---

## Görev 2: Kullanıcı Rolleri ve Senaryo Doğrulaması

### Customer (Müşteri) Senaryosu

| Senaryo | Backend Karşılığı | Durum |
|---|---|---|
| Home / Menu — Giriş yapmadan erişim | `GET /api/products`, `GET /api/categories` — public, auth yok | ✅ |
| Sepete ekleme → 401 döndürülmeli | `POST /api/cart/items` — [verifyToken](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/middlewares/auth.js#5-47) mevcut → 401 döner | ✅ |
| Cart ekranı → 401 döndürülmeli | `GET /api/cart` — [verifyToken](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/middlewares/auth.js#5-47) mevcut → 401 döner | ✅ |
| Orders ekranı → 401 döndürülmeli | `GET /api/orders/my` — [verifyToken](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/middlewares/auth.js#5-47) + [requireRole('customer')](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/middlewares/roles.js#3-14) → 401 döner | ✅ |
| Giriş sonrası menü / ürün detay | Public endpoint'ler zaten erişilebilir | ✅ |
| Sepete ekleme (giriş sonrası) | `POST /api/cart/items` — auth sonrası çalışır | ✅ |
| Sipariş oluşturma (bölge seçili olmalı) | ❌ | **Bölge zorunluluğu backend'de yok.** |
| Sipariş oluşturma | `POST /api/orders` — çalışır ama [verifyToken](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/middlewares/auth.js#5-47) yok | ⚠️ |
| Siparişlerim | `GET /api/orders/my` → doğru | ✅ |
| Profilim / Bilgi güncelleme | `GET /api/auth/me`, `PUT /api/auth/update-profile` | ✅ |
| Hesap silme | `DELETE /api/auth/delete` | ✅ |

> [!WARNING]
> **Bölge Seçimi Zorunluluğu Backend'de Eksik.**
> Kullanıcının belirttiği senaryoya göre bölge seçilmeden sipariş oluşturulamaz. `POST /api/orders`'ta `branchId` zorunlu ama bunun bir "bölge" (il/ilçe) seçiminden geldiği doğrulanmıyor. Backend, gelen `branchId`'nin müşterinin seçtiği bölgeyle eşleşip eşleşmediğini kontrol etmiyor. Bu, frontend sorumlulğunda olabilir ancak backend'de de güvence altına alınmalıdır.

---

### Staff (Çalışan) Senaryosu

| Senaryo | Backend Karşılığı | Durum |
|---|---|---|
| Bölgeye atanmış siparişleri görme | `GET /api/orders` — `staff_branches` tablosundan branch_id çekiliyor | ✅ (lojik doğru) |
| Sipariş durumu güncelleme | `PATCH /api/orders/:id/status` — branch kontrolü var | ✅ |
| Sipariş iptal | `PATCH /api/orders/:id/cancel` — branch kontrolü var | ✅ |
| Staff branch ataması yok (seed) | Seed'de `staff_branches` boş | ❌ |
| Staff hesabı yok (seed) | Seed'de staff kullanıcısı yok | ❌ |
| Staff sipariş oluşturma (müşteri adına) | `POST /api/orders` — auth yok, herkes sipariş verebilir | ⚠️ |
| Staff'ın home/menu/cart erişimi | Public endpoint'ler + cart auth ile erişilebilir | ✅ |

---

### Temel Sipariş Akışı Doğrulaması

```
Müşteri giriş yapar → ✅ (POST /api/auth/sign-in)
Menü sayfasında bölge seçme uyarısı çıkar → Frontend sorumluluğu
Bölge seçer (il/ilçe) → Frontend sorumluluğu, backend doğrulaması ❌ YOK
Ürünleri inceler → ✅ (GET /api/products)
Sepete ekler → ✅ (POST /api/cart/items)
Sepeti onaylar → ✅ (POST /api/orders)
Sipariş bölge havuzuna kaydedilir → ✅ (branchId ile orders'a yazılıyor)
Staff siparişi görür → ⚠️ (lojik doğru ama seed'de staff/branch ataması yok)
```

---

## Görev 3: API Hata ve Eksiklik Raporu

### Kritik Hatalar (🔴)

#### 1. `POST /api/orders` — Auth Middleware Eksik
- **Dosya:** [orders.router.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/routes/orders.router.js#L15)
- **Sorun:** `router.post("/", createOrder)` — [verifyToken](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/middlewares/auth.js#5-47) middleware yok.
- **Senaryo çelişkisi:** Senaryo kurgusu gereği müşterinin giriş yapması zorunlu (sepet auth'lu, bölge seçimi zorunlu). Ancak sipariş endpoint'i tamamen açık.
- **Öneri:** `router.post("/", verifyToken, createOrder)` olarak güncellenmeli. Guest checkout kaldırıldığına göre auth zorunlu olmalı.

#### 2. Seed'de Kullanıcı Hesabı Yok
- **Dosya:** [seed.sql](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/lib/db/seed.sql)
- **Sorun:** Plan'da belirtilen 1 admin, 2 staff, 2 customer test hesabı eklenmemiş.
- **Etki:** Sözlü sınavda doğrudan test yapılamaz. Docker compose up sonrası hiçbir hesapla giriş yapılamaz.
- **Öneri:** Bcrypt hash'lenmiş şifrelerle test kullanıcıları eklenmeli.

#### 3. Seed'de Staff-Branch Ataması Yok
- **Dosya:** [seed.sql](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/lib/db/seed.sql)
- **Sorun:** `staff_branches` tablosuna hiç veri yok.
- **Etki:** Staff kullanıcılar `GET /api/orders` çağırdığında "Staff account is not assigned to a branch" hatası alır.
- **Öneri:** Staff hesaplarıyla birlikte `staff_branches` seed'i eklenmeli.

#### 4. Seed'de Yetersiz Şube Sayısı
- **Dosya:** [seed.sql](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/lib/db/seed.sql#L364-L366)
- **Sorun:** Plan 5 şube belirtiyor, seed'de 2 şube var.
- **Öneri:** Plan'daki 5 şube (Kadıköy, Beşiktaş, Şişli, Üsküdar, Maltepe) eklenmeli.

---

### Orta Öncelikli Sorunlar (🟡)

#### 5. [roles.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/middlewares/roles.js) — Hata Yönetimi
- **Dosya:** [roles.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/middlewares/roles.js#L5-L9)
- **Sorun:** `throw ApiError.unauthorized(...)` ve `throw ApiError.forbidden(...)` kullanıyor. Express middleware'de `throw` yapılırsa, `async` olmayan bir fonksiyonda unhandled error olur ve uygulama crash edebilir.
- **Öneri:** `return res.status(401).json(...)` veya `return next(error)` paterni kullanılmalı.

```diff
 export const requireRole = (...allowedRoles) => {
     return (req, res, next) => {
         if (!req.user)
-            throw ApiError.unauthorized("Authentication required.");
+            return res.status(401).json({ success: false, error: "Authentication required." });

         if (!allowedRoles.includes(req.user.role))
-            throw ApiError.forbidden(`Access denied. Required roles: ${allowedRoles.join(', ')}`);
+            return res.status(403).json({ success: false, error: `Access denied. Required roles: ${allowedRoles.join(', ')}` });

         next();
     };
 };
```

#### 6. [cart.controller.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/cart.controller.js) — Runtime'da Tablo Yaratma
- **Dosya:** [cart.controller.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/cart.controller.js#L4-L9)
- **Sorun:** [ensureCartCouponsTable()](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/cart.controller.js#4-10) fonksiyonu her cart get operasyonunda `CREATE TABLE IF NOT EXISTS cart_coupons` çalıştırıyor. Bu tablo zaten [schema.sql](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/lib/db/schema.sql)'de tanımlı.
- **Neden sorunlu:** (1) Gereksiz performans kaybı, (2) Runtime'da DDL çalıştırma kötü pratik, (3) Schema ile kod arasında çift tanım.
- **Aynı sorun** [createOrder](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/orders.controller.js#4-282) fonksiyonunda da var ([orders.controller.js:37-40](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/orders.controller.js#L37-L40)).
- **Öneri:** [ensureCartCouponsTable()](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/cart.controller.js#4-10) fonksiyonu tamamen kaldırılmalı. Tablo schema.sql'de zaten var.

#### 7. Endpoint İsimlendirme Tutarsızlığı (Plan vs İmplementasyon)
- **Sorun:** Plan'daki endpoint isimleri ile implementasyon farklı:

| Plan | İmplementasyon | Dosya |
|---|---|---|
| `POST /api/auth/register` | `POST /api/auth/sign-up` | [auth.router.js:18](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/routes/auth.router.js#L18) |
| `POST /api/auth/login` | `POST /api/auth/sign-in` | [auth.router.js:19](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/routes/auth.router.js#L19) |
| `POST /api/coupons/validate` | `POST /api/cart/coupons/validate` | [cart.router.js:15](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/routes/cart.router.js#L15) |

- **Öneri:** Plan veya kod güncellenip tutarlı hale getirilmeli. Sözlü sınavda "planla implementasyon neden farklı?" sorusu sorulabilir.

#### 8. [getProducts](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/products.controller.js#4-56) — Options Join Eksik
- **Dosya:** [products.controller.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/products.controller.js#L4-L55)
- **Sorun:** Plan'da `GET /api/products?type=` ile opsiyonların (sizes/milkOptions) dahil edilebileceği belirtilmiş. Mevcut implementasyonda ürün listesi dönerken opsiyonlar dahil **edilmiyor**.
- **Etki:** Frontend menü sayfasında fiyat aralığı göstermek isterse fazladan API çağrısı yapması gerekir.
- **Öneri:** Query parametresi (`include_options=true`) ile opsiyonel join desteği eklenebilir.

#### 9. Register'da `city`/`district` Yok
- **Dosya:** [auth.controller.js:36](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/auth.controller.js#L36)
- **Sorun:** Plan'da register endpoint'ine `city, district` parametreleri gönderilmesi belirtilmiş. İmplementasyonda `fullname, email, phone, password` alınıyor, bölge bilgisi yok.
- **Senaryo bağlamı:** Kullanıcı bölge seçimini her girişte yapıyor (frontend session store), kayıt sırasında gerekli değilse bu kabul edilebilir. **Ama plan'la çelişiyor.**

#### 10. Dosya İsimlendirme Tutarsızlığı
- **Sorun:** Plan'da dosya isimleri `branch.controller.js` gibi tekil, implementasyonda [branches.controller.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/branches.controller.js) gibi çoğul:

| Plan | İmplementasyon |
|---|---|
| `branch.controller.js` | [branches.controller.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/branches.controller.js) |
| `product.controller.js` | [products.controller.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/products.controller.js) |
| `order.controller.js` | [orders.controller.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/orders.controller.js) |
| `coupon.controller.js` | Yok (cart.controller.js içinde) |
| `auth.routes.js` | [auth.router.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/routes/auth.router.js) |
| `branch.routes.js` | [branches.router.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/routes/branches.router.js) |

- **Öneri:** Tek bir convention seçilmeli (tekil veya çoğul) ve tutarlı kullanılmalı.

---

### Düşük Öncelikli Sorunlar (🟢)

#### 11. [createOrder](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/orders.controller.js#4-282) — Kupon Doğrulama Kod Tekrarı
- **Dosya:** [orders.controller.js:106-189](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/orders.controller.js#L106-L189)
- **Sorun:** [calculateCouponDiscount](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/cart.controller.js#99-180) fonksiyonu [cart.controller.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/cart.controller.js)'de var ve tekrar kullanılabilir, ama [createOrder](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/orders.controller.js#4-282) içinde kupon doğrulama mantığı **tamamen tekrar yazılmış** (~80 satır).
- **Öneri:** [calculateCouponDiscount](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/cart.controller.js#99-180) fonksiyonu ayrı bir service/util dosyasına çıkarılmalı ve her iki yerden çağrılmalı.

#### 12. [auth.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/middlewares/auth.js) Middleware — `db` Import Edilmiş Ama Kullanılmıyor
- **Dosya:** [auth.js:2](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/middlewares/auth.js#L2)
- **Sorun:** `import db from '../lib/db/database.js'` — kullanılmıyor (JWT'den user bilgisi alınıyor, DB sorgusu yok).
- **Öneri:** Gereksiz import kaldırılmalı.

#### 13. [logout](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/auth.controller.js#532-556) — Gerçek Token İnvalidasyonu Yok
- **Dosya:** [auth.controller.js:532-555](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/auth.controller.js#L532-L555)
- **Sorun:** Logout fonksiyonu sadece log basıyor, token'ı invalidate etmiyor. JWT stateless olduğundan bu teknik bir kısıt, ama sözlü sınavda sorulabilir.
- **Öneri:** Token blacklist (Redis veya DB tablosu) eklenebilir veya "JWT stateless olduğu için client-side token silme yeterli" savunması hazırlanmalı.

#### 14. Health Check Endpoint Path
- **Dosya:** [app.js:39](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/app.js#L39)
- **Sorun:** Plan'da `GET /api/health`, implementasyonda `GET /health`. API prefix yok.
- **Öneri:** `GET /api/health` olarak güncellenebilir veya plan güncellenebilir.

---

## Görev 4: Kod Yazım Standardı ([auth.controller.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/auth.controller.js) Referanslı)

### 4.1 Sözdizimi ve Biçimlendirme Kuralları

[auth.controller.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/auth.controller.js) dosyası referans alınarak aşağıdaki standartlar belirlenmiştir:

| Kural | Standart | Referans |
|---|---|---|
| **Tırnak işareti** | **Tek tırnak `'`** (string'ler ve import'lar için) | auth.controller.js tüm dosyada tek tırnak kullanıyor |
| **Noktalı virgül** | **Zorunlu `;`** | Tüm ifadelerin sonunda noktalı virgül mevcut |
| **Girinti** | **4 boşluk (space)** | Tüm bloklar 4 space indent |
| **Import düzeni** | (1) Utility/Error imports → (2) DB import → (3) Utils → (4) Üçüncü parti paketler | Gruplar arasında boş satır yok, sıralama mantıksal |
| **Arrow function** | `export const fnName = async (req, res) => { ... };` | Named export + async arrow function |
| **Blok yapısı** | Süslü parantez her zaman, tek satırlık throw hariç | Kısa if'lerde throw direkt yazılmış |
| **Trailing comma** | Çok satırlı objeler ve dizilerde **var** | Response JSON'larında trailing comma mevcut |

---

### 4.2 Mimari Kurallar

| Kural | Standart |
|---|---|
| **Dosya isimlendirme** | `kebab-case` format: [auth.controller.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/auth.controller.js), [send.mail.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/utils/send.mail.js) — nokta ile ayrılmış modül tipi |
| **Klasör yapısı** | `controllers/`, `routes/`, `middlewares/`, `utils/`, `lib/` |
| **Route dosya adı** | [.router.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/routes/auth.router.js) uzantısı (implementasyondaki mevcut kullanım) |
| **Controller dosya adı** | [.controller.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/cart.controller.js) uzantısı |
| **Katman sorumlulukları** | Controller = request parsing + response formatting + try/catch. Service layer = **mevcut değil** (iş mantığı controller'da). |
| **Hata yönetimi** | Her controller fonksiyonunda `try { ... } catch (error) { ... }` yapısı |
| **ApiError kullanımı** | `throw ApiError.badRequest(message)` — hata fırlatma, catch bloğunda `error.statusCode \|\| 500` |
| **Response formatı** | `{ success: true/false, message: '...', [data]: ... }` veya `{ success: false, error: '...' }` |
| **Middleware zinciri** | Route tanımında: `router.method(path, [middleware1, middleware2, ...], handler)` |

---

### 4.3 Response Formatı Standardı

```javascript
// Başarılı yanıt
res.status(200).json({
    success: true,
    message: 'İşlem açıklaması',
    data_key: data, // örn: user, orders, products
});

// Hata yanıtı
res.status(statusCode).json({
    success: false,
    error: error.message || 'Varsayılan hata mesajı',
});
```

> [!IMPORTANT]
> **Tutarsızlık tespit edildi:** Başarılı yanıtlarda veri anahtarı standart değil. Bazı controller'lar `user`, bazıları `orders`, bazıları `cart` kullanıyor. Bu kabul edilebilir ama bir `data` wrapper kullanılması da düşünülebilir.

> [!WARNING]
> **Kritik tutarsızlık:** [auth.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/middlewares/auth.js) middleware hata yanıtlarında `message` anahtarı kullanırken, controller'lar `error` anahtarı kullanıyor. Standart olarak hata yanıtlarında **`error` anahtarı** kullanılmalı.

---

### 4.4 Mevcut Kod Stili Tutarsızlıkları

| Dosya | Sorun | Detay |
|---|---|---|
| [auth.router.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/routes/auth.router.js) | **Çift tırnak** | `import express from "express"` — standart tek tırnak olmalı |
| [categories.router.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/routes/categories.router.js) | **Çift tırnak** | Tüm string'ler çift tırnak |
| [products.router.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/routes/products.router.js) | **Çift tırnak** | Tüm string'ler çift tırnak |
| [orders.router.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/routes/orders.router.js) | **Çift tırnak** | Tüm string'ler çift tırnak |
| [app.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/app.js) | **Çift tırnak** | Çoğu string çift tırnak — standarta aykırı |
| [roles.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/middlewares/roles.js) | **Çift tırnak** | `"Authentication required."` — çift tırnak |
| [error.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/utils/error.js) | **Çift tırnak** | Varsayılan mesajlarda karma kullanım |
| [database.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/lib/db/database.js) | **Çift tırnak** | Import'larda çift tırnak |
| [auth.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/middlewares/auth.js) | **Hata yanıtında `message`** | `{ success: false, message: '...' }` — standart `error` olmalı |
| [app.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/app.js) | **404/500 yanıtında `message`** | `{ success: false, message: '...' }` — standart `error` olmalı |
| [branches.router.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/routes/branches.router.js) | **Import boşluk** | [getBranches](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/branches.controller.js#4-38) import'unda fazladan boşluk (`   getBranches`) |

---

### 4.5 Dokümantasyon Kuralları

Mevcut kodda **hiçbir fonksiyon yorumu yok**. Standart olarak:

```javascript
/**
 * Creates a new user account with customer role.
 * Validates email format, password strength, and checks for duplicates.
 * Returns JWT tokens (access + refresh) on successful registration.
 */
export const signUp = async (req, res) => { ... };
```

Her exported fonksiyonun başına JSDoc formatında kısa açıklama eklenmeli.

---

## Sorularım

Aşağıdaki noktalarda netleştirme gerekiyor:

1. **Guest Checkout:** Plan'da guest checkout desteği var ama senaryoda "giriş yapmadan sipariş verilemez" denmiş. **Guest checkout tamamen kaldırılacak mı?** Eğer evetse, `POST /api/orders`'a [verifyToken](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/middlewares/auth.js#5-47) eklenmeli ve `carts` tablosundan `session_id` planı da iptal edilmeli.

2. **Endpoint İsimleri:** Plan'daki `/api/auth/register` ve `/api/auth/login` mi yoksa mevcut `/api/auth/sign-up` ve `/api/auth/sign-in` mi kullanılacak? Sözlü sınavda plan ile kod arasındaki tutarsızlık sorulabilir.

3. **Dosya İsimlendirme:** [branches.controller.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/branches.controller.js) (çoğul) mu yoksa `branch.controller.js` (tekil) mi kullanılmalı? Hem plan hem kod farklı convention kullanıyor.

4. **Service Layer:** [auth.controller.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/auth.controller.js)'de iş mantığı controller'ın içinde yazılmış. **Ayrı bir `services/` klasörü oluşturulacak mı** yoksa mevcut controller-heavy yapı korunacak mı? Service layer bitirme projesinde mimari olgunluk göstergesi olur ancak scope'u artırır.

5. **Kupon Endpoint Yeri:** `POST /api/coupons/validate` (plan) mı yoksa `POST /api/cart/coupons/validate` (mevcut) mi? Kupon doğrulaması cart context'inde yapıldığı için mevcut yol (cart altında) mantıklı olabilir ama plan'la çelişiyor.

6. **Hata Response Key:** Auth middleware `message` anahtarı, controller'lar `error` anahtarı kullanıyor. Hangisi standart olacak? **Benim önerim: hata yanıtlarında `error`, genel bilgilendirme yanıtlarında `message` kullanılması.**
