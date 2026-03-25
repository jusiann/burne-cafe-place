import { useState } from 'react';
import { Mail, Lock, User, Phone, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import useAuthStore from '../../stores/authStore.js';

function SignUpSection() {
    const { signUp, isLoading, openAuthModal, closeAuthModal } = useAuthStore();

    const [formData, setFormData] = useState({
        fullname: '',
        phone: '',
        email: '',
        password: '',
    });

    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.fullname || !formData.phone || !formData.email || !formData.password) {
            setError('Lütfen tüm alanları doldurun.');
            return;
        }

        const result = await signUp(formData);

        if (result.success) {
            closeAuthModal();
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-8">
                <div className="text-center mb-8">
                    <h1 className="font-heading text-3xl text-[#2B1E17] mb-2">Kayıt Ol</h1>
                    <p className="text-[#8B7E75]">Aramıza katılın ve sipariş vermeye başlayın.</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-[#C46A2B]/10 text-[#C46A2B] rounded-xl flex items-start gap-3 border border-[#C46A2B]/20">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-[#2B1E17] mb-2">
                            Ad Soyad
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B7E75]" />
                            <input
                                type="text"
                                name="fullname"
                                value={formData.fullname}
                                onChange={handleChange}
                                className="w-full pl-11 pr-4 py-3 bg-white border border-[#E8E0D5] rounded-xl text-[#2B1E17] placeholder:text-[#8B7E75]/50 focus:ring-2 focus:ring-[#C46A2B]/30 outline-none transition-all"
                                placeholder="Adınız Soyadınız"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#2B1E17] mb-2">
                            Telefon Numarası
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B7E75]" />
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full pl-11 pr-4 py-3 bg-white border border-[#E8E0D5] rounded-xl text-[#2B1E17] placeholder:text-[#8B7E75]/50 focus:ring-2 focus:ring-[#C46A2B]/30 outline-none transition-all"
                                placeholder="05XXXXXXXXX"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#2B1E17] mb-2">
                            E-posta Adresi
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B7E75]" />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full pl-11 pr-4 py-3 bg-white border border-[#E8E0D5] rounded-xl text-[#2B1E17] placeholder:text-[#8B7E75]/50 focus:ring-2 focus:ring-[#C46A2B]/30 outline-none transition-all"
                                placeholder="ornek@email.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#2B1E17] mb-2">
                            Şifre
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B7E75]" />
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full pl-11 pr-4 py-3 bg-white border border-[#E8E0D5] rounded-xl text-[#2B1E17] placeholder:text-[#8B7E75]/50 focus:ring-2 focus:ring-[#C46A2B]/30 outline-none transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <p className="mt-2 text-xs text-[#8B7E75]">En az 8 karakter, 1 büyük harf, 1 küçük harf ve 1 rakam içermelidir.</p>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#C46A2B] text-white font-semibold rounded-xl hover:bg-[#A85A24] transition-all disabled:opacity-70 mt-4"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                Kayıt Ol
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>
            </div>

            <div className="px-8 py-6 bg-[#F5F1EB] border-t border-[#E8E0D5] text-center">
                <p className="text-[#8B7E75] text-sm gap-1 flex items-center justify-center">
                    Zaten hesabınız var mı?
                    <button type="button" onClick={() => openAuthModal('signIn')} className="font-semibold text-[#C46A2B] hover:text-[#A85A24] transition-colors ml-1">
                        Giriş Yapın
                    </button>
                </p>
            </div>
        </div>
    );
}

export default SignUpSection;
