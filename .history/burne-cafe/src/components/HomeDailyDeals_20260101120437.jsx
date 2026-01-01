import { Link } from 'react-router-dom';
import { Clock, Percent, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import products from '../data/products.json';
import coupons from '../data/coupons.json';

function HomeDailyDeals() {
    const discountedProducts = products.filter(p => p.discount > 0).slice(0, 2);
    const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 51, seconds: 45 });
    const [activeCouponIndex, setActiveCouponIndex] = useState(0);

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
        }, 4000); // 4 saniyede bir değişir

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
                <div className="mt-12 p-4 md:p-6 bg-gradient-to-r from-[#C46A2B] to-[#A85A24] rounded-2xl max-w-4xl mx-auto relative overflow-hidden">
                    <div className="flex items-center justify-between gap-6">
                        {/* LEFT - COUPON CONTENT */}
                        <div className="flex-1">
                            <div className="relative h-24">
                                {coupons.map((coupon, index) => (
                                    <div
                                        key={coupon.id}
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
                                        <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
                                            <div className="flex items-center gap-3">
                                                <Percent className="w-8 h-8 text-white flex-shrink-0" />
                                                <div className="text-left">
                                                    <p className="text-white/80 text-xs">{coupon.title}</p>
                                                    <p className="text-white font-bold text-lg">{coupon.description}</p>
                                                    <p className="text-white/70 text-xs mt-0.5 line-clamp-1">{coupon.conditions}</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-3 flex flex-col sm:flex-row items-center gap-2">
                                            <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/30">
                                                <p className="text-white/90 text-xs">
                                                    Kupon: <span className="font-bold text-sm">{coupon.code}</span>
                                                </p>
                                            </div>
                                            <Link
                                                to="/menu"
                                                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white text-[#C46A2B] text-sm font-medium rounded-lg hover:bg-white/90 hover:shadow-2xl transition-all duration-300"
                                            >
                                                Sipariş Ver
                                                <ChevronRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* RIGHT - VERTICAL INDICATORS */}
                        <div className="hidden md:flex flex-col items-center gap-4 h-full py-4">
                            {coupons.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveCouponIndex(index)}
                                    className={`
                                        w-1 
                                        rounded-full 
                                        transition-all 
                                        duration-500
                                        ${index === activeCouponIndex
                                            ? 'h-16 bg-white'
                                            : 'h-8 bg-white/40 hover:bg-white/60'
                                        }
                                    `}
                                />
                            ))}
                        </div>
                    </div>

                    {/* MOBILE INDICATORS (DOT STYLE) */}
                    <div className="md:hidden flex justify-center gap-2 mt-4">
                        {coupons.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setActiveCouponIndex(index)}
                                className={`
                                    rounded-full 
                                    transition-all 
                                    duration-300
                                    ${index === activeCouponIndex
                                        ? 'w-8 h-2 bg-white'
                                        : 'w-2 h-2 bg-white/40'
                                    }
                                `}
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
