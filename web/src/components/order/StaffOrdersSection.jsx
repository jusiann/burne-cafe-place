import { useState, useEffect, useCallback } from 'react';
import { Package, Clock, CheckCircle, Truck, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import * as orderService from '../../services/order.service.js';
import useLocationStore from '../../stores/locationStore.js';
import { showSuccess, showError } from '../../constants/alert.utils.js';
import useAuthStore from '../../stores/authStore.js';

function StaffOrdersSection() {
    const { branchId, name: branchName, openModal } = useLocationStore();
    const { user } = useAuthStore();
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('active'); // 'active' or 'past'

    const fetchOrders = useCallback(async () => {
        if (!branchId) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const response = await orderService.getOrders({ branchId, limit: 100 });
            setOrders(response.orders || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Siparişler yüklenemedi.');
        } finally {
            setIsLoading(false);
        }
    }, [branchId]);

    useEffect(() => {
        fetchOrders();
        // Optional: set interval for polling
        const interval = setInterval(fetchOrders, 30000); // refresh every 30s
        return () => clearInterval(interval);
    }, [fetchOrders]);

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            await orderService.updateOrderStatus(orderId, newStatus);
            showSuccess('Sipariş durumu güncellendi.');
            fetchOrders();
        } catch (err) {
            showError(err.response?.data?.message || 'Durum güncellenemedi.');
        }
    };

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm('Bu siparişi iptal etmek istediğinize emin misiniz?')) {
            return;
        }

        try {
            await orderService.cancelOrder(orderId, 'Personel tarafından iptal edildi.');
            showSuccess('Sipariş başarıyla iptal edildi.');
            fetchOrders();
        } catch (err) {
            showError(err.response?.data?.message || 'Sipariş iptal edilemedi.');
        }
    };

    if (!branchId) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
                <AlertCircle className="w-12 h-12 text-[#C46A2B] mb-4" />
                <h2 className="text-2xl font-heading text-[#2B1E17] mb-2">Şube Seçilmedi</h2>
                <p className="text-[#8B7E75] mb-6">Siparişleri görebilmek için lütfen çalıştığınız şubeyi seçin.</p>
                <button onClick={openModal} className="px-6 py-3 bg-[#C46A2B] text-white rounded-xl hover:bg-[#A85A24] transition-colors">
                    Şube Seç
                </button>
            </div>
        );
    }

    // Filter orders
    const activeStatus = ['preparing', 'ready'];
    const pastStatus = ['completed', 'cancelled'];

    const filteredOrders = orders.filter(o => 
        activeTab === 'active' ? activeStatus.includes(o.status) : pastStatus.includes(o.status)
    );

    /* STATUS LABELS */
    const statusLabels = {
        'preparing': 'Hazırlanıyor',
        'ready': 'Hazır',
        'completed': 'Teslim Edildi',
        'cancelled': 'İptal Edildi'
    };

    /* STATUS ICON MAPPING */
    const statusIcons = {
        'preparing': { icon: Clock, color: 'text-[#C46A2B]', bg: 'bg-[#C46A2B]/10' },
        'ready': { icon: Truck, color: 'text-[#9B7F57]', bg: 'bg-[#9B7F57]/10' },
        'completed': { icon: CheckCircle, color: 'text-[#6B5D4F]', bg: 'bg-[#6B5D4F]/10' },
        'cancelled': { icon: XCircle, color: 'text-[#3D2817]', bg: 'bg-[#3D2817]/10' }
    };

    return (
        <section className="py-8 min-h-[80vh]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="font-heading text-2xl md:text-3xl text-[#2B1E17] mb-2">Şube Siparişleri</h1>
                        <p className="text-[#8B7E75]">Seçili Şube: <span className="font-semibold text-[#C46A2B]">{branchName}</span></p>
                    </div>
                    <div className="flex bg-[#F5F1EB] p-1 rounded-xl">
                        <button 
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'active' ? 'bg-white text-[#C46A2B] shadow-sm' : 'text-[#8B7E75] hover:text-[#2B1E17]'}`}
                            onClick={() => setActiveTab('active')}
                        >
                            Aktif Siparişler
                        </button>
                        <button 
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'past' ? 'bg-white text-[#C46A2B] shadow-sm' : 'text-[#8B7E75] hover:text-[#2B1E17]'}`}
                            onClick={() => setActiveTab('past')}
                        >
                            Geçmiş Siparişler
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="min-h-[40vh] flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-[#C46A2B] animate-spin" />
                    </div>
                ) : error ? (
                    <div className="min-h-[40vh] flex items-center justify-center text-red-500">
                        <AlertCircle className="w-6 h-6 mr-2" />
                        <p>{error}</p>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="py-16 text-center">
                        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#C46A2B]/10 flex items-center justify-center">
                            <Package className="w-12 h-12 text-[#C46A2B]" />
                        </div>
                        <h3 className="font-heading text-xl text-[#2B1E17] mb-2">Sipariş Bulunamadı</h3>
                        <p className="text-[#8B7E75]">{activeTab === 'active' ? 'Şu anda hazırlanmayı bekleyen sipariş yok.' : 'Henüz tamamlanmış sipariş bulunmuyor.'}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredOrders.map(order => {
                            const statusConfig = statusIcons[order.status] || statusIcons['preparing'];
                            const StatusIcon = statusConfig.icon;

                            return (
                                <div key={order.id} className="bg-white rounded-xl border border-[#E8E0D5] overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="p-4 bg-[#F5F1EB] border-b border-[#E8E0D5] flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-[#2B1E17]">{order.order_number}</p>
                                            <p className="text-xs text-[#8B7E75]">{new Date(order.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} - {order.customer_name}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.color} ${statusConfig.bg}`}>
                                            {statusLabels[order.status]}
                                        </span>
                                    </div>
                                    <div className="p-4">
                                        <div className="space-y-3 mb-4">
                                            {order.items?.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center text-sm border-b border-[#E8E0D5]/50 pb-2 last:border-0 last:pb-0">
                                                    <div>
                                                        <span className="font-bold text-[#C46A2B] mr-2">{item.quantity}x</span>
                                                        <span className="font-medium text-[#2B1E17]">{item.product_name}</span>
                                                        {(item.size_name || item.milk_option_name) && (
                                                            <p className="text-xs text-[#8B7E75] ml-6">{item.size_name && `Boy: ${item.size_name}`}{item.milk_option_name && ` | Süt: ${item.milk_option_name}`}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            {order.order_note && (
                                                <div className="bg-[#C46A2B]/10 p-3 rounded-lg mt-2">
                                                    <p className="text-xs font-bold text-[#C46A2B] mb-1">Müşteri Notu:</p>
                                                    <p className="text-sm text-[#2B1E17] italic">{order.order_note}</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center pt-4 border-t border-[#E8E0D5]">
                                            <span className="font-bold text-[#C46A2B]">₺{Number(order.total).toFixed(2)}</span>
                                            
                                            {activeTab === 'active' && (
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => handleCancelOrder(order.id)}
                                                        className="px-4 py-2 border border-[#C46A2B] text-[#C46A2B] bg-white text-sm font-semibold rounded-lg hover:bg-[#C46A2B]/10 transition-colors"
                                                    >
                                                        İptal Et
                                                    </button>
                                                    {order.status === 'preparing' && (
                                                        <button 
                                                            onClick={() => handleStatusUpdate(order.id, 'ready')}
                                                            className="px-4 py-2 bg-[#9B7F57] text-white text-sm font-semibold rounded-lg hover:bg-[#7A6242] transition-colors"
                                                        >
                                                            Hazır
                                                        </button>
                                                    )}
                                                    {order.status === 'ready' && (
                                                        <button 
                                                            onClick={() => handleStatusUpdate(order.id, 'completed')}
                                                            className="px-4 py-2 bg-[#6B5D4F] text-white text-sm font-semibold rounded-lg hover:bg-[#4A4036] transition-colors"
                                                        >
                                                            Teslim Et
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}

export default StaffOrdersSection;
