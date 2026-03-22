import {useState,useEffect,useMemo} from 'react';
import {useSearchParams,useNavigate} from 'react-router-dom';
import {UtensilsCrossed,Coffee,Snowflake,IceCream,Droplets,LayoutGrid,ArrowUpDown,ArrowUp,ArrowDown,RotateCcw,Star,ShoppingCart,Check} from 'lucide-react';
import {cn} from '../../lib/utils';
import {useProducts} from '../../hooks/useProducts.js';
import {useCategories} from '../../hooks/useCategories.js';
import useCartStore from '../../stores/cartStore.js';
import useAuthStore from '../../stores/authStore.js';
import {showSuccess, showError} from '../../constants/alert.utils.js';

function MenuSection() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState('default');

    const {products: apiProducts, isLoading: isProductsLoading, error: productsError} = useProducts();
    const {categories: apiCategories, isLoading: isCategoriesLoading} = useCategories();
    const {addToCart, isLoading: isCartLoading} = useCartStore();

    /* CONFIGURATION */
    const categories = useMemo(() => {
        return apiCategories ? apiCategories.map(c => c.name) : [];
    }, [apiCategories]);

    const categoryIcons = {
        "Sıcak Kahveler": Coffee,
        "Soğuk Kahveler": Snowflake,
        "Frappeler": IceCream,
        "Serinletici İçecekler": Droplets
    };

    const sortOptions = [
        {value: 'default', label: 'Varsayılan', icon: ArrowUpDown},
        {value: 'price-asc', label: 'Fiyat (Artan)', icon: ArrowUp},
        {value: 'price-desc', label: 'Fiyat (Azalan)', icon: ArrowDown}
    ];

    const currentSort = sortOptions.find(option => option.value === sortOrder) || sortOptions[0];

    /* URL PARAMS SYNC */
    useEffect(() => {
        const categoryParam = searchParams.get('category');
        const searchParam = searchParams.get('search');

        if (categoryParam) {
            const matchedCategory = categories.find(category =>
                category.toLowerCase().replace(/\s+/g, '-').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ç/g, 'c').replace(/ğ/g, 'g') === categoryParam
            );
            if (matchedCategory) 
                setActiveCategory(matchedCategory);
        } else {
            setActiveCategory('all');
        }

        setSearchQuery(searchParam || '');
    }, [searchParams, categories]);

    /* HANDLERS */
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

    const handleReset = () => {
        setActiveCategory('all');
        setSearchQuery('');
        setSortOrder('default');
        setSearchParams({});
    };

    /* FILTERED PRODUCTS */
    const filteredProducts = useMemo(() => {
        if (!apiProducts) return [];
        let result = [...apiProducts];

        if (activeCategory !== 'all') {
            result = result.filter(product => {
                const pCatName = product.category_name;
                return pCatName === activeCategory;
            });
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(product => {
                const pCatName = product.category_name || '';
                return (
                    product.name.toLowerCase().includes(query) ||
                    (product.description && product.description.toLowerCase().includes(query)) ||
                    pCatName.toLowerCase().includes(query)
                );
            });
        }

        if (sortOrder === 'price-asc') {
            result.sort((itemA,itemB) => itemA.base_price - itemB.base_price);
        } else if (sortOrder === 'price-desc') {
            result.sort((itemA,itemB) => itemB.base_price - itemA.base_price);
        }

        return result;
    }, [apiProducts, activeCategory, searchQuery, sortOrder]);

    /* PRODUCT CARD COMPONENT */
    const ProductCard = ({product}) => {
        const navigate = useNavigate();
        const {isAuthenticated} = useAuthStore();
        const [isAdded, setIsAdded] = useState(false);
        const priceNum = Number(product.base_price || 0);
        const discountNum = Number(product.discount || 0);
        const hasDiscount = discountNum > 0;
        const discountedPrice = hasDiscount ? priceNum - (priceNum * discountNum / 100) : priceNum;

        const handleAddToCart = async (e) => {
            e.stopPropagation();
            if (!isAuthenticated) {
                showError('Sipariş vermek için giriş yapmalısınız');
                navigate('/sign-in');
                return;
            }
            if (isCartLoading) return;
            
            // Default options selection logic
            const defaultSize = product.options?.size?.find(opt => opt.name === 'Tall') || product.options?.size?.[0] || null;
            const defaultMilk = product.options?.milk?.find(opt => opt.name === 'Standart Süt') || product.options?.milk?.[0] || null;

            const result = await addToCart({
                productId: product.id,
                quantity: 1,
                sizeName: defaultSize?.name || null,
                milkOptionName: defaultMilk?.name || null,
                extras: [],
                note: ''
            });

            if (result.success) {
                setIsAdded(true);
                showSuccess(`${product.name} sepete eklendi`);
                setTimeout(() => setIsAdded(false), 2000);
            } else {
                if (result.message === 'User not found. Please sign in again.') {
                    showError('Oturumunuz süresi doldu, giriş ekranına yönlendiriliyorsunuz...');
                } else {
                    showError(result.message || 'Sepete eklenirken hata oluştu');
                }
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
                <div className="block relative">
                    <div className="aspect-[4/3] overflow-hidden">
                        <img src={product.image_url || '/assets/caffee-pictures/placeholder.jpg'} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    </div>

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

                <div className="flex-1 flex flex-col p-4">
                    <div className="flex-1">
                        <div className="text-xs text-[#C46A2B] font-medium mb-1">{product.category_name}</div>
                        <h3 className="font-semibold text-[#2B1E17] group-hover:text-[#C46A2B] transition-colors mb-1">{product.name}</h3>
                        <p className="text-xs text-[#8B7E75] line-clamp-2">{product.description}</p>
                    </div>

                    <div className="relative mt-3 pt-3">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-[#E8E0D5]/30 via-[#C46A2B]/40 to-[#E8E0D5]/30" />
                        <div className="flex items-center justify-between">
                            <div className="flex items-baseline gap-2">
                                <span className="text-lg font-bold text-[#C46A2B]">₺{discountedPrice.toFixed(0)}</span>
                                {hasDiscount && <span className="text-sm text-[#8B7E75] line-through">₺{priceNum.toFixed(2)}</span>}
                            </div>
                            <button 
                                onClick={handleAddToCart} 
                                disabled={isCartLoading || isAdded}
                                className={`p-2 rounded-lg transition-all duration-300 ${isAdded ? 'bg-[#6B5D4F] text-white' : 'bg-[#C46A2B]/10 hover:bg-[#C46A2B] text-[#C46A2B] hover:text-white'} disabled:opacity-50`} 
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
        <>
            <section className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4">
                            <UtensilsCrossed className="w-5 h-5 text-[#C46A2B]" />
                        </div>
                        <h1 className="font-heading text-3xl md:text-4xl text-[#2B1E17] mb-4">Menümüz</h1>
                        <p className="text-[#8B7E75] max-w-2xl mx-auto">En taze kahve çekirdeklerinden hazırladığımız özel içeceklerimizi keşfedin.</p>
                    </div>

                    <div className="w-full">
                        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-1 sm:justify-center">
                            <button
                                onClick={() => handleCategoryChange('all')}
                                className={cn('relative flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-300', activeCategory === 'all' ? 'text-[#C46A2B] bg-[#C46A2B]/10' : 'text-[#2B1E17] hover:text-[#C46A2B] hover:bg-[#C46A2B]/5')}
                            >
                                <div className={cn('absolute bottom-0 left-2 right-2 h-0.5 bg-[#C46A2B] rounded-full transition-transform duration-300', activeCategory === 'all' ? 'scale-x-100' : 'scale-x-0')} />
                                <LayoutGrid className="w-4 h-4" />
                                <span className="relative z-10">Tümü</span>
                            </button>

                            {categories.map((category) => {
                                const IconComponent = categoryIcons[category] || Coffee;
                                return (
                                    <button
                                        key={category}
                                        onClick={() => handleCategoryChange(category)}
                                        className={cn('relative flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-300', activeCategory === category ? 'text-[#C46A2B] bg-[#C46A2B]/10' : 'text-[#2B1E17] hover:text-[#C46A2B] hover:bg-[#C46A2B]/5')}
                                    >
                                        <div className={cn('absolute bottom-0 left-2 right-2 h-0.5 bg-[#C46A2B] rounded-full transition-transform duration-300', activeCategory === category ? 'scale-x-100' : 'scale-x-0')} />
                                        <IconComponent className="w-4 h-4" />
                                        <span className="relative z-10">{category}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="text-sm text-[#8B7E75]">
                            {isProductsLoading ? 'Yükleniyor...' : `${filteredProducts.length} ürün bulundu`}
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={handleReset} className="flex items-center gap-1.5 px-3 py-2 bg-[#C46A2B]/10 hover:bg-[#C46A2B] text-[#C46A2B] hover:text-white rounded-lg text-sm font-medium transition-all duration-300">
                                <span>Sıfırla</span>
                                <RotateCcw className="w-4 h-4" />
                            </button>

                            <div className="relative">
                                <select
                                    value={sortOrder}
                                    onChange={(event) => setSortOrder(event.target.value)}
                                    className="appearance-none w-full sm:w-auto px-3 py-2 pr-8 bg-white border border-[#E8E0D5] rounded-lg text-sm text-[#2B1E17] font-medium shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer outline-none focus:ring-2 focus:ring-[#C46A2B]/20"
                                >
                                    {sortOptions.map((option) => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                                <currentSort.icon className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C46A2B] pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {isProductsLoading || isCategoriesLoading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-8 h-8 border-4 border-[#C46A2B]/30 border-t-[#C46A2B] rounded-full animate-spin" />
                        </div>
                    ) : productsError ? (
                        <div className="text-center py-20 text-red-500">
                            Ürünler yüklenirken hata oluştu.
                        </div>
                    ) : filteredProducts.length > 0 ? (
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
                            <h3 className="text-lg font-semibold text-[#2B1E17] mb-2">Ürün Bulunamadı</h3>
                            <p className="text-[#8B7E75]">Arama kriterlerinize uygun ürün bulunamadı.</p>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}

export default MenuSection;
