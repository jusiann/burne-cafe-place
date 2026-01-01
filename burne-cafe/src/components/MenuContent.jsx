import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Coffee, Star, ShoppingCart } from 'lucide-react';
import products from '../data/products.json';

function MenuContent({ activeCategory, searchQuery, sortOrder }) {
    const ProductCard = ({ product }) => {
        const hasDiscount = product.discount > 0;
        const discountedPrice = hasDiscount
            ? product.price - (product.price * product.discount / 100)
            : product.price;

        return (
            <div className="group h-full flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">

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
                            <h3 className="font-semibold text-[#2B1E17] group-hover:text-[#C46A2B] transition-colors mb-1">
                                {product.name}
                            </h3>
                        </Link>

                        {/* DESCRIPTION */}
                        <p className="text-xs text-[#8B7E75] line-clamp-2">
                            {product.description}
                        </p>
                    </div>

                    {/* PRICE & ADD TO CART */}
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
    };

    const filteredProducts = useMemo(() => {
        let result = [...products];

        // FILTER BY CATEGORY
        if (activeCategory !== 'all') {
            result = result.filter(p => p.category === activeCategory);
        }

        // FILTER BY SEARCH QUERY
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.description.toLowerCase().includes(query) ||
                p.category.toLowerCase().includes(query)
            );
        }

        // SORT BY PRICE
        if (sortOrder === 'price-asc') {
            result.sort((a, b) => a.price - b.price);
        } else if (sortOrder === 'price-desc') {
            result.sort((a, b) => b.price - a.price);
        }

        return result;
    }, [activeCategory, searchQuery, sortOrder]);

    return (
        <section className="pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* PRODUCTS GRID */}
                {filteredProducts.length > 0 ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#C46A2B]/10 flex items-center justify-center">
                            <Coffee className="w-8 h-8 text-[#C46A2B]" />
                        </div>
                        <h3 className="text-lg font-semibold text-[#2B1E17] mb-2">
                            Ürün Bulunamadı
                        </h3>
                        <p className="text-[#8B7E75]">
                            Arama kriterlerinize uygun ürün bulunamadı.
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}

export default MenuContent;
