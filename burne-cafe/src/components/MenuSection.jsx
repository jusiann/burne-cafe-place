import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { UtensilsCrossed, Coffee, Snowflake, IceCream, Droplets, LayoutGrid, ArrowUpDown, ArrowUp, ArrowDown, RotateCcw, Star, ShoppingCart, Check } from 'lucide-react';
import { cn } from '../lib/utils';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import products from '../data/products.json';

function MenuSection() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState('default');

    // CATEGORIES
    const categories = useMemo(() => {
        return [...new Set(products.map(p => p.category))];
    }, []);

    // CATEGORY ICONS
    const categoryIcons = {
        "Sıcak Kahveler": Coffee,
        "Soğuk Kahveler": Snowflake,
        "Frappeler": IceCream,
        "Serinletici İçecekler": Droplets
    };

    // SORT OPTIONS
    const sortOptions = [
        { value: 'default', label: 'Varsayılan', icon: ArrowUpDown },
        { value: 'price-asc', label: 'Fiyat (Artan)', icon: ArrowUp },
        { value: 'price-desc', label: 'Fiyat (Azalan)', icon: ArrowDown }
    ];

    const currentSort = sortOptions.find(opt => opt.value === sortOrder) || sortOptions[0];

    // URL PARAMS SYNC
    useEffect(() => {
        const categoryParam = searchParams.get('category');
        const searchParam = searchParams.get('search');

        if (categoryParam) {
            const matchedCategory = categories.find(cat =>
                cat.toLowerCase().replace(/\s+/g, '-').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ç/g, 'c').replace(/ğ/g, 'g') === categoryParam
            );
            if (matchedCategory)
                setActiveCategory(matchedCategory);
        } else {
            setActiveCategory('all');
        }

        setSearchQuery(searchParam || '');
    }, [searchParams, categories]);

    // CATEGORY CHANGE HANDLER
    const handleCategoryChange = (category) => {
        setActiveCategory(category);

        if (category === 'all') {
            searchParams.delete('category');
        } else {
            const categoryId = category.toLowerCase().replace(/\s+/g, '-').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ç/g, 'c').replace(/ğ/g, 'g');
            searchParams.set('category', categoryId);
        }
        setSearchParams(searchParams);
    };

    // RESET HANDLER
    const handleReset = () => {
        setActiveCategory('all');
        setSearchQuery('');
        setSortOrder('default');
        setSearchParams({});
    };

    // FILTERED PRODUCTS
    const filteredProducts = useMemo(() => {
        let result = [...products];

        if (activeCategory !== 'all') {
            result = result.filter(p => p.category === activeCategory);
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.description.toLowerCase().includes(query) ||
                p.category.toLowerCase().includes(query)
            );
        }

        if (sortOrder === 'price-asc') {
            result.sort((a, b) => a.price - b.price);
        } else if (sortOrder === 'price-desc') {
            result.sort((a, b) => b.price - a.price);
        }

        return result;
    }, [activeCategory, searchQuery, sortOrder]);

    // PRODUCT CARD COMPONENT
    const ProductCard = ({ product }) => {
        const navigate = useNavigate();
        const [isAdded, setIsAdded] = useState(false);
        const hasDiscount = product.discount > 0;
        const discountedPrice = hasDiscount
            ? product.price - (product.price * product.discount / 100)
            : product.price;

        const handleAddToCart = () => {
            navigate(`/product/${product.id}`);
        };

        return (
            <div className="group h-full flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">

                {/* PRODUCT IMAGE */}
                <div className="block relative">
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
                </div>

                {/* PRODUCT INFO */}
                <div className="flex-1 flex flex-col p-4">

                    {/* TOP CONTENT */}
                    <div className="flex-1">
                        <div className="text-xs text-[#C46A2B] font-medium mb-1">
                            {product.category}
                        </div>

                        <h3 className="font-semibold text-[#2B1E17] group-hover:text-[#C46A2B] transition-colors mb-1">
                            {product.name}
                        </h3>

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
                                onClick={handleAddToCart}
                                className={`p-2 rounded-lg transition-all duration-300 ${isAdded
                                    ? 'bg-green-500 text-white'
                                    : 'bg-[#C46A2B]/10 hover:bg-[#C46A2B] text-[#C46A2B] hover:text-white'
                                    }`}
                                aria-label="Sepete Ekle"
                            >
                                {isAdded
                                    ? <Check className="w-5 h-5" />
                                    : <ShoppingCart className="w-5 h-5" />
                                }
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            {/* FILTER SECTION */}
            <section className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

                    {/* PAGE TITLE */}
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4">
                            <UtensilsCrossed className="w-5 h-5 text-[#C46A2B]" />
                        </div>
                        <h1 className="font-heading text-3xl md:text-4xl text-[#2B1E17] mb-4">
                            Menümüz
                        </h1>
                        <p className="text-[#8B7E75] max-w-2xl mx-auto">
                            En taze kahve çekirdeklerinden hazırladığımız özel içeceklerimizi keşfedin.
                        </p>
                    </div>

                    {/* CATEGORY FILTER */}
                    <div className="w-full">
                        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-1 sm:justify-center">

                            {/* ALL CATEGORIES TAB */}
                            <button
                                onClick={() => handleCategoryChange('all')}
                                className={cn(
                                    'relative flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-300',
                                    activeCategory === 'all'
                                        ? 'text-[#C46A2B] bg-[#C46A2B]/10'
                                        : 'text-[#2B1E17] hover:text-[#C46A2B] hover:bg-[#C46A2B]/5'
                                )}
                            >
                                {/* ACTIVE INDICATOR */}
                                <div
                                    className={cn(
                                        'absolute bottom-0 left-2 right-2 h-0.5 bg-[#C46A2B] rounded-full transition-transform duration-300',
                                        activeCategory === 'all' ? 'scale-x-100' : 'scale-x-0'
                                    )}
                                />
                                <LayoutGrid className="w-4 h-4" />
                                <span className="relative z-10">Tümü</span>
                            </button>

                            {/* CATEGORY TABS */}
                            {categories.map((category) => {
                                const IconComponent = categoryIcons[category] || Coffee;

                                return (
                                    <button
                                        key={category}
                                        onClick={() => handleCategoryChange(category)}
                                        className={cn(
                                            'relative flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-300',
                                            activeCategory === category
                                                ? 'text-[#C46A2B] bg-[#C46A2B]/10'
                                                : 'text-[#2B1E17] hover:text-[#C46A2B] hover:bg-[#C46A2B]/5'
                                        )}
                                    >
                                        {/* ACTIVE INDICATOR */}
                                        <div
                                            className={cn(
                                                'absolute bottom-0 left-2 right-2 h-0.5 bg-[#C46A2B] rounded-full transition-transform duration-300',
                                                activeCategory === category ? 'scale-x-100' : 'scale-x-0'
                                            )}
                                        />
                                        <IconComponent className="w-4 h-4" />
                                        <span className="relative z-10">{category}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* SORT AND RESULTS ROW */}
                    <div className="flex items-center justify-between">
                        {/* RESULTS COUNT */}
                        <div className="text-sm text-[#8B7E75]">
                            {filteredProducts.length} ürün bulundu
                        </div>

                        {/* SORT AND RESET */}
                        <div className="flex items-center gap-2">

                            {/* RESET BUTTON */}
                            <button
                                onClick={handleReset}
                                className="flex items-center gap-1.5 px-3 py-2 bg-[#C46A2B]/10 hover:bg-[#C46A2B] text-[#C46A2B] hover:text-white rounded-lg text-sm font-medium transition-all duration-300"
                            >
                                <span>Sıfırla</span>
                                <RotateCcw className="w-4 h-4" />
                            </button>

                            {/* SORT DROPDOWN */}
                            <div className="relative">
                                <select
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value)}
                                    className="appearance-none w-full sm:w-auto px-3 py-2 pr-8 bg-white border border-[#E8E0D5] rounded-lg text-sm text-[#2B1E17] font-medium shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer outline-none focus:ring-2 focus:ring-[#C46A2B]/20"
                                >
                                    {sortOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>

                                {/* DROPDOWN ICON */}
                                <currentSort.icon className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C46A2B] pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* PRODUCTS LIST SECTION */}
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
        </>
    );
}

export default MenuSection;
