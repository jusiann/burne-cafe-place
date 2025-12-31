import { ArrowUpDown, ArrowUp, ArrowDown, RotateCcw } from 'lucide-react';

function MenuSearchSort({ sortOrder, onSortChange, onReset }) {

    const sortOptions = [
        { value: 'default', label: 'Varsayılan', icon: ArrowUpDown },
        { value: 'price-asc', label: 'Fiyat (Artan)', icon: ArrowUp },
        { value: 'price-desc', label: 'Fiyat (Azalan)', icon: ArrowDown }
    ];

    const currentSort = sortOptions.find(opt => opt.value === sortOrder) || sortOptions[0];

    return (
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
    );
}

export default MenuSearchSort;
