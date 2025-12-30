import { cn, formatPrice } from '../lib/utils';
import { X, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

function CartDrawer() {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    isCartOpen,
    closeCart,
  } = useCart();

  const navigate = useNavigate();

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  // Ürün fiyatını hesapla (size + extras)
  const calculateItemPrice = (item) => {
    const extrasTotal = item.selectedExtras
      ? item.selectedExtras.reduce((acc, extra) => acc + extra.price, 0)
      : 0;
    const basePrice = item.selectedSize ? item.selectedSize.price : item.price;
    return basePrice + extrasTotal;
  };

  return (
    <>
      {/* OVERLAY */}
      <div
        className={cn(
          'fixed inset-0 bg-black/40 z-50 transition-opacity duration-300',
          isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={closeCart}
      />

      {/* DRAWER PANEL */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-2xl z-50 transition-transform duration-300 ease-out flex flex-col',
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-[#E8E0D5]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#C46A2B]" />
            <h2 className="text-lg font-semibold text-[#2B1E17]">
              Sepetim ({totalItems})
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="p-2 text-[#6B5E55] hover:text-[#2B1E17] hover:bg-[#C46A2B]/5 rounded-lg transition-colors"
            aria-label="Sepeti Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CART ITEMS */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="w-16 h-16 text-[#E8E0D5] mb-4" />
              <p className="text-[#6B5E55] text-lg font-medium mb-2">
                Sepetiniz boş
              </p>
              <p className="text-[#8B7E75] text-sm mb-6">
                Lezzetli kahvelerimizi keşfedin!
              </p>
              <button
                onClick={() => {
                  closeCart();
                  navigate('/menu');
                }}
                className="px-6 py-2 bg-[#C46A2B] text-white font-medium rounded-lg hover:bg-[#A85A24] transition-colors"
              >
                Menüye Git
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={`${item.id}-${item.selectedSize?.name || 'default'}`}
                  className="flex gap-3 p-3 bg-[#FAF7F2] rounded-lg"
                >
                  {/* Ürün Resmi */}
                  <div className="w-20 h-20 bg-[#E8E0D5] rounded-lg overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#8B7E75]">
                        <ShoppingBag className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  {/* Ürün Bilgileri */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-[#2B1E17] truncate">
                      {item.name}
                    </h3>

                    {/* Size & Extras */}
                    <div className="text-xs text-[#6B5E55] mt-1">
                      {item.selectedSize && (
                        <span>{item.selectedSize.name}</span>
                      )}
                      {item.selectedExtras?.length > 0 && (
                        <span className="ml-1">
                          + {item.selectedExtras.map((e) => e.name).join(', ')}
                        </span>
                      )}
                    </div>

                    {/* Fiyat */}
                    <p className="text-[#C46A2B] font-semibold mt-1">
                      {formatPrice(calculateItemPrice(item))}
                    </p>

                    {/* Adet Kontrolleri */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-md bg-white border border-[#E8E0D5] text-[#6B5E55] hover:border-[#C46A2B] hover:text-[#C46A2B] transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-medium text-[#2B1E17]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-md bg-white border border-[#E8E0D5] text-[#6B5E55] hover:border-[#C46A2B] hover:text-[#C46A2B] transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Sil Butonu */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1.5 text-[#8B7E75] hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        aria-label="Ürünü Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Sepeti Temizle */}
              <button
                onClick={clearCart}
                className="w-full py-2 text-sm text-[#8B7E75] hover:text-red-500 transition-colors"
              >
                Sepeti Temizle
              </button>
            </div>
          )}
        </div>

        {/* FOOTER - Toplam & Checkout */}
        {cartItems.length > 0 && (
          <div className="border-t border-[#E8E0D5] px-4 py-4 bg-white">
            {/* Ara Toplam */}
            <div className="flex justify-between text-sm text-[#6B5E55] mb-2">
              <span>Ara Toplam</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>

            {/* KDV */}
            <div className="flex justify-between text-sm text-[#6B5E55] mb-2">
              <span>KDV (%10)</span>
              <span>{formatPrice(totalPrice * 0.1)}</span>
            </div>

            {/* Toplam */}
            <div className="flex justify-between text-lg font-semibold text-[#2B1E17] mb-4 pt-2 border-t border-[#E8E0D5]">
              <span>Toplam</span>
              <span className="text-[#C46A2B]">{formatPrice(totalPrice * 1.1)}</span>
            </div>

            {/* Checkout Butonu */}
            <button
              onClick={handleCheckout}
              className="w-full py-3 bg-[#C46A2B] text-white font-semibold rounded-lg hover:bg-[#A85A24] transition-colors"
            >
              Siparişi Tamamla
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default CartDrawer;
