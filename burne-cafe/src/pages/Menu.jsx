import { UtensilsCrossed } from 'lucide-react';
import MenuProductList from '../components/MenuProductList';

function Menu() {
  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* PAGE HEADER */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4">
            <UtensilsCrossed className="w-5 h-5 text-[#C46A2B]" />
          </div>
          <h1 className="font-heading text-3xl md:text-4xl text-[#2B1E17] mb-4">
            Menümüz
          </h1>
          <p className="text-[#8B7E75] max-w-2xl mx-auto">
            En taze kahve çekirdeklerinden hazırladığımız özel içeceklerimizi keşfedin.
          </p>
        </div>

        {/* PRODUCT LIST WITH FILTERS */}
        <MenuProductList />
      </div>
    </section>
  );
}

export default Menu;
