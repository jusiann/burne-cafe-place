import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const categories = [
    {
        id: 'espresso',
        name: 'Espresso',
        description: 'Klasik İtalyan usulü',
        icon: 'E',
        color: 'from-amber-800/30 to-amber-900/30',
        borderColor: 'border-amber-700/40',
        count: 5
    },
    {
        id: 'sutlu-kahveler',
        name: 'Sütlü Kahveler',
        description: 'Kremsi ve yumuşak',
        icon: 'S',
        color: 'from-orange-700/30 to-orange-800/30',
        borderColor: 'border-orange-700/40',
        count: 5
    },
    {
        id: 'soguk-kahveler',
        name: 'Soğuk Kahveler',
        description: 'Serinletici lezzetler',
        icon: 'C',
        color: 'from-cyan-700/30 to-cyan-800/30',
        borderColor: 'border-cyan-700/40',
        count: 3
    },
    {
        id: 'ozel-kahveler',
        name: 'Özel Kahveler',
        description: 'Artisan demleme',
        icon: 'Ö',
        color: 'from-rose-700/30 to-rose-800/30',
        borderColor: 'border-rose-700/40',
        count: 4
    },
    {
        id: 'sicak-icecekler',
        name: 'Sıcak İçecekler',
        description: 'Alternatif içecekler',
        icon: 'İ',
        color: 'from-emerald-700/30 to-emerald-800/30',
        borderColor: 'border-emerald-700/40',
        count: 3
    }
];

function HomeCategoryCards() {
    return (
        <section className="py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* SECTION HEADER */}
                <div className="text-center mb-12">
                    <h2 className="font-heading text-3xl md:text-4xl text-[#2B1E17] mb-4">
                        Kategoriler
                    </h2>
                    <p className="text-[#8B7E75] max-w-2xl mx-auto">
                        İstediğiniz kahve türüne hızlıca ulaşın
                    </p>
                </div>

                {/* CATEGORIES GRID */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {categories.map((category) => (
                        <Link
                            key={category.id}
                            to={`/menu?category=${category.id}`}
                            className={`
                                group relative p-6 rounded-2xl border-2 ${category.borderColor}
                                bg-gradient-to-br ${category.color}
                                hover:scale-105 transition-all duration-300
                                overflow-hidden
                            `}
                        >
                            {/* ICON */}
                            <div className="w-12 h-12 mb-4 rounded-xl bg-[#2B1E17]/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <span className="text-lg font-heading text-[#2B1E17]">
                                    {category.icon}
                                </span>
                            </div>

                            {/* TEXT */}
                            <h3 className="font-semibold text-[#2B1E17] mb-1">
                                {category.name}
                            </h3>
                            <p className="text-xs text-[#6B5E55] line-clamp-1">
                                {category.description}
                            </p>

                            {/* PRODUCT COUNT */}
                            <div className="mt-3 text-xs text-[#8B7E75]">
                                {category.count} çeşit
                            </div>

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
