import { cn } from '../lib/utils';
import { Menu, X, ShoppingCart, Search } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);
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

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Arama sayfasına yönlendir veya arama işlemi yap
      console.log('Arama:', searchQuery);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleSearchClose = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
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

          {/* LOGO & SEARCH */}
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="flex flex-col gap-0 text-2xl font-bold text-[#2B1E17] hover:text-[#A85A24] transition-colors duration-300"
            >
              <span className="font-heading leading-tight">
                BURNÉ
              </span>
              <span className="text-[10px] font-normal tracking-[0.2em] text-[#A85A24] uppercase leading-tight">
                Cafe & Restaurant
              </span>
            </Link>

            {/* SEARCH - DESKTOP */}
            <div className="hidden md:flex items-center">
              <div
                className={cn(
                  "relative flex items-center gap-2 transition-all duration-300 rounded-lg",
                  isSearchOpen 
                    ? "w-[280px] text-[#C46A2B] px-4 py-2" 
                    : "w-auto text-[#2B1E17] hover:text-[#C46A2B] hover:bg-[#C46A2B]/5 p-2"
                )}
              >
                <Search className="w-6 h-6 flex-shrink-0" />
                
                {isSearchOpen && (
                  <form onSubmit={handleSearchSubmit} className="flex-1 min-w-0">
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Ürün ara..."
                      className="w-full bg-transparent border-none outline-none text-sm text-[#2B1E17] placeholder:text-[#2B1E17]/50"
                    />
                  </form>
                )}
                
                {!isSearchOpen && (
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className="absolute inset-0"
                    aria-label="Ara"
                  />
                )}
                
                {isSearchOpen && (
                  <button
                    type="button"
                    onClick={handleSearchClose}
                    className="p-1 hover:bg-[#C46A2B]/10 rounded transition-colors flex-shrink-0"
                    aria-label="Kapat"
                  >
                    <X className="w-4 h-4 text-[#2B1E17]/70" />
                  </button>
                )}

                {/* BOTTOM INDICATOR */}
                <div 
                  className={cn(
                    "absolute bottom-0 left-2 h-0.5 bg-[#C46A2B] rounded-full transition-all duration-300",
                    isSearchOpen ? "right-2" : "right-2 scale-x-0 group-hover:scale-x-100"
                  )}
                  style={{
                    transformOrigin: 'left'
                  }}
                />
              </div>
            </div>
          </div>

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
              {/* ACTIVE INDICATOR */}
              <div
                className={cn(
                  'absolute bottom-0 left-2 right-2 h-0.5 bg-[#C46A2B] rounded-full transition-transform duration-300',
                  isActiveRoute('/cart') ? 'scale-x-100' : 'scale-x-0'
                )}
              />
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

      {/* MOBILE MENU */}
      <div
        className={cn(
          "fixed top-16 left-0 right-0 bg-white shadow-lg md:hidden transition-all duration-300 overflow-hidden border-b border-[#E8E0D5]",
          isMenuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-4 py-3 space-y-1">
          {/* SEARCH - MOBILE */}
          <div className="mb-3">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#C46A2B]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ürün ara..."
                className="w-full pl-10 pr-4 py-2.5 text-[#2B1E17] placeholder:text-[#2B1E17]/40 bg-[#C46A2B]/5 border border-[#C46A2B]/20 rounded-lg outline-none focus:ring-2 focus:ring-[#C46A2B]/30 transition-all"
              />
            </form>
          </div>

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
    </nav>
  );
}

export default Navbar;