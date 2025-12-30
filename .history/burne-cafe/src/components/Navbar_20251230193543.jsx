import { cn } from '../lib/utils';
import { Menu, X, ShoppingCart, Search, Coffee } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { getTotalItems } = useCart();

  const totalItems = getTotalItems();

  const navItems = [
    { name: 'Ana Sayfa', href: '/' },
    { name: 'Menü', href: '/menu' },
    { name: 'Siparişlerim', href: '/order-history' },
  ];

  const isActiveRoute = (href) => {
    if (href === '/') {
      return location.pathname === '/' || location.pathname === '';
    }
    return location.pathname.startsWith(href);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/menu?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 w-full z-50 transition-all duration-500 ease-out",
        isScrolled
          ? "bg-white/90 backdrop-blur-xl shadow-[0_2px_20px_-5px_rgba(0,0,0,0.1)]"
          : "bg-white/60 backdrop-blur-sm"
      )}
    >
      {/* GRADIENT BOTTOM BORDER */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-[#E8E0D5]/30 via-[#C46A2B]/40 to-[#E8E0D5]/30" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">

          {/* LOGO */}
          <Link
            to="/"
            className="flex items-center gap-2 text-2xl font-bold text-[#2B1E17] hover:text-[#A85A24] transition-colors duration-300"
          >
            <Coffee className="w-7 h-7 text-[#C46A2B]" />
            <div className="flex flex-col leading-tight">
              <span className="font-heading text-xl sm:text-2xl">
                BURNÉ CAFE
              </span>
              <span className="text-[10px] sm:text-xs font-normal text-[#8B7355] -mt-1">
                Artisan Coffee & Delights
              </span>
            </div>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <div className="hidden md:flex items-center space-x-1">
            {
              navItems.map((item, key) => (
                <Link
                  key={key}
                  to={item.href}
                  className={cn(
                    'relative px-4 py-2 font-medium transition-all duration-300 rounded-lg',
                    isActiveRoute(item.href)
                      ? 'text-[#C46A2B] bg-[#C46A2B]/10'
                      : 'text-[#2B1E17] hover:text-[#C46A2B] hover:bg-[#C46A2B]/5'
                  )}
                >
                  {/* ACTIVE INDICATOR */}
                  <div
                    className={cn(
                      'absolute bottom-0 left-2 right-2 h-0.5 bg-[#C46A2B] rounded-full transition-transform duration-300',
                      isActiveRoute(item.href) ? 'scale-x-100' : 'scale-x-0'
                    )}
                  />
                  <span className="relative z-10">
                    {item.name}
                  </span>
                </Link>
              ))
            }

            {/* ARAMA İKONU - DESKTOP */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={cn(
                'p-2 rounded-lg transition-all duration-300 group',
                isSearchOpen
                  ? 'text-[#C46A2B] bg-[#C46A2B]/10'
                  : 'text-[#2B1E17] hover:text-[#C46A2B] hover:bg-[#C46A2B]/5'
              )}
              aria-label="Arama"
            >
              <Search className="w-6 h-6 transition-transform group-hover:scale-110" />
            </button>

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

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() => setIsMenuOpen((previous) => !previous)}
            className="md:hidden p-2 text-[#2B1E17] hover:text-[#C46A2B] transition-colors duration-300"
            aria-label={isMenuOpen ? "Menüyü Kapat" : "Menüyü Aç"}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* ARAMA ÇUBUĞU - DESKTOP */}
      <div
        className={cn(
          "hidden md:block absolute top-full left-0 right-0 bg-white shadow-lg transition-all duration-300 overflow-hidden border-b border-[#E8E0D5]",
          isSearchOpen ? "max-h-24 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ürün ara... (örn: burger, pizza, kahve)"
              className="flex-1 px-4 py-2 border border-[#E8E0D5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C46A2B]/20 focus:border-[#C46A2B] transition-all"
              autoFocus
            />
            <button
              type="submit"
              className="px-6 py-2 bg-[#C46A2B] text-white rounded-lg hover:bg-[#A85A24] transition-colors font-medium"
            >
              Ara
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSearchOpen(false);
                setSearchQuery('');
              }}
              className="px-4 py-2 border border-[#E8E0D5] rounded-lg hover:bg-[#E8E0D5]/30 transition-colors"
            >
              İptal
            </button>
          </form>
        </div>
      </div>

      {/* MOBILE MENU */}
      <div
        className={cn(
          "fixed top-16 left-0 right-0 bg-white shadow-lg md:hidden transition-all duration-300 overflow-hidden border-b border-[#E8E0D5]",
          isMenuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-4 py-3 space-y-1">
          {
            navItems.map((item, key) => (
              <Link
                key={key}
                to={item.href}
                className={cn(
                  'block px-4 py-3 rounded-lg transition-all duration-300',
                  isActiveRoute(item.href)
                    ? 'text-[#C46A2B] bg-[#C46A2B]/10 font-medium'
                    : 'text-[#2B1E17] hover:text-[#C46A2B] hover:bg-[#C46A2B]/5'
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))
          }

          {/* ARAMA - MOBILE MENU */}
          <button
            onClick={() => {
              setIsMenuOpen(false);
              setIsSearchOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-300 text-[#2B1E17] hover:text-[#C46A2B] hover:bg-[#C46A2B]/5 w-full"
          >
            <Search className="w-5 h-5" />
            <span>Ürün Ara</span>
          </button>

          {/* SEPET - MOBILE MENU */}
          <Link
            to="/cart"
            className={cn(
              'flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-300',
              isActiveRoute('/cart')
                ? 'text-[#C46A2B] bg-[#C46A2B]/10 font-medium'
                : 'text-[#2B1E17] hover:text-[#C46A2B] hover:bg-[#C46A2B]/5'
            )}
            onClick={() => setIsMenuOpen(false)}
          >
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              <span>Sepetim</span>
            </div>
            {totalItems > 0 && (
              <span className="px-2 py-0.5 bg-[#C46A2B] text-white text-xs font-bold rounded-full">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* ARAMA MODAL - MOBILE */}
      {isSearchOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setIsSearchOpen(false)}>
          <div className="bg-white m-4 mt-20 rounded-lg shadow-xl p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#2B1E17]">Ürün Ara</h3>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-1 hover:bg-[#E8E0D5]/30 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSearch} className="space-y-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ürün ara... (örn: burger, pizza, kahve)"
                className="w-full px-4 py-3 border border-[#E8E0D5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C46A2B]/20 focus:border-[#C46A2B] transition-all"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-[#C46A2B] text-white rounded-lg hover:bg-[#A85A24] transition-colors font-medium"
                >
                  Ara
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="px-4 py-3 border border-[#E8E0D5] rounded-lg hover:bg-[#E8E0D5]/30 transition-colors"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;