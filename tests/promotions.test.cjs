// Run: node --test tests/promotions.test.cjs
// Uses installed TypeScript and React; no additional dependencies.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

const modules = new Map();
function loadSource(name) {
  const file = path.resolve(__dirname, '../src', name);
  if (modules.has(file)) return modules.get(file).exports;
  const mod = { exports: {} };
  modules.set(file, mod);
  const { outputText } = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    fileName: file,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  });
  const localRequire = id => id.startsWith('.')
    ? loadSource(path.relative(path.resolve(__dirname, '../src'), path.resolve(path.dirname(file), id)) + '.ts')
    : require(id);
  new Function('require', 'module', 'exports', outputText)(localRequire, mod, mod.exports);
  return mod.exports;
}
const { products, normalizeCart } = loadSource('data.ts');
const { quote } = loadSource('pricing.ts');
const { CartPromo } = loadSource('PromoComponents.tsx');
const { useCart, CART_KEY } = loadSource('useCart.ts');
const entry = (id, qty = 1, size = 'medium') => ({ product: products.find(p => p.id === id), qty, size });
const actual = (entries, member = false) => {
  const q = quote(entries, member);
  return [q.subtotal, q.bogoDiscount, q.afterBogo, q.exclusiveDiscount, q.total, q.plan];
};

// Expected values are hand-calculated in cents, not computed using quote's algorithm.
const cases = [
  ['empty', [], false, [0, 0, 0, 0, 0, 'none']],
  ['empty member', [], true, [0, 0, 0, 0, 0, 'none']],
  ['one coffee', [entry('latte')], false, [2200, 0, 2200, 0, 2200, 'none']],
  ['two equal coffees', [entry('latte', 2)], false, [4400, 1100, 3300, 0, 3300, 'none']],
  ['two unequal coffees: cheaper one half price', [entry('vanilla'), entry('americano')], false, [4700, 950, 3750, 0, 3750, 'none']],
  ['three equal coffees', [entry('latte', 3)], false, [6600, 1100, 5500, 800, 4700, 'threshold']],
  ['three unequal coffees', [entry('vanilla'), entry('latte'), entry('americano')], false, [6900, 1100, 5800, 800, 5000, 'threshold']],
  ['four equal coffees', [entry('latte', 4)], false, [8800, 2200, 6600, 800, 5800, 'threshold']],
  ['four unequal coffees', [entry('vanilla'), entry('oat'), entry('latte'), entry('americano')], false, [9500, 2250, 7250, 800, 6450, 'threshold']],
  ['five coffees', [entry('latte', 5)], false, [11000, 2200, 8800, 800, 8000, 'threshold']],
  ['desserts never half price', [entry('basque', 2)], false, [6400, 0, 6400, 800, 5600, 'threshold']],
  ['one coffee plus dessert is not a pair', [entry('latte'), entry('brownie')], false, [4000, 0, 4000, 0, 4000, 'none']],
  ['dessert excluded from coffee pairing', [entry('latte', 2), entry('basque')], false, [7600, 1100, 6500, 800, 5700, 'threshold']],
  ['original subtotal exceeds 50 but discounted subtotal does not', [entry('oat', 2)], false, [5200, 1300, 3900, 0, 3900, 'none']],
  ['exactly 50 after half price', [entry('latte'), entry('flat-white'), entry('cookie')], false, [6100, 1100, 5000, 800, 4200, 'threshold']],
  ['large cup extra is included in half price', [entry('latte', 2, 'large')], false, [5000, 1250, 3750, 0, 3750, 'none']],
  ['different sizes are paired by full unit price', [entry('latte'), entry('latte', 1, 'large')], false, [4700, 1100, 3600, 0, 3600, 'none']],
  ['member discount after half price', [entry('latte', 2)], true, [4400, 1100, 3300, 165, 3135, 'member']],
  ['threshold beats member', [entry('latte', 3)], true, [6600, 1100, 5500, 800, 4700, 'threshold']],
  ['member beats threshold', [entry('latte', 10)], true, [22000, 5500, 16500, 825, 15675, 'member']],
  ['non-member cannot get 95 percent price', [entry('latte', 10)], false, [22000, 5500, 16500, 800, 15700, 'threshold']],
  ['tie applies only one offer', [entry('basque', 5)], true, [16000, 0, 16000, 800, 15200, 'threshold']],
  ['member rounding to cent', [entry('americano', 3)], true, [5700, 950, 4750, 238, 4512, 'member']],
];
for (const [name, entries, member, expected] of cases) {
  test(name, () => assert.deepEqual(actual(entries, member), expected));
}

for (const amount of [4999, 5000, 5001]) {
  test(`threshold boundary ${amount} cents after half price`, () => {
    const product = { ...products[0], price: 2000 };
    const dessert = { ...products.find(p => p.id === 'cookie'), price: amount - 3000 };
    const q = quote([{ product, qty: 2, size: 'medium' }, { product: dessert, qty: 1, size: 'medium' }], false);
    assert.equal(q.afterBogo, amount);
    assert.equal(q.thresholdDiscount, amount >= 5000 ? 800 : 0);
  });
}

test('pairing is independent of input order; line amounts reconcile', () => {
  const entries = [entry('vanilla'), entry('oat'), entry('latte'), entry('americano'), entry('basque')];
  const q = quote(entries, true);
  assert.deepEqual(actual([...entries].reverse(), true), actual(entries, true));
  assert.equal(q.lines.reduce((n, x) => n + x.halfDiscount, 0), q.bogoDiscount);
  assert.equal(q.lines.reduce((n, x) => n + x.halfCups, 0), q.halfCups);
  assert.equal(q.lines.find(x => x.product.category === 'dessert').halfDiscount, 0);
  assert.equal(q.total + q.saved, q.subtotal);
});

// An independent exhaustive pairing oracle for small bags (no price sorting).
function bestPairDiscount(prices) {
  if (prices.length < 2) return 0;
  const [first, ...rest] = prices;
  let best = prices.length % 2 ? bestPairDiscount(rest) : 0;
  for (let i = 0; i < rest.length; i++) {
    best = Math.max(best, Math.min(first, rest[i]) / 2 + bestPairDiscount(rest.filter((_, j) => i !== j)));
  }
  return best;
}
test('780 coffee combinations of 1–4 cups agree with exhaustive pairing', () => {
  const choices = [entry('americano'), entry('latte'), entry('oat'), entry('vanilla'), entry('latte', 1, 'large')];
  let checked = 0;
  function visit(entries) {
    if (entries.length) {
      const prices = entries.map(e => e.product.price + (e.size === 'large' ? 300 : 0));
      assert.equal(quote(entries, false).bogoDiscount, bestPairDiscount(prices));
      checked++;
    }
    if (entries.length < 4) for (const e of choices) visit([...entries, e]);
  }
  visit([]);
  assert.equal(checked, 780);
});

// Hook/persistence integration: real React SSR initializes the hook; actions write
// to an isolated in-memory Storage, then a fresh render verifies saved state.
// This does not replace live-browser checks of mounted React reactivity.
function storage(initial) {
  const data = new Map(Object.entries(initial));
  global.localStorage = { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
}
function readBasket() {
  let basket;
  function Probe() { basket = useCart(); return null; }
  renderToStaticMarkup(React.createElement(Probe));
  return basket;
}
test('quantity changes 2 -> 3 -> 4 -> 3 recalculate discounts', () => {
  storage({ [CART_KEY]: JSON.stringify({ 'latte|medium': 2 }) });
  for (const [delta, expected] of [[1, 4700], [1, 5800], [-1, 4700]]) {
    readBasket().changeQuantity('latte|medium', delta);
    assert.equal(quote(readBasket().entries, false).total, expected);
  }
});
test('size change crosses threshold and removes threshold discount', () => {
  storage({ [CART_KEY]: JSON.stringify({ 'latte|large': 2, 'cookie|medium': 1 }) });
  assert.equal(quote(readBasket().entries, false).total, 4450);
  readBasket().changeSize('latte|large', 'medium');
  assert.equal(quote(readBasket().entries, false).total, 4800);
});
test('adding/removing products recalculates pair and exclusive discounts', () => {
  storage({ [CART_KEY]: JSON.stringify({ 'latte|medium': 2 }) });
  readBasket().changeQuantity('basque|medium', 1);
  assert.equal(quote(readBasket().entries, true).total, 5700);
  readBasket().remove('latte|medium');
  assert.equal(quote(readBasket().entries, true).total, 3040);
  readBasket().clear();
  assert.equal(quote(readBasket().entries, true).total, 0);
});
test('size merge below limit preserves all cups', () => {
  storage({ [CART_KEY]: JSON.stringify({ 'latte|medium': 2, 'latte|large': 3 }) });
  readBasket().changeSize('latte|medium', 'large');
  assert.equal(readBasket().count, 5);
  assert.equal(quote(readBasket().entries, false).total, 9200);
});
test('legacy bags migrate without losing quantities', () => {
  storage({ 'shanyu-cart-v1': JSON.stringify({ latte: 3, americano: 1 }) });
  assert.equal(readBasket().count, 4);
  assert.deepEqual(readBasket().cart, normalizeCart({ latte: 3, americano: 1 }));
});
test('failed persistence does not change saved cart', () => {
  storage({ [CART_KEY]: JSON.stringify({ 'latte|medium': 2 }) });
  global.localStorage.setItem = () => { throw new Error('quota exceeded'); };
  assert.equal(readBasket().changeQuantity('latte|medium', 1), false);
  assert.equal(readBasket().count, 2);
});

test('REGRESSION: member-winning order must not label threshold as selected', () => {
  const order = quote([entry('latte', 10)], true);
  assert.equal(order.plan, 'member');
  const html = renderToStaticMarkup(React.createElement(CartPromo, { order, isMember: true, onToggleMember() {}, storageError: '' }));
  const thresholdRow = html.match(/<li class="promo-choice [^"]*">.*?<\/li>/)[0];
  assert.doesNotMatch(thresholdRow, /已选用/, 'Only the member offer should be selected');
});
test('REGRESSION: changing cup size must not silently discard cups at limit', () => {
  storage({ [CART_KEY]: JSON.stringify({ 'latte|medium': 1, 'latte|large': 99 }) });
  assert.equal(readBasket().count, 100);
  readBasket().changeSize('latte|medium', 'large');
  assert.equal(readBasket().count, 100, 'Reject the merge or preserve overflow; do not remove a purchased cup');
});
