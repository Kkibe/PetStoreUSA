import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { session } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!session?.user) { setCartItems([]); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from('cart_items')
      .select('id, quantity, product_id, products(id, name, slug, price, image_url, stock)')
      .eq('user_id', session.user.id);
    if (!error && data) {
      setCartItems(data.map((c) => ({ ...c, product: c.products })));
    }
    setLoading(false);
  }, [session?.user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = async (productId, qty = 1) => {
    if (!session?.user) throw new Error('Please sign in to add items to your cart.');
    const { data: existing } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', session.user.id)
      .eq('product_id', productId)
      .maybeSingle();
    if (existing) {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + qty })
        .eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('cart_items')
        .insert({ product_id: productId, quantity: qty });
      if (error) throw error;
    }
    await fetchCart();
  };

  const updateQuantity = async (cartId, quantity) => {
    if (quantity <= 0) { await removeFromCart(cartId); return; }
    const { error } = await supabase.from('cart_items').update({ quantity }).eq('id', cartId);
    if (error) throw error;
    await fetchCart();
  };

  const removeFromCart = async (cartId) => {
    const { error } = await supabase.from('cart_items').delete().eq('id', cartId);
    if (error) throw error;
    await fetchCart();
  };

  const clearCart = async () => {
    if (!session?.user) return;
    const { error } = await supabase.from('cart_items').delete().eq('user_id', session.user.id);
    if (error) throw error;
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = cartItems.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0);

  const value = { cartItems, loading, cartCount, cartTotal, addToCart, updateQuantity, removeFromCart, clearCart, fetchCart };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
