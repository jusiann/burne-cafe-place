import {useParams,useNavigate} from 'react-router-dom';
import {useEffect} from 'react';
import products from '../data/products.json';
import ProductDetailSection from '../components/ProductDetailSection';
import Layout from '../components/Layout';

function ProductDetail() {
    const {id} = useParams();
    const navigate = useNavigate();

    const product = products.find(productItem => productItem.id == id);

    useEffect(() => {
        if (!product) {
            // navigate('/not-found');
        }
    }, [product, navigate]);

    if (!product) {
        return (
            <Layout>
                <div className="min-h-[50vh] flex flex-col items-center justify-center">
                    <p>Ürün bulunamadı...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <ProductDetailSection product={product} />
        </Layout>
    );
}

export default ProductDetail;
