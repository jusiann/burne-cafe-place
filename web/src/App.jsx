import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Home from './pages/Home';
import Menu from './pages/Menu';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import OrderHistory from './pages/OrderHistory';
import StaffOrders from './pages/StaffOrders';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

import ProtectedRoute from './components/common/ProtectedRoute';
import LocationSelectionModal from './components/common/LocationSelectionModal';
import AuthModal from './components/auth/AuthModal';
import useAuthStore from './stores/authStore';
import useCartStore from './stores/cartStore';

function ScrollToTop() {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    return null;
}

function App() {
    const [isInit, setIsInit] = useState(true);
    const { checkAuth, isAuthenticated } = useAuthStore();
    const fetchCart = useCartStore((state) => state.fetchCart);

    useEffect(() => {
        const init = async () => {
            await checkAuth();
            await fetchCart();
            setIsInit(false);
        };
        init();
    }, [checkAuth, fetchCart]);

    useEffect(() => {
        if (!isInit) {
            fetchCart();
        }
    }, [isAuthenticated, isInit, fetchCart]);

    if (isInit)
        return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Sistem başlatılıyor...</div>;

    return (
        <BrowserRouter>
            <ScrollToTop />
            <LocationSelectionModal />
            <AuthModal />
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/menu' element={<Menu />} />
                <Route path='/product/:id' element={<ProductDetail />} />
                {/* PROTECTED ROUTES */}
                <Route element={<ProtectedRoute />}>
                    <Route path='/profile' element={<Profile />} />
                    <Route path='/cart' element={<Cart />} />
                    <Route path='/checkout' element={<Checkout />} />
                    <Route path='/order-confirmation' element={<OrderConfirmation />} />
                    <Route path='/order-history' element={<OrderHistory />} />
                    <Route path='/orders' element={<StaffOrders />} />
                </Route>
                <Route path='*' element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;