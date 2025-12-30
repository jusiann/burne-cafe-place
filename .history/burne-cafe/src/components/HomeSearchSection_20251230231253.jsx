import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import products from '../data/products.json';

function HomeSearchSection() {
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const navigate = useNavigate();

    const filteredProducts = query.trim()
        ? products.filter(p =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.description.toLowerCase().includes(query.toLowerCase()) ||
            p.category.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5)
        : [];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/menu?search=${encodeURIComponent(query)}`);
            setQuery('');
        }
    };

    const handleClear = () => {
        setQuery('');
    };

    return (
        <section className="py-16 bg-[#F5F1EB]">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* HEADER */}
                <div className="text-center mb-8">
                    <h2 className="font-heading text-2xl md:text-3xl text-[#2B1E17] mb-2">
                        Bugün Ne İçmek İstersiniz?
                    </h2>
                    <p className="text-[#8B7E75]">
                        Favori kahvenizi hemen bulun
                    </p>
                </div>

                {/* SEARCH BAR */}
                <div className="relative">
                    <form onSubmit={handleSubmit}>
                        <div
                            className={`
                                relative flex items-center bg-white rounded-2xl shadow-sm 
                                transition-all duration-300
                                ${isFocused
                                    ? 'shadow-lg ring-2 ring-[#C46A2B]/20'
                                    : 'hover:shadow-md'
                                }
                            `}
                        >
                            <Search className="absolute left-5 w-5 h-5 text-[#C46A2B]" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                                placeholder="Latte, Cappuccino, Cold Brew..."
                                className="w-full pl-14 pr-24 py-4 bg-transparent text-[#2B1E17] placeholder:text-[#8B7E75] outline-none rounded-2xl"
                            />
                            {query && (
                                <button
                                    type="button"
                                    onClick={handleClear}
                                    className="absolute right-20 p-1 text-[#8B7E75] hover:text-[#2B1E17] transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                            <button
                                type="submit"
                                className="absolute right-2 px-5 py-2 bg-[#C46A2B] hover:bg-[#A85A24] text-white font-medium rounded-xl transition-all duration-300"
                            >
                                Ara
                            </button>
                        </div>
                    </form>

                    {/* SEARCH RESULTS DROPDOWN */}
                    {isFocused && filteredProducts.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-[#E8E0D5] overflow-hidden z-10">
                            {filteredProducts.map((product) => (
                                <Link
                                    key={product.id}
                                    to={`/urun/${product.id}`}
                                    className="flex items-center gap-4 p-4 hover:bg-[#F5F1EB] transition-colors"
                                    onClick={() => setQuery('')}
                                >
                                    <div className="w-12 h-12 bg-gradient-to-br from-[#5D4037] to-[#3E2723] rounded-lg flex items-center justify-center">
                                        <div className="w-6 h-6 rounded-full border-2 border-[#8D6E63] bg-[#4E342E]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-[#2B1E17]">{product.name}</p>
                                        <p className="text-sm text-[#8B7E75]">{product.category}</p>
                                    </div>
                                    <span className="font-bold text-[#C46A2B]">₺{product.price}</span>
                                </Link>
                            ))}
                            <Link
                                to={`/menu?search=${encodeURIComponent(query)}`}
                                className="block p-4 text-center text-[#C46A2B] font-medium hover:bg-[#F5F1EB] border-t border-[#E8E0D5]"
                            >
                                Tüm sonuçları gör
                            </Link>
                        </div>
                    )}
                </div>

                {/* POPULAR SEARCHES */}
                <div className="flex flex-wrap justify-center gap-2 mt-6">
                    <span className="text-[#8B7E75] text-sm">Popüler:</span>
                    {['Latte', 'Cappuccino', 'Americano', 'Mocha', 'Cold Brew'].map((term) => (
                        <button
                            key={term}
                            onClick={() => {
                                setQuery(term);
                                navigate(`/menu?search=${encodeURIComponent(term)}`);
                            }}
                            className="px-3 py-1 text-sm bg-white text-[#6B5E55] hover:text-[#C46A2B] hover:bg-[#C46A2B]/5 rounded-full border border-[#E8E0D5] transition-all duration-300"
                        >
                            {term}
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default HomeSearchSection;
