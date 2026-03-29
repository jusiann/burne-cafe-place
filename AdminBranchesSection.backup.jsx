import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Plus, Edit2, Trash2, UserPlus, ChevronDown, ChevronRight, X, Loader2, Shield, MapPin, Store } from 'lucide-react';

export default function AdminBranchesSection() {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [expandedBranch, setExpandedBranch] = useState(null);
    const [staffData, setStaffData] = useState({});
    const [staffLoading, setStaffLoading] = useState({});
    const [staffError, setStaffError] = useState({});

    const [modalState, setModalState] = useState({ isOpen: false, mode: 'create', data: null });
    const [modalError, setModalError] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);

    const [formData, setFormData] = useState({ name: '', city: '', district: '', address: '' });

    const [inlineStaffForm, setInlineStaffForm] = useState(null); // branchId
    const [staffFormData, setStaffFormData] = useState({ name: '', email: '', phone: '', password: '' });
    const [staffFormError, setStaffFormError] = useState(null);
    const [staffFormLoading, setStaffFormLoading] = useState(false);

    const fetchBranches = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.get('/admin/branches');
            setBranches(data || []);
        } catch (err) {
            setError(err.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchStaff = async (branchId) => {
        setStaffLoading((prev) => ({ ...prev, [branchId]: true }));
        setStaffError((prev) => ({ ...prev, [branchId]: null }));
        try {
            const { data } = await api.get(`/admin/branches/${branchId}/staff`);
            setStaffData((prev) => ({ ...prev, [branchId]: data || [] }));
        } catch (err) {
            setStaffError((prev) => ({ ...prev, [branchId]: err.response?.data?.error || err.message }));
        } finally {
            setStaffLoading((prev) => ({ ...prev, [branchId]: false }));
        }
    };

    useEffect(() => {
        fetchBranches();
    }, []);

    const toggleBranchAccordion = (branchId) => {
        if (expandedBranch === branchId) {
            setExpandedBranch(null);
        } else {
            setExpandedBranch(branchId);
            if (!staffData[branchId]) {
                fetchStaff(branchId);
            }
        }
    };

    const handleOpenModal = (mode, branch = null) => {
        setModalState({ isOpen: true, mode, data: branch });
        setModalError(null);
        if (mode === 'edit' && branch) {
            setFormData({
                name: branch.name || '',
                city: branch.city || '',
                district: branch.district || '',
                address: branch.address || ''
            });
        } else {
            setFormData({ name: '', city: '', district: '', address: '' });
        }
    };

    const handleCloseModal = () => {
        setModalState({ isOpen: false, mode: 'create', data: null });
        setFormData({ name: '', city: '', district: '', address: '' });
        setModalError(null);
    };

    const handleBranchSubmit = async (e) => {
        e.preventDefault();
        setModalLoading(true);
        setModalError(null);
        try {
            if (modalState.mode === 'create') {
                await api.post('/admin/branches', formData);
            } else if (modalState.mode === 'edit') {
                await api.put(`/admin/branches/${modalState.data.id}`, formData);
            }
            await fetchBranches();
            handleCloseModal();
        } catch (err) {
            setModalError(err.response?.data?.error || err.message);
        } finally {
            setModalLoading(false);
        }
    };

    const handleToggleBranchStatus = async (branchId, currentStatus) => {
        try {
            setBranches((prev) => prev.map((b) => (b.id === branchId ? { ...b, is_active: !b.is_active } : b)));
            await api.patch(`/admin/branches/${branchId}/status`, { is_active: !currentStatus });
        } catch (err) {
            setBranches((prev) => prev.map((b) => (b.id === branchId ? { ...b, is_active: currentStatus } : b)));
            setError(err.response?.data?.error || err.message);
        }
    };

    const handleDeleteBranch = async (branchId) => {
        if (!window.confirm('Bu şubeyi silmek istediğinize emin misiniz?')) return;
        try {
            await api.delete(`/admin/branches/${branchId}`);
            setBranches((prev) => prev.filter((b) => b.id !== branchId));
            if (expandedBranch === branchId) setExpandedBranch(null);
        } catch (err) {
            setError(err.response?.data?.error || err.message);
        }
    };

    const handleRemoveStaffBranch = async (staffId, branchId) => {
        if (!window.confirm('Bu personeli şubeden çıkarmak istediğinize emin misiniz?')) return;
        try {
            await api.patch(`/admin/staff/${staffId}/branch`, { branch_id: null });
            await fetchStaff(branchId);
            await fetchBranches();
        } catch (err) {
            console.error(err);
            setStaffError((prev) => ({ ...prev, [branchId]: err.response?.data?.error || err.message }));
        }
    };

    const handleToggleStaffStatus = async (staffId, branchId, currentStatus) => {
        try {
            setStaffData((prev) => ({
                ...prev,
                [branchId]: prev[branchId].map((s) => (s.id === staffId ? { ...s, is_active: !s.is_active } : s))
            }));
            await api.patch(`/admin/staff/${staffId}/status`, { is_active: !currentStatus });
        } catch (err) {
            setStaffData((prev) => ({
                ...prev,
                [branchId]: prev[branchId].map((s) => (s.id === staffId ? { ...s, is_active: currentStatus } : s))
            }));
            setStaffError((prev) => ({ ...prev, [branchId]: err.response?.data?.error || err.message }));
        }
    };

    const handleOpenInlineStaffForm = (branchId) => {
        setInlineStaffForm(branchId);
        setStaffFormData({ name: '', email: '', phone: '', password: '' });
        setStaffFormError(null);
    };

    const handleCloseInlineStaffForm = () => {
        setInlineStaffForm(null);
        setStaffFormData({ name: '', email: '', phone: '', password: '' });
        setStaffFormError(null);
    };

    const handleStaffSubmit = async (e, branchId) => {
        e.preventDefault();
        setStaffFormLoading(true);
        setStaffFormError(null);
        try {
            await api.post('/admin/staff', { ...staffFormData, branch_id: branchId });
            await fetchStaff(branchId);
            await fetchBranches();
            handleCloseInlineStaffForm();
        } catch (err) {
            setStaffFormError(err.response?.data?.error || err.message);
        } finally {
            setStaffFormLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 mt-16">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-[#2B1E17] mb-2 flex items-center">
                        <Store className="mr-3 text-[#C46A2B]" size={32} />
                        Şube Yönetimi
                    </h1>
                    <p className="text-[#8B7E75]">Şubelerinizi ve personellerini buradan yönetebilirsiniz.</p>
                </div>
                <button
                    onClick={() => handleOpenModal('create')}
                    className="bg-[#C46A2B] hover:bg-[#A85A24] text-white px-5 py-2.5 rounded-xl transition-all duration-300 font-medium flex items-center justify-center shadow-sm"
                >
                    <Plus size={20} className="mr-2" />
                    Yeni Şube Ekle
                </button>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 mb-6 flex items-start">
                    <div className="mr-3 mt-0.5">⚠️</div>
                    <div>{error}</div>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="w-8 h-8 animate-spin text-[#C46A2B]" />
                </div>
            ) : (
                <div className="flex flex-col space-y-4">
                    {branches.map((branch) => {
                        const isExpanded = expandedBranch === branch.id;
                        return (
                            <div key={branch.id} className="bg-white rounded-2xl shadow-sm border border-[#E8E0D5] overflow-hidden transition-all duration-300">
                                <div 
                                    className={`flex flex-col md:flex-row md:items-center justify-between p-5 cursor-pointer hover:bg-[#F8F6F4]/50 transition-colors ${isExpanded ? 'bg-[#F8F6F4]/50' : ''}`} 
                                    onClick={() => toggleBranchAccordion(branch.id)}
                                >
                                    <div className="flex items-center space-x-4 mb-4 md:mb-0">
                                        <div className="text-[#C46A2B]">
                                            {isExpanded ? <ChevronDown size={24} /> : <ChevronRight size={24} />}
                                        </div>
                                        <div>
                                            <h3 className="font-heading font-bold text-lg text-[#2B1E17]">{branch.name}</h3>
                                            <div className="flex items-center text-sm text-[#8B7E75] mt-1 space-x-3">
                                                <span className="flex items-center"><MapPin size={14} className="mr-1" /> {branch.city} / {branch.district}</span>
                                                <span className="flex items-center"><UserPlus size={14} className="mr-1" /> {branch.staff_count || 0} Personel</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0" onClick={(e) => e.stopPropagation()}>
                                        <div className={`px-4 py-1.5 rounded-full text-xs font-semibold mr-2 ${branch.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {branch.is_active ? 'Aktif' : 'Pasif'}
                                        </div>
                                        
                                        <button 
                                            onClick={() => handleToggleBranchStatus(branch.id, branch.is_active)} 
                                            className="px-3 py-1.5 text-sm rounded-lg border border-[#E8E0D5] text-[#4A3B32] hover:bg-gray-50 flex items-center whitespace-nowrap"
                                        >
                                            <Shield size={16} className="mr-1.5" /> Durum
                                        </button>
                                        <button 
                                            onClick={() => handleOpenModal('edit', branch)} 
                                            className="px-3 py-1.5 text-sm rounded-lg border border-[#E8E0D5] text-[#4A3B32] hover:bg-gray-50 flex items-center whitespace-nowrap"
                                        >
                                            <Edit2 size={16} className="mr-1.5" /> Düzenle
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteBranch(branch.id)} 
                                            className="px-3 py-1.5 text-sm rounded-lg border border-red-200 text-red-600 hover:bg-red-50 flex items-center whitespace-nowrap"
                                        >
                                            <Trash2 size={16} className="mr-1.5" /> Sil
                                        </button>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="bg-[#F8F6F4]/30 border-t border-[#E8E0D5] p-6 lg:pl-16">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="font-heading font-semibold text-lg text-[#2B1E17]">Şube Personelleri</h3>
                                            {inlineStaffForm !== branch.id && (
                                                <button 
                                                    onClick={() => handleOpenInlineStaffForm(branch.id)} 
                                                    className="text-sm bg-white border border-[#E8E0D5] text-[#4A3B32] rounded-xl px-4 py-2 hover:bg-gray-50 flex items-center shadow-sm"
                                                >
                                                    <Plus size={16} className="mr-1.5" />
                                                    Personel Ekle
                                                </button>
                                            )}
                                        </div>

                                        {staffError[branch.id] && (
                                            <div className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg">{staffError[branch.id]}</div>
                                        )}

                                        {staffLoading[branch.id] ? (
                                            <div className="flex justify-center py-4">
                                                <Loader2 className="w-6 h-6 animate-spin text-[#C46A2B]" />
                                            </div>
                                        ) : (
                                            <div className="flex flex-col space-y-3 mb-4">
                                                {(staffData[branch.id] || []).length === 0 ? (
                                                    <div className="text-sm text-[#8B7E75] bg-white p-4 rounded-xl border border-[#E8E0D5] text-center">Bu şubeye atanmış personel bulunmuyor.</div>
                                                ) : (
                                                    (staffData[branch.id] || []).map((staff) => (
                                                        <div key={staff.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-[#E8E0D5] p-4 rounded-xl shadow-sm">
                                                            <div className="flex items-center space-x-4 mb-3 sm:mb-0">
                                                                <div className="bg-[#F8F6F4] p-2 rounded-full text-[#C46A2B]">
                                                                    <UserPlus size={18} />
                                                                </div>
                                                                <div>
                                                                    <div className="font-medium text-[#2B1E17]">{staff.name}</div>
                                                                    <div className="text-sm text-[#8B7E75]">{staff.email}</div>
                                                                </div>
                                                                <div className={`px-2 py-0.5 rounded-full text-xs font-medium ml-4 ${staff.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                                    {staff.is_active ? 'Aktif' : 'Pasif'}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center space-x-2 pl-12 sm:pl-0">
                                                                <button onClick={() => handleToggleStaffStatus(staff.id, branch.id, staff.is_active)} className="text-xs font-medium px-3 py-1.5 rounded-lg border border-[#E8E0D5] text-[#4A3B32] hover:bg-gray-50 bg-white">Durum Değiştir</button>
                                                                <button onClick={() => handleRemoveStaffBranch(staff.id, branch.id)} className="text-xs font-medium px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 bg-white flex items-center"><X size={14} className="mr-1" /> Çıkar</button>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        )}

                                        {inlineStaffForm === branch.id && (
                                            <form onSubmit={(e) => handleStaffSubmit(e, branch.id)} className="bg-white border border-[#E8E0D5] p-5 rounded-xl shadow-sm mt-4">
                                                <h4 className="font-heading font-medium text-[#2B1E17] mb-4">Yeni Personel Ekle</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-medium text-[#8B7E75] mb-1.5">İsim Soyisim</label>
                                                        <input type="text" required value={staffFormData.name} onChange={(e) => setStaffFormData({ ...staffFormData, name: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-[#E8E0D5] bg-[#F8F6F4]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C46A2B]/20 text-sm text-[#2B1E17]" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-[#8B7E75] mb-1.5">E-posta</label>
                                                        <input type="email" required value={staffFormData.email} onChange={(e) => setStaffFormData({ ...staffFormData, email: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-[#E8E0D5] bg-[#F8F6F4]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C46A2B]/20 text-sm text-[#2B1E17]" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-[#8B7E75] mb-1.5">Telefon</label>
                                                        <input type="text" value={staffFormData.phone} onChange={(e) => setStaffFormData({ ...staffFormData, phone: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-[#E8E0D5] bg-[#F8F6F4]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C46A2B]/20 text-sm text-[#2B1E17]" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-[#8B7E75] mb-1.5">Şifre</label>
                                                        <input type="password" required value={staffFormData.password} onChange={(e) => setStaffFormData({ ...staffFormData, password: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-[#E8E0D5] bg-[#F8F6F4]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C46A2B]/20 text-sm text-[#2B1E17]" />
                                                    </div>
                                                </div>
                                                <div className="flex justify-end space-x-3 mt-5">
                                                    <button type="button" onClick={handleCloseInlineStaffForm} className="px-4 py-2 rounded-xl font-medium text-[#4A3B32] hover:bg-[#F8F6F4] transition-colors text-sm">İptal</button>
                                                    <button type="submit" disabled={staffFormLoading} className="bg-[#2B1E17] text-white font-medium text-sm px-5 py-2 rounded-xl hover:bg-[#4A3B32] disabled:opacity-50 flex items-center transition-colors">
                                                        {staffFormLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                                        Kaydet
                                                    </button>
                                                </div>
                                                {staffFormError && (
                                                    <div className="mt-3 text-red-500 text-sm bg-red-50 p-2 rounded-lg">{staffFormError}</div>
                                                )}
                                            </form>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {branches.length === 0 && !loading && (
                        <div className="text-center py-12 bg-white rounded-2xl border border-[#E8E0D5]">
                            <Store className="w-12 h-12 text-[#E8E0D5] mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-[#2B1E17]">Şube Bulunamadı</h3>
                            <p className="text-[#8B7E75] mt-1">Sisteme henüz hiç şube eklenmemiş.</p>
                        </div>
                    )}
                </div>
            )}

            {modalState.isOpen && (
                <div className="fixed inset-0 bg-[#2B1E17]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white max-w-lg w-full rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-[#E8E0D5] flex justify-between items-center bg-[#F8F6F4]/50">
                            <h2 className="font-heading font-bold text-xl text-[#2B1E17] flex items-center">
                                <Store className="mr-2 text-[#C46A2B]" size={24} />
                                {modalState.mode === 'create' ? 'Yeni Şube Ekle' : 'Şube Düzenle'}
                            </h2>
                            <button onClick={handleCloseModal} className="text-[#8B7E75] hover:text-[#2B1E17] transition-colors bg-white p-1.5 rounded-full shadow-sm">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleBranchSubmit} className="p-6 flex flex-col space-y-4">
                            {modalError && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-100 flex items-start">
                                    <div className="mr-2 mt-0.5">⚠️</div>
                                    <div>{modalError}</div>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-[#4A3B32] mb-1.5">Şube Adı</label>
                                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-[#E8E0D5] bg-[#F8F6F4]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C46A2B]/20 transition-all text-[#2B1E17]" placeholder="Örn: Kadıköy Şubesi" />
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="w-full sm:w-1/2">
                                    <label className="block text-sm font-medium text-[#4A3B32] mb-1.5">İl</label>
                                    <input type="text" required value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-[#E8E0D5] bg-[#F8F6F4]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C46A2B]/20 transition-all text-[#2B1E17]" placeholder="Örn: İstanbul" />
                                </div>
                                <div className="w-full sm:w-1/2">
                                    <label className="block text-sm font-medium text-[#4A3B32] mb-1.5">İlçe</label>
                                    <input type="text" required value={formData.district} onChange={(e) => setFormData({ ...formData, district: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-[#E8E0D5] bg-[#F8F6F4]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C46A2B]/20 transition-all text-[#2B1E17]" placeholder="Örn: Kadıköy" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#4A3B32] mb-1.5">Açık Adres</label>
                                <textarea rows="3" required value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-[#E8E0D5] bg-[#F8F6F4]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C46A2B]/20 transition-all text-[#2B1E17] resize-none" placeholder="Tam adresi giriniz..."></textarea>
                            </div>
                            <div className="pt-4 flex justify-end space-x-3 border-t border-[#E8E0D5] mt-2">
                                <button type="button" onClick={handleCloseModal} className="px-5 py-2.5 rounded-xl font-medium text-[#4A3B32] hover:bg-[#F8F6F4] transition-colors">İptal</button>
                                <button type="submit" disabled={modalLoading} className="bg-[#C46A2B] text-white font-medium px-6 py-2.5 rounded-xl hover:bg-[#A85A24] disabled:opacity-50 transition-colors flex items-center shadow-sm">
                                    {modalLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    {modalState.mode === 'create' ? 'Oluştur' : 'Değişiklikleri Kaydet'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
