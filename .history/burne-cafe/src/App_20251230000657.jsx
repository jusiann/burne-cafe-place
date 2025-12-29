import {BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Menu from './pages/Menu';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import OrderHistory from './pages/OrderHistory';
import NotFound from './pages/NotFound';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/menu' element={<Menu />} />
                <Route path='/product:id' element={<ProductDetail />} /> 
                <Route path='/cart' element={<Cart />} /> 
                <Route path='/checkout' element={<Checkout />} /> 
                <Route path='/order-confirmation' element={<OrderConfirmation />} /> 
                <Route path='/order-history' element={<OrderHistory />} /> 
                <Route path='*' element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App