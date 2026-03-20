import HomeHeroSlider from '../../components/home/HeroSlider';
import HomeCategoryCards from '../../components/home/CategoryCards';
import HomeFeaturedProducts from '../../components/home/FeaturedProducts';
import HomeDailyDeals from '../../components/home/DailyDeals';
import Layout from '../../components/layout/Layout';

function Home() {
    return (
        <Layout>
            {/* HERO SLIDER */}
            <HomeHeroSlider />

            {/* CATEGORY CARDS */}
            <HomeCategoryCards />

            {/* FEATURED PRODUCTS */}
            <HomeFeaturedProducts />

            {/* DAILY DEALS */}
            <HomeDailyDeals />
        </Layout>
    );
}

export default Home;