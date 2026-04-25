import { useEffect, useRef, useState } from 'react';
import api from '../../services/api';
import { Plus, Edit2, Trash2, Package, Tag, Loader2, ChevronDown, ChevronRight, X, UploadCloud } from 'lucide-react';

export default function AdminProductsSection() {
    const [categories, setCategories] = useState([]); 
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [expandedCategories, setExpandedCategories] = useState({});

    const [modalState, setModalState] = useState({ isOpen: false, mode: 'create', data: null });
    const [modalLoading, setModalLoading] = useState(false);
    const [modalError, setModalError] = useState(null);
    const imageInputRef = useRef(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedImagePreview, setSelectedImagePreview] = useState('');

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
    }, []);

    useEffect(() => {
        if (!selectedImage) {
            setSelectedImagePreview('');
            return;
        }

        const previewUrl = URL.createObjectURL(selectedImage);
        setSelectedImagePreview(previewUrl);

        return () => {
            URL.revokeObjectURL(previewUrl);
        };
    }, [selectedImage]);

    const toggleCategory = (categoryId) => {
        setExpandedCategories((prev) => ({
            ...prev,
            [categoryId]: !prev[categoryId]
        }));
    };

    const handleOpenModal = (mode, product = null) => {
        setModalState({ isOpen: true, mode, data: product });
        setModalError(null);
        setSelectedImage(null);
        if (imageInputRef.current)
            imageInputRef.current.value = '';
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
        setSelectedImage(null);
        if (imageInputRef.current)
            imageInputRef.current.value = '';
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        setModalLoading(true);
        setModalError(null);
        try {
            if (modalState.mode === 'create') {
                if (!selectedImage) {
                    setModalError('Lutfen bir urun resmi secin.');
                    return;
                }

                const payload = new FormData();
                payload.append('name', formData.name);
                payload.append('description', formData.description);
                payload.append('base_price', formData.base_price);
                payload.append('category_id', formData.category_id);
                payload.append('is_available', String(formData.is_available));
                payload.append('image', selectedImage);

                await api.post('/admin/products', payload, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else if (modalState.mode === 'edit') {
                const payload = {
                    ...formData,
                    base_price: parseFloat(formData.base_price)
                };
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

    const handleImageSelect = (event) => {
        const file = event.target.files?.[0] || null;
        setSelectedImage(file);
    };

    const formatFileSize = (bytes) => {
        if (!bytes || Number.isNaN(bytes)) return '0 KB';
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;

        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
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
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 mb-6">
                    {error}
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
                                            <div className="text-sm text-[#8B7E75] bg-white p-4 rounded-xl border border-[#E8E0D5] text-center m-6">Bu kategoride henüz ürün bulunmuyor.</div>
                                        ) : (
                                            <div className="p-4 sm:p-6">
                                                <div className="flex flex-col space-y-3">
                                                    {category.items.map((product) => (
                                                        <div key={product.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b last:border-0 border-[#E8E0D5] pb-4 last:pb-0">
                                                            <div className="flex items-start space-x-4 mb-3 sm:mb-0">
                                                                <div className="mt-1 text-[#8B7E75]">
                                                                    <Package size={20} />
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center flex-wrap gap-2">
                                                                        <span className="font-semibold text-[#2B1E17] text-base">{product.name}</span>
                                                                        <span className="text-[#C46A2B] font-bold">₺{Number(product.base_price).toFixed(2)}</span>
                                                                    </div>
                                                                    {product.description && (
                                                                        <div className="text-sm text-[#8B7E75] mt-0.5 line-clamp-1">{product.description}</div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center space-x-4 sm:pl-4 self-start sm:self-center shrink-0">
                                                                <div className="flex items-center space-x-2">
                                                                    <span className={`text-xs font-medium ${product.is_available ? 'text-green-600' : 'text-gray-500'}`}>
                                                                        {product.is_available ? 'Satışta' : 'Tükendi'}
                                                                    </span>
                                                                    <button
                                                                        onClick={() => handleToggleAvailability(product.id, product.is_available)}
                                                                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${product.is_available ? 'bg-green-500' : 'bg-gray-300'}`}
                                                                        role="switch"
                                                                        aria-checked={product.is_available}
                                                                    >
                                                                        <span className="sr-only">Durum Değiştir</span>
                                                                        <span
                                                                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${product.is_available ? 'translate-x-2' : '-translate-x-2'}`}
                                                                        />
                                                                    </button>
                                                                </div>
                                                                <button
                                                                    onClick={() => handleOpenModal('edit', product)}
                                                                    className="text-gray-400 hover:text-[#4A3B32] transition-colors p-1"
                                                                    title="Düzenle"
                                                                >
                                                                    <Edit2 size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteProduct(product.id)}
                                                                    className="text-gray-400 hover:text-red-600 transition-colors p-1"
                                                                    title="Sil"
                                                                >
                                                                    <Trash2 size={16} />
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
                                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-100">
                                    {modalError}
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
                            {modalState.mode === 'create' && (
                                <div className="bg-[#F8F6F4]/60 p-4 rounded-xl border border-[#E8E0D5] space-y-3">
                                    <label className="block text-sm font-medium text-[#4A3B32]">Urun Resmi</label>
                                    <input
                                        ref={imageInputRef}
                                        type="file"
                                        accept="image/png,image/jpeg,image/jpg,image/webp"
                                        className="hidden"
                                        onChange={handleImageSelect}
                                    />
                                    <div>
                                        <button
                                            type="button"
                                            onClick={() => imageInputRef.current?.click()}
                                            className="px-4 py-2 rounded-lg border border-[#E8E0D5] bg-white text-[#4A3B32] hover:bg-[#F8F6F4] transition-colors inline-flex items-center"
                                        >
                                            <UploadCloud size={16} className="mr-2 text-[#C46A2B]" />
                                            Dosya Yukle
                                        </button>
                                    </div>

                                    {selectedImage ? (
                                        <div className="bg-white border border-[#E8E0D5] rounded-xl p-3 flex items-start gap-3">
                                            <img
                                                src={selectedImagePreview}
                                                alt="Secilen urun resmi"
                                                className="w-16 h-16 rounded-lg object-cover border border-[#E8E0D5]"
                                            />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-[#2B1E17] truncate">{selectedImage.name}</p>
                                                <p className="text-xs text-[#8B7E75] mt-1">{formatFileSize(selectedImage.size)}</p>
                                                <p className="text-xs text-[#A85A24] mt-1">Resim secildi ve gonderime hazir.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-xs text-[#8B7E75] bg-white border border-dashed border-[#D8CCBE] rounded-xl p-3">
                                            JPG, PNG veya WEBP dosyasi secin. Maksimum 5MB.
                                        </div>
                                    )}
                                    <div className="text-[11px] text-[#8B7E75]">
                                        Not: Urun olusturma icin gorsel secimi zorunludur.
                                    </div>
                                </div>
                            )}
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
