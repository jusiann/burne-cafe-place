import {BrowserRouter, Routes, Route } from 'react-router-dom';
import {Home} from './pages/Home';
import {Menu} from './pages/Menu';
import {ProductDetail} from './pages/ProductDetail';
import {Cart} from './pages/Cart';
import {Checkout} from './pages/Checkout';
import {OrderConfirmation} from './pages/OrderConfirmation';
import {OrderHistory} from './pages/OrderHistory';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<Home />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App