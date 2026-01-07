import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Package,Clock,CheckCircle,Truck,ChevronRight,RotateCcw,ShoppingBag} from 'lucide-react';
import {useCart} from '../context/CartContext';
import products from '../data/products.json';

function OrderHistorySection() {
    const navigate = useNavigate();
    const {orders,reorderFromOrder,STATUS_LABELS} = useCart();
    const [reorderingId,setReorderingId] = useState(null);

    /* STATUS ICON MAPPING */
    const statusIcons = {
        'preparing': {icon: Clock,color: 'text-[#C46A2B]',bg: 'bg-[#C46A2B]/10'},
        'on_the_way': {icon: Truck,color: 'text-[#9B7F57]',bg: 'bg-[#9B7F57]/10'},
        'delivered': {icon: CheckCircle,color: 'text-[#6B5D4F]',bg: 'bg-[#6B5D4F]/10'}
    };

    /* HANDLE REORDER */
    const handleReorder = (orderId) => {
        setReorderingId(orderId);
        const success = reorderFromOrder(orderId, products);

        if (success) {
            setTimeout(() => {
                navigate('/cart');
            }, 500);
        } else {
            setReorderingId(null);
        }
    };

    /* EMPTY STATE */
    if (orders.length === 0) {
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
                        const statusConfig = statusIcons[order.status];
                        const StatusIcon = statusConfig.icon;

                        return (
                            <div key={order.id} className="bg-white rounded-xl border border-[#E8E0D5] overflow-hidden hover:shadow-lg transition-shadow">

                                {/* ORDER HEADER */}
                                <div className="p-4 bg-[#F5F1EB] border-b border-[#E8E0D5] flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <p className="font-semibold text-[#2B1E17]">#{order.orderNumber}</p>
                                            <p className="text-xs text-[#8B7E75]">{new Date(order.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.color} ${statusConfig.bg}`}>
                                        {STATUS_LABELS[order.status]}
                                    </span>
                                </div>

                                {/* ORDER BODY */}
                                <div className="p-4">
                                    <div className="grid md:grid-cols-2 gap-4">

                                        {/* ITEMS */}
                                        <div>
                                            <p className="text-sm text-[#8B7E75] mb-2">Ürünler</p>
                                            <div className="space-y-2">
                                                {order.items.slice(0, 2).map((item, itemIndex) => (
                                                    <div key={itemIndex} className="flex items-center gap-3">
                                                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#F5F1EB] flex-shrink-0">
                                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-[#2B1E17] truncate">{item.name}</p>
                                                            <p className="text-xs text-[#8B7E75]">{item.quantity} adet</p>
                                                        </div>
                                                    </div>
                                                ))}
                                                {order.items.length > 2 && (
                                                    <p className="text-xs text-[#8B7E75] italic">+ {order.items.length - 2} ürün daha</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* DETAILS */}
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-[#8B7E75]">Teslimat</span>
                                                <span className="text-[#2B1E17] font-medium">{order.estimatedDelivery}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-[#8B7E75]">Ödeme</span>
                                                <span className="text-[#2B1E17] font-medium">
                                                    {order.paymentMethod === 'cash' && 'Kapıda Nakit'}
                                                    {order.paymentMethod === 'card_on_delivery' && 'Kapıda Kart'}
                                                    {order.paymentMethod === 'online_card' && 'Online Kart'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center pt-2 border-t border-[#E8E0D5]">
                                                <span className="text-[#2B1E17] font-semibold">Toplam</span>
                                                <span className="text-lg font-bold text-[#C46A2B]">₺{order.total.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ACTIONS */}
                                    <div className="mt-4 pt-4 border-t border-[#E8E0D5] flex gap-3">
                                        <button
                                            onClick={() => handleReorder(order.id)}
                                            disabled={reorderingId === order.id}
                                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${reorderingId === order.id ? 'bg-[#E8E0D5] text-[#8B7E75] cursor-not-allowed' : 'bg-[#C46A2B] text-white hover:bg-[#A85A24] hover:shadow-lg'}`}
                                        >
                                            {reorderingId === order.id ? 'Ekleniyor...' : 'Tekrar Sipariş Ver'}
                                            <RotateCcw className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => navigate('/order-confirmation', { state: { orderId: order.id } })}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-[#C46A2B] text-[#C46A2B] font-semibold rounded-lg hover:bg-[#C46A2B] hover:text-white transition-all"
                                        >
                                            Detayları Gör
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

export default OrderHistorySection;
