import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Coffee } from 'lucide-react';
import MenuCategoryFilter from './MenuCategoryFilter';
import MenuSearchSort from './MenuSearchSort';
import MenuProductCard from './MenuProductCard';
import products from '../data/products.json';

function MenuProductList() {

    const [searchParams, setSearchParams] = useSearchParams();
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState('default');

    const categories = useMemo(() => {
        return [...new Set(products.map(p => p.category))];
    }, []);

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

    const handleSearchChange = (query) => {
        setSearchQuery(query);

        if (query.trim()) {
            searchParams.set('search', query);
        } else {
            searchParams.delete('search');
        }
        setSearchParams(searchParams);
    };

    const handleReset = () => {
        setActiveCategory('all');
        setSearchQuery('');
        setSortOrder('default');
        setSearchParams({});
    };

    const hasActiveFilters = activeCategory !== 'all' || searchQuery.trim() !== '' || sortOrder !== 'default';

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
        <div className="space-y-8">

            {/* CATEGORY FILTER */}
            <MenuCategoryFilter
                categories={categories}
                activeCategory={activeCategory}
                onCategoryChange={handleCategoryChange}
            />

            {/* SORT AND RESULTS ROW */}
            <div className="flex items-center justify-between">
                {/* RESULTS COUNT */}
                <div className="text-sm text-[#8B7E75]">
                    {filteredProducts.length} ürün bulundu
                </div>

                {/* SORT AND RESET */}
                <MenuSearchSort
                    sortOrder={sortOrder}
                    onSortChange={setSortOrder}
                    onReset={handleReset}
                />
            </div>

            {/* PRODUCTS GRID */}
            {filteredProducts.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => (
                        <MenuProductCard key={product.id} product={product} />
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
    );
}

export default MenuProductList;
