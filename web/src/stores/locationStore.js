import { create } from 'zustand';
import { STORAGE_KEYS, getItem, setItem, removeItem } from '../constants/storage.utils.js';


const useLocationStore = create((set) => ({
    city: getItem(STORAGE_KEYS.LOCATION)?.city || null,
    district: getItem(STORAGE_KEYS.LOCATION)?.district || null,
    branchId: getItem(STORAGE_KEYS.LOCATION)?.branchId || null,
    isSet: !!getItem(STORAGE_KEYS.LOCATION)?.city,
    setLocation: (city, district, branchId = null) => {
        const location = { city, district, branchId };
        setItem(STORAGE_KEYS.LOCATION, location);

        set({ city, district, branchId, isSet: true });
    },
    clearLocation: () => {
        removeItem(STORAGE_KEYS.LOCATION);
        set({ city: null, district: null, branchId: null, isSet: false });
    },
}));

export default useLocationStore;
