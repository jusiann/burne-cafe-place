import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Plus, Edit2, Trash2, Package, Tag, Loader2, ChevronDown, ChevronRight, X } from 'lucide-react';

export default function AdminProductsSection() {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [expandedCategories, setExpandedCategories] = useState({});

    const [modalState, setModalState] = useState({ isOpen: false, mode: 'create', data: null });
    const [modalLoading, setModalLoading] = useState(false);
    const [modalError, setModalError] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        base_price: '',
        category_id: '',
        is_available: true
    });

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [catRes, prodRes] = await Promise.all([
                api.get('/categories'),
                api.get('/products')
            ]);
            
            const fetchedCategories = catRes.data?.categories || catRes.categories || [];
            setCategories(fetchedCategories);
            setProducts(prodRes.data?.products || prodRes.products || []);
            
            if (fetchedCategories.length > 0 && Object.keys(expandedCategories).length === 0) {
                setExpandedCategories({ [fetchedCategories[0].id]: true });
            }
        } catch (err) {
            setError(err.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const toggleCategory = (categoryId) => {
        setExpandedCategories((prev) => ({
            ...prev,
            [categoryId]: !prev[categoryId]
        }));
    };

    const handleOpenModal = (mode, product = null) => {
        setModalState({ isOpen: true, mode, data: product });
        setModalError(null);
        if (mode === 'edit' && product) {
            setFormData({
                name: product.name || '',
                description: product.description || '',
                base_price: product.base_price || '',
                category_id: product.category_id || (categories.length > 0 ? categories[0].id : ''),
                is_available: product.is_available ?? true
            });
        } else {
            setFormData({
                name: '',
                description: '',
                base_price: '',
                category_id: categories.length > 0 ? categories[0].id : '',
                is_available: true
            });
        }
    };

    const handleCloseModal = () => {
        setModalState({ isOpen: false, mode: 'create', data: null });
        setFormData({ name: '', description: '', base_price: '', category_id: '', is_available: true });
        setModalError(null);
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        setModalLoading(true);
        setModalError(null);
        try {
            const payload = {
                ...formData,
                base_price: parseFloat(formData.base_price)
            };
            if (modalState.mode === 'create') {
                await api.post('/admin/products', payload);
            } else if (modalState.mode === 'edit') {
                await api.put(`/admin/products/${modalState.data.id}`, payload);
            }
            await fetchData();
            handleCloseModal();
        } catch (err) {
            setModalError(err.response?.data?.error || err.message);
        } finally {
            setModalLoading(false);
        }
    };

    const handleToggleAvailability = async (productId, currentStatus) => {
        try {
            setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, is_available: !currentStatus } : p)));
            await api.patch(`/admin/products/${productId}/availability`, { is_available: !currentStatus });
        } catch (err) {
            setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, is_available: currentStatus } : p)));
            setError(err.response?.data?.error || err.message);
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;
        try {
            await api.delete(`/admin/products/${productId}`);
            setProducts((prev) => prev.filter((p) => p.id !== productId));
        } catch (err) {
            setError(err.response?.data?.error || err.message);
        }
    };

    const productsByCategory = categories.map((cat) => ({
        ...cat,
        items: products.filter((p) => p.category_id === cat.id)
    }));

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 mt-16">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-[#2B1E17] mb-2 flex items-center">
                        <Package className="mr-3 text-[#C46A2B]" size={32} />
                        Ürün Yönetimi
                    </h1>
                    <p className="text-[#8B7E75]">Kategorileri ve ürünleri buradan yönetebilirsiniz.</p>
                </div>
                <button
                    onClick={() => handleOpenModal('create')}
                    className="bg-[#C46A2B] hover:bg-[#A85A24] text-white px-5 py-2.5 rounded-xl transition-all duration-300 font-medium flex items-center justify-center shadow-sm"
                >
                    <Plus size={20} className="mr-2" />
                    Yeni Ürün Ekle
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
                <div className="flex flex-col space-y-5">
                    {productsByCategory.map((category) => {
                        const isExpanded = expandedCategories[category.id];
                        return (
                            <div key={category.id} className="bg-white rounded-2xl shadow-sm border border-[#E8E0D5] overflow-hidden transition-all duration-300">
                                <div
                                    className={`flex items-center justify-between p-5 cursor-pointer hover:bg-[#F8F6F4]/80 transition-colors ${isExpanded ? 'bg-[#F8F6F4]/50' : 'bg-white'}`}
                                    onClick={() => toggleCategory(category.id)}
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="text-[#C46A2B] bg-white p-1 rounded-full shadow-sm">
                                            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                        </div>
                                        <h2 className="font-heading font-bold text-xl text-[#2B1E17] flex items-center">
                                            <Tag size={18} className="mr-2 text-[#8B7E75]" />
                                            {category.name}
                                        </h2>
                                        <div className="bg-[#2B1E17] text-white px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                                            {category.items.length} ÜRÜN
                                        </div>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="border-t border-[#E8E0D5]">
                                        {category.items.length === 0 ? (
                                            <div className="p-8 text-[#8B7E75] text-center bg-[#F8F6F4]/30">Bu kategoride henüz ürün bulunmuyor.</div>
                                        ) : (
                                            <div className="w-full bg-[#F8F6F4]/10">
                                                <div className="hidden md:grid grid-cols-12 bg-[#F8F6F4] border-b border-[#E8E0D5] px-6 py-3 text-xs font-bold text-[#8B7E75] uppercase tracking-wider">
                                                    <div className="col-span-5">Ürün Detayı</div>
                                                    <div className="col-span-3">Fiyat</div>
                                                    <div className="col-span-2 text-center">Durum</div>
                                                    <div className="col-span-2 text-right">İşlemler</div>
                                                </div>
                                                <div className="divide-y divide-[#E8E0D5]">
                                                    {category.items.map((product) => (
                                                        <div key={product.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-0 items-center px-6 py-4 hover:bg-[#F8F6F4]/50 transition-colors">
                                                            <div className="col-span-1 md:col-span-5 flex flex-col">
                                                                <span className="font-semibold text-[#2B1E17] text-base">{product.name}</span>
                                                                {product.description && <span className="text-sm text-[#8B7E75] mt-1 line-clamp-2 md:w-11/12">{product.description}</span>}
                                                            </div>
                                                            <div className="col-span-1 md:col-span-3 font-semibold text-[#2B1E17] text-lg">
                                                                ₺{Number(product.base_price).toFixed(2)}
                                                            </div>
                                                            <div className="col-span-1 md:col-span-2 flex md:justify-center">
                                                                <button
                                                                    onClick={() => handleToggleAvailability(product.id, product.is_available)}
                                                                    className={`px-4 py-1.5 text-xs uppercase font-bold rounded-full transition-colors border shadow-sm ${
                                                                        product.is_available 
                                                                            ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' 
                                                                            : 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                                                                    }`}
                                                                >
                                                                    {product.is_available ? 'Satışta' : 'Tükendi'}
                                                                </button>
                                                            </div>
                                                            <div className="col-span-1 md:col-span-2 flex items-center md:justify-end space-x-2 mt-2 md:mt-0">
                                                                <button onClick={() => handleOpenModal('edit', product)} className="p-2 md:px-3 md:py-1.5 md:text-sm rounded-lg border border-[#E8E0D5] bg-white text-[#4A3B32] hover:bg-gray-50 flex items-center shadow-sm">
                                                                    <Edit2 size={16} className="md:mr-1.5" /> <span className="hidden md:inline">Düzenle</span>
                                                                </button>
                                                                <button onClick={() => handleDeleteProduct(product.id)} className="p-2 md:px-3 md:py-1.5 md:text-sm rounded-lg border border-red-200 bg-white text-red-600 hover:bg-red-50 flex items-center shadow-sm">
                                                                    <Trash2 size={16} className="md:mr-1.5" /> <span className="hidden md:inline">Sil</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {modalState.isOpen && (
                <div className="fixed inset-0 bg-[#2B1E17]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-[#E8E0D5] flex justify-between items-center bg-[#F8F6F4]/50">
                            <h2 className="font-heading font-bold text-xl text-[#2B1E17] flex items-center">
                                <Package className="mr-2 text-[#C46A2B]" size={24} />
                                {modalState.mode === 'create' ? 'Yeni Ürün' : 'Ürünü Düzenle'}
                            </h2>
                            <button onClick={handleCloseModal} className="text-[#8B7E75] hover:text-[#2B1E17] transition-colors bg-white p-1.5 rounded-full shadow-sm">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleProductSubmit} className="p-6 flex flex-col space-y-4">
                            {modalError && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-100 flex items-start">
                                    <div className="mr-2 mt-0.5">⚠️</div>
                                    <div>{modalError}</div>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-[#4A3B32] mb-1.5">Ürün Adı</label>
                                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-[#E8E0D5] bg-[#F8F6F4]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C46A2B]/20 transition-all text-[#2B1E17]" placeholder="Örn: Caffe Latte" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#4A3B32] mb-1.5">Açıklama</label>
                                <textarea rows="2" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-[#E8E0D5] bg-[#F8F6F4]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C46A2B]/20 transition-all text-[#2B1E17] resize-none" placeholder="Ürün içerik açıklaması..."></textarea>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-1/2">
                                    <label className="block text-sm font-medium text-[#4A3B32] mb-1.5">Fiyat (₺)</label>
                                    <input type="number" step="0.01" min="0" required value={formData.base_price} onChange={(e) => setFormData({ ...formData, base_price: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-[#E8E0D5] bg-[#F8F6F4]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C46A2B]/20 transition-all text-[#2B1E17]" />
                                </div>
                                <div className="w-1/2">
                                    <label className="block text-sm font-medium text-[#4A3B32] mb-1.5">Kategori</label>
                                    <select required value={formData.category_id} onChange={(e) => setFormData({ ...formData, category_id: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-[#E8E0D5] bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C46A2B]/20 transition-all text-[#2B1E17]">
                                        <option value="" disabled>Seçiniz</option>
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="pt-2 flex items-center space-x-3 bg-[#F8F6F4]/50 p-3 rounded-xl border border-[#E8E0D5]">
                                <input type="checkbox" id="is_available" checked={formData.is_available} onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })} className="w-5 h-5 accent-[#C46A2B] rounded cursor-pointer" />
                                <label htmlFor="is_available" className="text-sm font-medium text-[#2B1E17] cursor-pointer select-none">Müşterilere Satışa Açık</label>
                            </div>
                            <div className="pt-4 mt-2 border-t border-[#E8E0D5] flex justify-end space-x-3">
                                <button type="button" onClick={handleCloseModal} className="px-5 py-2.5 rounded-xl font-medium text-[#4A3B32] hover:bg-[#F8F6F4] transition-colors">İptal</button>
                                <button type="submit" disabled={modalLoading} className="bg-[#C46A2B] text-white font-medium px-6 py-2.5 rounded-xl hover:bg-[#A85A24] disabled:opacity-50 transition-colors flex items-center shadow-sm">
                                    {modalLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    {modalState.mode === 'create' ? 'Oluştur' : 'Kaydet'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
