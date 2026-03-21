import {Link} from 'react-router-dom';
import {Clock,Percent,ChevronRight} from 'lucide-react';
import {useState,useEffect} from 'react';
import {useProducts} from '../../hooks/useProducts.js';

function HomeDailyDeals() {
    const {products, isLoading, error} = useProducts();
    const discountedProducts = (products || []).filter(product => product.discount > 0).slice(0, 2);
    
    const [timeLeft,setTimeLeft] = useState({hours: 4,minutes: 51,seconds: 45});
    const [activeCouponIndex,setActiveCouponIndex] = useState(0);

    const coupons = [
        { code: 'ILK15' },
        { code: 'IKILIM20' },
        { code: 'MIEL10' }
    ];

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
            description: 'Miel Siparişlerinde %10 İndirim',
            conditions: 'Mielde geçerlidir.'
        }
    };

    const TimeBlock = ({value,label}) => (
        <div className="text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                <span className="text-2xl md:text-3xl font-bold text-white">
                    {String(value).padStart(2,'0')}
                </span>
            </div>
            <p className="text-white/60 text-sm mt-2">{label}</p>
        </div>
    );

    const DealCard = ({product}) => {
        const priceNum = Number(product.base_price || 0);
        const discountNum = Number(product.discount || 0);
        const discountedPrice = priceNum - (priceNum * discountNum / 100);

        return (
            <Link
                to={`/product/${product.id}`}
                className="group flex gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/15 transition-all duration-300"
            >
                <div className="flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden">
                    <img src={product.image_url || '/assets/caffee-pictures/placeholder.jpg'} alt={product.name} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-white group-hover:text-[#C46A2B] transition-colors">
                            {product.name}
                        </h3>
                        <span className="flex-shrink-0 h-7 px-2 flex items-center justify-center bg-[#8B4513] text-[#F5DEB3] text-xs font-bold rounded-md border border-[#D4A574]/50">
                            %{product.discount}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                        <Clock className="w-4 h-4 text-[#C46A2B]" />
                        <span className="text-[#C46A2B] text-sm">Sınırlı süre</span>
                    </div>

                    <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-lg font-bold text-[#C46A2B]">
                            ₺{discountedPrice.toFixed(0)}
                        </span>
                        <span className="text-sm text-white/50 line-through">
                            ₺{priceNum.toFixed(2)}
                        </span>
                    </div>
                </div>
            </Link>
        );
    };

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(previous => {
                let { hours, minutes, seconds } = previous;

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

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveCouponIndex((previous) => (previous + 1) % coupons.length);
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    return (
        <section className="py-20 bg-gradient-to-br from-[#2B1E17] via-[#3D2B20] to-[#2B1E17] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-72 h-72 bg-[#C46A2B]/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#C46A2B]/10 rounded-full blur-3xl" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4">
                        <Percent className="w-4 h-4 text-[#C46A2B]" />
                    </div>
                    <h2 className="font-heading text-3xl md:text-4xl text-white mb-4">
                        Günün Kampanyaları
                    </h2>
                    <p className="text-white/60 max-w-2xl mx-auto">
                        Sınırlı süre için geçerli indirimli kahvelerimizi kaçırmayın
                    </p>
                </div>

                <div className="flex justify-center gap-4 mb-12">
                    <TimeBlock value={timeLeft.hours} label="Saat" />
                    <TimeBlock value={timeLeft.minutes} label="Dakika" />
                    <TimeBlock value={timeLeft.seconds} label="Saniye" />
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-10">
                        <div className="w-8 h-8 border-4 border-[#C46A2B]/30 border-t-[#C46A2B] rounded-full animate-spin" />
                    </div>
                ) : error ? (
                    <div className="text-center text-red-500 py-10">Kampanyalar yüklenemedi.</div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        {discountedProducts.map((product) => (
                            <DealCard key={product.id} product={product} />
                        ))}
                    </div>
                )}

                <div className="mt-12 p-4 bg-gradient-to-r from-[#C46A2B] to-[#A85A24] rounded-2xl max-w-4xl mx-auto relative overflow-hidden">
                    <div className="flex items-center justify-between gap-3 md:gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="relative h-24 md:h-16">
                                {coupons.map((coupon, index) => {
                                    const details = couponDetails[coupon.code];
                                    return (
                                        <div
                                            key={coupon.code}
                                            className={`absolute inset-0 transition-all duration-700 ease-out ${index === activeCouponIndex ? 'opacity-100 translate-y-0 z-10 pointer-events-auto delay-300' : 'opacity-0 translate-y-8 z-0 pointer-events-none delay-0'}`}
                                        >
                                            <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-0">
                                                <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                                                    <Percent className="w-8 h-8 md:w-9 md:h-9 text-white flex-shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-white/90 text-xs md:text-sm font-medium mb-0.5">{details?.title}</p>
                                                        <p className="text-white font-bold text-base md:text-lg leading-tight">{details?.description}</p>
                                                        <p className="text-white/80 text-xs leading-snug line-clamp-1">{details?.conditions}</p>
                                                    </div>
                                                </div>

                                                <div className="hidden md:block h-12 w-px bg-gradient-to-b from-white/20 via-white/40 to-white/20 mx-3" />

                                                <div className="flex flex-row gap-2 w-full md:w-auto md:flex-shrink-0 md:mr-3">
                                                    <div className="flex-1 md:flex-initial bg-white/20 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/30">
                                                        <p className="text-white text-xs text-center whitespace-nowrap">
                                                            <span className="font-normal">Kod: </span>
                                                            <span className="font-bold tracking-wider">{coupon.code}</span>
                                                        </p>
                                                    </div>
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

                        <div className="flex flex-col items-center gap-3 py-2 flex-shrink-0">
                            {coupons.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveCouponIndex(index)}
                                    className={`relative w-3 flex items-center justify-center transition-all duration-500 cursor-pointer ${index === activeCouponIndex ? 'h-12 md:h-14' : 'h-6 md:h-7'}`}
                                >
                                    <span className={`w-1 h-full rounded-full transition-all duration-500 ${index === activeCouponIndex ? 'bg-white' : 'bg-white/40 hover:bg-white/60'}`} />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default HomeDailyDeals;
