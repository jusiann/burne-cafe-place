# Burne Cafe - Online Sipariş Sistemi

Bu proje, React ve Vite kullanılarak geliştirilmiş bir online cafe sipariş platformudur. Kullanıcıların menüden ürün seçip, sepete ekleyip, sipariş verebilecekleri modern bir web uygulamasıdır.

## Kurulum

Projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları izleyin:

```bash
# Proje dizinine git
cd burne-cafe

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

## Proje Yapısı

```
burne-cafe/
├── public/
│   └── caffee-pictures/     # Ürün görselleri
├── src/
│   ├── assets/              # Statik dosyalar
│   ├── components/          # React bileşenleri
│   │   ├── CartSection.jsx
│   │   ├── CheckoutSection.jsx
│   │   ├── Footer.jsx
│   │   ├── HomeCategoryCards.jsx
│   │   ├── HomeDailyDeals.jsx
│   │   ├── HomeFeaturedProducts.jsx
│   │   ├── HomeHeroSlider.jsx
│   │   ├── Layout.jsx
│   │   ├── MenuSection.jsx
│   │   ├── Navbar.jsx
│   │   ├── OrderConfirmationSection.jsx
│   │   ├── OrderHistorySection.jsx
│   │   └── ProductDetailSection.jsx
│   ├── context/             # Context API dosyaları
│   │   └── CartContext.jsx  # Sepet yönetimi
│   ├── data/                # Mock data dosyaları
│   │   ├── products.json    # Ürün veritabanı (25 ürün)
│   │   ├── orders.json      # Sipariş şablonları
│   │   └── coupons.json     # İndirim kuponları
│   ├── lib/                 # Yardımcı fonksiyonlar
│   │   └── utils.js
│   ├── pages/               # Sayfa bileşenleri
│   │   ├── Cart.jsx
│   │   ├── Checkout.jsx
│   │   ├── Home.jsx
│   │   ├── Menu.jsx
│   │   ├── NotFound.jsx
│   │   ├── OrderConfirmation.jsx
│   │   ├── OrderHistory.jsx
│   │   └── ProductDetail.jsx
│   ├── App.jsx              # Ana uygulama bileşeni
│   ├── main.jsx             # Uygulama giriş noktası
│   └── index.css            # Global stiller
├── package.json
└── vite.config.js
```

## Kullanılan Teknolojiler

### Temel Teknolojiler
| Teknoloji | Versiyon | Açıklama |
|-----------|----------|----------|
| React | 19.2.0 | UI geliştirme kütüphanesi |
| Vite | 7.2.4 | Build aracı ve geliştirme sunucusu |
| React Router DOM | 7.11.0 | Sayfa yönlendirmeleri |

### UI ve Stil
| Teknoloji | Versiyon | Açıklama |
|-----------|----------|----------|
| Tailwind CSS | 4.1.18 | Utility-first CSS framework |
| Lucide React | 0.562.0 | Modern ikon kütüphanesi |
| clsx | 2.1.1 | Koşullu className yönetimi |
| tailwind-merge | 3.4.0 | Tailwind sınıf birleştirme |

### State Yönetimi
| Teknoloji | Açıklama |
|-----------|----------|
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

## Lisans

Bu proje eğitim amaçlı geliştirilmiştir.

## İletişim

Proje hakkında sorularınız için: [GitHub Repository](https://github.com/jusiann/burne-cafe-place)

---

**Geliştirici:** Adil Efe  
**Tarih:** Ocak 2026  
**Ders:** BLG331 - Web Teknolojileri
