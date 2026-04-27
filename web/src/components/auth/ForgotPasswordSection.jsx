import { useState } from 'react';
import { Mail, KeyRound, Lock, ArrowRight, ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import * as authService from '../../services/auth.service.js';
import useAuthStore from '../../stores/authStore.js';

function ForgotPasswordSection() {
    const { openAuthModal } = useAuthStore();

    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [email, setEmail] = useState('');
    const [resetCode, setResetCode] = useState('');
    const [temporaryToken, setTemporaryToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    /* STEP 1: Send reset code */
    const handleSendCode = async (e) => {
        e.preventDefault();
        if (!email) { setError('Lütfen e-posta adresinizi girin.'); return; }

        setIsLoading(true);
        setError('');
        try {
            await authService.forgotPassword({ email });
            setSuccess('Doğrulama kodu e-posta adresinize gönderildi.');
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.error || 'Bir hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    /* STEP 2: Verify code */
    const handleVerifyCode = async (e) => {
        e.preventDefault();
        if (!resetCode) { setError('Lütfen doğrulama kodunu girin.'); return; }

        setIsLoading(true);
        setError('');
        setSuccess('');
        try {
            const response = await authService.checkResetCode({ email, reset_code: resetCode });
            setTemporaryToken(response.temporary_token);
            setSuccess('Kod doğrulandı! Yeni şifrenizi belirleyin.');
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.error || 'Geçersiz veya süresi dolmuş kod.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!newPassword || !confirmPassword) { setError('Lütfen tüm alanları doldurun.'); return; }
        if (newPassword !== confirmPassword) { setError('Şifreler eşleşmiyor.'); return; }
        if (newPassword.length < 8) { setError('Şifre en az 8 karakter olmalıdır.'); return; }

        setIsLoading(true);
        setError('');
        setSuccess('');
        try {
            await authService.resetPassword({ password: newPassword, temporary_token: temporaryToken });
            setSuccess('Şifreniz başarıyla sıfırlandı! Giriş yapabilirsiniz.');
            setTimeout(() => openAuthModal('signIn'), 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Şifre sıfırlama başarısız.');
        } finally {
            setIsLoading(false);
        }
    };

    /* STEP INDICATOR */
    const StepIndicator = () => (
        <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                        step >= s ? 'bg-[#C46A2B] text-white' : 'bg-[#E8E0D5] text-[#8B7E75]'
                    }`}>
                        {s}
                    </div>
                    {s < 3 && <div className={`w-8 h-0.5 ${step > s ? 'bg-[#C46A2B]' : 'bg-[#E8E0D5]'}`} />}
                </div>
            ))}
        </div>
    );

    const stepTitles = {
        1: { title: 'Şifremi Unuttum', subtitle: 'Kayıtlı e-posta adresinizi girin, size bir doğrulama kodu göndereceğiz.' },
        2: { title: 'Doğrulama Kodu', subtitle: 'E-postanıza gönderilen 6 haneli kodu girin.' },
        3: { title: 'Yeni Şifre', subtitle: 'Yeni şifrenizi belirleyin.' },
    };

    return (
        <div className="w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-8">
                <StepIndicator />

                <div className="text-center mb-6">
                    <h1 className="font-heading text-2xl text-[#2B1E17] mb-2">{stepTitles[step].title}</h1>
                    <p className="text-[#8B7E75] text-sm">{stepTitles[step].subtitle}</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-[#C46A2B]/10 text-[#C46A2B] rounded-xl flex items-start gap-3 border border-[#C46A2B]/20">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-3 bg-[#6B5D4F]/10 text-[#6B5D4F] rounded-xl flex items-start gap-3 border border-[#6B5D4F]/20">
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <p className="text-sm">{success}</p>
                    </div>
                )}

                {/* STEP 1: EMAIL */}
                {step === 1 && (
                    <form onSubmit={handleSendCode} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-[#2B1E17] mb-2">E-posta Adresi</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B7E75]" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                    className="w-full pl-11 pr-4 py-3 bg-white border border-[#E8E0D5] rounded-xl text-[#2B1E17] placeholder:text-[#8B7E75]/50 focus:ring-2 focus:ring-[#C46A2B]/30 outline-none transition-all"
                                    placeholder="ornek@email.com"
                                    required
                                />
                            </div>
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#C46A2B] text-white font-semibold rounded-xl hover:bg-[#A85A24] transition-all disabled:opacity-70">
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Kod Gönder</span><ArrowRight className="w-5 h-5" /></>}
                        </button>
                    </form>
                )}

                {/* STEP 2: CODE */}
                {step === 2 && (
                    <form onSubmit={handleVerifyCode} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-[#2B1E17] mb-2">Doğrulama Kodu</label>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B7E75]" />
                                <input
                                    type="text"
                                    value={resetCode}
                                    onChange={(e) => { setResetCode(e.target.value.toUpperCase()); setError(''); }}
                                    className="w-full pl-11 pr-4 py-3 bg-white border border-[#E8E0D5] rounded-xl text-[#2B1E17] text-center text-lg tracking-[0.3em] font-bold placeholder:text-[#8B7E75]/50 placeholder:tracking-normal placeholder:text-base placeholder:font-normal focus:ring-2 focus:ring-[#C46A2B]/30 outline-none transition-all"
                                    placeholder="6 haneli kod"
                                    maxLength={6}
                                    required
                                />
                            </div>
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#C46A2B] text-white font-semibold rounded-xl hover:bg-[#A85A24] transition-all disabled:opacity-70">
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Kodu Doğrula</span><ArrowRight className="w-5 h-5" /></>}
                        </button>
                        <button type="button" onClick={() => { setStep(1); setError(''); setSuccess(''); }} className="w-full flex items-center justify-center gap-2 text-[#8B7E75] hover:text-[#C46A2B] transition-colors text-sm">
                            <ArrowLeft className="w-4 h-4" /> Geri Dön
                        </button>
                    </form>
                )}

                {/* STEP 3: NEW PASSWORD */}
                {step === 3 && (
                    <form onSubmit={handleResetPassword} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-[#2B1E17] mb-2">Yeni Şifre</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B7E75]" />
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                                    className="w-full pl-11 pr-4 py-3 bg-white border border-[#E8E0D5] rounded-xl text-[#2B1E17] placeholder:text-[#8B7E75]/50 focus:ring-2 focus:ring-[#C46A2B]/30 outline-none transition-all"
                                    placeholder="En az 8 karakter"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#2B1E17] mb-2">Şifre Tekrar</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B7E75]" />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                                    className="w-full pl-11 pr-4 py-3 bg-white border border-[#E8E0D5] rounded-xl text-[#2B1E17] placeholder:text-[#8B7E75]/50 focus:ring-2 focus:ring-[#C46A2B]/30 outline-none transition-all"
                                    placeholder="Şifrenizi tekrar girin"
                                    required
                                />
                            </div>
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#C46A2B] text-white font-semibold rounded-xl hover:bg-[#A85A24] transition-all disabled:opacity-70">
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Şifreyi Sıfırla</span><CheckCircle2 className="w-5 h-5" /></>}
                        </button>
                    </form>
                )}
            </div>

            <div className="px-8 py-5 bg-[#F5F1EB] border-t border-[#E8E0D5] text-center">
                <p className="text-[#8B7E75] text-sm flex items-center justify-center gap-1">
                    Şifrenizi hatırladınız mı?
                    <button type="button" onClick={() => openAuthModal('signIn')} className="font-semibold text-[#C46A2B] hover:text-[#A85A24] transition-colors ml-1">
                        Giriş Yapın
                    </button>
                </p>
            </div>
        </div>
    );
}

export default ForgotPasswordSection;
