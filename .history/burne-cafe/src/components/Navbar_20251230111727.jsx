import { cn } from '../lib/utils';
import { Menu, X, ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const totalItems = 0;

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
            className="flex items-center gap-1 text-xl font-bold text-[#2B1E17] hover:text-[#C46A2B] transition-colors"
          >
            <span className="font-heading tracking-tight">
              BURNÉ <span className="text-[#C46A2B]">Coffee</span>
            </span>
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
          <div className="flex items-center gap-2 md:hidden">
            {/* SEPET - MOBILE HEADER */}
            <Link
              to="/cart"
              className={cn(
                'relative p-2 rounded-lg transition-all duration-300',
                isActiveRoute('/cart')
                  ? 'text-[#C46A2B]'
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

            {/* HAMBURGER BUTTON */}
            <button
              onClick={() => setIsMenuOpen((previous) => !previous)}
              className="p-2 text-[#2B1E17] hover:text-[#C46A2B] transition-colors duration-300 rounded-lg hover:bg-[#C46A2B]/5"
              aria-label={isMenuOpen ? "Menüyü Kapat" : "Menüyü Aç"}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU OVERLAY */}
      <div
        className={cn(
          "fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity duration-300",
          isMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* MOBILE MENU MODAL */}
      <div
        className={cn(
          "fixed top-4 right-4 left-4 bg-white rounded-2xl shadow-2xl z-50 md:hidden transition-all duration-300 overflow-hidden",
          isMenuOpen
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 -translate-y-4 pointer-events-none"
        )}
      >
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8E0D5]">
          <span className="text-lg font-bold text-[#2B1E17]">
            BURNÉ <span className="text-[#C46A2B]">Coffee</span>
          </span>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="p-2 text-[#2B1E17] hover:text-[#C46A2B] hover:bg-[#C46A2B]/5 rounded-lg transition-colors duration-300"
            aria-label="Menüyü Kapat"
          >
            <X size={20} />
          </button>
        </div>

        {/* MODAL NAVIGATION LINKS */}
        <div className="px-3 py-4 space-y-1">
          {
            navItems.map((item, key) => (
              <Link
                key={key}
                to={item.href}
                className={cn(
                  'flex items-center px-4 py-3 rounded-xl transition-all duration-300',
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

          {/* SEPET - MOBILE MENU */}
          <Link
            to="/cart"
            className={cn(
              'flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300',
              isActiveRoute('/cart')
                ? 'text-[#C46A2B] bg-[#C46A2B]/10 font-medium'
                : 'text-[#2B1E17] hover:text-[#C46A2B] hover:bg-[#C46A2B]/5'
            )}
            onClick={() => setIsMenuOpen(false)}
          >
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-5 h-5" />
              <span>Sepetim</span>
            </div>
            {totalItems > 0 && (
              <span className="px-2.5 py-1 bg-[#C46A2B] text-white text-xs font-bold rounded-full">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;