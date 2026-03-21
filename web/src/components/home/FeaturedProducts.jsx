import {useState} from 'react';
import {Link,useNavigate} from 'react-router-dom';
import {Star,ShoppingCart,ChevronRight,Check} from 'lucide-react';
import {useProducts} from '../../hooks/useProducts.js';
import useCartStore from '../../stores/cartStore.js';
import {showSuccess, showError} from '../../constants/alert.utils.js';

function HomeFeaturedProducts() {
    const {products, isLoading, error} = useProducts({ is_popular: true });
    const {addToCart, isLoading: isCartLoading} = useCartStore();

    // Sadece popüler olanlardan ilk 4 tanesi
    const popularProducts = (products || [])
        .filter(p => p.is_popular)
        .slice(0, 4);

    const ProductCard = ({product}) => {
        const navigate = useNavigate();
        const [isAdded,setIsAdded] = useState(false);
        const priceNum = Number(product.base_price || 0);
        const discountNum = Number(product.discount || 0);
        const hasDiscount = discountNum > 0;
        const discountedPrice = hasDiscount
            ? priceNum - (priceNum * discountNum / 100)
            : priceNum;

        const handleAddToCart = async (e) => {
            e.stopPropagation();
            if (isCartLoading) return;
            
            const result = await addToCart({
                product_id: product.id,
                quantity: 1,
                unit_price: discountedPrice,
                product_name: product.name,
                image_url: product.image_url
            });

            if (result.success) {
                setIsAdded(true);
                showSuccess(`${product.name} sepete eklendi`);
                setTimeout(() => setIsAdded(false), 2000);
            } else {
                showError('Sepete eklenirken hata oluştu');
            }
        };

        const handleCardClick = () => {
            navigate(`/product/${product.id}`);
        };

        return (
            <div 
                onClick={handleCardClick}
                className="group cursor-pointer h-full flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
                {/* PRODUCT IMAGE */}
                <div className="block relative">
                    <div className="aspect-[4/3] overflow-hidden">
                        <img
                            src={product.image_url || '/assets/caffee-pictures/placeholder.jpg'}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                    </div>

                    {/* BADGES */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {product.is_popular && (
                            <span className="h-7 px-2 flex items-center justify-center bg-[#2B1E17] text-[#D4A574] rounded-md border border-[#D4A574]/30">
                                <Star className="w-4 h-4 fill-current" />
                            </span>
                        )}
                        {product.is_new && (
                            <span className="h-7 px-2 flex items-center justify-center bg-[#C46A2B] text-white text-xs font-medium rounded-md border border-[#D4A574]/50">
                                Yeni
                            </span>
                        )}
                        {hasDiscount && (
                            <span className="h-7 px-2 flex items-center justify-center bg-[#8B4513] text-[#F5DEB3] text-xs font-bold rounded-md border border-[#D4A574]/50">
                                %{product.discount}
                            </span>
                        )}
                    </div>
                </div>

                {/* PRODUCT INFO */}
                <div className="flex-1 flex flex-col p-4">
                    <div className="flex-1">
                            {product.category_name}
                        <h3 className="font-semibold text-[#2B1E17] group-hover:text-[#C46A2B] transition-colors">
                            {product.name}
                        </h3>
                    </div>

                    {/* PRICE AND ADD TO CART */}
                    <div className="relative mt-3 pt-3">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-[#E8E0D5]/30 via-[#C46A2B]/40 to-[#E8E0D5]/30" />
                        <div className="flex items-center justify-between">
                            <div className="flex items-baseline gap-2">
                                <span className="text-lg font-bold text-[#C46A2B]">
                                    ₺{discountedPrice.toFixed(0)}
                                </span>
                                {hasDiscount && (
                                    <span className="text-sm text-[#8B7E75] line-through">
                                        ₺{priceNum.toFixed(2)}
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={handleAddToCart}
                                disabled={isCartLoading || isAdded}
                                className={`p-2 rounded-lg transition-all duration-300 ${isAdded ? 'bg-green-500 text-white' : 'bg-[#C46A2B]/10 hover:bg-[#C46A2B] text-[#C46A2B] hover:text-white'} disabled:opacity-50`}
                                aria-label="Sepete Ekle"
                            >
                                {isAdded ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <section className="py-20 bg-gradient-to-b from-background to-[#F5F1EB]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* SECTION HEADER */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4">
                        <Star className="w-4 h-4 text-[#C46A2B]" />
                    </div>
                    <h2 className="font-heading text-3xl md:text-4xl text-[#2B1E17] mb-4">
                        Popüler Kahvelerimiz
                    </h2>
                    <p className="text-[#8B7E75] max-w-2xl mx-auto">
                        Müşterilerimizin favorisi olan, özenle hazırlanmış kahve seçeneklerimizi keşfedin.
                    </p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-10">
                        <div className="w-8 h-8 border-4 border-[#C46A2B]/30 border-t-[#C46A2B] rounded-full animate-spin" />
                    </div>
                ) : error ? (
                    <div className="text-center text-red-500 py-10">Popüler ürünler yüklenemedi.</div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {popularProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}

                {/* VIEW ALL BUTTON */}
                <div className="text-center mt-12">
                    <Link
                        to="/menu"
                        className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[#C46A2B] text-[#C46A2B] hover:bg-[#C46A2B] hover:text-white font-medium rounded-xl transition-colors duration-300"
                    >
                        Tüm Menüyü Gör
                        <ChevronRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </section>
    );
}

export default HomeFeaturedProducts;
