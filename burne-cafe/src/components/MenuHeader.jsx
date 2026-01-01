import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { UtensilsCrossed, Coffee, Snowflake, IceCream, Droplets, LayoutGrid, ArrowUpDown, ArrowUp, ArrowDown, RotateCcw } from 'lucide-react';
import { cn } from '../lib/utils';
import products from '../data/products.json';

function MenuHeader({ activeCategory, onCategoryChange, sortOrder, onSortChange, onReset, resultCount }) {
    const categories = useMemo(() => {
        return [...new Set(products.map(p => p.category))];
    }, []);

    const categoryIcons = {
        "Sıcak Kahveler": Coffee,
        "Soğuk Kahveler": Snowflake,
        "Frappeler": IceCream,
        "Serinletici İçecekler": Droplets
    };

    const sortOptions = [
        { value: 'default', label: 'Varsayılan', icon: ArrowUpDown },
        { value: 'price-asc', label: 'Fiyat (Artan)', icon: ArrowUp },
        { value: 'price-desc', label: 'Fiyat (Azalan)', icon: ArrowDown }
    ];

    const currentSort = sortOptions.find(opt => opt.value === sortOrder) || sortOptions[0];

    return (
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
                            onClick={() => onCategoryChange('all')}
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
                                    onClick={() => onCategoryChange(category)}
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
                        {resultCount} ürün bulundu
                    </div>

                    {/* SORT AND RESET */}
                    <div className="flex items-center gap-2">

                        {/* RESET BUTTON */}
                        <button
                            onClick={onReset}
                            className="flex items-center gap-1.5 px-3 py-2 bg-[#C46A2B]/10 hover:bg-[#C46A2B] text-[#C46A2B] hover:text-white rounded-lg text-sm font-medium transition-all duration-300"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Sıfırla</span>
                        </button>

                        {/* SORT DROPDOWN */}
                        <div className="relative">
                            <select
                                value={sortOrder}
                                onChange={(e) => onSortChange(e.target.value)}
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
    );
}

export default MenuHeader;
