import { cn } from '../lib/utils';
import { Menu, X, ShoppingCart, Search } from 'lucide-react';
import { useEffect, useState, useRef, useMemo } from 'react';
import { useLocation, Link, useNavigate, useSearchParams } from 'react-router-dom';
import products from '../data/products.json';
import { useCart } from '../context/CartContext';

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const activeSearchQuery = searchParams.get('search') || '';
  const hasActiveSearch = activeSearchQuery.trim() !== '';

  const { cartTotals } = useCart();
  const totalItems = cartTotals.itemCount;

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return products.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);
  }, [searchQuery]);

  const navItems = [
    { name: 'Ana Sayfa', href: '/' },
    { name: 'Menü', href: '/menu' },
    { name: 'Siparişlerim', href: '/order-history' },
  ];

  // CHECK ACTIVE ROUTE
  const isActiveRoute = (href) => {
    if (href === '/') {
      return location.pathname === '/' || location.pathname === '';
    }
    return location.pathname.startsWith(href);
  };

  // SCROLL HANDLER
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // MOBILE MENU BODY SCROLL LOCK
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

  // SEARCH INPUT FOCUS
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/menu?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  // SEARCH CLOSE HANDLER
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
            {/* LOGO */}
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

            {/* SEARCH BAR - DESKTOP */}
            <div className="hidden md:flex items-center relative">
              <div
                className={cn(
                  "relative flex items-center gap-2 px-4 py-2 transition-all duration-300 rounded-lg",
                  isSearchOpen
                    ? "w-[280px] text-[#C46A2B]"
                    : hasActiveSearch
                      ? "w-auto text-[#C46A2B] bg-[#C46A2B]/10"
                      : "w-auto text-[#2B1E17] hover:text-[#C46A2B] hover:bg-[#C46A2B]/5"
                )}
              >
                <Search className="w-5 h-5 flex-shrink-0" />

                {/* ACTIVE SEARCH TEXT */}
                {!isSearchOpen && hasActiveSearch && (
                  <>
                    <span className="text-sm font-medium max-w-[150px] truncate">
                      "{activeSearchQuery}"
                    </span>
                    <button
                      onClick={() => {
                        const newParams = new URLSearchParams(searchParams);
                        newParams.delete('search');
                        navigate(`/menu${newParams.toString() ? '?' + newParams.toString() : ''}`);
                      }}
                      className="p-1 hover:bg-[#C46A2B]/20 rounded transition-colors flex-shrink-0"
                      aria-label="Aramayı temizle"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                )}

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

                {!isSearchOpen && !hasActiveSearch && (
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

              {/* SEARCH RESULTS DROPDOWN */}
              {isSearchOpen && filteredProducts.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-[#E8E0D5] overflow-hidden z-50">
                  {filteredProducts.map((product) => (
                    <Link
                      key={product.id}
                      to={`/product/${product.id}`}
                      className="flex items-center gap-3 p-3 hover:bg-[#F5F1EB] transition-colors"
                      onClick={() => {
                        setSearchQuery('');
                        setIsSearchOpen(false);
                      }}
                    >
                      {/* PRODUCT IMAGE */}
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#F5F1EB] flex-shrink-0">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* PRODUCT INFO */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-[#2B1E17] truncate">{product.name}</p>
                        <p className="text-xs text-[#8B7E75]">{product.category}</p>
                      </div>

                      {/* PRICE */}
                      <span className="font-bold text-[#C46A2B]">₺{product.price}</span>
                    </Link>
                  ))}

                  {/* VIEW ALL RESULTS */}
                  <Link
                    to={`/menu?search=${encodeURIComponent(searchQuery)}`}
                    className="block p-3 text-center text-sm text-[#C46A2B] font-medium hover:bg-[#F5F1EB] border-t border-[#E8E0D5]"
                    onClick={() => {
                      setSearchQuery('');
                      setIsSearchOpen(false);
                    }}
                  >
                    Tüm sonuçları gör
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* DESKTOP NAVIGATION */}
          <div className="hidden md:flex items-center space-x-1">
            {/* NAVIGATION LINKS */}
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

            {/* CART ICON - DESKTOP */}
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
                <span className="absolute top-0 right-0 w-4 h-4 bg-[#C46A2B] rounded-full border-2 border-white animate-pulse" />
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
          {/* SEARCH BAR - MOBILE */}
          <div className="mb-3">
            {hasActiveSearch ? (
              <div className="flex items-center justify-between px-4 py-2.5 bg-[#C46A2B]/10 border border-[#C46A2B]/20 rounded-lg">
                <div className="flex items-center gap-2 text-[#C46A2B]">
                  <Search className="w-5 h-5" />
                  <span className="font-medium truncate max-w-[200px]">"{activeSearchQuery}"</span>
                </div>
                <button
                  onClick={() => {
                    const newParams = new URLSearchParams(searchParams);
                    newParams.delete('search');
                    navigate(`/menu${newParams.toString() ? '?' + newParams.toString() : ''}`);
                    setIsMenuOpen(false);
                  }}
                  className="p-1 hover:bg-[#C46A2B]/20 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-[#C46A2B]" />
                </button>
              </div>
            ) : (
              <form onSubmit={(e) => { handleSearchSubmit(e); setIsMenuOpen(false); }} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#C46A2B]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ürün ara..."
                  className="w-full pl-10 pr-4 py-2.5 text-[#2B1E17] placeholder:text-[#2B1E17]/40 bg-[#C46A2B]/5 border border-[#C46A2B]/20 rounded-lg outline-none focus:ring-2 focus:ring-[#C46A2B]/30 transition-all"
                />
              </form>
            )}
          </div>

          {/* NAVIGATION LINKS - MOBILE */}
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

          {/* CART - MOBILE MENU */}
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