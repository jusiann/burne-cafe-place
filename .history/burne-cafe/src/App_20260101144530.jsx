import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Menu from './pages/Menu';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import OrderHistory from './pages/OrderHistory';
import NotFound from './pages/NotFound';
import Footer from './components/Footer';

function ScrollToTop() {
    const {pathname} = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}

// Page Transition Wrapper
function AnimatedRoute({ children }) {
    return (
        <div className="animate-slideUp">
            {children}
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <ScrollToTop />
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="pt-20 pb-2 flex-1">
                    <Routes>
                        <Route path='/' element={<AnimatedRoute><Home /></AnimatedRoute>} />
                        <Route path='/menu' element={<AnimatedRoute><Menu /></AnimatedRoute>} />
                        <Route path='/product/:id' element={<AnimatedRoute><ProductDetail /></AnimatedRoute>} />
                        <Route path='/cart' element={<AnimatedRoute><Cart /></AnimatedRoute>} />
                        <Route path='/checkout' element={<AnimatedRoute><Checkout /></AnimatedRoute>} />
                        <Route path='/order-confirmation' element={<AnimatedRoute><OrderConfirmation /></AnimatedRoute>} />
                        <Route path='/order-history' element={<AnimatedRoute><OrderHistory /></AnimatedRoute>} />
                        <Route path='*' element={<AnimatedRoute><NotFound /></AnimatedRoute>} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </BrowserRouter>
    )
}

export default App;