import { useEffect } from 'react';
import { X } from 'lucide-react';
import useAuthStore from '../../stores/authStore.js';
import SignInSection from './SignInSection';
import SignUpSection from './SignUpSection';

function AuthModal() {
    const { authModalView, closeAuthModal } = useAuthStore();

    useEffect(() => {
        if (authModalView) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [authModalView]);

    if (!authModalView) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Background click to close */}
            <div className="absolute inset-0" onClick={closeAuthModal}></div>

            <div className="relative w-full max-w-md animate-in zoom-in-95 duration-200 z-10">
                <button
                    onClick={closeAuthModal}
                    className="absolute -top-3 -right-3 text-[#8B7E75] hover:text-[#2B1E17] transition-colors z-50 bg-white rounded-full p-1.5 shadow-lg cursor-pointer border border-[#E8E0D5]"
                >
                    <X className="w-5 h-5" />
                </button>
                
                {authModalView === 'signIn' && <SignInSection />}
                {authModalView === 'signUp' && <SignUpSection />}
            </div>
        </div>
    );
}

export default AuthModal;
