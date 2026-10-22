export type Product = { id: string; name: string; english: string; note: string; price: number; image: string; tag?: string };
export const products: Product[] = [
  { id: 'americano', name: '山隅美式', english: 'AMERICANO', note: '清爽坚果香 · 冰 / 热', price: 1900, image: '/assets/iced.png', tag: '日常之选' },
  { id: 'latte', name: '云朵拿铁', english: 'CAFFÈ LATTE', note: '绵密奶香 · 热饮', price: 2200, image: '/assets/latte.png', tag: '店长推荐' },
  { id: 'oat', name: '燕麦轻拿铁', english: 'OAT LATTE', note: '谷物回甘 · 冰饮', price: 2600, image: '/assets/oat.png', tag: '植物基' },
  { id: 'flat-white', name: '馥郁小白', english: 'FLAT WHITE', note: '双份浓缩 · 热饮', price: 2400, image: '/assets/latte.png' },
  { id: 'cold-brew', name: '山野冷萃', english: 'COLD BREW', note: '柔和果香 · 冰饮', price: 2500, image: '/assets/iced.png' },
  { id: 'vanilla', name: '香草云拿铁', english: 'VANILLA LATTE', note: '香草尾韵 · 冰饮', price: 2800, image: '/assets/oat.png' },
];
export const money = (cents: number) => `¥${(cents / 100).toFixed(2)}`;
export type Cart = Record<string, number>;
export function normalizeCart(raw: unknown): Cart {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const cart: Cart = {};
  for (const product of products) {
    const quantity = (raw as Cart)[product.id];
    if (Number.isInteger(quantity) && quantity > 0 && quantity <= 99) cart[product.id] = quantity;
  }
  return cart;
}
export const cartSubtotal = (cart: Cart) => products.reduce((sum, p) => sum + p.price * (cart[p.id] ?? 0), 0);
