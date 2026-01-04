import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Clock, Package, Coffee, ArrowRight, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';

function OrderConfirmationSection() {
    const navigate = useNavigate();
    const location = useLocation();
    const { latestOrder, getOrderById, clearLatestOrder } = useCart();

    const orderId = location.state?.orderId;
    const order = orderId ? getOrderById(orderId) : latestOrder;

    /* REDIRECT IF NO ORDER */
    useEffect(() => {
        if (!order) {
            navigate('/menu');
        }
    }, [order, navigate]);

    /* CLEANUP ON UNMOUNT */
    useEffect(() => {
        return () => {
            if (clearLatestOrder) {
                clearLatestOrder();
            }
        };
    }, [clearLatestOrder]);

    if (!order) {
        return null;
    }

    return (
        <section className="py-16 min-h-[80vh] flex items-center justify-center">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                {/* SUCCESS MESSAGE */}
                <div className="text-center mb-8">
                    <h1 className="font-heading text-3xl md:text-4xl text-[#2B1E17] mb-3">Siparişiniz Alındı!</h1>
                    <p className="text-[#8B7E75] text-lg">Teşekkür ederiz, siparişiniz başarıyla oluşturuldu.</p>
                </div>

                {/* ORDER DETAILS CARD */}
                <div className="bg-white rounded-2xl border-2 border-[#E8E0D5] overflow-hidden shadow-lg">
                    {/* ORDER HEADER */}
                    <div className="bg-gradient-to-r from-[#C46A2B] to-[#A85A24] p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white/80 text-sm mb-1">Sipariş Numarası</p>
                                <p className="text-2xl font-bold tracking-wider">#{order.orderNumber}</p>
                            </div>
                            <Package className="w-12 h-12 text-white/80" />
                        </div>
                    </div>

                    {/* ORDER INFO */}
                    <div className="p-6 space-y-6">
                        {/* ESTIMATED DELIVERY */}
                        <div className="flex items-start gap-4 p-4 bg-[#F5F1EB] rounded-xl">
                            <div className="w-12 h-12 rounded-full bg-[#C46A2B]/20 flex items-center justify-center flex-shrink-0">
                                <Clock className="w-6 h-6 text-[#C46A2B]" />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-[#2B1E17] mb-1">Tahmini Teslimat Süresi</p>
                                <p className="text-[#C46A2B] text-xl font-bold">{order.estimatedDelivery}</p>
                                <p className="text-[#8B7E75] text-sm mt-1">Siparişiniz hazırlanıyor ve kısa süre içinde yola çıkacak</p>
                            </div>
                        </div>

                        {/* CUSTOMER INFO */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-[#8B7E75] mb-1">Müşteri</p>
                                <p className="font-semibold text-[#2B1E17]">{order.customer.name}</p>
                                <p className="text-sm text-[#8B7E75]">{order.customer.phone}</p>
                            </div>
                            <div>
                                <p className="text-sm text-[#8B7E75] mb-1">Teslimat Adresi</p>
                                <p className="font-semibold text-[#2B1E17]">{order.address.city}, {order.address.district}</p>
                                <p className="text-sm text-[#8B7E75]">{order.address.neighborhood}</p>
                                <p className="text-sm text-[#8B7E75] mt-1">{order.address.fullAddress}</p>
                            </div>
                        </div>

                        {/* ORDER SUMMARY */}
                        <div className="border-t border-[#E8E0D5] pt-4">
                            <p className="text-sm text-[#8B7E75] mb-3">Sipariş Özeti</p>
                            <div className="space-y-2 mb-4">
                                {order.items.slice(0, 3).map((item, index) => (
                                    <div key={index} className="flex items-center justify-between text-sm">
                                        <span className="text-[#2B1E17]">{item.quantity}x {item.name}</span>
                                        <span className="text-[#8B7E75]">₺{item.totalPrice.toFixed(2)}</span>
                                    </div>
                                ))}
                                {order.items.length > 3 && (
                                    <p className="text-sm text-[#8B7E75] italic">+ {order.items.length - 3} ürün daha...</p>
                                )}
                            </div>

                            {/* PRICE BREAKDOWN */}
                            <div className="space-y-2 pt-3 border-t border-[#E8E0D5]">
                                <div className="flex justify-between text-sm">
                                    <span className="text-[#8B7E75]">Ara Toplam</span>
                                    <span className="text-[#2B1E17]">₺{order.subtotal.toFixed(2)}</span>
                                </div>
                                {order.discount > 0 && order.couponCode && (
                                    <div className="flex justify-between text-sm text-[#C46A2B]">
                                        <div className="flex items-center gap-2">
                                            <Tag className="w-4 h-4" />
                                            <span>{order.couponCode}</span>
                                        </div>
                                        <span>-₺{order.discount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm">
                                    <span className="text-[#8B7E75]">KDV (%20)</span>
                                    <span className="text-[#2B1E17]">₺{order.tax.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-3 border-t border-[#E8E0D5] mt-2">
                                <span className="font-bold text-[#2B1E17]">Toplam</span>
                                <span className="font-bold text-xl text-[#C46A2B]">₺{order.total.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* PAYMENT METHOD */}
                        <div className="flex items-center gap-2 p-3 bg-[#F5F1EB] rounded-lg">
                            <p className="text-sm text-[#8B7E75]">Ödeme Yöntemi:</p>
                            <p className="text-sm font-semibold text-[#2B1E17]">
                                {order.paymentMethod === 'cash' && 'Kapıda Nakit Ödeme'}
                                {order.paymentMethod === 'card_on_delivery' && 'Kapıda Kredi Kartı'}
                                {order.paymentMethod === 'online_card' && 'Online Kredi Kartı'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* ACTION BUTTON */}
                <div className="mt-8">
                    <button
                        onClick={() => navigate('/order-history')}
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#C46A2B] text-white font-semibold rounded-xl hover:bg-[#A85A24] transition-all hover:shadow-lg"
                    >
                        <Coffee className="w-5 h-5" />
                        Siparişlerim
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>

                {/* ADDITIONAL INFO */}
                <div className="mt-8 p-4 bg-[#F5F1EB] rounded-xl text-center">
                    <p className="text-sm text-[#8B7E75]">
                        Sipariş durumunuzu <span className="font-semibold text-[#C46A2B]">Siparişlerim</span> sayfasından takip edebilirsiniz.
                    </p>
                </div>
            </div>
        </section>
    );
}

export default OrderConfirmationSection;
