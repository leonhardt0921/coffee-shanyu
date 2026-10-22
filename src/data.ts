export type Category = 'coffee' | 'dessert';
export type Size = 'medium' | 'large';
export type Product = { id: string; name: string; english: string; note: string; price: number; image: string; tag?: string; category: Category };
export const products: Product[] = [
  { id: 'americano', name: '山隅美式', english: 'AMERICANO', note: '清爽坚果香 · 冰 / 热', price: 1900, image: '/assets/iced.png', tag: '日常之选', category: 'coffee' },
  { id: 'latte', name: '云朵拿铁', english: 'CAFFÈ LATTE', note: '绵密奶香 · 热饮', price: 2200, image: '/assets/latte.png', tag: '店长推荐', category: 'coffee' },
  { id: 'oat', name: '燕麦轻拿铁', english: 'OAT LATTE', note: '谷物回甘 · 冰饮', price: 2600, image: '/assets/oat.png', tag: '植物基', category: 'coffee' },
  { id: 'flat-white', name: '馥郁小白', english: 'FLAT WHITE', note: '双份浓缩 · 热饮', price: 2400, image: '/assets/latte.png', category: 'coffee' },
  { id: 'cold-brew', name: '山野冷萃', english: 'COLD BREW', note: '柔和果香 · 冰饮', price: 2500, image: '/assets/iced.png', category: 'coffee' },
  { id: 'vanilla', name: '香草云拿铁', english: 'VANILLA LATTE', note: '香草尾韵 · 冰饮', price: 2800, image: '/assets/oat.png', category: 'coffee' },
  { id: 'basque', name: '山隅巴斯克', english: 'BASQUE CHEESECAKE', note: '焦香芝士 · 现烤出炉', price: 3200, image: '/assets/latte.png', tag: '人气甜点', category: 'dessert' },
  { id: 'brownie', name: '可可布朗尼', english: 'CACAO BROWNIE', note: '浓醇可可 · 微苦回甘', price: 1800, image: '/assets/iced.png', category: 'dessert' },
  { id: 'cookie', name: '燕麦曲奇', english: 'OAT COOKIE', note: '酥脆谷物 · 单份两片', price: 1500, image: '/assets/oat.png', category: 'dessert' },
];
export const money = (cents: number) => `¥${(cents / 100).toFixed(2)}`;
export const LARGE_EXTRA = 300;
export const sizes: readonly Size[] = ['medium', 'large'];
export const sizeLabel = (size: Size) => (size === 'large' ? '大杯' : '中杯');
/** Only coffee is priced by cup size; desserts are sold as a single portion. */
export const unitPrice = (product: Product, size: Size) => product.price + (product.category === 'coffee' && size === 'large' ? LARGE_EXTRA : 0);
export const hasSizes = (product: Product) => product.category === 'coffee';

export type Cart = Record<string, number>;
export type Entry = { product: Product; size: Size; qty: number };
export const lineKey = (id: string, size: Size) => `${id}|${size}`;
export const parseLine = (key: string) => {
  const [id, raw] = key.split('|');
  const product = products.find(p => p.id === id);
  if (!product) return null;
  // Legacy v1 keys carry a bare product id; desserts never carry a size.
  const size: Size = raw === 'large' && product.category === 'coffee' ? 'large' : 'medium';
  return { product, size };
};
export function normalizeCart(raw: unknown): Cart {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const cart: Cart = {};
  for (const [key, quantity] of Object.entries(raw as Cart)) {
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) continue;
    const parsed = parseLine(key);
    if (!parsed) continue;
    const canonical = lineKey(parsed.product.id, parsed.size);
    cart[canonical] = Math.min(99, (cart[canonical] ?? 0) + quantity);
  }
  return cart;
}
/** Stable order: menu order first, then medium before large. */
export const cartEntries = (cart: Cart): Entry[] => {
  const entries: Entry[] = [];
  for (const product of products) for (const size of sizes) {
    const qty = cart[lineKey(product.id, size)] ?? 0;
    if (qty > 0) entries.push({ product, size, qty });
  }
  return entries;
};
export const cartSubtotal = (cart: Cart) => cartEntries(cart).reduce((sum, e) => sum + unitPrice(e.product, e.size) * e.qty, 0);
