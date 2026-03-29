import { useEffect } from 'react';
import { MapPin, X, Loader2 } from 'lucide-react';
import useLocationStore from '../../stores/locationStore.js';
import useAuthStore from '../../stores/authStore.js';
import { useBranches } from '../../hooks/useBranches.js';

function LocationSelectionModal() {
    const { isModalOpen, closeModal, isSet, setLocation, openModal } = useLocationStore();
    const { user } = useAuthStore();
    const isStaff = user?.role === 'staff';
    const { branches, isLoading, error, refetch } = useBranches();

    useEffect(() => {
        if (!isSet && !isStaff) {
            openModal();
        }
    }, [isSet, isStaff, openModal]);

    // Modalı her açıldığında ve kapanmadığında şubeleri en güncel haliyle veritabanından çek.
    // Bu sayede admin panelinde yapılan aktif/pasife alma işlemleri sayfayı yenilemeden modalda görülür.
    useEffect(() => {
        if (isModalOpen) {
            refetch();
        }
    }, [isModalOpen, refetch]);

    if (!isModalOpen || isStaff) return null;

    const handleSelect = (branch) => {
        setLocation(branch.name, branch.city, branch.district, branch.id);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white text-left rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-200">
                {isSet && (
                    <button
                        onClick={closeModal}
                        className="absolute top-4 right-4 text-[#8B7E75] hover:text-[#2B1E17] transition-colors z-10 bg-white/50 rounded-full p-1 backdrop-blur-md cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}

                <div className="h-32 bg-[#F5F1EB] relative flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border border-[#E8E0D5] shadow-lg mb-2">
                        <MapPin className="w-8 h-8 text-[#C46A2B]" />
                    </div>
                </div>

                <div className="p-6 bg-white border-t border-[#E8E0D5] flex flex-col">
                    <h2 className="font-heading text-2xl text-[#2B1E17] mb-2 text-center">Şube Seçimi</h2>
                    <p className="text-[#8B7E75] mb-6 text-center text-sm">
                        Siparişinize devam etmek için lütfen size en uygun şubeyi seçin.
                    </p>

                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-8 h-8 text-[#C46A2B] animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="text-center text-red-500 py-4 text-sm">{error}</div>
                    ) : branches?.length === 0 ? (
                        <div className="text-center text-[#8B7E75] py-4 text-sm">Hiç şube bulunamadı.</div>
                    ) : (
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {branches.map(branch => (
                                <button
                                    key={branch.id}
                                    onClick={() => handleSelect(branch)}
                                    className="w-full flex items-start gap-4 p-4 rounded-xl border border-[#E8E0D5] hover:border-[#C46A2B]/50 hover:bg-[#C46A2B]/5 transition-all text-left group"
                                >
                                    <div className="mt-1 w-8 h-8 rounded-full bg-[#F5F1EB] group-hover:bg-white flex items-center justify-center flex-shrink-0 transition-colors">
                                        <MapPin className="w-4 h-4 text-[#C46A2B]" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-[#2B1E17]">{branch.name}</h3>
                                        <p className="text-sm text-[#8B7E75] mt-1 line-clamp-2">
                                            {branch.address || `${branch.district}, ${branch.city}`}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default LocationSelectionModal;
