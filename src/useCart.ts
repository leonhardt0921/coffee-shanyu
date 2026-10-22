import { useMemo, useRef, useState } from 'react';
import { type Cart, type Entry, type Size, cartEntries, lineKey, normalizeCart, parseLine } from './data';
export const CART_KEY = 'shanyu-cart-v2';
const LEGACY_KEY = 'shanyu-cart-v1';
function readCart(): Cart {
  try {
    const raw = localStorage.getItem(CART_KEY);
    // Bags saved before cup sizes existed are keyed by bare product id.
    if (raw === null) { const legacy = localStorage.getItem(LEGACY_KEY); return legacy ? normalizeCart(JSON.parse(legacy)) : {}; }
    return normalizeCart(JSON.parse(raw));
  } catch { return {}; }
}
export function useCart() {
  const [cart, setCart] = useState<Cart>(readCart);
  const latest = useRef(cart);
  const [storageError, setStorageError] = useState('');
  const save = (next: Cart) => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(next));
      latest.current = next;
      setCart(next);
      setStorageError('');
      return true;
    } catch {
      setStorageError('浏览器未能保存购物袋，本次修改未生效。请释放存储空间后重试。');
      return false;
    }
  };
  const changeQuantity = (key: string, delta: number) => {
    if (!parseLine(key)) return false;
    if (!Number.isSafeInteger(delta)) return false;
    const next = { ...latest.current };
    const value = Math.min(99, Math.max(0, (next[key] ?? 0) + delta));
    if (value) next[key] = value; else delete next[key];
    return save(next);
  };
  /** Moving a line to another cup size merges into an existing line of that size. */
  const changeSize = (key: string, size: Size) => {
    const parsed = parseLine(key);
    if (!parsed || parsed.size === size) return false;
    const next = { ...latest.current };
    const qty = next[key] ?? 0;
    if (!qty) return false;
    delete next[key];
    const target = lineKey(parsed.product.id, size);
    next[target] = Math.min(99, (next[target] ?? 0) + qty);
    return save(next);
  };
  const remove = (key: string) => { const next = { ...latest.current }; delete next[key]; return save(next); };
  const entries = useMemo<Entry[]>(() => cartEntries(cart), [cart]);
  return { cart, entries, changeQuantity, changeSize, remove, clear: () => save({}), storageError,
    count: entries.reduce((sum, e) => sum + e.qty, 0) };
}
