import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Package,Clock,CheckCircle,Truck,ChevronRight,ShoppingBag,XCircle,AlertCircle,X,Loader2} from 'lucide-react';
import {useMyOrders} from '../../hooks/useOrders.js';
import * as orderService from '../../services/order.service.js';
import {showSuccess, showError} from '../../constants/alert.utils.js';

function OrderHistorySection() {
    const navigate = useNavigate();
    const {orders, isLoading, error, refetch} = useMyOrders();

    const [confirmationModal, setConfirmationModal] = useState({
        isOpen: false,
        orderId: null
    });

    const openConfirmation = (orderId) => {
        setConfirmationModal({
            isOpen: true,
            orderId
        });
        document.body.style.overflow = 'hidden';
    };

    const closeConfirmation = () => {
        setConfirmationModal({isOpen: false, orderId: null});
        document.body.style.overflow = 'unset';
    };

    const handleCancelOrder = async () => {
        if (!confirmationModal.orderId) return;
        
        try {
            await orderService.cancelOrder(confirmationModal.orderId, { staffNote: 'Müşteri tarafından iptal edildi' });
            showSuccess('Sipariş başarıyla iptal edildi.');
            refetch();
        } catch (err) {
            showError(err.response?.data?.message || 'Sipariş iptal edilemedi.');
        } finally {
            closeConfirmation();
        }
    };

    /* STATUS LABELS */
    const statusLabels = {
        'preparing': 'Hazırlanıyor',
        'ready': 'Hazır',
        'completed': 'Teslim Edildi',
        'cancelled': 'İptal Edildi'
    };

    /* STATUS ICON MAPPING */
    const statusIcons = {
        'preparing': {icon: Clock,color: 'text-[#C46A2B]',bg: 'bg-[#C46A2B]/10'},
        'ready': {icon: Truck,color: 'text-[#9B7F57]',bg: 'bg-[#9B7F57]/10'},
        'completed': {icon: CheckCircle,color: 'text-[#6B5D4F]',bg: 'bg-[#6B5D4F]/10'},
        'cancelled': {icon: XCircle,color: 'text-[#3D2817]',bg: 'bg-[#3D2817]/10'}
    };

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#C46A2B] animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center text-red-500">
                <AlertCircle className="w-6 h-6 mr-2" />
                <p>{error}</p>
            </div>
        );
    }

    /* EMPTY STATE */
    if (!orders || orders.length === 0) {
        return (
            <section className="py-16 min-h-[80vh] flex items-center justify-center">
                <div className="max-w-md mx-auto px-4 text-center">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#C46A2B]/10 flex items-center justify-center">
                        <Package className="w-12 h-12 text-[#C46A2B]" />
                    </div>
                    <h1 className="font-heading text-2xl md:text-3xl text-[#2B1E17] mb-3">Henüz Siparişiniz Yok</h1>
                    <p className="text-[#8B7E75] mb-8">İlk siparişinizi vererek kahve keyfinize başlayın!</p>
                    <button
                        onClick={() => navigate('/menu')}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#C46A2B] text-white font-semibold rounded-xl hover:bg-[#A85A24] transition-all hover:shadow-lg"
                    >
                        <ShoppingBag className="w-5 h-5" />
                        Menüye Git
                    </button>
                </div>
            </section>
        );
    }

    return (
        <section className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* HEADER */}
                <div className="mb-8">
                    <h1 className="font-heading text-2xl md:text-3xl text-[#2B1E17] mb-2">Siparişlerim</h1>
                    <p className="text-[#8B7E75]">{orders.length} sipariş geçmişiniz</p>
                </div>

                {/* ORDERS LIST */}
                <div className="space-y-4">
                    {orders.map((order) => {
                        const statusConfig = statusIcons[order.status] || statusIcons['preparing'];
                        const StatusIcon = statusConfig.icon;

                        return (
                            <div key={order.id} className="bg-white rounded-xl border border-[#E8E0D5] overflow-hidden hover:shadow-lg transition-shadow">

                                {/* ORDER HEADER */}
                                <div className="p-4 bg-[#F5F1EB] border-b border-[#E8E0D5] flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <p className="font-semibold text-[#2B1E17]">{order.order_number}</p>
                                            <p className="text-xs text-[#8B7E75]">{new Date(order.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.color} ${statusConfig.bg}`}>
                                        {statusLabels[order.status]}
                                    </span>
                                </div>

                                {/* ORDER BODY */}
                                <div className="p-4">
                                    <div className="grid md:grid-cols-2 gap-4">

                                        {/* ITEMS */}
                                        <div>
                                            <p className="text-sm text-[#8B7E75] mb-2">Ürünler</p>
                                            <div className="space-y-2">
                                                {order.items?.slice(0, 2).map((item, itemIndex) => (
                                                    <div key={itemIndex} className="flex items-center gap-3">
                                                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#F5F1EB] flex-shrink-0">
                                                            <div className="w-full h-full flex items-center justify-center text-[#8B7E75] text-xs">A</div>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-[#2B1E17] truncate">{item.product_name}</p>
                                                            <p className="text-xs text-[#8B7E75]">{item.quantity} adet</p>
                                                        </div>
                                                    </div>
                                                ))}
                                                {order.items?.length > 2 && (
                                                    <p className="text-xs text-[#8B7E75] italic">+ {order.items.length - 2} ürün daha</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* DETAILS */}
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-[#8B7E75]">Şube</span>
                                                <span className="text-[#2B1E17] font-medium">{order.branch_name || order.branch_id || 'Merkez'}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-[#8B7E75]">Ödeme</span>
                                                <span className="text-[#2B1E17] font-medium">
                                                    {order.payment_method === 'cash' && 'Nakit'}
                                                    {order.payment_method === 'credit_card' && 'Kredi Kartı'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center pt-2 border-t border-[#E8E0D5]">
                                                <span className="text-[#2B1E17] font-semibold">Toplam</span>
                                                <span className="text-lg font-bold text-[#C46A2B]">₺{Number(order.total).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ACTIONS */}
                                    <div className="mt-4 pt-4 border-t border-[#E8E0D5]">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => navigate('/order-confirmation', { state: { orderId: order.id } })}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#C46A2B] text-white font-semibold rounded-lg hover:bg-[#A85A24] hover:shadow-lg transition-all"
                                            >
                                                Sipariş Detayları
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                            {order.status === 'preparing' && (
                                                <button
                                                    onClick={() => openConfirmation(order.id)}
                                                    className="px-4 py-2.5 bg-white border-2 border-[#C46A2B] text-[#C46A2B] font-semibold rounded-lg hover:bg-[#F5F1EB] hover:shadow-lg transition-all flex items-center gap-2"
                                                >
                                                    İptal Et
                                                    <X className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* CONFIRMATION MODAL */}
                {confirmationModal.isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                            {/* HEADER */}
                            <div className="px-6 py-4 border-b border-[#E8E0D5] flex items-center justify-between bg-[#F5F1EB]">
                                <h3 className="font-heading text-lg text-[#2B1E17] flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-[#C46A2B]" />
                                    Siparişi İptal Et
                                </h3>
                                <button
                                    onClick={closeConfirmation}
                                    className="text-[#8B7E75] hover:text-[#2B1E17] transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* BODY */}
                            <div className="p-6">
                                <p className="text-[#8B7E75] text-base leading-relaxed">
                                    Bu siparişi iptal etmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                                </p>
                            </div>

                            {/* FOOTER */}
                            <div className="px-6 py-4 bg-[#F5F1EB]/50 border-t border-[#E8E0D5] flex justify-end gap-3">
                                <button
                                    onClick={closeConfirmation}
                                    className="px-4 py-2 rounded-xl text-[#8B7E75] font-medium hover:bg-[#E8E0D5]/50 transition-colors"
                                >
                                    Vazgeç
                                </button>
                                <button
                                    onClick={handleCancelOrder}
                                    className="px-4 py-2 rounded-xl bg-[#C46A2B] text-white font-medium hover:bg-[#A85A24] transition-colors shadow-lg shadow-[#C46A2B]/20"
                                >
                                    İptal Et
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}

export default OrderHistorySection;
