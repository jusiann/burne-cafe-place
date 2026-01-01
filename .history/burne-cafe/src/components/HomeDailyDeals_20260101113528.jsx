import { Link } from 'react-router-dom';
import { Clock, Percent, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import products from '../data/products.json';
import coupons from '../data/coupons.json';

function HomeDailyDeals() {
    const discountedProducts = products.filter(p => p.discount > 0).slice(0, 2);
    const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 51, seconds: 45 });
    const [currentCouponIndex, setCurrentCouponIndex] = useState(0);

    const activeCoupons = coupons.filter(c => c.isActive);

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

    // COUPON AUTO-SWITCH EFFECT
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentCouponIndex(prev => (prev + 1) % activeCoupons.length);
        }, 5000); // Her 5 saniyede bir değişir

        return () => clearInterval(interval);
    }, [activeCoupons.length]);

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

                {/* PROMO BANNER */}
                <div className="mt-12 p-6 md:p-8 bg-gradient-to-r from-[#C46A2B] to-[#A85A24] rounded-2xl max-w-4xl mx-auto relative overflow-hidden min-h-[140px]">
                    
                    {/* ANIMATED VERTICAL LINES WITH FLOWING EFFECT */}
                    <div className="absolute right-8 top-1/2 -translate-y-1/2 h-32 flex items-center">
                        <div className="relative h-full w-4 flex flex-col justify-center gap-2">
                            {[...Array(5)].map((_, i) => (
                                <div
                                    key={i}
                                    className="w-1 bg-white/30 rounded-full absolute left-1/2 -translate-x-1/2"
                                    style={{
                                        height: `${20 + (i % 3) * 10}px`,
                                        animation: 'flowUp 3s ease-in-out infinite',
                                        animationDelay: `${i * 0.6}s`,
                                        top: `${i * 20}%`
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <style>{`
                        @keyframes flowUp {
                            0%, 100% {
                                transform: translateY(0) translateX(-50%);
                                opacity: 0.3;
                            }
                            50% {
                                transform: translateY(-60px) translateX(-50%);
                                opacity: 0.8;
                            }
                        }
                    `}</style>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 relative pr-12 md:pr-16">
                        <div className="flex items-center gap-3 min-w-[180px]">
                            <Percent className="w-10 h-10 text-white flex-shrink-0" />
                            <div className="text-left">
                                <p className="text-white/80 text-sm whitespace-nowrap">
                                    {activeCoupons[currentCouponIndex]?.conditions?.firstOrder 
                                        ? 'İlk Siparişe Özel' 
                                        : 'Özel Kampanya'}
                                </p>
                                <p className="text-white font-bold text-xl whitespace-nowrap">
                                    {activeCoupons[currentCouponIndex]?.discountType === 'percentage' 
                                        ? `%${activeCoupons[currentCouponIndex]?.discountValue} İNDİRİM`
                                        : 'EKSTRA İNDİRİM'}
                                </p>
                            </div>
                        </div>
                        
                        <div className="hidden md:block w-px h-12 bg-white/30 flex-shrink-0" />
                        
                        <div className="text-center flex-1 min-w-[200px] max-w-[300px]">
                            <p className="text-white/90 mb-1 text-sm line-clamp-1">
                                {activeCoupons[currentCouponIndex]?.description}
                            </p>
                            <p className="text-white font-mono whitespace-nowrap">
                                Kod: <span className="font-bold text-lg">{activeCoupons[currentCouponIndex]?.code}</span>
                            </p>
                        </div>
                        
                        <Link
                            to="/menu"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#C46A2B] font-medium rounded-xl hover:bg-white/90 hover:shadow-2xl transition-all duration-300 flex-shrink-0 whitespace-nowrap"
                        >
                            Sipariş Ver
                            <ChevronRight className="w-5 h-5" />
                        </Link>
                    </div>

                    {/* COUPON INDICATORS */}
                    <div className="flex justify-center gap-2 mt-4">
                        {activeCoupons.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentCouponIndex(index)}
                                className={`transition-all duration-300 rounded-full ${
                                    index === currentCouponIndex 
                                        ? 'w-6 h-2 bg-white' 
                                        : 'w-2 h-2 bg-white/40 hover:bg-white/60'
                                }`}
                            />
                        ))}
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
