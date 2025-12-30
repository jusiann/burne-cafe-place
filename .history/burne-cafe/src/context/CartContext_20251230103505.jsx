import { createContext, useContext, useEffect, useState } from 'react';
import { storage } from '../lib/utils';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    // LocalStorage'dan sepeti yükle
    return storage.get('cart', []);
  });

  // Sepet paneli açık/kapalı state'i
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sepet panelini aç
  const openCart = () => setIsCartOpen(true);

  // Sepet panelini kapat
  const closeCart = () => setIsCartOpen(false);

  // Sepet panelini toggle
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  // Sepet her değiştiğinde LocalStorage'a kaydet
  useEffect(() => {
    storage.set('cart', cartItems);
  }, [cartItems]);

  // Panel açıkken body scroll'u kilitle
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen]);

  // Sepete ürün ekle
  const addToCart = (product) => {
    setCartItems((prevItems) => {
      // Aynı ürün (aynı ID ve seçeneklerle) zaten var mı kontrol et
      const existingItemIndex = prevItems.findIndex(
        (item) =>
          item.id === product.id &&
          JSON.stringify(item.selectedSize) === JSON.stringify(product.selectedSize) &&
          JSON.stringify(item.selectedExtras) === JSON.stringify(product.selectedExtras)
      );

      if (existingItemIndex > -1) {
        // Varsa adedini artır
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += product.quantity || 1;
        return updatedItems;
      }

      // Yoksa yeni ürün olarak ekle
      return [...prevItems, { ...product, quantity: product.quantity || 1 }];
    });
    // Ürün eklendiğinde sepeti aç
    openCart();
  };

  // Sepetten ürün sil
  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  // Ürün adedini güncelle
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  // Sepeti temizle
  const clearCart = () => {
    setCartItems([]);
  };

  // Toplam ürün sayısı (sepet badge için)
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Toplam fiyat hesapla
  const totalPrice = cartItems.reduce((sum, item) => {
    const extrasTotal = item.selectedExtras
      ? item.selectedExtras.reduce((acc, extra) => acc + extra.price, 0)
      : 0;
    const sizePrice = item.selectedSize ? item.selectedSize.price : item.price;
    return sum + (sizePrice + extrasTotal) * item.quantity;
  }, 0);

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    isCartOpen,
    openCart,
    closeCart,
    toggleCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
