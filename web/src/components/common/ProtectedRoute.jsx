import {Navigate, useLocation} from 'react-router-dom';
import useAuthStore from '../../stores/authStore.js';
import LoadingSpinner from './LoadingSpinner.jsx';

function ProtectedRoute({children, requireRole}) {
    const {isAuthenticated, user, isLoading} = useAuthStore();
    const location = useLocation();

    if (isLoading) {
        return <LoadingSpinner fullScreen />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{from: location}} replace />;
    }

    if (requireRole && user?.role !== requireRole) {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default ProtectedRoute;
