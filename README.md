# Burne Cafe

> Modern ve kullanıcı dostu bir online cafe sipariş platformu.

![License](https://img.shields.io/github/license/jusiann/burne-cafe-place)
![Stars](https://img.shields.io/github/stars/jusiann/burne-cafe-place?style=social)

---

## İçindekiler

- [Hakkında](#hakkında)
- [Özellikler](#özellikler)
- [Kurulum](#kurulum)
- [Kullanım](#kullanım)
- [Konfigürasyon](#konfigürasyon)
- [İletişim](#iletişim)

---

## Hakkında

Burne Cafe, kullanıcıların kolayca kahve ve yiyecek siparişi verebilmelerini sağlayan modern bir web uygulamasıdır. Menüden ürün seçimi, sepet yönetimi, kupon kullanımı ve sipariş takibi gibi tam kapsamlı bir e-ticaret deneyimi sunar.

**Teknoloji Yığını:**

- **Dil:** JavaScript (ES6+)
- **Framework:** React 19.2.0 + Vite 7.2.4
- **Stil:** Tailwind CSS 4.1.18
- **Routing:** React Router DOM 7.11.0
- **Diğer:** Lucide React, clsx, tailwind-merge

---

## Özellikler

- **Dinamik Menü** — Kategorilere göre filtrelenebilir ürün listesi
- **Sepet Yönetimi** — Ürün ekleme, çıkarma ve miktar güncelleme
- **Kupon Sistemi** — İndirim kuponları ile tasarruf imkanı
- **Sipariş Takibi** — Geçmiş siparişleri görüntüleme
- **Hero Slider** — Ana sayfada dinamik görsel slider
- **Günlük Fırsatlar** — Öne çıkan ürünler ve kampanyalar
- **Responsive Tasarım** — Mobil uyumlu arayüz

---

## Kurulum

### Gereksinimler

- Node.js >= 18
- npm veya yarn

### Hızlı Başlangıç

```bash
# Repoyu klonla
git clone https://github.com/jusiann/burne-cafe-place.git
cd burne-cafe-place/burne-cafe

# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev
```

Tarayıcınızda `http://localhost:5173` adresini açarak projeyi görüntüleyebilirsiniz.

### Diğer Komutlar

```bash
# Üretim derlemesi oluştur
npm run build

# Derlemeyi önizle
npm run preview

# Kod kalitesi kontrolü
npm run lint
```

---

## Kullanım

Uygulama aşağıdaki sayfa yapısına sahiptir:

| Sayfa | Yol | Açıklama |
|-------|-----|----------|
| Ana Sayfa | `/` | Hero slider, kategoriler ve günlük fırsatlar |
| Menü | `/menu` | Tüm ürünlerin listelendiği sayfa |
| Ürün Detay | `/product/:id` | Tek ürün detay sayfası |
| Sepet | `/cart` | Sepet içeriği ve yönetimi |
| Ödeme | `/checkout` | Sipariş tamamlama |
| Sipariş Onay | `/order-confirmation` | Sipariş özeti |
| Geçmiş | `/order-history` | Sipariş geçmişi |

---

## Konfigürasyon

Proje yapılandırmaları:

| Dosya | Açıklama |
|-------|----------|
| `vite.config.js` | Vite build ve dev server ayarları |
| `tailwind.config.js` | Tailwind CSS özelleştirmeleri |
| `src/data/products.json` | Ürün veritabanı |
| `src/data/coupons.json` | İndirim kuponları |

---

## İletişim

**Adil Aslan** — insta:adlefee — aslanadil8@gmail.com

Proje: [https://github.com/jusiann/burne-cafe-place](https://github.com/jusiann/burne-cafe-place)
| Context API | Sepet ve sipariş state yönetimi |
| Local Storage | Sepet ve sipariş verilerinin kalıcı saklanması |

## Özellikler

### 🛍️ Alışveriş Özellikleri
- **Ürün Katalog** - 25 farklı kahve ve içecek ürünü
- **Kategori Filtreleme** - 4 kategori (Sıcak Kahveler, Soğuk Kahveler, Frappeler, Serinletici İçecekler)
- **Ürün Arama** - Gerçek zamanlı arama özelliği
- **Fiyat Sıralama** - Artan/Azalan fiyata göre sıralama
- **Ürün Detay** - Besin değerleri, boyut seçimi, ekstra malzeme ekleme

### 🛒 Sepet Yönetimi
- **Dinamik Sepet** - Gerçek zamanlı sepet güncelleme
- **CRUD İşlemleri** - Ürün ekleme, silme, güncelleme
- **Kupon Sistemi** - 3 farklı indirim kuponu (ILK15, IKILIM20, MIEL10)
- **Fiyat Hesaplama** - Ara toplam, KDV (%20) ve toplam hesaplama
- **Local Storage** - Sayfa yenilendiğinde sepet korunur

### 📦 Sipariş Sistemi
- **Sipariş Formu** - Kişisel bilgiler, adres ve teslimat bilgileri
- **Form Validasyonu** - Telefon, e-posta ve kart formatı kontrolü
- **Ödeme Yöntemleri** - Kapıda Nakit, Kapıda Kart, Online Kredi Kartı
- **SMS Doğrulama** - Online ödemeler için SMS kod doğrulama modalı
- **Teslimat Zamanı** - Hemen veya belirli saat seçimi
- **Sipariş Takibi** - Sipariş durumu (Hazırlanıyor, Yolda, Teslim Edildi)

### 🎨 UI/UX Özellikleri
- **Responsive Tasarım** - Mobil, tablet ve masaüstü uyumlu
- **Hamburger Menü** - Mobil cihazlar için optimize edilmiş menü
- **Scroll Animasyonları** - Yumuşak sayfa geçişleri
- **Badge Göstergesi** - Sepetteki ürün sayısı navbar'da görünür
- **Ürün Düzenleme** - Sepetteki ürünleri detay sayfasından düzenleme

### 📊 Veri Yönetimi
- **Mock Data** - Backend'siz çalışan sahte veri sistemi
- **25+ Ürün** - Detaylı ürün bilgileri (besin değerleri, fiyat, kategori)
- **4 Kategori** - Cafe konseptine uygun kategori yapısı
- **3 Kupon** - Farklı koşullara sahip indirim kuponları
- **Sipariş Geçmişi** - Geçmiş siparişleri görüntüleme ve tekrar sipariş verme

## Sayfalar

| Sayfa | Route | Açıklama |
|-------|-------|----------|
| Ana Sayfa | `/` | Hero slider, kategoriler, öne çıkan ürünler, günün fırsatı |
| Menü | `/menu` | Tüm ürünler, filtreleme, sıralama, arama |
| Ürün Detay | `/product/:id` | Ürün görseli, besin değerleri, boyut/ekstra seçimi |
| Sepet | `/cart` | Sepet içeriği, kupon kodu, sipariş özeti |
| Sipariş Formu | `/checkout` | Teslimat bilgileri, adres, ödeme yöntemi |
| Sipariş Onay | `/order-confirmation` | Sipariş başarılı mesajı, sipariş numarası, tahmini süre |
| Siparişlerim | `/order-history` | Geçmiş siparişler, durum takibi, tekrar sipariş |
| 404 Sayfası | `*` | Sayfa bulunamadı |

## Kullanım Senaryoları

### Senaryo 1: Ürün Siparişi
1. Ana sayfadan veya menüden bir ürün seçin
2. Ürün detay sayfasında boyut, süt tipi ve ekstralar seçin
3. Adet belirleyin ve "Sepete Ekle" butonuna tıklayın
4. Sepet ikonu güncellenir ve bildirim görürsünüz

### Senaryo 2: Sipariş Tamamlama
1. Sepet sayfasından ürünlerinizi kontrol edin
2. İsteğe bağlı kupon kodu girin (örn: ILK15)
3. "Siparişi Tamamla" butonuna tıklayın
4. Sipariş formunu doldurun ve ödeme yöntemi seçin
5. Siparişi onaylayın ve sipariş numaranızı alın

### Senaryo 3: Tekrar Sipariş
1. "Siparişlerim" sayfasına gidin
2. Geçmiş bir siparişte "Tekrar Sipariş Ver" butonuna tıklayın
3. Aynı ürünler sepete eklenir
4. Sepet sayfasında değişiklik yapıp siparişi tamamlayın

## Kupon Kodları

| Kod | İndirim | Min. Tutar | Koşul |
|-----|---------|------------|-------|
| ILK15 | %15 | 0 TL | İlk sipariş için geçerli |
| IKILIM20 | %20 | 100 TL | Sepette Americano ve Latte olmalı |
| MIEL10 | %10 | 50 TL | Miel ürününün ekstraları için geçerli |

## Teknik Detaylar

### Context API Kullanımı
Proje, sepet ve sipariş yönetimi için Context API kullanır:
- `CartProvider` - Tüm sepet state'ini yönetir
- `useCart` hook - Component'lerden sepet işlemlerine erişim
- Local Storage senkronizasyonu - `useEffect` ile otomatik kaydetme

### Form Validasyonu
CheckoutSection'da kapsamlı form validasyonu:
- Boş alan kontrolü
- Telefon formatı (10 haneli)
- E-posta formatı
- Kredi kartı formatı (16 haneli)
- CVV formatı (3 haneli)
- Son kullanma tarihi formatı (AA/YY)

### Responsive Breakpoint'ler
Tailwind CSS breakpoint'leri:
- `sm:` - 640px ve üzeri
- `md:` - 768px ve üzeri
- `lg:` - 1024px ve üzeri
- `xl:` - 1280px ve üzeri

## Proje Hakkında

Bu proje, **BLG331 - Web Teknolojileri** dersi kapsamında geliştirilmiş bir dönem projesidir. Projenin amacı, modern React best practice'lerini kullanarak tam işlevsel bir e-ticaret platformu oluşturmaktır.

### Öne Çıkan Özellikler
- ✅ Component bazlı mimari
- ✅ Context API ile merkezi state yönetimi
- ✅ React Router ile dinamik routing
- ✅ Local Storage ile veri kalıcılığı
- ✅ Responsive ve modern UI/UX
- ✅ Form validasyonu ve hata yönetimi
- ✅ Kupon sistemi ve fiyat hesaplamaları
- ✅ Sipariş takip sistemi

### Geliştirme Notları
Proje, orijinal dönem proje dökümanında belirtilen "restoran" konsepti yerine **cafe** konseptine uyarlanmıştır. Bu nedenle kategori yapısı kahve odaklı tasarlanmıştır:
- ✅ Sıcak Kahveler
- ✅ Soğuk Kahveler
- ✅ Frappeler
- ✅ Serinletici İçecekler


## İletişim

Proje hakkında sorularınız için: [GitHub Repository](https://github.com/jusiann/burne-cafe-place)

---

**Geliştirici:** Adil Efe  
**Tarih:** Ocak 2026  
**Ders:** BLG331 - Web Teknolojileri
