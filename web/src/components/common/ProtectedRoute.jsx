import { Navigate, useLocation, Outlet } from 'react-router-dom';
import useAuthStore from '../../stores/authStore.js';

function ProtectedRoute({ children, requireRole }) {
    const { isAuthenticated, user, isLoading } = useAuthStore();
    const location = useLocation();

    if (isLoading)
        return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Yetki kontrol ediliyor...</div>;

    if (!isAuthenticated)
        return <Navigate to="/" state={{ from: location }} replace />;

    if (requireRole && user?.role !== requireRole)
        return <Navigate to="/" replace />;

    return children ? children : <Outlet />;
}

export default ProtectedRoute;
