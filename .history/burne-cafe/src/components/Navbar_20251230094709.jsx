import { cn } from '../lib/utils';
import { Menu, X, ShoppingCart, Coffee } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { totalItems } = useCart();

  const navItems = [
    { name: 'Ana Sayfa', href: '/' },
    { name: 'Menü', href: '/menu' },
    { name: 'Siparişlerim', href: '/order-history' },
  ];

  const isActiveRoute = (href) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mobil menü açıkken body scroll'u kilitle
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-[#E8E0D5]'
          : 'bg-white/80 backdrop-blur-sm'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* LOGO */}
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold text-[#2B1E17] hover:text-[#C46A2B] transition-colors"
          >
            <Coffee className="w-6 h-6 text-[#C46A2B]" />
            <span className="font-heading tracking-tight">
              BURNÉ <span className="text-[#C46A2B]">Coffee</span>
            </span>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'relative px-4 py-2 font-medium transition-all duration-300 rounded-lg',
                  isActiveRoute(item.href)
                    ? 'text-[#C46A2B] bg-[#C46A2B]/10'
                    : 'text-[#2B1E17] hover:text-[#C46A2B] hover:bg-[#C46A2B]/5'
                )}
              >
                {item.name}
                {isActiveRoute(item.href) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#C46A2B] rounded-full" />
                )}
              </Link>
            ))}

            {/* SEPET İKONU - DESKTOP */}
            <Link
              to="/cart"
              className={cn(
                'relative p-2 ml-2 rounded-lg transition-all duration-300 group',
                isActiveRoute('/cart')
                  ? 'text-[#C46A2B] bg-[#C46A2B]/10'
                  : 'text-[#2B1E17] hover:text-[#C46A2B] hover:bg-[#C46A2B]/5'
              )}
              aria-label={`Sepet - ${totalItems} ürün`}
            >
              <ShoppingCart className="w-6 h-6 transition-transform group-hover:scale-110" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#C46A2B] text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>
          </div>

          {/* MOBILE: SEPET + MENU BUTTON */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Mobil Sepet İkonu */}
            <Link
              to="/cart"
              className={cn(
                'relative p-2 rounded-lg transition-all duration-300',
                isActiveRoute('/cart')
                  ? 'text-[#C46A2B] bg-[#C46A2B]/10'
                  : 'text-[#2B1E17] hover:text-[#C46A2B]'
              )}
              aria-label={`Sepet - ${totalItems} ürün`}
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#C46A2B] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>

            {/* Hamburger Menu Button */}
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="p-2 text-[#2B1E17] hover:text-[#C46A2B] transition-colors rounded-lg hover:bg-[#C46A2B]/5"
              aria-label={isMenuOpen ? 'Menüyü Kapat' : 'Menüyü Aç'}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE NAVIGATION OVERLAY */}
      <div
        className={cn(
          'fixed inset-0 top-16 bg-black/20 md:hidden transition-opacity duration-300 z-40',
          isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* MOBILE NAVIGATION MENU */}
      <div
        className={cn(
          'fixed top-16 left-0 right-0 bg-white/98 backdrop-blur-md shadow-xl md:hidden transition-all duration-300 overflow-hidden border-b border-[#E8E0D5] z-50',
          isMenuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="px-4 py-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'block px-4 py-3 font-medium rounded-lg transition-all duration-300',
                isActiveRoute(item.href)
                  ? 'text-[#C46A2B] bg-[#C46A2B]/10'
                  : 'text-[#2B1E17] hover:text-[#C46A2B] hover:bg-[#C46A2B]/5'
              )}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}

          {/* SEPET LİNKİ - MOBILE MENU İÇİNDE */}
          <Link
            to="/cart"
            className={cn(
              'flex items-center justify-between px-4 py-3 font-medium rounded-lg transition-all duration-300',
              isActiveRoute('/cart')
                ? 'text-[#C46A2B] bg-[#C46A2B]/10'
                : 'text-[#2B1E17] hover:text-[#C46A2B] hover:bg-[#C46A2B]/5'
            )}
            onClick={() => setIsMenuOpen(false)}
          >
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-5 h-5" />
              <span>Sepetim</span>
            </div>
            {totalItems > 0 && (
              <span className="px-2 py-0.5 bg-[#C46A2B] text-white text-xs font-bold rounded-full">
                {totalItems} ürün
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;