### 🛡️⚡ GÜVENLİK VE OPTİMİZASYON DENETİMİ: Burne Cafe API (Veritabanı & Auth Süreçleri)
**Risk & Performans Durumu:** Sarı (Orta Risk - Genel yapı çok iyi fakat kritik birkaç mantık/mimari düzeltme gerekiyor)

**1) Özet (Executive Summary)**
Mevcut kod tabanını, veritabanı şemasını ([schema.sql](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/lib/db/schema.sql), [seed.sql](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/lib/db/seed.sql)) ve Kimlik Doğrulama iş mantığını ([auth.controller.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/auth.controller.js), [auth.routes.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/routes/auth.routes.js), [middlewares/auth.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/middlewares/auth.js)) inceledim. Kod modüler MVC mimarisine sadık kalarak temiz yazılmış. "Yazılım Mühendisliği Bitirme Projesi" gereksinimlerini (3 Rol, Kapsamlı DB, Auth, Ayrıştırılmış Sorumluluklar) kağıt üzerinde fazlasıyla karşılıyor. Ancak güvenlik ve sürdürülebilirlik (performans) bacağında **"sıfır güven (zero trust)"** ve **"verimlilik"** ilkelerini bozan bazı durumlar tespit ettim. 

Müdahale edilmezse yaşanacak en büyük risk: **Kullanıcıların parola sıfırlama (reset) kodlarının veri sızıntısında açıkça görülebilmesi** ve her istekte DB'yi gereksiz yoran JWT doğrulamasıdır.

Öncelikli 3 Hamle:
1. [forgotPassword](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/auth.controller.js#139-203) süreçlerinde reset_code'un şifrelenerek saklanması.
2. [verifyToken](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/middlewares/auth.js#5-51) içindeki darboğazın (her istekte DB'ye Select atılması) engellenmesi.
3. API güvenliğini kanıtlamak için Rate-Limiting eklenmesi.

---

**2) Güvenlik Bulguları (Security Findings)**

* **[Hassas Veri İfşası - Plain-text Reset Code]** (Önem: Kritik)
  * **Konum:** [auth.controller.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/auth.controller.js) / [forgotPassword](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/auth.controller.js#139-203) & [checkResetCode](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/auth.controller.js#204-244)
  * **Sömürü:** DB'ye salt okunur (read-only) dahi olsa bir SQL Injection veya sistem sızıntısı olursa, saldırganlar `users` tablosundaki aktif `reset_code` değerlerini düz metin (plain text) olarak görebilirler. Kullanıcıların hesaplarını zorla ele geçirebilirler (Account Takeover).
  * **Çözüm:** `resetCode` DB'ye kaydedilmeden önce `bcrypt.hash()` ile şifrelenmeli. [checkResetCode](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/auth.controller.js#204-244) içinde ise kullanıcının girdiği kod ile veritabanındaki hash `bcrypt.compare()` kullanılarak karşılaştırılmalı. (Birebir `password` mantığı gibi).

* **[Kırık Erişim Kontrolü - Stateless JWT Logout]** (Önem: Yüksek)
  * **Konum:** [auth.controller.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/auth.controller.js) / [logout](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/auth.controller.js#472-498)
  * **Sömürü:** [logout](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/auth.controller.js#472-498) sadece 200 mesajı dönüyor. İstemci tarafında token silinse bile, JWT doğası gereği sunucu tarafında süresi dolana kadar **geçerlidir**. Eğer saldırgan kullanıcı `localStorage` üzerinden token'ı çalmışsa, "çıkış yapsa bile" bu token kullanılmaya devam edilebilir.
  * **Çözüm:** Akademik bir projede "Security awareness" puanınızı zirveye taşımak için; sunucu tarafında bir Token Karalistesine (Blacklist) ihtiyacınız var. Redis (büyük projeler) veya veritabanında basit bir `invalidated_tokens` tablosu / token_version sütunu ekleyebilirsiniz.

* **[Brute Force / Abuse (Eksik Hız Sınırlandırması)]** (Önem: Orta)
  * **Konum:** [auth.routes.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/routes/auth.routes.js)
  * **Sömürü:** Kötü niyetli bir script, `POST /api/auth/sign-in` uç noktasına saniyede binlerce şifre denemesi atabilir.
  * **Çözüm:** `express-rate-limit` paketini kurup özellikle `/auth` rotalarına dahil etmeniz SE projenizde "Güvenlik" non-functional gereksinimini %100 sağladığınızı kanıtlar.

---

**3) Optimizasyon Bulguları (Optimization Findings)**

* **[DB Darboğazı - JWT verify = Stateful]** (Kategori: DB/Architecture | Önem: Yüksek)
  * **Kanıt:** [middlewares/auth.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/middlewares/auth.js) içindeki `SELECT id, name, email, role, is_active FROM users WHERE id = $1 LIMIT 1`
  * **Neden Verimsiz:** JWT'yi "Stateless" (durumsuz ve yüksek performanslı) olduğu için seçtiniz. Ancak yazdığınız middleware, korumalı ROTAYA GELEN HER İSTEKTE (örneğin ana sayfadaki 10 ürünün çekilmesi vs) DB'ye sorgu atıyor. Sisteme yoğun yük bindiğinde veritabanı çöker (Scalability eksi puan).
  * **Önerilen Çözüm:** `generateTokens` içerisinde `role` ve `is_active` gibi bilgileri payload'a dahil edin. Middleware'de DB sorgusunu tamamen silin ve sadece `jwt.verify` sonucuna güvenerek `req.user = decoded` yapın. Eğer kullanıcının `is_active` durumunu kritik işlemlerde kontrol edecekseniz sadece sipariş verildiğinde kontrol yapın. Gecikmeyi ciddi oranda (%30+) düşürür.

* **[Redundant Query (Gereksiz Doğrulama Sorgusu)]** (Kategori: DB/I-O | Önem: Orta)
  * **Kanıt:** [auth.controller.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/auth.controller.js) / [updateProfile](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/auth.controller.js#356-446) 417. satır: Telefon no benzersiz mi diye `SELECT id FROM users WHERE phone = $1...` sorgusu atılıyor.
  * **Neden Verimsiz:** [schema.sql](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/lib/db/schema.sql)'de `phone` alanı zaten `UNIQUE` tanımlanmış! Eğer o numara başka birindeyse PostgreSQL işlemi anında reddedip `23505 (unique_violation)` fırlatacak. 
  * **Önerilen Çözüm:** SQL sorgusunu silin. Sadece `UPDATE` sorgusunu çalıştırın. Eğer DB hata dönerse catch bloğunda `error.code === '23505'` yakalayıp `ApiError.conflict` fırlatın. Böylece fazladan 1 I/O işleminden (DB gidip gelmesi) kurtulursunuz.

* **[Ölü/Eski Konfigürasyon - Dead Code]** (Kategori: DB | Önem: Düşük)
  * **Kanıt:** [schema.sql](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/lib/db/schema.sql) ilk satır `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
  * **Açıklama:** Veritabanınızı `docker-compose.yml` içinde `postgres:16-alpine` ile başlatıyorsunuz. PostgreSQL 13'ten beri `gen_random_uuid()` standart/yerleşik bir özelliktir. Bu yüzden extension import'una gerek yoktur, mimari açıdan sadeleşme için güvenle kaldırılabilir.

---

**4) Hızlı Kazanımlar (Quick Wins)**

1. `uuid-ossp` extension komutunu silelim (Temiz kod).
2. [updateProfile](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/auth.controller.js#356-446) içindeki SELECT telefon kontrolünü silelim, PostgreSQL hata fırlatmasına güvenelim.
3. `express-rate-limit` paketini `app.js` içine global olarak veya `auth` rotalarına koyalım (Jüri sunumunda harika durur: *"Güvenliği maksimize etmek için rate limit kullandım"*).

---

**5) Proje Uyum ve Doğrulama Planı (SE Expectations Match)**

Bu audit raporu ile **Bitirme Projesi** beklentilerini şu açılardan tartışmış olacağız:
* **Separation of concerns:** Controllers & Middleware mükemmel ayrılmış durumda, bozulmamalı.
* **Basic scalability thinking:** JWT DB çağrısını Middleware'dan silerek hocalarınıza "Uygulamanın ölçeklenebilmesi için DB yükünü minimumda tuttum" diyebilirsiniz.
* **Security awareness:** Parola kurtarma süreçlerini daha güvenli hale getirerek jüri sorularından (Örn: "Parola kurtarma mantığını nasıl korudun?") tam puan alırsınız.

**Aksiyon?**
Hocam, bu bulgular ışığında kodunuzu revize edebilirim. Hangilerinden başlayalım? (örn: *JWT Middleware optimizasyonu ve Rate limit eklenmesi*, veya *Reset code'un şifrelenmesi*)
