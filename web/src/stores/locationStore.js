import { create } from 'zustand';
import { STORAGE_KEYS, getItem, setItem, removeItem } from '../constants/storage.utils.js';

const useLocationStore = create((set) => ({
    name: getItem(STORAGE_KEYS.LOCATION)?.name || null,
    city: getItem(STORAGE_KEYS.LOCATION)?.city || null,
    district: getItem(STORAGE_KEYS.LOCATION)?.district || null,
    branchId: getItem(STORAGE_KEYS.LOCATION)?.branchId || null,
    isSet: !!getItem(STORAGE_KEYS.LOCATION)?.branchId,
    isModalOpen: false,
    openModal: () => set({ isModalOpen: true }),
    closeModal: () => set({ isModalOpen: false }),
    setLocation: (name, city, district, branchId = null) => {
        const location = { name, city, district, branchId };
        setItem(STORAGE_KEYS.LOCATION, location);
        set({ name, city, district, branchId, isSet: true, isModalOpen: false });
    },
    clearLocation: () => {
        removeItem(STORAGE_KEYS.LOCATION);
        set({ name: null, city: null, district: null, branchId: null, isSet: false });
    },
}));

export default useLocationStore;
