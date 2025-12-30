import { Link } from 'react-router-dom';
import { Clock, Percent, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import products from '../data/products.json';

function HomeDailyDeals() {
    const discountedProducts = products.filter(p => p.discount > 0).slice(0, 2);
    const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 32, seconds: 45 });

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
                <div className="mt-12 p-6 md:p-8 bg-gradient-to-r from-[#C46A2B] to-[#A85A24] rounded-2xl text-center">
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
                        <div className="flex items-center gap-3">
                            <Percent className="w-10 h-10 text-white" />
                            <div className="text-left">
                                <p className="text-white/80 text-sm">İlk Siparişe Özel</p>
                                <p className="text-white font-bold text-xl">%15 İNDİRİM</p>
                            </div>
                        </div>
                        <div className="hidden md:block w-px h-12 bg-white/30" />
                        <div>
                            <p className="text-white/90 mb-2">
                                Kupon kodu: <span className="font-bold">KAHVE15</span>
                            </p>
                        </div>
                        <Link
                            to="/menu"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#C46A2B] font-medium rounded-xl hover:bg-white/90 transition-all duration-300"
                        >
                            Sipariş Ver
                            <ChevronRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

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

function DealCard({ product }) {
    const discountedPrice = product.price - (product.price * product.discount / 100);

    return (
        <Link
            to={`/urun/${product.id}`}
            className="group flex gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/15 transition-all duration-300"
        >
            {/* IMAGE */}
            <div className="flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* CONTENT */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-white group-hover:text-[#C46A2B] transition-colors">
                        {product.name}
                    </h3>
                    <span className="flex-shrink-0 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-lg">
                        %{product.discount}
                    </span>
                </div>
                <p className="text-white/60 text-sm line-clamp-1 mt-1">
                    {product.description}
                </p>
                <div className="flex items-center gap-2 mt-3">
                    <Clock className="w-4 h-4 text-[#C46A2B]" />
                    <span className="text-[#C46A2B] text-sm">Sınırlı süre</span>
                </div>
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
