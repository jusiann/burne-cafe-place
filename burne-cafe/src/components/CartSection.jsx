import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, ShoppingBag, Coffee, Tag, Trash2, Minus, Plus, FileText, X, Check, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';

function CartSection() {
    const { items, cartTotals, appliedCoupon, updateQuantity, removeFromCart, applyCoupon, removeCoupon, isEmpty, clearCart } = useCart();

    const CartItem = ({ item }) => {
        const options = [
            item.size?.name,
            item.milkOption?.name,
            ...(item.extras?.map(e => e.name) || [])
        ].filter(Boolean);

        return (
            <div className="flex gap-4 p-4 bg-white rounded-xl border border-[#E8E0D5] hover:shadow-md transition-shadow duration-300">
                <Link to={`/product/${item.productId}`} state={{ cartItem: item }} className="flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden bg-[#F5F1EB]">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" />
                </Link>
                <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex-1 min-w-0">
                            <Link to={`/product/${item.productId}`} state={{ cartItem: item }} className="font-semibold text-[#2B1E17] hover:text-[#C46A2B] transition-colors line-clamp-1">{item.name}</Link>
                        </div>
                        <button onClick={() => removeFromCart(item.itemId)} className="p-1.5 text-[#8B7E75] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>

                    {/* OPTIONS - VERTICAL LIST */}
                    {options.length > 0 && (
                        <div className="text-xs text-[#8B7E75] mb-2 space-y-0.5">
                            {options.map((opt, i) => (
                                <div key={i}>{opt}</div>
                            ))}
                        </div>
                    )}

                    {item.note && <div className="flex items-center gap-1 text-xs text-[#8B7E75] mb-2"><FileText className="w-4 h-4 flex-shrink-0" /><span className="line-clamp-1">{item.note}</span></div>}
                    <div className="mt-auto flex items-end justify-between gap-2 min-h-[45px]">
                        {/* Quantity controls styled like ProductDetail */}
                        <div className="flex items-center bg-[#C46A2B] rounded-xl p-0.5 shrink-0">
                            <button onClick={() => updateQuantity(item.itemId, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-[#A85A24] rounded-lg text-white transition-all disabled:opacity-50" disabled={item.quantity <= 1}><Minus className="w-3.5 h-3.5" /></button>
                            <span className="w-8 text-center font-bold text-sm text-white">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.itemId, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-[#A85A24] rounded-lg text-white transition-all"><Plus className="w-3.5 h-3.5" /></button>
                        </div>
                        <div className="text-right">
                            <div className="font-bold text-[#C46A2B]">₺{(item.unitPrice * item.quantity).toFixed(2)}</div>
                            {item.quantity > 1 && <div className="text-xs text-[#8B7E75]">₺{item.unitPrice.toFixed(2)} / adet</div>}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const CouponInput = () => {
        const [code, setCode] = useState('');
        const [message, setMessage] = useState(null);
        const [isLoading, setIsLoading] = useState(false);

        const handleApply = async (e) => {
            e.preventDefault();
            if (!code.trim()) { setMessage({ type: 'error', text: 'Lütfen kupon kodu girin' }); return; }
            setIsLoading(true);
            await new Promise(resolve => setTimeout(resolve, 300));
            const result = applyCoupon(code.trim());
            setMessage({ type: result.success ? 'success' : 'error', text: result.message });
            if (result.success) setCode('');
            setIsLoading(false);
            setTimeout(() => setMessage(null), 3000);
        };

        // Applied Coupon View - Matches Theme
        if (appliedCoupon) {
            return (
                <div className="bg-[#C46A2B]/5 border border-[#C46A2B]/20 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[#C46A2B]">
                            <Tag className="w-5 h-5" />
                            <div>
                                <p className="font-semibold">{appliedCoupon.code}</p>
                                <p className="text-xs text-[#C46A2B]/80">{appliedCoupon.discountType === 'percentage' ? `%${appliedCoupon.discountValue} indirim` : `₺${appliedCoupon.discountValue} indirim`}</p>
                            </div>
                        </div>
                        <button onClick={removeCoupon} className="p-1.5 text-[#C46A2B] hover:text-red-500 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
                    </div>
                </div>
            );
        }

        // Coupon Input View
        return (
            <div className="rounded-xl">
                <form onSubmit={handleApply} className="space-y-3">
                    <div className="flex gap-2 h-[42px]"> {/* Match height of other elements if needed or standard height */}
                        <div className="relative flex-1">
                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B7E75]" />
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                                placeholder="Kupon kodu girin"
                                className="w-full h-full pl-10 pr-4 bg-white border border-[#E8E0D5] rounded-lg text-[#2B1E17] placeholder:text-[#8B7E75] outline-none focus:ring-2 focus:ring-[#C46A2B]/30 transition-all font-medium"
                                disabled={isLoading}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading || !code.trim()}
                            className={`px-6 h-full rounded-lg font-medium transition-all ${isLoading || !code.trim() ? 'bg-[#C46A2B]/70 text-white/80 cursor-not-allowed opacity-70' : 'bg-[#C46A2B] text-white hover:bg-[#A85A24]'}`}
                        >
                            Uygula
                        </button>
                    </div>
                    {message && <div className={`flex items-center gap-2 text-sm p-2 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{message.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}{message.text}</div>}
                </form>
            </div>
        );
    };

    const CartSummary = () => {
        return (
            <div className="bg-white rounded-xl border border-[#E8E0D5] p-6 sticky top-24">
                <h3 className="font-heading text-xl text-[#2B1E17] mb-6 flex items-center gap-2"><ShoppingBag className="w-5 h-5 text-[#C46A2B]" />Sipariş Özeti</h3>
                <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-[#2B1E17]"><span>Ara Toplam</span><span>₺{cartTotals.subtotal.toFixed(2)}</span></div>
                    {appliedCoupon && cartTotals.discount > 0 && (
                        <div className="flex justify-between text-[#C46A2B]">
                            <div className="flex items-center gap-2"><Tag className="w-4 h-4" /><span>{appliedCoupon.code}</span></div> {/* Removed 'Kaldır' link */}
                            <span>-₺{cartTotals.discount.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-[#8B7E75]"><span>KDV (%20)</span><span>₺{cartTotals.tax.toFixed(2)}</span></div>
                    <div className="h-px bg-gradient-to-r from-[#E8E0D5]/30 via-[#C46A2B]/40 to-[#E8E0D5]/30" />
                    <div className="flex justify-between text-lg font-bold"><span className="text-[#2B1E17]">Toplam</span><span className="text-[#C46A2B]">₺{cartTotals.total.toFixed(2)}</span></div>
                </div>
                <Link to={isEmpty ? '#' : '/checkout'} className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all duration-300 ${isEmpty ? 'bg-[#E8E0D5] text-[#8B7E75] cursor-not-allowed' : 'bg-[#C46A2B] text-white hover:bg-[#A85A24] hover:shadow-lg'}`} onClick={(e) => isEmpty && e.preventDefault()}>Siparişi Tamamla<ArrowRight className="w-5 h-5" /></Link>
                {/* Removed 'Sepetinizde X ürün var' */}
            </div>
        );
    };

    if (isEmpty) {
        return (
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-md mx-auto text-center">
                        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#C46A2B]/10 flex items-center justify-center"><ShoppingCart className="w-12 h-12 text-[#C46A2B]" /></div>
                        <h1 className="font-heading text-2xl md:text-3xl text-[#2B1E17] mb-3">Sepetiniz Boş</h1>
                        <p className="text-[#8B7E75] mb-8">Henüz sepetinize ürün eklemediniz. Lezzetli kahvelerimizi keşfedin!</p>
                        <Link to="/menu" className="inline-flex items-center gap-2 px-6 py-3 bg-[#C46A2B] text-white font-semibold rounded-xl hover:bg-[#A85A24] hover:shadow-lg transition-all duration-300"><Coffee className="w-5 h-5" />Menüyü Keşfet</Link>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <>
            <section className="py-8 pb-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Link to="/menu" className="p-2 text-[#8B7E75] hover:text-[#C46A2B] hover:bg-[#C46A2B]/10 rounded-lg transition-colors">
                                    <ArrowLeft className="w-5 h-5" />
                                </Link>
                                <h1 className="font-heading text-2xl md:text-3xl text-[#2B1E17]">Sepetim</h1>
                            </div>
                            <p className="text-[#8B7E75] ml-11">{items.length} farklı ürün</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8">
                        <div className="contents lg:block lg:col-span-2">
                            <div className="order-3 lg:order-none space-y-4">
                                {items.map((item) => (
                                    <CartItem key={item.itemId} item={item} />
                                ))}
                            </div>
                            <div className="order-2 lg:order-none lg:mt-6">
                                <CouponInput />
                            </div>
                        </div>

                        <div className="order-1 lg:order-none lg:col-span-1">
                            <CartSummary />
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

export default CartSection;
