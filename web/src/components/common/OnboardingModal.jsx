import {useState, useEffect} from 'react';
import {X, Coffee, ArrowRight} from 'lucide-react';
import {getItem, setItem} from '../../constants/storage.utils.js';
import useAuthStore from '../../stores/authStore.js';
import {useNavigate} from 'react-router-dom';

function OnboardingModal() {
    const [isOpen, setIsOpen] = useState(false);
    const {isAuthenticated} = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        const hasSeen = getItem('has_seen_onboarding');
        if (!hasSeen && !isAuthenticated) {
            const timer = setTimeout(() => {
                setIsOpen(true);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isAuthenticated]);

    const handleClose = () => {
        setItem('has_seen_onboarding', 'true');
        setIsOpen(false);
    };

    const handleRegister = () => {
        handleClose();
        navigate('/register');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-200">
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-[#8B7E75] hover:text-[#2B1E17] transition-colors z-10 bg-white/50 rounded-full p-1 backdrop-blur-md"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="h-48 bg-[#F5F1EB] relative flex items-center justify-center">
                    <Coffee className="w-20 h-20 text-[#C46A2B] opacity-10 absolute" />
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center border border-[#E8E0D5] shadow-lg">
                        <Coffee className="w-12 h-12 text-[#C46A2B]" />
                    </div>
                </div>

                <div className="p-8 text-center bg-white border-t border-[#E8E0D5]">
                    <h2 className="font-heading text-2xl text-[#2B1E17] mb-3">Burne Cafe'ye Hoş Geldiniz!</h2>
                    <p className="text-[#8B7E75] mb-6">Özel indirimler, hızlı sipariş ve çok daha fazlası için hemen aramıza katılın.</p>
                    
                    <button
                        onClick={handleRegister}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#C46A2B] text-white font-semibold rounded-xl hover:bg-[#A85A24] transition-all shadow-lg hover:shadow-xl"
                    >
                        Hemen Kayıt Ol
                        <ArrowRight className="w-5 h-5" />
                    </button>
                    
                    <button
                        onClick={handleClose}
                        className="mt-4 text-sm font-medium text-[#8B7E75] hover:text-[#2B1E17] transition-colors inline-block"
                    >
                        Belki Daha Sonra
                    </button>
                </div>
            </div>
        </div>
    );
}

export default OnboardingModal;
