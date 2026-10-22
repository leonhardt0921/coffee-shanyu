import { useState } from 'react';
import { type Cart, cartSubtotal, normalizeCart, products } from './data';
export const CART_KEY = 'shanyu-cart-v1';
function readCart(): Cart {
  try { return normalizeCart(JSON.parse(localStorage.getItem(CART_KEY) ?? '{}')); }
  catch { return {}; }
}
export function useCart() {
  const [cart, setCart] = useState<Cart>(readCart);
  const [storageError, setStorageError] = useState('');
  const save = (next: Cart) => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(next));
      setCart(next);
      setStorageError('');
      return true;
    } catch {
      setStorageError('浏览器未能保存购物袋，本次修改未生效。请释放存储空间后重试。');
      return false;
    }
  };
  const changeQuantity = (id: string, delta: number) => {
    if (!products.some(p => p.id === id)) return false;
    const next = { ...cart };
    const value = Math.min(99, Math.max(0, (next[id] ?? 0) + delta));
    if (value) next[id] = value; else delete next[id];
    return save(next);
  };
  const remove = (id: string) => { const next = { ...cart }; delete next[id]; return save(next); };
  return { cart, changeQuantity, remove, clear: () => save({}), storageError,
    count: Object.values(cart).reduce((a, b) => a + b, 0), subtotal: cartSubtotal(cart) };
}
