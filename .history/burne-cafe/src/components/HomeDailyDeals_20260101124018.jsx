import { Link } from 'react-router-dom';
import { Clock, Percent, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import products from '../data/products.json';
import coupons from '../data/coupons.json';

function HomeDailyDeals() {
    const discountedProducts = products.filter(p => p.discount > 0).slice(0, 2);
    const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 51, seconds: 45 });
    const [activeCouponIndex, setActiveCouponIndex] = useState(0);
    const [copiedCode, setCopiedCode] = useState('');

    const couponDetails = {
        'ILK15': {
            title: 'İlk Siparişe Özel',
            description: 'Tüm Kahvelerde %15 İndirim',
            conditions: 'İlk siparişinizde geçerlidir.'
        },
        'IKILIM20': {
            title: 'For Lovers',
            description: 'Americano & Latte %20 İndirim',
            conditions: 'Americano ve Latte bir arada alındığında geçerlidir.'
        },
        'MIEL10': {
            title: 'Le Miêl',
            description: 'Miel Ekstra Ürünlerde %10 İndirim',
            conditions: 'Miel kahve için ekstra ürünlerde geçerlidir.'
        }
    };

    // COPY COUPON CODE
    const copyCouponCode = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(''), 2000);
    };

    // COUNTDOWN TIMER EFFECT
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                let { hours, minutes, seconds } = prev;

                if (seconds > 0) {
                    seconds--;
                } else if (minutes > 0) {
                    minutes--;
                    seconds = 59;
                } else if (hours > 0) {
                    hours--;
                    minutes = 59;
                    seconds = 59;
                } else {
                    return { hours: 23, minutes: 59, seconds: 59 };
                }

                return { hours, minutes, seconds };
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // COUPON CAROUSEL EFFECT
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveCouponIndex((prev) => (prev + 1) % coupons.length);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <section className="py-20 bg-gradient-to-br from-[#2B1E17] via-[#3D2B20] to-[#2B1E17] relative overflow-hidden">

            {/* DECORATIVE ELEMENTS */}
            <div className="absolute top-0 left-0 w-72 h-72 bg-[#C46A2B]/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#C46A2B]/10 rounded-full blur-3xl" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* SECTION HEADER */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#C46A2B]/20 rounded-full mb-4">
                        <Percent className="w-4 h-4 text-[#C46A2B]" />
                        <span className="text-[#C46A2B] text-sm font-medium">
                            Günlük Fırsatlar
                        </span>
                    </div>
                    <h2 className="font-heading text-3xl md:text-4xl text-white mb-4">
                        Günün Kampanyaları
                    </h2>
                    <p className="text-white/60 max-w-2xl mx-auto">
                        Sınırlı süre için geçerli indirimli kahvelerimizi kaçırmayın
                    </p>
                </div>

                {/* COUNTDOWN TIMER */}
                <div className="flex justify-center gap-4 mb-12">
                    <TimeBlock value={timeLeft.hours} label="Saat" />
                    <TimeBlock value={timeLeft.minutes} label="Dakika" />
                    <TimeBlock value={timeLeft.seconds} label="Saniye" />
                </div>

                {/* DEALS GRID */}
                <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {discountedProducts.map((product) => (
                        <DealCard key={product.id} product={product} />
                    ))}
                </div>

                {/* PROMO BANNER - COUPON CAROUSEL */}
                <div className="mt-12 p-4 bg-gradient-to-r from-[#C46A2B] to-[#A85A24] rounded-2xl max-w-4xl mx-auto relative overflow-hidden">
                    <div className="flex items-center justify-between gap-3 md:gap-4">
                        {/* LEFT - COUPON CONTENT */}
                        <div className="flex-1 min-w-0">
                            <div className="relative h-24 md:h-16">
                                {coupons.map((coupon, index) => {
                                    const details = couponDetails[coupon.code];
                                    return (
                                        <div
                                            key={coupon.code}
                                            className={`
                                                absolute 
                                                inset-0 
                                                transition-all 
                                                duration-700 
                                                ease-in-out
                                                ${index === activeCouponIndex
                                                    ? 'opacity-100 translate-x-0'
                                                    : 'opacity-0 translate-x-8'
                                                }
                                            `}
                                        >
                                            <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-0">
                                                {/* Sol: Icon + Yazılar */}
                                                <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                                                    <Percent className="w-8 h-8 md:w-9 md:h-9 text-white flex-shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-white/90 text-xs md:text-sm font-medium mb-0.5">{details?.title}</p>
                                                        <p className="text-white font-bold text-base md:text-lg leading-tight">{details?.description}</p>
                                                        <p className="text-white/80 text-xs leading-snug line-clamp-1">{details?.conditions}</p>
                                                    </div>
                                                </div>
                                                
                                                {/* Orta: Dikey Border (Sadece Desktop) */}
                                                <div className="hidden md:block h-12 w-px bg-gradient-to-b from-white/20 via-white/40 to-white/20 mx-3" />
                                                
                                                {/* Sağ: Butonlar */}
                                                <div className="flex flex-row gap-2 w-full md:w-auto md:flex-shrink-0 md:mr-4">
                                                    <button
                                                        onClick={() => copyCouponCode(coupon.code)}
                                                        className="relative flex-1 md:flex-initial bg-white/20 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/30 hover:bg-white/30 transition-all duration-300 cursor-pointer"
                                                    >
                                                        <p className="text-white text-xs text-center whitespace-nowrap">
                                                            <span className="font-normal">Kod: </span>
                                                            <span className="font-bold tracking-wider">{coupon.code}</span>
                                                        </p>
                                                        {copiedCode === coupon.code && (
                                                            <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-white text-[#C46A2B] text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
                                                                Kopyalandı!
                                                            </span>
                                                        )}
                                                    </button>
                                                    <Link
                                                        to="/menu"
                                                        className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-white text-[#C46A2B] text-sm font-semibold rounded-lg hover:bg-white/90 hover:shadow-lg transition-all duration-300 whitespace-nowrap"
                                                    >
                                                        Sipariş Ver
                                                        <ChevronRight className="w-4 h-4" />
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* RIGHT - VERTICAL INDICATORS */}
                        <div className="flex flex-col items-center gap-3 py-2 flex-shrink-0">
                            {coupons.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveCouponIndex(index)}
                                    className={`
                                        relative
                                        w-3
                                        flex
                                        items-center
                                        justify-center
                                        transition-all 
                                        duration-500
                                        cursor-pointer
                                        ${index === activeCouponIndex ? 'h-12 md:h-14' : 'h-6 md:h-7'}
                                    `}
                                >
                                    <span
                                        className={`
                                            w-1 
                                            h-full
                                            rounded-full 
                                            transition-all 
                                            duration-500
                                            ${index === activeCouponIndex
                                                ? 'bg-white'
                                                : 'bg-white/40 hover:bg-white/60'
                                            }
                                        `}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// TIME BLOCK COMPONENT
function TimeBlock({ value, label }) {
    return (
        <div className="text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                <span className="text-2xl md:text-3xl font-bold text-white">
                    {String(value).padStart(2, '0')}
                </span>
            </div>
            <p className="text-white/60 text-sm mt-2">{label}</p>
        </div>
    );
}

// DEAL CARD COMPONENT
function DealCard({ product }) { 
    const discountedPrice = product.price - (product.price * product.discount / 100);

    return (
        <Link
            to={`/urun/${product.id}`}
            className="group flex gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/15 transition-all duration-300"
        >
            {/* PRODUCT IMAGE */}
            <div className="flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* PRODUCT INFO */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-white group-hover:text-[#C46A2B] transition-colors">
                        {product.name}
                    </h3>
                    <span className="flex-shrink-0 h-7 px-2 flex items-center justify-center bg-[#8B4513] text-[#F5DEB3] text-xs font-bold rounded-md border border-[#D4A574]/50">
                        %{product.discount}
                    </span>
                </div>
                
                {/* LIMITED TIME BADGE */}
                <div className="flex items-center gap-2 mt-3">
                    <Clock className="w-4 h-4 text-[#C46A2B]" />
                    <span className="text-[#C46A2B] text-sm">Sınırlı süre</span>
                </div>

                {/* PRICING */}
                <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-lg font-bold text-[#C46A2B]">
                        ₺{discountedPrice.toFixed(0)}
                    </span>
                    <span className="text-sm text-white/50 line-through">
                        ₺{product.price}
                    </span>
                </div>
            </div>
        </Link>
    );
}

export default HomeDailyDeals;
