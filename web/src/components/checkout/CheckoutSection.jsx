import {useState,useMemo} from 'react';
import {useNavigate} from 'react-router-dom';
import {User,Phone,MapPin,Clock,CreditCard,FileText,ShoppingBag,Tag,AlertCircle,X} from 'lucide-react';
import useCartStore from '../../stores/cartStore.js';
import useLocationStore from '../../stores/locationStore.js';
import useAuthStore from '../../stores/authStore.js';
import * as orderService from '../../services/order.service.js';
import {showSuccess, showError} from '../../constants/alert.utils.js';

const InputField = ({name,label,icon: Icon,type = 'text',required = true,formData,errors,handleChange,...props}) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-[#2B1E17] mb-2">
            {label} {required && <span className="text-[#C46A2B]">*</span>}
        </label>
        <div className="relative">
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B7E75]" />
            <input
                id={name}
                name={name}
                type={type}
                value={formData[name]}
                onChange={handleChange}
                className={`w-full pl-11 pr-4 py-3 bg-white border rounded-xl text-[#2B1E17] placeholder:text-[#8B7E75]/50 outline-none transition-all ${errors[name] ? 'border-[#C46A2B] focus:ring-2 focus:ring-[#C46A2B]/30' : 'border-[#E8E0D5] focus:ring-2 focus:ring-[#C46A2B]/30'}`}
                {...props}
            />
        </div>
        {errors[name] && (
            <p className="mt-1 text-sm text-[#C46A2B] flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors[name]}
            </p>
        )}
    </div>
);

function CheckoutSection() {
    const navigate = useNavigate();
    const store = useCartStore();
    const {items, appliedCoupon, clearCart} = store;
    const cartTotals = store.getCartTotals();
    const isEmpty = store.isEmpty();
    
    const { user } = useAuthStore();
    const locationStore = useLocationStore();
    const activeBranchId = locationStore.branchId || locationStore.id || null;

    const [formData, setFormData] = useState({
        deliveryTime: 'asap',
        customTime: '',
        paymentMethod: 'online_card',
        cardNumber: '',
        cardName: '',
        cardExpiry: '',
        cardCvv: '',
        orderNote: ''
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const deliveryTimeOptions = [
        {value: 'asap',label: 'Şimdi (5-10 dk)'},
        {value: 'custom',label: 'Belirli Bir Saat'}
    ];

    const timeOptions = useMemo(() => {
        const options = [];
        const now = new Date();
        const currentHour = now.getHours();
        let startHour = currentHour + 1;

        for (let hour = startHour; hour < 24; hour++) {
            const displayHour = String(hour).padStart(2, '0');
            options.push({
                value: `${hour}:00`,
                label: `${displayHour}:00`
            });
        }
        return options;
    }, []);

    const paymentMethods = [
        {value: 'online_card',label: 'Online Kredi Kartı ile Ödeme',icon: CreditCard}
    ];

    const handleChange = (event) => {
        const {name,value} = event.target;
        setFormData(previous => ({...previous,[name]: value}));
        if (errors[name]) {
            setErrors(previous => ({...previous,[name]: ''}));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (formData.deliveryTime === 'custom' && !formData.customTime) {
            newErrors.customTime = 'Lütfen bir saat seçin';
        }

        if (formData.paymentMethod === 'online_card') {
            if (!formData.cardNumber.trim()) {
                newErrors.cardNumber = 'Kart numarası gereklidir';
            } else if (!/^[0-9]{16}$/.test(formData.cardNumber.replace(/\s/g, ''))) {
                newErrors.cardNumber = 'Geçerli bir kart numarası girin (16 haneli)';
            }
            if (!formData.cardName.trim()) newErrors.cardName = 'Kart üzerindeki isim gereklidir';
            if (!formData.cardExpiry.trim()) {
                newErrors.cardExpiry = 'Son kullanma tarihi gereklidir';
            } else if (!/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(formData.cardExpiry)) {
                newErrors.cardExpiry = 'Geçerli format: AA/YY';
            }
            if (!formData.cardCvv.trim()) {
                newErrors.cardCvv = 'CVV gereklidir';
            } else if (!/^[0-9]{3}$/.test(formData.cardCvv)) {
                newErrors.cardCvv = 'Geçerli bir CVV girin (3 haneli)';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!activeBranchId) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            showError('Lütfen siparişin gönderileceği şubeyi seçin.');
            locationStore.openModal();
            return;
        }

        if (!validateForm()) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setIsSubmitting(true);

        try {
            let scheduledTime = null;
            if (formData.deliveryTime === 'custom') {
                const now = new Date();
                const [hours, minutes] = formData.customTime.split(':');
                now.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
                scheduledTime = now.toISOString();
            }

            const paymentMethod = formData.paymentMethod === 'online_card' ? 'credit_card' : 'cash';

            const orderData = {
                branchId: activeBranchId,
                customerName: user?.name || 'Müşteri',
                customerPhone: user?.phone || '0000000000',
                scheduledTime: scheduledTime,
                paymentMethod: paymentMethod,
                orderNote: formData.orderNote.trim() || null,
                couponCode: appliedCoupon ? appliedCoupon.code : null,
                cartId: store.id
            };

            const response = await orderService.createOrder(orderData);
            
            await clearCart();
            showSuccess('Sipariş başarıyla oluşturuldu');
            navigate('/order-confirmation', { state: { orderId: response.order.id } });
        } catch (error) {
            console.error('Order creation failed:', error);
            const errorMsg = error.response?.data?.error || 'Sipariş oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.';
            setErrors({ submit: errorMsg });
            showError(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isEmpty) {
        return (
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-md mx-auto text-center">
                        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#C46A2B]/10 flex items-center justify-center">
                            <ShoppingBag className="w-12 h-12 text-[#C46A2B]" />
                        </div>
                        <h1 className="font-heading text-2xl md:text-3xl text-[#2B1E17] mb-3">Sepetiniz Boş</h1>
                        <p className="text-[#8B7E75] mb-8">Sipariş vermek için önce sepetinize ürün eklemelisiniz.</p>
                        <a href="/menu" className="inline-flex items-center gap-2 px-6 py-3 bg-[#C46A2B] text-white font-semibold rounded-xl hover:bg-[#A85A24] transition-colors">Menüye Git</a>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* HEADER */}
                <div className="mb-8">
                    <h1 className="font-heading text-2xl md:text-3xl text-[#2B1E17] mb-2">Sipariş Detayları</h1>
                    <p className="text-[#8B7E75]">Teslimat bilgilerinizi doldurun</p>
                </div>

                <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">

                    {/* FORMS */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* DELIVERY TIME */}
                        <div className="bg-white rounded-xl border border-[#E8E0D5] p-6">
                            <h2 className="font-semibold text-lg text-[#2B1E17] mb-4 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-[#C46A2B]" />
                                Teslimat Zamanı
                            </h2>
                            <div className="space-y-4">
                                <div className="grid sm:grid-cols-2 gap-3">
                                    {deliveryTimeOptions.map((option) => (
                                        <label
                                            key={option.value}
                                            className={`flex items-center p-3 border-2 rounded-xl cursor-pointer transition-all ${formData.deliveryTime === option.value ? 'border-[#C46A2B] bg-[#C46A2B]/5' : 'border-[#E8E0D5] hover:border-[#C46A2B]/50'}`}
                                        >
                                            <input
                                                type="radio"
                                                name="deliveryTime"
                                                value={option.value}
                                                checked={formData.deliveryTime === option.value}
                                                onChange={handleChange}
                                                className="w-4 h-4 text-[#C46A2B] focus:ring-[#C46A2B]"
                                            />
                                            <span className="ml-3 text-sm text-[#2B1E17]">{option.label}</span>
                                        </label>
                                    ))}
                                </div>

                                {formData.deliveryTime === 'custom' && (
                                    <div>
                                        <label className="block text-sm font-medium text-[#2B1E17] mb-2">
                                            Teslimat Saati Seçin <span className="text-[#C46A2B]">*</span>
                                        </label>
                                        <select
                                            name="customTime"
                                            value={formData.customTime}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-3 bg-white border rounded-xl text-[#2B1E17] outline-none transition-all ${errors.customTime ? 'border-[#C46A2B] focus:ring-2 focus:ring-[#C46A2B]/30' : 'border-[#E8E0D5] focus:ring-2 focus:ring-[#C46A2B]/30'}`}
                                        >
                                            <option value="">Saat seçin...</option>
                                            {timeOptions.map((time) => (
                                                <option key={time.value} value={time.value}>
                                                    {time.label}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.customTime && (
                                            <p className="mt-1 text-sm text-[#C46A2B] flex items-center gap-1">
                                                <AlertCircle className="w-4 h-4" />
                                                {errors.customTime}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* PAYMENT METHOD */}
                        <div className="bg-white rounded-xl border border-[#E8E0D5] p-6">
                            <h2 className="font-semibold text-lg text-[#2B1E17] mb-4 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-[#C46A2B]" />
                                Ödeme Yöntemi
                            </h2>
                            <div className="space-y-4">
                                {formData.paymentMethod === 'online_card' && (
                                    <div className="space-y-4 mt-2">
                                        <div>
                                            <label className="block text-sm font-medium text-[#2B1E17] mb-2">
                                                Kart Numarası <span className="text-[#C46A2B]">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="cardNumber"
                                                value={formData.cardNumber}
                                                onChange={(event) => {
                                                    const value = event.target.value.replace(/\s/g,'').replace(/\D/g,'');
                                                    const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
                                                    setFormData(previous => ({...previous,cardNumber: formatted}));
                                                    if (errors.cardNumber) setErrors(previous => ({...previous,cardNumber: ''}));
                                                }}
                                                placeholder="1234 5678 9012 3456"
                                                maxLength="19"
                                                className={`w-full px-4 py-3 bg-white border rounded-xl text-[#2B1E17] placeholder:text-[#8B7E75]/50 outline-none transition-all ${errors.cardNumber ? 'border-[#C46A2B] focus:ring-2 focus:ring-[#C46A2B]/30' : 'border-[#E8E0D5] focus:ring-2 focus:ring-[#C46A2B]/30'}`}
                                            />
                                            {errors.cardNumber && (
                                                <p className="mt-1 text-sm text-[#C46A2B] flex items-center gap-1">
                                                    <AlertCircle className="w-4 h-4" />
                                                    {errors.cardNumber}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[#2B1E17] mb-2">
                                                Kart Üzerindeki İsim <span className="text-[#C46A2B]">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="cardName"
                                                value={formData.cardName}
                                                onChange={handleChange}
                                                placeholder="AD SOYAD"
                                                className={`w-full px-4 py-3 bg-white border rounded-xl text-[#2B1E17] placeholder:text-[#8B7E75]/50 outline-none transition-all uppercase ${errors.cardName ? 'border-[#C46A2B] focus:ring-2 focus:ring-[#C46A2B]/30' : 'border-[#E8E0D5] focus:ring-2 focus:ring-[#C46A2B]/30'}`}
                                            />
                                            {errors.cardName && (
                                                <p className="mt-1 text-sm text-[#C46A2B] flex items-center gap-1">
                                                    <AlertCircle className="w-4 h-4" />
                                                    {errors.cardName}
                                                </p>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-[#2B1E17] mb-2">
                                                    Son Kullanma <span className="text-[#C46A2B]">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="cardExpiry"
                                                    value={formData.cardExpiry}
                                                    onChange={(event) => {
                                                        let value = event.target.value.replace(/\D/g,'');
                                                        if (value.length >= 2) {
                                                            value = value.slice(0,2) + '/' + value.slice(2,4);
                                                        }
                                                        setFormData(previous => ({...previous,cardExpiry: value}));
                                                        if (errors.cardExpiry) setErrors(previous => ({...previous,cardExpiry: ''}));
                                                    }}
                                                    placeholder="AA/YY"
                                                    maxLength="5"
                                                    className={`w-full px-4 py-3 bg-white border rounded-xl text-[#2B1E17] placeholder:text-[#8B7E75]/50 outline-none transition-all ${errors.cardExpiry ? 'border-[#C46A2B] focus:ring-2 focus:ring-[#C46A2B]/30' : 'border-[#E8E0D5] focus:ring-2 focus:ring-[#C46A2B]/30'}`}
                                                />
                                                {errors.cardExpiry && (
                                                    <p className="mt-1 text-sm text-[#C46A2B] flex items-center gap-1">
                                                        <AlertCircle className="w-4 h-4" />
                                                        {errors.cardExpiry}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-[#2B1E17] mb-2">
                                                    CVV <span className="text-[#C46A2B]">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="cardCvv"
                                                    value={formData.cardCvv}
                                                    onChange={(event) => {
                                                        const value = event.target.value.replace(/\D/g,'');
                                                        setFormData(previous => ({...previous,cardCvv: value}));
                                                        if (errors.cardCvv) setErrors(previous => ({...previous,cardCvv: ''}));
                                                    }}
                                                    placeholder="123"
                                                    maxLength="3"
                                                    className={`w-full px-4 py-3 bg-white border rounded-xl text-[#2B1E17] placeholder:text-[#8B7E75]/50 outline-none transition-all ${errors.cardCvv ? 'border-[#C46A2B] focus:ring-2 focus:ring-[#C46A2B]/30' : 'border-[#E8E0D5] focus:ring-2 focus:ring-[#C46A2B]/30'}`}
                                                />
                                                {errors.cardCvv && (
                                                    <p className="mt-1 text-sm text-[#C46A2B] flex items-center gap-1">
                                                        <AlertCircle className="w-4 h-4" />
                                                        {errors.cardCvv}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ORDER NOTE */}
                        <div className="bg-white rounded-xl border border-[#E8E0D5] p-6">
                            <h2 className="font-semibold text-lg text-[#2B1E17] mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-[#C46A2B]" />
                                Sipariş Notu (Opsiyonel)
                            </h2>
                            <textarea
                                name="orderNote"
                                value={formData.orderNote}
                                onChange={handleChange}
                                rows="3"
                                placeholder="Siparişiniz hakkında not ekleyin..."
                                className="w-full px-4 py-3 bg-white border border-[#E8E0D5] rounded-xl text-[#2B1E17] placeholder:text-[#8B7E75]/50 outline-none focus:ring-2 focus:ring-[#C46A2B]/30 resize-none transition-all"
                            />
                        </div>
                    </div>

                    {/* ORDER SUMMARY */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl border border-[#E8E0D5] p-6 sticky top-24">
                            <h2 className="font-semibold text-lg text-[#2B1E17] mb-4 flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5 text-[#C46A2B]" />
                                Sipariş Özeti
                            </h2>

                            {/* ITEMS */}
                            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                                {items.map((item) => (
                                    <div key={item.id} className="flex items-center gap-3 pb-3 border-b border-[#E8E0D5]">
                                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#F5F1EB] flex-shrink-0">
                                            <img src={item.product_image || item.image || item.image_url || '/assets/caffee-pictures/placeholder.jpg'} alt={item.name || item.product_name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-[#2B1E17] truncate">{item.name || item.product_name}</p>
                                            <p className="text-xs text-[#8B7E75]">{item.quantity}x ₺{Number(item.unit_price || 0).toFixed(2)}</p>
                                        </div>
                                        <p className="text-sm font-semibold text-[#C46A2B]">₺{(Number(item.unit_price || 0) * item.quantity).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>

                            {/* TOTALS */}
                            <div className="space-y-2 mb-6">
                                <div className="flex justify-between text-sm text-[#2B1E17]">
                                    <span>Ara Toplam</span>
                                    <span>₺{cartTotals.subtotal.toFixed(2)}</span>
                                </div>
                                {appliedCoupon && cartTotals.discount > 0 && (
                                    <div className="flex justify-between text-sm text-[#C46A2B]">
                                        <div className="flex items-center gap-1">
                                            <Tag className="w-4 h-4" />
                                            <span>{appliedCoupon.code}</span>
                                        </div>
                                        <span>-₺{cartTotals.discount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm text-[#8B7E75]">
                                    <span>KDV (%20)</span>
                                    <span>₺{cartTotals.tax.toFixed(2)}</span>
                                </div>
                                <div className="h-px bg-gradient-to-r from-[#E8E0D5]/30 via-[#C46A2B]/40 to-[#E8E0D5]/30 my-3" />
                                <div className="flex justify-between text-lg font-bold">
                                    <span className="text-[#2B1E17]">Toplam</span>
                                    <span className="text-[#C46A2B]">₺{cartTotals.total.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* SUBMIT */}
                            {errors.submit && (
                                <div className="mb-4 p-3 bg-[#C46A2B]/10 border border-[#C46A2B]/20 rounded-lg text-sm text-[#C46A2B] flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    {errors.submit}
                                </div>
                            )}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full py-3 rounded-xl font-semibold transition-all ${isSubmitting ? 'bg-[#C46A2B]/70 text-white cursor-not-allowed' : 'bg-[#C46A2B] text-white hover:bg-[#A85A24] hover:shadow-lg'}`}
                            >
                                {isSubmitting ? 'Sipariş Oluşturuluyor...' : 'Siparişi Tamamla'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </section>
    );
}

export default CheckoutSection;
