import {Link} from 'react-router-dom';
import {ArrowRight,Coffee,Snowflake,IceCream,Droplets,LayoutGrid} from 'lucide-react';
import {useCategories} from '../../hooks/useCategories.js';

function HomeCategoryCards() {
    const {categories: apiCategories, isLoading, error} = useCategories();

    const categoryMeta = {
        "Sıcak Kahveler": {
            icon: Coffee,
            color: 'from-[#D4A574]/40 to-[#C46A2B]/30',
            borderColor: 'border-[#C46A2B]/50',
            description: 'Sıcacık kahve keyfi'
        },
        "Soğuk Kahveler": {
            icon: Snowflake,
            color: 'from-[#8B7E75]/30 to-[#6B5E55]/30',
            borderColor: 'border-[#8B7E75]/40',
            description: 'Serinletici buzlu kahveler'
        },
        "Frappeler": {
            icon: IceCream,
            color: 'from-[#A08070]/30 to-[#7A6A5A]/30',
            borderColor: 'border-[#A08070]/40',
            description: 'Kremsi buzlu lezzetler'
        },
        "Serinletici İçecekler": {
            icon: Droplets,
            color: 'from-[#9A8A7A]/25 to-[#7A6A5A]/25',
            borderColor: 'border-[#9A8A7A]/35',
            description: 'Ferahlatıcı içecekler'
        }
    };

    if (isLoading) {
        return (
            <section className="py-20 flex justify-center items-center">
                <div className="w-8 h-8 border-4 border-[#C46A2B]/30 border-t-[#C46A2B] rounded-full animate-spin" />
            </section>
        );
    }

    if (error) {
        return null;
    }

    const categories = (apiCategories || []).map(cat => {
        const meta = categoryMeta[cat.name] || {
            icon: Coffee,
            color: 'from-gray-700/30 to-gray-800/30',
            borderColor: 'border-gray-700/40',
            description: cat.description || 'Lezzetli içecekler'
        };
        return {
            id: cat.id,
            name: cat.name,
            description: meta.description,
            Icon: meta.icon,
            color: meta.color,
            borderColor: meta.borderColor,
            count: cat.product_count || 0
        };
    });

    return (
        <section className="py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* SECTION HEADER */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4">
                        <LayoutGrid className="w-4 h-4 text-[#C46A2B]" />
                    </div>
                    <h2 className="font-heading text-3xl md:text-4xl text-[#2B1E17] mb-4">
                        Kategoriler
                    </h2>
                    <p className="text-[#8B7E75] max-w-2xl mx-auto">
                        İstediğiniz kahve türüne hızlıca ulaşın
                    </p>
                </div>

                {/* CATEGORIES GRID */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {categories.map((category) => (
                        <Link
                            key={category.id}
                            to={`/menu?category=${category.id}`}
                            className={`group relative p-6 rounded-2xl border-2 ${category.borderColor} bg-gradient-to-br ${category.color} hover:scale-105 transition-all duration-300 overflow-hidden`}
                        >
                            {/* ICON */}
                            <div className="w-12 h-12 mb-4 rounded-xl bg-[#2B1E17]/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <category.Icon className="w-6 h-6 text-[#2B1E17]" />
                            </div>

                            {/* CATEGORY INFO */}
                            <h3 className="font-semibold text-[#2B1E17] mb-1">
                                {category.name}
                            </h3>
                            <p className="text-xs text-[#6B5E55] line-clamp-1">
                                {category.description}
                            </p>

                            {/* ARROW INDICATOR */}
                            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <ArrowRight className="w-5 h-5 text-[#C46A2B]" />
                            </div>

                            {/* DECORATIVE CIRCLE */}
                            <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default HomeCategoryCards;
