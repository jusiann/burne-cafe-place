import HomeHeroSlider from '../components/HomeHeroSlider';
import HomeCategoryCards from '../components/HomeCategoryCards';
import HomeFeaturedProducts from '../components/HomeFeaturedProducts';
import HomeDailyDeals from '../components/HomeDailyDeals';
import Layout from '../components/Layout';

function Home() {
    return (
        <Layout>
            <HomeHeroSlider />
            <HomeCategoryCards />
            <HomeFeaturedProducts />
            <HomeDailyDeals />
        </Layout>
    );
}

export default Home;
