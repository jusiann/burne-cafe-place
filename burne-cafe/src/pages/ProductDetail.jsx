import { useParams, useNavigate } from 'react-router-dom';
import products from '../data/products.json';
import ProductDetailSection from '../components/ProductDetailSection';
import Layout from '../components/Layout';
import { useEffect } from 'react';

function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    // Find Product
    // Use loose equality (==) for ID to handle string vs number mismatch
    const product = products.find(p => p.id == id);

    // Handle Not Found
    useEffect(() => {
        if (!product) {
            // navigate('/not-found'); // Or redirect to menu
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
