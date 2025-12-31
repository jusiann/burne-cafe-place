import { Coffee, Snowflake, IceCream, Droplets, LayoutGrid } from 'lucide-react';
import { cn } from '../lib/utils';

function MenuCategoryFilter({ categories, activeCategory, onCategoryChange }) {

    const categoryIcons = {
        "Sıcak Kahveler": Coffee,
        "Soğuk Kahveler": Snowflake,
        "Frappeler": IceCream,
        "Serinletici İçecekler": Droplets
    };

    return (
        <div className="w-full">

            {/* CATEGORY TABS */}
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
    );
}

export default MenuCategoryFilter;
