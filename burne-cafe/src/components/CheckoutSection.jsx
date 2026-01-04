import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, MapPin, Clock, CreditCard, FileText, ShoppingBag, Tag, AlertCircle, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

/* INPUT FIELD COMPONENT */
const InputField = ({ name, label, icon: Icon, type = 'text', required = true, formData, errors, handleChange, ...props }) => (
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
                className={`w-full pl-11 pr-4 py-3 bg-white border rounded-xl text-[#2B1E17] placeholder:text-[#8B7E75]/50 outline-none transition-all ${errors[name] ? 'border-red-500 focus:ring-2 focus:ring-red-500/30' : 'border-[#E8E0D5] focus:ring-2 focus:ring-[#C46A2B]/30'}`}
                {...props}
            />
        </div>
        {errors[name] && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors[name]}
            </p>
        )}
    </div>
);

function CheckoutSection() {
    const navigate = useNavigate();
    const { items, cartTotals, appliedCoupon, isEmpty, createOrder } = useCart();

    /* FORM STATE */
    const [formData, setFormData] = useState({
        customerName: '',
        customerPhone: '',
        city: '',
        district: '',
        neighborhood: '',
        fullAddress: '',
        deliveryTime: 'asap',
        customTime: '',
        paymentMethod: 'cash',
        cardNumber: '',
        cardName: '',
        cardExpiry: '',
        cardCvv: '',
        orderNote: ''
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [smsCode, setSmsCode] = useState('');
    const [pendingOrder, setPendingOrder] = useState(null);

    /* DELIVERY TIME OPTIONS */
    const deliveryTimeOptions = [
        { value: 'asap', label: 'Şimdi (15-20 dk)' },
        { value: 'custom', label: 'Belirli Bir Saat' }
    ];

    /* GENERATE TIME OPTIONS */
    const generateTimeOptions = () => {
        const options = [];
        const now = new Date();
        const currentHour = now.getHours();

        for (let hour = currentHour + 1; hour < 24; hour++) {
            const displayHour = String(hour).padStart(2, '0');
            options.push({
                value: `${hour}:00`,
                label: `${displayHour}:00`
            });
            options.push({
                value: `${hour}:30`,
                label: `${displayHour}:30`
            });
        }
        return options;
    };

    const timeOptions = generateTimeOptions();

    /* PAYMENT METHOD OPTIONS */
    const paymentMethods = [
        { value: 'cash', label: 'Kapıda Nakit Ödeme', icon: CreditCard },
        { value: 'card_on_delivery', label: 'Kapıda Kredi Kartı', icon: CreditCard },
        { value: 'online_card', label: 'Online Kredi Kartı ile Ödeme', icon: CreditCard }
    ];

    /* HANDLE INPUT CHANGE */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    /* FORM VALIDATION */
    const validateForm = () => {
        const newErrors = {};

        if (!formData.customerName.trim()) newErrors.customerName = 'İsim gereklidir';
        if (!formData.customerPhone.trim()) {
            newErrors.customerPhone = 'Telefon numarası gereklidir';
        } else if (!/^[0-9]{10}$/.test(formData.customerPhone.replace(/[-]/g, ''))) {
            newErrors.customerPhone = 'Geçerli bir telefon numarası girin (10 haneli)';
        }
        if (!formData.city.trim()) newErrors.city = 'Şehir gereklidir';
        if (!formData.district.trim()) newErrors.district = 'İlçe gereklidir';
        if (!formData.neighborhood.trim()) newErrors.neighborhood = 'Mahalle gereklidir';
        if (!formData.fullAddress.trim()) newErrors.fullAddress = 'Adres gereklidir';

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

    /* HANDLE SUBMIT */
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setIsSubmitting(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 1000));

            // If online card payment, show verification modal
            if (formData.paymentMethod === 'online_card') {
                setPendingOrder(formData);
                setShowPaymentModal(true);
                setIsSubmitting(false);
            } else {
                const order = createOrder(formData);
                navigate('/order-confirmation', { state: { orderId: order.id } });
            }
        } catch (error) {
            console.error('Order creation failed:', error);
            setErrors({ submit: 'Sipariş oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.' });
            setIsSubmitting(false);
        }
    };

    /* HANDLE PAYMENT VERIFICATION */
    const handlePaymentVerification = async () => {
        if (!smsCode || smsCode.length !== 6) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 1500));

            const order = createOrder(pendingOrder);
            setShowPaymentModal(false);
            setSmsCode('');
            setPendingOrder(null);
            navigate('/order-confirmation', { state: { orderId: order.id } });
        } catch (error) {
            console.error('Payment verification failed:', error);
            setIsSubmitting(false);
        }
    };

    /* EMPTY CART STATE */
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

    /* MAIN RENDER */
    return (
        <section className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* HEADER */}
                <div className="mb-8">
                    <h1 className="font-heading text-2xl md:text-3xl text-[#2B1E17] mb-2">Sipariş Detayları</h1>
                    <p className="text-[#8B7E75]">Teslimat bilgilerinizi doldurun</p>
                </div>

                <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
                    {/* LEFT COLUMN - FORMS */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* CUSTOMER INFO */}
                        <div className="bg-white rounded-xl border border-[#E8E0D5] p-6">
                            <h2 className="font-semibold text-lg text-[#2B1E17] mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-[#C46A2B]" />
                                Müşteri Bilgileri
                            </h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <InputField name="customerName" label="Ad Soyad" icon={User} placeholder="Adınız ve soyadınız" formData={formData} errors={errors} handleChange={handleChange} />
                                <div>
                                    <label htmlFor="customerPhone" className="block text-sm font-medium text-[#2B1E17] mb-2">
                                        Telefon <span className="text-[#C46A2B]">*</span>
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B7E75]" />
                                        <input
                                            id="customerPhone"
                                            name="customerPhone"
                                            type="tel"
                                            value={formData.customerPhone}
                                            onChange={(e) => {
                                                let value = e.target.value.replace(/\D/g, '');
                                                if (value.length > 10) value = value.slice(0, 10);
                                                if (value.length > 3 && value.length <= 6) {
                                                    value = value.slice(0, 3) + '-' + value.slice(3);
                                                } else if (value.length > 6) {
                                                    value = value.slice(0, 3) + '-' + value.slice(3, 6) + '-' + value.slice(6);
                                                }
                                                setFormData(prev => ({ ...prev, customerPhone: value }));
                                                if (errors.customerPhone) setErrors(prev => ({ ...prev, customerPhone: '' }));
                                            }}
                                            placeholder="5XX-XXX-XXXX"
                                            maxLength="12"
                                            className={`w-full pl-11 pr-4 py-3 bg-white border rounded-xl text-[#2B1E17] placeholder:text-[#8B7E75]/50 outline-none transition-all ${errors.customerPhone ? 'border-red-500 focus:ring-2 focus:ring-red-500/30' : 'border-[#E8E0D5] focus:ring-2 focus:ring-[#C46A2B]/30'}`}
                                        />
                                    </div>
                                    {errors.customerPhone && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.customerPhone}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ADDRESS INFO */}
                        <div className="bg-white rounded-xl border border-[#E8E0D5] p-6">
                            <h2 className="font-semibold text-lg text-[#2B1E17] mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-[#C46A2B]" />
                                Teslimat Adresi
                            </h2>
                            <div className="space-y-4">
                                <div className="grid sm:grid-cols-3 gap-4">
                                    <InputField name="city" label="Şehir" icon={MapPin} placeholder="İstanbul" formData={formData} errors={errors} handleChange={handleChange} />
                                    <InputField name="district" label="İlçe" icon={MapPin} placeholder="Kadıköy" formData={formData} errors={errors} handleChange={handleChange} />
                                    <InputField name="neighborhood" label="Mahalle" icon={MapPin} placeholder="Moda" formData={formData} errors={errors} handleChange={handleChange} />
                                </div>
                                <div>
                                    <label htmlFor="fullAddress" className="block text-sm font-medium text-[#2B1E17] mb-2">
                                        Tam Adres <span className="text-[#C46A2B]">*</span>
                                    </label>
                                    <textarea
                                        id="fullAddress"
                                        name="fullAddress"
                                        value={formData.fullAddress}
                                        onChange={handleChange}
                                        rows="3"
                                        placeholder="Sokak, bina no, kat, daire no..."
                                        className={`w-full px-4 py-3 bg-white border rounded-xl text-[#2B1E17] placeholder:text-[#8B7E75]/50 outline-none resize-none transition-all ${errors.fullAddress ? 'border-red-500 focus:ring-2 focus:ring-red-500/30' : 'border-[#E8E0D5] focus:ring-2 focus:ring-[#C46A2B]/30'}`}
                                    />
                                    {errors.fullAddress && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.fullAddress}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

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

                                {/* CUSTOM TIME PICKER */}
                                {formData.deliveryTime === 'custom' && (
                                    <div>
                                        <label className="block text-sm font-medium text-[#2B1E17] mb-2">
                                            Teslimat Saati Seçin <span className="text-[#C46A2B]">*</span>
                                        </label>
                                        <select
                                            name="customTime"
                                            value={formData.customTime}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-3 bg-white border rounded-xl text-[#2B1E17] outline-none transition-all ${errors.customTime ? 'border-red-500 focus:ring-2 focus:ring-red-500/30' : 'border-[#E8E0D5] focus:ring-2 focus:ring-[#C46A2B]/30'}`}
                                        >
                                            <option value="">Saat seçin...</option>
                                            {timeOptions.map((time) => (
                                                <option key={time.value} value={time.value}>
                                                    {time.label}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.customTime && (
                                            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
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
                                {paymentMethods.map((method) => (
                                    <label
                                        key={method.value}
                                        className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${formData.paymentMethod === method.value ? 'border-[#C46A2B] bg-[#C46A2B]/5' : 'border-[#E8E0D5] hover:border-[#C46A2B]/50'}`}
                                    >
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value={method.value}
                                            checked={formData.paymentMethod === method.value}
                                            onChange={handleChange}
                                            className="w-4 h-4 text-[#C46A2B] focus:ring-[#C46A2B]"
                                        />
                                        <method.icon className="ml-3 w-5 h-5 text-[#8B7E75]" />
                                        <span className="ml-3 text-sm text-[#2B1E17] font-medium">{method.label}</span>
                                    </label>
                                ))}

                                {/* ONLINE CARD DETAILS */}
                                {formData.paymentMethod === 'online_card' && (
                                    <div className="mt-4 p-4 bg-[#F5F1EB] rounded-xl space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-[#2B1E17] mb-2">
                                                Kart Numarası <span className="text-[#C46A2B]">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="cardNumber"
                                                value={formData.cardNumber}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
                                                    const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
                                                    setFormData(prev => ({ ...prev, cardNumber: formatted }));
                                                    if (errors.cardNumber) setErrors(prev => ({ ...prev, cardNumber: '' }));
                                                }}
                                                placeholder="1234 5678 9012 3456"
                                                maxLength="19"
                                                className={`w-full px-4 py-3 bg-white border rounded-xl text-[#2B1E17] placeholder:text-[#8B7E75]/50 outline-none transition-all ${errors.cardNumber ? 'border-red-500 focus:ring-2 focus:ring-red-500/30' : 'border-[#E8E0D5] focus:ring-2 focus:ring-[#C46A2B]/30'}`}
                                            />
                                            {errors.cardNumber && (
                                                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
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
                                                className={`w-full px-4 py-3 bg-white border rounded-xl text-[#2B1E17] placeholder:text-[#8B7E75]/50 outline-none transition-all uppercase ${errors.cardName ? 'border-red-500 focus:ring-2 focus:ring-red-500/30' : 'border-[#E8E0D5] focus:ring-2 focus:ring-[#C46A2B]/30'}`}
                                            />
                                            {errors.cardName && (
                                                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
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
                                                    onChange={(e) => {
                                                        let value = e.target.value.replace(/\D/g, '');
                                                        if (value.length >= 2) {
                                                            value = value.slice(0, 2) + '/' + value.slice(2, 4);
                                                        }
                                                        setFormData(prev => ({ ...prev, cardExpiry: value }));
                                                        if (errors.cardExpiry) setErrors(prev => ({ ...prev, cardExpiry: '' }));
                                                    }}
                                                    placeholder="AA/YY"
                                                    maxLength="5"
                                                    className={`w-full px-4 py-3 bg-white border rounded-xl text-[#2B1E17] placeholder:text-[#8B7E75]/50 outline-none transition-all ${errors.cardExpiry ? 'border-red-500 focus:ring-2 focus:ring-red-500/30' : 'border-[#E8E0D5] focus:ring-2 focus:ring-[#C46A2B]/30'}`}
                                                />
                                                {errors.cardExpiry && (
                                                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
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
                                                    onChange={(e) => {
                                                        const value = e.target.value.replace(/\D/g, '');
                                                        setFormData(prev => ({ ...prev, cardCvv: value }));
                                                        if (errors.cardCvv) setErrors(prev => ({ ...prev, cardCvv: '' }));
                                                    }}
                                                    placeholder="123"
                                                    maxLength="3"
                                                    className={`w-full px-4 py-3 bg-white border rounded-xl text-[#2B1E17] placeholder:text-[#8B7E75]/50 outline-none transition-all ${errors.cardCvv ? 'border-red-500 focus:ring-2 focus:ring-red-500/30' : 'border-[#E8E0D5] focus:ring-2 focus:ring-[#C46A2B]/30'}`}
                                                />
                                                {errors.cardCvv && (
                                                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
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

                    {/* RIGHT COLUMN - ORDER SUMMARY */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl border border-[#E8E0D5] p-6 sticky top-24">
                            <h2 className="font-semibold text-lg text-[#2B1E17] mb-4 flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5 text-[#C46A2B]" />
                                Sipariş Özeti
                            </h2>

                            {/* ORDER ITEMS */}
                            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                                {items.map((item) => (
                                    <div key={item.itemId} className="flex items-center gap-3 pb-3 border-b border-[#E8E0D5]">
                                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#F5F1EB] flex-shrink-0">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-[#2B1E17] truncate">{item.name}</p>
                                            <p className="text-xs text-[#8B7E75]">{item.quantity}x ₺{item.unitPrice.toFixed(2)}</p>
                                        </div>
                                        <p className="text-sm font-semibold text-[#C46A2B]">₺{(item.unitPrice * item.quantity).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>

                            {/* PRICE SUMMARY */}
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

                            {/* SUBMIT BUTTON */}
                            {errors.submit && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
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

                {/* PAYMENT VERIFICATION MODAL */}
                {showPaymentModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl max-w-md w-full p-6 relative animate-fade-in">
                            {/* CLOSE BUTTON */}
                            <button
                                onClick={() => {
                                    setShowPaymentModal(false);
                                    setSmsCode('');
                                    setPendingOrder(null);
                                    setIsSubmitting(false);
                                }}
                                className="absolute top-4 right-4 p-2 hover:bg-[#F5F1EB] rounded-lg transition-colors"
                                disabled={isSubmitting}
                            >
                                <X className="w-5 h-5 text-[#8B7E75]" />
                            </button>

                            {/* HEADER */}
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#C46A2B]/10 flex items-center justify-center">
                                    <CreditCard className="w-8 h-8 text-[#C46A2B]" />
                                </div>
                                <h2 className="font-heading text-2xl text-[#2B1E17] mb-2">Ödeme Onayı</h2>
                                <p className="text-[#8B7E75] text-sm">Kartınızdan <span className="font-bold text-[#C46A2B]">₺{cartTotals.total.toFixed(2)}</span> çekilecektir</p>
                            </div>

                            {/* SMS INFO */}
                            <div className="bg-[#F5F1EB] rounded-xl p-4 mb-4">
                                <p className="text-sm text-[#2B1E17] mb-2">
                                    Telefonunuza gönderilen 6 haneli kodu girin
                                </p>
                                <p className="text-xs text-[#8B7E75]">
                                    Kod gönderildi: <span className="font-semibold text-[#C46A2B]">{formData.customerPhone}</span>
                                </p>
                            </div>

                            {/* SMS CODE INPUT */}
                            <div className="mb-6">
                                <input
                                    type="text"
                                    value={smsCode}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '');
                                        if (value.length <= 6) {
                                            setSmsCode(value);
                                        }
                                    }}
                                    placeholder="000000"
                                    maxLength="6"
                                    className="w-full px-4 py-4 text-center text-2xl tracking-widest font-bold bg-white border-2 border-[#E8E0D5] rounded-xl text-[#2B1E17] placeholder:text-[#8B7E75]/30 outline-none focus:ring-2 focus:ring-[#C46A2B]/30 focus:border-[#C46A2B] transition-all"
                                    autoFocus
                                    disabled={isSubmitting}
                                />
                            </div>

                            {/* VERIFY BUTTON */}
                            <button
                                onClick={handlePaymentVerification}
                                disabled={smsCode.length !== 6 || isSubmitting}
                                className={`w-full py-4 rounded-xl font-semibold transition-all ${smsCode.length === 6 && !isSubmitting
                                    ? 'bg-[#C46A2B] text-white hover:bg-[#A85A24] hover:shadow-lg'
                                    : 'bg-[#E8E0D5] text-[#8B7E75] cursor-not-allowed'
                                    }`}
                            >
                                {isSubmitting ? 'Onaylanıyor...' : 'Ödemeyi Onayla'}
                            </button>

                            {/* HELPER TEXT */}
                            <p className="text-xs text-center text-[#8B7E75] mt-4">
                                Kodu almadınız mı? <button className="text-[#C46A2B] font-semibold hover:underline">Tekrar gönder</button>
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}

export default CheckoutSection;
