import { useParams } from 'react-router-dom';
import productsData from '../data/products.json';
import ProductDetailSection from '../components/ProductDetailSection';
import Layout from '../components/Layout';
import type { Product } from '../types/product';

const products = productsData as Product[];

function ProductDetail() {
    const { id } = useParams<{ id: string }>();

    const product = products.find(p => String(p.id) === String(id));

    if (!product) {
        return (
            <Layout>
                <div className="min-h-[50vh] flex flex-col items-center justify-center">
                    <p className="text-[#8B7E75]">Ürün bulunamadı...</p>
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
