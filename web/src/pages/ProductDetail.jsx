import {useParams,useNavigate} from 'react-router-dom';
import {useEffect} from 'react';
import {useProduct} from '../hooks/useProducts.js';
import ProductDetailSection from '../components/product/ProductDetailSection';
import Layout from '../components/layout/Layout';

function ProductDetail() {
    const {id} = useParams();
    const navigate = useNavigate();

    const {product, isLoading, error} = useProduct(id);

    useEffect(() => {
        if (!isLoading && !product) {
            // navigate('/not-found');
        }
    }, [product, isLoading, navigate]);

    if (isLoading) {
        return (
            <Layout>
                <div className="min-h-[50vh] flex flex-col items-center justify-center">
                    <p className="text-[#8B7E75]">Ürün detayları yükleniyor...</p>
                </div>
            </Layout>
        );
    }

    if (error || !product) {
        return (
            <Layout>
                <div className="min-h-[50vh] flex flex-col items-center justify-center">
                    <p className="text-[#8B7E75]">Ürün bulunamadı veya bir hata oluştu.</p>
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
