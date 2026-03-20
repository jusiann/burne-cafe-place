import {BrowserRouter,Routes,Route,useLocation} from 'react-router-dom';
import {useEffect, useState} from 'react';
import Home from './pages/customer/Home';
import Menu from './pages/customer/Menu';
import ProductDetail from './pages/customer/ProductDetail';
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';
import OrderConfirmation from './pages/customer/OrderConfirmation';
import OrderHistory from './pages/customer/OrderHistory';
import Login from './pages/customer/Login';
import Register from './pages/customer/Register';
import NotFound from './pages/NotFound';

import ErrorBoundary from './components/common/ErrorBoundary';
import ProtectedRoute from './components/common/ProtectedRoute';
import OnboardingModal from './components/common/OnboardingModal';
import LoadingSpinner from './components/common/LoadingSpinner';
import useAuthStore from './stores/authStore';

function ScrollToTop() {
    const {pathname} = useLocation();
    useEffect(() => {
        window.scrollTo(0,0);
    }, [pathname]);
    return null;
}

function App() {
    const [isInit, setIsInit] = useState(true);
    const {checkAuth} = useAuthStore();

    useEffect(() => {
        const init = async () => {
            await checkAuth();
            setIsInit(false);
        };
        init();
    }, [checkAuth]);

    if (isInit) {
        return <LoadingSpinner fullScreen />;
    }

    return (
        <ErrorBoundary>
            <BrowserRouter>
                <ScrollToTop />
                <OnboardingModal />
                <Routes>
                    <Route path='/' element={<Home />} />
                    <Route path='/menu' element={<Menu />} />
                    <Route path='/product/:id' element={<ProductDetail />} />
                    
                    <Route path='/cart' element={
                        <ProtectedRoute>
                            <Cart />
                        </ProtectedRoute>
                    } />
                    <Route path='/checkout' element={
                        <ProtectedRoute>
                            <Checkout />
                        </ProtectedRoute>
                    } />
                    <Route path='/order-confirmation' element={
                        <ProtectedRoute>
                            <OrderConfirmation />
                        </ProtectedRoute>
                    } />
                    <Route path='/order-history' element={
                        <ProtectedRoute>
                            <OrderHistory />
                        </ProtectedRoute>
                    } />
                    
                    <Route path='/login' element={<Login />} />
                    <Route path='/register' element={<Register />} />
                    <Route path='*' element={<NotFound />} />
                </Routes>
            </BrowserRouter>
        </ErrorBoundary>
    );
}

export default App;