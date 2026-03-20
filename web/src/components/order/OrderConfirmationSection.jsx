import {useEffect} from 'react';
import {useNavigate,useLocation} from 'react-router-dom';
import {Clock,Package,Coffee,ArrowRight,Tag,FileText,Loader2,AlertCircle} from 'lucide-react';
import {useOrder} from '../../hooks/useOrders.js';

function OrderConfirmationSection() {
    const navigate = useNavigate();
    const location = useLocation();

    const orderId = location.state?.orderId;
    const {order, isLoading, error} = useOrder(orderId);

    /* REDIRECT IF NO ORDER ID */
    useEffect(() => {
        if (!orderId) {
            navigate('/menu');
        }
    }, [orderId,navigate]);

    if (!orderId) {
        return null;
    }

    if (isLoading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#C46A2B] animate-spin" />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold text-[#2B1E17] mb-2">Sipariş Bulunamadı</h1>
                <p className="text-[#8B7E75] mb-6">Aradığınız sipariş bulunamadı veya bir hata oluştu.</p>
                <button
                    onClick={() => navigate('/menu')}
                    className="px-6 py-2 bg-[#C46A2B] text-white rounded-xl hover:bg-[#A85A24] transition-colors"
                >
                    Menüye Dön
                </button>
            </div>
        );
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
                                <p className="text-2xl font-bold tracking-wider">{order.order_number}</p>
                            </div>
                            <Package className="w-12 h-12 text-white/80" />
                        </div>
                    </div>

                    {/* ORDER INFO */}
                    <div className="p-6 space-y-6">

                        {/* ESTIMATED DELIVERY */}
                        <div className="flex items-center gap-4 p-4 bg-[#F5F1EB] rounded-xl">
                            <div className="w-12 h-12 rounded-full bg-[#C46A2B]/20 flex items-center justify-center flex-shrink-0">
                                <Clock className="w-6 h-6 text-[#C46A2B]" />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-[#2B1E17] mb-1">Sipariş Durumu</p>
                                <p className="text-[#C46A2B] text-xl font-bold">
                                    {order.status === 'preparing' && 'Hazırlanıyor'}
                                    {order.status === 'ready' && 'Hazır'}
                                    {order.status === 'completed' && 'Teslim Edildi'}
                                    {order.status === 'cancelled' && 'İptal Edildi'}
                                </p>
                            </div>
                        </div>

                        {/* CUSTOMER INFO */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-[#8B7E75] mb-1">Müşteri</p>
                                <p className="font-semibold text-[#2B1E17]">{order.customer_name}</p>
                                <p className="text-sm text-[#8B7E75]">{order.customer_phone}</p>
                            </div>
                            <div>
                                <p className="text-sm text-[#8B7E75] mb-1">Teslimat Adresi</p>
                                <p className="font-semibold text-[#2B1E17] pl-1 break-words">{order.branch_name || order.branch_id || 'Şubeden Teslim'}</p>
                            </div>
                        </div>

                        {/* ORDER NOTE */}
                        {order.order_note && (
                            <div className="p-4 bg-[#fff8f3] rounded-xl border border-[#C46A2B]/10">
                                <p className="text-sm text-[#8B7E75] mb-1 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-[#C46A2B]" />
                                    Sipariş Notu
                                </p>
                                <p className="text-[#2B1E17] italic">{order.order_note}</p>
                            </div>
                        )}

                        {/* ORDER SUMMARY */}
                        <div className="border-t border-[#E8E0D5] pt-4">
                            <p className="text-sm text-[#8B7E75] mb-3">Sipariş Özeti</p>
                            <div className="space-y-2 mb-4">
                                {order.items?.slice(0, 3).map((item, index) => (
                                    <div key={index} className="flex items-center justify-between text-sm">
                                        <span className="text-[#2B1E17]">{item.quantity}x {item.product_name}</span>
                                        <span className="text-[#8B7E75]">₺{Number(item.total_price).toFixed(2)}</span>
                                    </div>
                                ))}
                                {order.items?.length > 3 && (
                                    <p className="text-sm text-[#8B7E75] italic">+ {order.items.length - 3} ürün daha...</p>
                                )}
                            </div>

                            {/* PRICE BREAKDOWN */}
                            <div className="space-y-2 pt-3 border-t border-[#E8E0D5]">
                                <div className="flex justify-between text-sm">
                                    <span className="text-[#8B7E75]">Ara Toplam</span>
                                    <span className="text-[#2B1E17]">₺{Number(order.subtotal).toFixed(2)}</span>
                                </div>
                                {Number(order.discount) > 0 && (
                                    <div className="flex justify-between text-sm text-[#C46A2B]">
                                        <div className="flex items-center gap-2">
                                            <Tag className="w-4 h-4" />
                                            <span>İndirim</span>
                                        </div>
                                        <span>-₺{Number(order.discount).toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm">
                                    <span className="text-[#8B7E75]">KDV</span>
                                    <span className="text-[#2B1E17]">₺{Number(order.tax).toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-3 border-t border-[#E8E0D5] mt-2">
                                <span className="font-bold text-[#2B1E17]">Toplam</span>
                                <span className="font-bold text-xl text-[#C46A2B]">₺{Number(order.total).toFixed(2)}</span>
                            </div>
                        </div>

                        {/* PAYMENT METHOD */}
                        <div className="flex items-center gap-2 p-3 bg-[#F5F1EB] rounded-lg">
                            <p className="text-sm text-[#8B7E75]">Ödeme Yöntemi:</p>
                            <p className="text-sm font-semibold text-[#2B1E17]">
                                {order.payment_method === 'cash' && 'Nakit'}
                                {order.payment_method === 'credit_card' && 'Kredi Kartı'}
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
                <div className="mt-8 text-center">
                    <p className="text-sm text-[#8B7E75]">
                        Sipariş durumunuzu <span className="font-semibold text-[#C46A2B]">Siparişlerim</span> sayfasından takip edebilirsiniz.
                    </p>
                </div>
            </div>
        </section>
    );
}

export default OrderConfirmationSection;
