import api from './api.js';
import { ENDPOINTS } from '../constants/api.utils.js';

export const getBranches = (params) => api.get(ENDPOINTS.BRANCHES.LIST, { params });
export const getBranchById = (id) => api.get(ENDPOINTS.BRANCHES.BY_ID(id));
