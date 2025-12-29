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
    { name: 'Siparişlerim', href: '/siparislerim' },
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

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300',
        isScrolled
          ? 'bg-amber-50/95 dark:bg-neutral-900/95 backdrop-blur-md shadow-lg border-b border-amber-200 dark:border-neutral-800'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* LOGO */}
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold text-amber-900 dark:text-amber-100 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
          >
            <Coffee className="w-6 h-6" />
            <span>
              BURNÉ <span className="text-amber-600 dark:text-amber-400">Coffee</span>
            </span>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item, key) => (
              <Link
                key={key}
                to={item.href}
                className={cn(
                  'relative px-4 py-2 font-medium transition-all duration-300 rounded-lg',
                  isActiveRoute(item.href)
                    ? 'text-amber-900 dark:text-amber-100 bg-amber-100 dark:bg-neutral-800'
                    : 'text-neutral-700 dark:text-neutral-300 hover:text-amber-900 dark:hover:text-amber-100 hover:bg-amber-50 dark:hover:bg-neutral-800/50'
                )}
              >
                {item.name}
              </Link>
            ))}

            {/* SEPET İKONU - DESKTOP */}
            <Link
              to="/sepet"
              className={cn(
                'relative p-2 ml-2 rounded-lg transition-all duration-300',
                isActiveRoute('/sepet')
                  ? 'text-amber-900 dark:text-amber-100 bg-amber-100 dark:bg-neutral-800'
                  : 'text-neutral-700 dark:text-neutral-300 hover:text-amber-900 dark:hover:text-amber-100 hover:bg-amber-50 dark:hover:bg-neutral-800/50'
              )}
            >
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-600 dark:bg-amber-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="md:hidden p-2 text-neutral-700 dark:text-neutral-300 hover:text-amber-900 dark:hover:text-amber-100 transition-colors"
            aria-label={isMenuOpen ? 'Menüyü Kapat' : 'Menüyü Aç'}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* MOBILE NAVIGATION */}
      <div
        className={cn(
          'fixed top-16 left-0 right-0 bg-amber-50/98 dark:bg-neutral-900/98 backdrop-blur-md shadow-lg md:hidden transition-all duration-300 overflow-hidden border-b border-amber-200 dark:border-neutral-800',
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="px-4 py-4 space-y-2">
          {navItems.map((item, key) => (
            <Link
              key={key}
              to={item.href}
              className={cn(
                'block px-4 py-3 font-medium rounded-lg transition-all duration-300',
                isActiveRoute(item.href)
                  ? 'text-amber-900 dark:text-amber-100 bg-amber-100 dark:bg-neutral-800'
                  : 'text-neutral-700 dark:text-neutral-300 hover:text-amber-900 dark:hover:text-amber-100 hover:bg-amber-100 dark:hover:bg-neutral-800'
              )}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}

          {/* SEPET İKONU - MOBILE */}
          <Link
            to="/sepet"
            className={cn(
              'flex items-center gap-2 px-4 py-3 font-medium rounded-lg transition-all duration-300',
              isActiveRoute('/sepet')
                ? 'text-amber-900 dark:text-amber-100 bg-amber-100 dark:bg-neutral-800'
                : 'text-neutral-700 dark:text-neutral-300 hover:text-amber-900 dark:hover:text-amber-100 hover:bg-amber-100 dark:hover:bg-neutral-800'
            )}
            onClick={() => setIsMenuOpen(false)}
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-amber-600 dark:bg-amber-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </div>
            <span>Sepetim ({totalItems})</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;