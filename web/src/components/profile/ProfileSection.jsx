import { useState, useEffect } from 'react';
import { User, Mail, Phone, Lock, Save, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import useAuthStore from '../../stores/authStore.js';

function ProfileSection() {
    const { user, updateProfile, isLoading } = useAuthStore();
    
    const [formData, setFormData] = useState({
        fullname: '',
        email: '',
        phone: '',
        currentPassword: '',
        newPassword: '',
    });

    const [status, setStatus] = useState({ type: '', message: '' });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                fullname: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
            }));
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (status.message) setStatus({ type: '', message: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.fullname || !formData.phone) {
            setStatus({ type: 'error', message: 'Lütfen zorunlu alanları (Ad Soyad, Telefon) doldurun.' });
            return;
        }

        const dataToUpdate = {
            fullname: formData.fullname,
            phone: formData.phone,
        };

        // If trying to update password
        if (formData.newPassword) {
            if (!formData.currentPassword) {
                setStatus({ type: 'error', message: 'Şifrenizi güncellemek için mevcut şifrenizi girmelisiniz.' });
                return;
            }
            if (formData.newPassword.length < 8) {
                setStatus({ type: 'error', message: 'Yeni şifreniz en az 8 karakter olmalıdır.' });
                return;
            }
            dataToUpdate.currentPassword = formData.currentPassword;
            dataToUpdate.newPassword = formData.newPassword;
        }

        const result = await updateProfile(dataToUpdate);
        
        if (result.success) {
            setStatus({ type: 'success', message: 'Profiliniz başarıyla güncellendi.' });
            setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
            
            // Clear message after 3 seconds
            setTimeout(() => setStatus({ type: '', message: '' }), 3000);
        } else {
            setStatus({ type: 'error', message: result.message });
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 mt-16">
            <div className="mb-8">
                <h1 className="text-3xl font-heading font-bold text-[#2B1E17] mb-2">Profilim</h1>
                <p className="text-[#8B7E75]">Kişisel bilgilerinizi ve hesap tercihlerinizi yönetin.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-[#E8E0D5] overflow-hidden">
                <div className="p-8">
                    {status.message && (
                        <div className={`mb-8 p-4 rounded-xl flex items-start gap-3 border ${
                            status.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                            {status.type === 'success' ? (
                                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            ) : (
                                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            )}
                            <p className="text-sm font-medium">{status.message}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* PERSONAL INFO */}
                        <div>
                            <h3 className="text-lg font-semibold text-[#2B1E17] mb-4 pb-2 border-b border-[#E8E0D5]">Kişisel Bilgiler</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                            className="w-full pl-11 pr-4 py-3 bg-white border border-[#E8E0D5] rounded-xl text-[#2B1E17] focus:ring-2 focus:ring-[#C46A2B]/30 outline-none transition-all"
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
                                            className="w-full pl-11 pr-4 py-3 bg-white border border-[#E8E0D5] rounded-xl text-[#2B1E17] focus:ring-2 focus:ring-[#C46A2B]/30 outline-none transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-[#2B1E17] mb-2 cursor-not-allowed opacity-70">
                                        E-posta Adresi (Değiştirilemez)
                                    </label>
                                    <div className="relative opacity-70">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B7E75]" />
                                        <input
                                            type="email"
                                            value={formData.email}
                                            className="w-full pl-11 pr-4 py-3 bg-[#F5F1EB] border border-[#E8E0D5] rounded-xl text-[#8B7E75] cursor-not-allowed"
                                            disabled
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SECURITY */}
                        <div>
                            <h3 className="text-lg font-semibold text-[#2B1E17] mb-4 pb-2 border-b border-[#E8E0D5]">Güvenlik (İsteğe Bağlı)</h3>
                            <p className="text-sm text-[#8B7E75] mb-4">Şifrenizi değiştirmek istemiyorsanız bu alanları boş bırakabilirsiniz.</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-[#2B1E17] mb-2">
                                        Mevcut Şifre
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B7E75]" />
                                        <input
                                            type="password"
                                            name="currentPassword"
                                            value={formData.currentPassword}
                                            onChange={handleChange}
                                            className="w-full pl-11 pr-4 py-3 bg-white border border-[#E8E0D5] rounded-xl text-[#2B1E17] focus:ring-2 focus:ring-[#C46A2B]/30 outline-none transition-all"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#2B1E17] mb-2">
                                        Yeni Şifre
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B7E75]" />
                                        <input
                                            type="password"
                                            name="newPassword"
                                            value={formData.newPassword}
                                            onChange={handleChange}
                                            className="w-full pl-11 pr-4 py-3 bg-white border border-[#E8E0D5] rounded-xl text-[#2B1E17] focus:ring-2 focus:ring-[#C46A2B]/30 outline-none transition-all"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex items-center gap-2 px-8 py-3 bg-[#C46A2B] text-white font-semibold rounded-xl hover:bg-[#A85A24] transition-all disabled:opacity-70 shadow-lg shadow-[#C46A2B]/20"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Değişiklikleri Kaydet
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ProfileSection;
