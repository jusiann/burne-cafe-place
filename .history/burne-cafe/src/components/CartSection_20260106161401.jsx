import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, ShoppingBag, Coffee, Tag, Trash2, Minus, Plus, FileText, X, Check, AlertCircle, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';



function CartSection() {
    const { items, cartTotals, appliedCoupon, updateQuantity, removeFromCart, applyCoupon, removeCoupon, isEmpty, clearCart } = useCart();
    
    const [confirmationModal, setConfirmationModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {}
    });

    const openConfirmation = (title, message, onConfirm) => {
        setConfirmationModal({
            isOpen: true,
            title,
            message,
            onConfirm
        });
    };

    const closeConfirmation = () => {
        setConfirmationModal(prev => ({ ...prev, isOpen: false }));
    };

    useEffect(() => {
        if (confirmationModal.isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [confirmationModal.isOpen]);

    /* CART ITEM COMPONENT */
    const CartItem = ({ item }) => {
        const options = [
            item.size?.name,
            item.milkOption?.name,
            ...(item.extras?.map(e => e.name) || [])
        ].filter(Boolean);

        return (
            <article className="flex gap-4 p-4 bg-white rounded-xl border border-[#E8E0D5] hover:shadow-md transition-shadow duration-300">
                {/* PRODUCT IMAGE */}
                <Link to={`/product/${item.productId}`} state={{ cartItem: item }} className="flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden bg-[#F5F1EB]">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" />
                </Link>

                {/* PRODUCT INFO */}
                <section className="flex-1 min-w-0 flex flex-col">
                    {/* TITLE & DELETE */}
                    <header className="flex items-start justify-between gap-2 mb-1">
                        <Link to={`/product/${item.productId}`} state={{ cartItem: item }} className="flex-1 min-w-0 font-semibold text-[#2B1E17] hover:text-[#C46A2B] transition-colors line-clamp-1">
                            {item.name}
                        </Link>
                        <button onClick={() => openConfirmation('Ürünü Sil', `${item.name} ürününü sepetten silmek istediğinize emin misiniz?`, () => removeFromCart(item.itemId))} className="p-1.5 text-[#8B7E75] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </header>

                    {/* OPTIONS */}
                    {options.length > 0 && (
                        <ul className="text-xs text-[#8B7E75] mb-2 space-y-0.5">
                            {options.map((opt, i) => <li key={i}>{opt}</li>)}
                        </ul>
                    )}

                    {/* NOTE */}
                    {item.note && (
                        <p className="flex items-center gap-1 text-xs text-[#8B7E75] mb-2">
                            <FileText className="w-4 h-4 flex-shrink-0" />
                            <span className="line-clamp-1">{item.note}</span>
                        </p>
                    )}

                    {/* QUANTITY & PRICE */}
                    <footer className="mt-auto flex items-end justify-between gap-2 min-h-[45px]">
                        <nav className="flex items-center bg-[#C46A2B] rounded-xl p-0.5 shrink-0">
                            <button onClick={() => updateQuantity(item.itemId, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-[#A85A24] rounded-lg text-white transition-all disabled:opacity-50" disabled={item.quantity <= 1}>
                                <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-8 text-center font-bold text-sm text-white">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.itemId, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-[#A85A24] rounded-lg text-white transition-all">
                                <Plus className="w-3.5 h-3.5" />
                            </button>
                        </nav>
                        <aside className="text-right">
                            <p className="font-bold text-[#C46A2B]">₺{(item.unitPrice * item.quantity).toFixed(2)}</p>
                            {item.quantity > 1 && <p className="text-xs text-[#8B7E75]">₺{item.unitPrice.toFixed(2)} / adet</p>}
                        </aside>
                    </footer>
                </section>
            </article>
        );
    };

    /* COUPON INPUT COMPONENT */
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

        // ACTIVE COUPON
        if (appliedCoupon) {
            return (
                <aside className="bg-[#C46A2B]/5 border border-[#C46A2B]/20 rounded-xl p-4">
                    <header className="flex items-center justify-between">
                        <section className="flex items-center gap-2 text-[#C46A2B]">
                            <Tag className="w-5 h-5" />
                            <div>
                                <p className="font-semibold">{appliedCoupon.code}</p>
                                <p className="text-xs text-[#C46A2B]/80">{appliedCoupon.discountType === 'percentage' ? `%${appliedCoupon.discountValue} indirim` : `₺${appliedCoupon.discountValue} indirim`}</p>
                            </div>
                        </section>
                        <button onClick={removeCoupon} className="p-1.5 text-[#C46A2B] hover:text-red-500 rounded-lg transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </header>
                </aside>
            );
        }

        // COUPON FORM
        return (
            <form onSubmit={handleApply} className="space-y-3">
                {/* INPUT & BUTTON */}
                <section className="flex gap-2 h-[42px]">
                    <label className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B7E75]" />
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            placeholder="Kupon kodu girin"
                            className="w-full h-full pl-10 pr-4 bg-white border border-[#E8E0D5] rounded-lg text-[#2B1E17] placeholder:text-[#8B7E75] outline-none focus:ring-2 focus:ring-[#C46A2B]/30 transition-all font-medium"
                            disabled={isLoading}
                        />
                    </label>
                    <button type="submit" disabled={isLoading || !code.trim()} className={`px-6 h-full rounded-lg font-medium transition-all ${isLoading || !code.trim() ? 'bg-[#C46A2B]/70 text-white/80 cursor-not-allowed opacity-70' : 'bg-[#C46A2B] text-white hover:bg-[#A85A24]'}`}>
                        Uygula
                    </button>
                </section>

                {/* MESSAGE */}
                {message && (
                    <aside className={`flex items-center gap-2 text-sm p-2 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {message.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        {message.text}
                    </aside>
                )}
            </form>
        );aside className="bg-white rounded-xl border border-[#E8E0D5] p-6 sticky top-24">
                {/* HEADER */}
                <header className="flex items-center justify-between mb-6">
                    <h3 className="font-heading text-xl text-[#2B1E17] flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-[#C46A2B]" />
                        Sipariş Özeti
                    </h3>
                    <button onClick={() => openConfirmation('Sepeti Temizle', 'Sepeti tamamen silmek istediğinize emin misiniz? Bu işlem geri alınamaz.', () => clearCart())} className="text-[#8B7E75] hover:text-red-500 transition-colors p-1" title="Sepeti Temizle">
                        <Trash2 className="w-5 h-5" />
                    </button>
                </header>

                {/* TOTALS */}
                <section className="space-y-3 mb-6">
                    <p className="flex justify-between text-[#2B1E17]">
                        <span>Ara Toplam</span>
                        <span>₺{cartTotals.subtotal.toFixed(2)}</span>
                    </p>
                    {appliedCoupon && cartTotals.discount > 0 && (
                        <p className="flex justify-between text-[#C46A2B]">
                            <span className="flex items-center gap-2">
                                <Tag className="w-4 h-4" />
                                {appliedCoupon.code}
                            </span>
                            <span>-₺{cartTotals.discount.toFixed(2)}</span>
                        </p>
                    )}
                    <p className="flex justify-between text-[#8B7E75]">
                        <span>KDV (%20)</span>
                        <span>₺{cartTotals.tax.toFixed(2)}</span>
                    </p>
                    <hr className="h-px bg-gradient-to-r from-[#E8E0D5]/30 via-[#C46A2B]/40 to-[#E8E0D5]/30 border-0" />
                    <p className="flex justify-between text-lg font-bold">
                        <span className="text-[#2B1E17]">Toplam</span>
                        <span className="text-[#C46A2B]">₺{cartTotals.total.toFixed(2)}</span>
                    </p>
                </section>

                {/* CHECKOUT BUTTON */}
     / EMPTY STATE
    if (isEmpty) {
        return (
            <section className="py-16">
                <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-md mx-auto text-center">
                        {/* ICON */}
                        <figure className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#C46A2B]/10 flex items-center justify-center">
                            <ShoppingCart className="w-12 h-12 text-[#C46A2B]" />
                        </figure>

                        {/* CONTENT */}
                        <h1 className="font-heading text-2xl md:text-3xl text-[#2B1E17] mb-3">Sepetiniz Boş</h1>
                        <p className="text-[#8B7E75] mb-8">Henüz sepetinize ürün eklemediniz. Lezzetli kahvelerimizi keşfedin!</p>
                        
                        {/* CTA */}
                        <Link to="/menu" className="inline-flex items-center gap-2 px-6 py-3 bg-[#C46A2B] text-white font-semibold rounded-xl hover:bg-[#A85A24] hover:shadow-lg transition-all duration-300">
                            <Coffee className="w-5 h-5" />
                            Menüyü Keşfet
                        </Link>
                    </div>
                </articleclassName="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-md mx-auto text-center">
                        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#C46A2B]/10 flex items-center justify-center">
                            <ShoppingCart className="w-12 h-12 text-[#C46A2B]" />
                        </div>
     / MAIN RENDER
    return (
        <section className="py-8">
            <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* HEADER */}
                <header className="mb-8">
                    <h1 className="font-heading text-2xl md:text-3xl text-[#2B1E17] mb-2">Sepetim</h1>
                    <p className="text-[#8B7E75]">{items.length} farklı ürün</p>
                </header>

                {/* GRID LAYOUT */}
                <section className="flex flex-col lg:grid lg:grid-cols-3 gap-8">
                    {/* LEFT: ITEMS & COUPON */}
                    <section className="contents lg:block lg:col-span-2">
                        {/* CART ITEMS */}
                        <section className="order-3 lg:order-none space-y-4">
                            {items.map((item) => (
                                <CartItem key={item.itemId} item={item} />
                            ))}
                        </section>

                        {/* COUPON */}
                        <section className="order-2 lg:order-none lg:mt-6">
                            <CouponInput />
                        </section>
                    </section>

                    {/* RIGHT: SUMMARY */}
                    <section className="order-1 lg:order-none lg:col-span-1">
                        <CartSummary />
                    </section>
                </section>
            </article>

            {/* CONFIRMATION MODAL */}
            {confirmationModal.isOpen && (
                <aside className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <article className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* MODAL HEADER */}
                        <header className="px-6 py-4 border-b border-[#E8E0D5] flex items-center justify-between bg-[#F5F1EB]">
                            <h3 className="font-heading text-lg text-[#2B1E17] flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-[#C46A2B]" />
                                {confirmationModal.title}
                            </h3>
                            <button onClick={closeConfirmation} className="text-[#8B7E75] hover:text-[#2B1E17] transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </header>

                        {/* MODAL BODY */}
                        <section className="p-6">
                            <p className="text-[#8B7E75] text-base leading-relaxed">
                                {confirmationModal.message}
                            </p>
                        </section>

                        {/* MODAL ACTIONS */}
                        <footer className="px-6 py-4 bg-[#F5F1EB]/50 border-t border-[#E8E0D5] flex justify-end gap-3">
                            <button onClick={closeConfirmation} className="px-4 py-2 rounded-xl text-[#8B7E75] font-medium hover:bg-[#E8E0D5]/50 transition-colors">
                                İptal
                            </button>
                            <button onClick={() => { confirmationModal.onConfirm(); closeConfirmation(); }} className="px-4 py-2 rounded-xl bg-[#C46A2B] text-white font-medium hover:bg-[#A85A24] transition-colors shadow-lg shadow-[#C46A2B]/20">
                                Sil
                            </button>
                        </footer>
                    </article>
                </aside>
            )}                          confirmationModal.onConfirm();
                                            closeConfirmation();
                                        }}
                                        className="px-4 py-2 rounded-xl bg-[#C46A2B] text-white font-medium hover:bg-[#A85A24] transition-colors shadow-lg shadow-[#C46A2B]/20"
                                    >
                                        Sil
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

export default CartSection;
