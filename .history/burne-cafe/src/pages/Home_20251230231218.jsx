import Layout from "../components/Layout";
import HomeHeroSlider from "../components/HomeHeroSlider";
import HomeCategoryCards from "../components/HomeCategoryCards";
import HomeFeaturedProducts from "../components/HomeFeaturedProducts";
import HomeDailyDeals from "../components/HomeDailyDeals";

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