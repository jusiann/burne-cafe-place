import { useState, useEffect } from 'react';
import { Minus, Plus, ShoppingBag, Check, Coffee, Droplet, Star, Flame, Dumbbell, Bean, ChevronLeft, RefreshCw } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function ProductDetailSection({ product }) {
    const { addToCart, updateItem } = useCart();
    const navigate = useNavigate();
    const location = useLocation();

    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedMilk, setSelectedMilk] = useState(null);
    const [selectedExtras, setSelectedExtras] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [note, setNote] = useState('');
    const [totalPrice, setTotalPrice] = useState(0);
    const [isAdded, setIsAdded] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    useEffect(() => {
        if (product) {
            const editItem = location.state?.cartItem;

            // Edit Mode
            if (editItem && String(editItem.productId) === String(product.id)) {
                setEditingItem(editItem);

                // Restore Size
                const size = product.sizes?.find(s => s.name === editItem.size?.name);
                setSelectedSize(size || editItem.size || null);

                // Restore Milk
                const milk = product.milkOptions?.find(m => m.name === editItem.milkOption?.name);
                setSelectedMilk(milk || editItem.milkOption || null);

                // Restore Extras
                if (editItem.extras && product.extras) {
                    const restoredExtras = editItem.extras.map(e =>
                        product.extras.find(pe => pe.name === e.name)
                    ).filter(Boolean);
                    setSelectedExtras(restoredExtras);
                } else {
                    setSelectedExtras([]);
                }

                setQuantity(editItem.quantity);
                setNote(editItem.note || '');
            } else {
                // Default Mode
                setEditingItem(null);
                const defaultSize = product.sizes?.find(s => s.name === 'Tall') || product.sizes?.[0];
                setSelectedSize(defaultSize);

                if (product.milkOptions?.length > 0) {
                    const defaultMilk = product.milkOptions.find(m => m.name === 'Standart Süt') || product.milkOptions[0];
                    setSelectedMilk(defaultMilk);
                }

                setSelectedExtras([]);
                setQuantity(1);
                setNote('');
            }
        }
    }, [product, location.state]);

    useEffect(() => {
        if (!product) return;

        let total = product.price;

        if (selectedSize) total += selectedSize.price;
        if (selectedMilk) total += selectedMilk.price;

        const extrasTotal = selectedExtras.reduce((sum, extra) => sum + extra.price, 0);
        total += extrasTotal;

        setTotalPrice(total);
    }, [product, selectedSize, selectedMilk, selectedExtras]);

    if (!product) return null;

    const handleToggleExtra = (extra) => {
        setSelectedExtras(prev => {
            const isSelected = prev.find(e => e.name === extra.name);
            if (isSelected) {
                return prev.filter(e => e.name !== extra.name);
            } else {
                return [...prev, extra];
            }
        });
    };

    const handleAction = async () => {
        setIsAdded(true);

        if (editingItem) {
            updateItem(editingItem.itemId, product, quantity, selectedSize, selectedMilk, selectedExtras, note);
        } else {
            addToCart(product, quantity, selectedSize, selectedMilk, selectedExtras, note);
        }

        setTimeout(() => {
            setIsAdded(false);
            navigate('/cart');
        }, 1000);
    };

    const NutritionItem = ({ icon: Icon, label, value, unit }) => (
        <div className="flex flex-col items-center justify-center text-center">
            <Icon className="w-4 h-4 text-[#C46A2B]/70 mb-1" />
            <span className="text-[10px] text-[#8B7E75] uppercase tracking-wider mb-0.5">{label}</span>
            <span className="font-medium text-[#2B1E17] text-sm">{value}{unit}</span>
        </div>
    );

    return (
        <section className="pt-6 pb-8 md:py-16 overflow-x-hidden">
            <div className="w-full max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
                <Link to="/menu" className="inline-flex items-center gap-2 text-[#8B7E75] hover:text-[#C46A2B] mb-8 transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                    Menüye Dön
                </Link>

                <div className="grid lg:grid-cols-2 gap-6 lg:gap-16 items-start">
                    <div className="space-y-6">
                        <div className="aspect-square w-full rounded-2xl overflow-hidden bg-[#F5F1EB] border border-[#E8E0D5] relative md:sticky md:top-24">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                            />
                            {/* BADGES */}
                            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                                {product.isPopular && (
                                    <span className="h-8 px-3 flex items-center justify-center bg-[#2B1E17] text-[#D4A574] rounded-lg border border-[#D4A574]/30 shadow-lg">
                                        <Star className="w-5 h-5 fill-current" />
                                    </span>
                                )}
                                {product.isNew && (
                                    <span className="h-8 px-3 flex items-center justify-center bg-[#C46A2B] text-white text-sm font-medium rounded-lg border border-[#D4A574]/50 shadow-lg">
                                        Yeni
                                    </span>
                                )}
                                {product.discount > 0 && (
                                    <span className="h-8 px-3 flex items-center justify-center bg-[#8B4513] text-[#F5DEB3] text-sm font-bold rounded-lg border border-[#D4A574]/50 shadow-lg">
                                        %{product.discount}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <h1 className="font-heading text-3xl md:text-4xl text-[#2B1E17] mb-4">{product.name}</h1>
                            <p className="text-[#8B7E75] leading-relaxed">{product.description}</p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <NutritionItem icon={Flame} label="Kalori" value={product.nutrition.calories} unit=" kcal" />
                            <NutritionItem icon={Dumbbell} label="Protein" value={product.nutrition.protein} unit="g" />
                            <NutritionItem icon={Droplet} label="Yağ" value={product.nutrition.fat} unit="g" />
                            <NutritionItem icon={Bean} label="Karb" value={product.nutrition.carbs} unit="g" />
                        </div>

                        <div className="h-px bg-[#E8E0D5]" />

                        <div className="space-y-8">
                            {product.sizes && product.sizes.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-[#2B1E17] mb-3 flex items-center gap-2">
                                        <Coffee className="w-5 h-5 text-[#C46A2B]" /> Porsiyon Seçimi
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {product.sizes.map((size) => (
                                            <button
                                                key={size.name}
                                                onClick={() => setSelectedSize(size)}
                                                className={`p-3 rounded-xl border-2 transition-all text-center ${selectedSize?.name === size.name
                                                    ? 'border-[#C46A2B] bg-[#C46A2B]/5 text-[#C46A2B]'
                                                    : 'border-[#E8E0D5] text-[#8B7E75] hover:border-[#C46A2B]/50'
                                                    }`}
                                            >
                                                <div className="font-medium">{size.name}</div>
                                                <div className="text-xs mt-1">{size.price === 0 ? 'Standart' : `+₺${size.price}`}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {product.milkOptions && product.milkOptions.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-[#2B1E17] mb-3 flex items-center gap-2">
                                        <Droplet className="w-5 h-5 text-[#C46A2B]" /> Süt Seçimi
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {product.milkOptions.map((milk) => (
                                            <button
                                                key={milk.name}
                                                onClick={() => setSelectedMilk(milk)}
                                                className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all text-left ${selectedMilk?.name === milk.name
                                                    ? 'border-[#C46A2B] bg-[#C46A2B]/5 text-[#C46A2B]'
                                                    : 'border-[#E8E0D5] text-[#8B7E75] hover:border-[#C46A2B]/50'
                                                    }`}
                                            >
                                                <span className="font-medium text-sm">{milk.name}</span>
                                                <span className="text-xs">{milk.price === 0 ? '' : `+₺${milk.price}`}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {product.extras && product.extras.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-[#2B1E17] mb-3 flex items-center gap-2">
                                        <Star className="w-5 h-5 text-[#C46A2B]" /> Ekstralar
                                    </h3>
                                    <div className="space-y-2">
                                        {product.extras.map((extra) => {
                                            const isSelected = selectedExtras.some(e => e.name === extra.name);
                                            return (
                                                <button
                                                    key={extra.name}
                                                    onClick={() => handleToggleExtra(extra)}
                                                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${isSelected
                                                        ? 'border-[#C46A2B] bg-[#C46A2B]/5 text-[#C46A2B]'
                                                        : 'border-[#E8E0D5] text-[#8B7E75] hover:bg-[#F5F1EB]'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-[#C46A2B] border-[#C46A2B]' : 'border-[#C46A2B]'}`}>
                                                            {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                                                        </div>
                                                        <span className="font-medium text-sm">{extra.name}</span>
                                                    </div>
                                                    <span className="text-sm font-semibold">+₺{extra.price}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div>
                                <h3 className="font-semibold text-[#2B1E17] mb-3">Sipariş Notu</h3>
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Eklemek istediğiniz notlar (opsiyonel)..."
                                    className="w-full p-4 bg-white border border-[#E8E0D5] rounded-xl text-[#2B1E17] placeholder:text-[#8B7E75]/50 focus:ring-2 focus:ring-[#C46A2B]/30 outline-none resize-none h-24"
                                />
                            </div>
                        </div>

                        <div className="mt-4 w-full p-0 overflow-hidden">
                            <div className="flex gap-2 sm:gap-4">
                                <div className="flex items-center bg-[#C46A2B] rounded-xl p-1 shrink-0">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-10 h-10 flex items-center justify-center hover:bg-[#A85A24] rounded-lg text-white transition-all disabled:opacity-50"
                                        disabled={quantity <= 1}
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="w-10 text-center font-bold text-lg text-white">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-10 h-10 flex items-center justify-center hover:bg-[#A85A24] rounded-lg text-white transition-all"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>

                                <button
                                    onClick={handleAction}
                                    disabled={isAdded}
                                    className={`flex-1 min-w-0 py-3 px-4 sm:px-6 rounded-xl font-semibold text-sm sm:text-base flex items-center justify-center gap-2 transition-all transform active:scale-95 ${isAdded
                                        ? 'bg-[#A85A24] text-white'
                                        : 'bg-[#C46A2B] text-white hover:bg-[#A85A24]'
                                        }`}
                                >
                                    {isAdded ? (
                                        <span>{editingItem ? 'Sepet Güncellendi' : 'Sepete Eklendi'}</span>
                                    ) : (
                                        <>
                                            <span>{editingItem ? 'Sepeti Güncelle' : 'Sepete Ekle'}</span>
                                            <span className="bg-white/20 px-2 py-0.5 rounded text-sm ml-1">
                                                ₺{(totalPrice * quantity).toFixed(2)}
                                            </span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
}

export default ProductDetailSection;
