import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { session } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFavorites = useCallback(async () => {
    if (!session?.user) { setFavorites([]); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from('favorites')
      .select('id, product_id, products(*)')
      .eq('user_id', session.user.id);
    if (!error && data) {
      setFavorites(data.map((f) => ({ id: f.id, product_id: f.product_id, product: f.products })));
    }
    setLoading(false);
  }, [session?.user]);

  useEffect(() => { fetchFavorites(); }, [fetchFavorites]);

  const isFavorite = useCallback((productId) => {
    return favorites.some((f) => f.product_id === productId);
  }, [favorites]);

  const toggleFavorite = async (productId) => {
    if (!session?.user) throw new Error('Please sign in to save pets.');
    const existing = favorites.find((f) => f.product_id === productId);
    if (existing) {
      const { error } = await supabase.from('favorites').delete().eq('id', existing.id);
      if (error) throw error;
      setFavorites((prev) => prev.filter((f) => f.id !== existing.id));
    } else {
      const { data, error } = await supabase
        .from('favorites')
        .insert({ product_id: productId })
        .select('id, product_id')
        .maybeSingle();
      if (error) throw error;
      if (data) {
        const { data: prod } = await supabase.from('products').select('*').eq('id', productId).maybeSingle();
        setFavorites((prev) => [...prev, { id: data.id, product_id: productId, product: prod }]);
      }
    }
  };

  const value = { favorites, loading, isFavorite, toggleFavorite, fetchFavorites };
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
