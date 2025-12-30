import { Link } from 'react-router-dom';
import { Star, ShoppingCart, ChevronRight } from 'lucide-react';
import products from '../../data/products.json';

function HomeFeaturedProducts() {
    const popularProducts = products.filter(p => p.isPopular).slice(0, 4);

    return (
        <section className="py-20 bg-gradient-to-b from-background to-[#F5F1EB]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* SECTION HEADER */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#C46A2B]/10 rounded-full mb-4">
                        <Star className="w-4 h-4 text-[#C46A2B]" />
                        <span className="text-[#C46A2B] text-sm font-medium">
                            En Çok Tercih Edilenler
                        </span>
                    </div>
                    <h2 className="font-heading text-3xl md:text-4xl text-[#2B1E17] mb-4">
                        Popüler Kahvelerimiz
                    </h2>
                    <p className="text-[#8B7E75] max-w-2xl mx-auto">
                        Müşterilerimizin favorisi olan, özenle hazırlanmış kahve seçeneklerimizi keşfedin.
                    </p>
                </div>

                {/* PRODUCTS GRID */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {popularProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>

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

function ProductCard({ product }) {
    const hasDiscount = product.discount > 0;
    const discountedPrice = hasDiscount
        ? product.price - (product.price * product.discount / 100)
        : product.price;

    return (
        <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            {/* IMAGE */}
            <Link to={`/urun/${product.id}`} className="block relative">
                <div className="aspect-[4/3] bg-gradient-to-br from-[#3E2723] to-[#5D4037] overflow-hidden flex items-center justify-center">
                    {/* Coffee cup illustration */}
                    <div className="w-20 h-20 rounded-full border-4 border-[#8D6E63] bg-gradient-to-br from-[#5D4037] to-[#3E2723] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#4E342E] to-[#3E2723] border-2 border-[#6D4C41]" />
                    </div>
                </div>

                {/* BADGES */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.isPopular && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#C46A2B] text-white text-xs font-medium rounded-lg">
                            <Star className="w-3 h-3 fill-current" />
                            Popüler
                        </span>
                    )}
                    {product.isNew && (
                        <span className="px-2 py-1 bg-emerald-500 text-white text-xs font-medium rounded-lg">
                            Yeni
                        </span>
                    )}
                    {hasDiscount && (
                        <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-lg">
                            %{product.discount}
                        </span>
                    )}
                </div>
            </Link>

            {/* CONTENT */}
            <div className="p-4">
                <div className="text-xs text-[#C46A2B] font-medium mb-1">
                    {product.category}
                </div>
                <Link to={`/urun/${product.id}`}>
                    <h3 className="font-semibold text-[#2B1E17] group-hover:text-[#C46A2B] transition-colors mb-1">
                        {product.name}
                    </h3>
                </Link>
                <p className="text-sm text-[#8B7E75] line-clamp-2 mb-3">
                    {product.description}
                </p>

                {/* PRICE & ADD TO CART */}
                <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-[#C46A2B]">
                            ₺{discountedPrice.toFixed(0)}
                        </span>
                        {hasDiscount && (
                            <span className="text-sm text-[#8B7E75] line-through">
                                ₺{product.price}
                            </span>
                        )}
                    </div>
                    <button
                        className="p-2 bg-[#C46A2B]/10 hover:bg-[#C46A2B] text-[#C46A2B] hover:text-white rounded-lg transition-all duration-300"
                        aria-label="Sepete Ekle"
                    >
                        <ShoppingCart className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default HomeFeaturedProducts;
