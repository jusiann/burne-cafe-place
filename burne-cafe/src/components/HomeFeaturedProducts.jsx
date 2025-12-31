import { Link } from 'react-router-dom';
import { Star, ShoppingCart, ChevronRight } from 'lucide-react';
import products from '../data/products.json';

function HomeFeaturedProducts() {

    const hotCoffees = products.filter(p => p.isPopular && p.category === 'Sıcak Kahveler');
    const coldCoffees = products.filter(p => p.isPopular && p.category === 'Soğuk Kahveler');
    const frappes = products.filter(p => p.isPopular && p.category === 'Frappeler');
    const refreshing = products.filter(p => p.isPopular && p.category === 'Serinletici İçecekler');

    const popularProducts = [
        ...hotCoffees.slice(0, 2),
        ...(coldCoffees.length > 0 ? coldCoffees.slice(0, 1) : frappes.slice(0, 1)),
        ...(refreshing.length > 0 ? refreshing.slice(0, 1) : frappes.slice(0, 1))
    ].slice(0, 4);

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

                {/* PRODUCTS GRID */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {popularProducts.map((product) => {
                        const hasDiscount = product.discount > 0;
                        const discountedPrice = hasDiscount
                            ? product.price - (product.price * product.discount / 100)
                            : product.price;

                        return (
                            <div key={product.id} className="group h-full flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">

                                {/* PRODUCT IMAGE */}
                                <Link to={`/product/${product.id}`} className="block relative">
                                    <div className="aspect-[4/3] overflow-hidden">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                    </div>

                                    {/* PRODUCT BADGES */}
                                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                                        {product.isPopular && (
                                            <span className="h-7 px-2 flex items-center justify-center bg-[#2B1E17] text-[#D4A574] rounded-md border border-[#D4A574]/30">
                                                <Star className="w-4 h-4 fill-current" />
                                            </span>
                                        )}
                                        {product.isNew && (
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
                                </Link>

                                {/* PRODUCT INFO */}
                                <div className="flex-1 flex flex-col p-4">

                                    {/* TOP CONTENT */}
                                    <div className="flex-1">
                                        <div className="text-xs text-[#C46A2B] font-medium mb-1">
                                            {product.category}
                                        </div>
                                        <Link to={`/product/${product.id}`}>
                                            <h3 className="font-semibold text-[#2B1E17] group-hover:text-[#C46A2B] transition-colors">
                                                {product.name}
                                            </h3>
                                        </Link>
                                    </div>

                                    {/* PRICE & ADD TO CART - FIXED AT BOTTOM */}
                                    <div className="relative mt-3 pt-3">
                                        {/* GRADIENT TOP BORDER */}
                                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-[#E8E0D5]/30 via-[#C46A2B]/40 to-[#E8E0D5]/30" />

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
                            </div>
                        );
                    })}
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

export default HomeFeaturedProducts;
