import { describe, expect, test } from 'vitest';
import { cartSubtotal, money, normalizeCart } from '../../src/data';

describe('基础购物袋数据边界', () => {
  test('真实业务组合：美式19元加拿铁22元，合计41元', () => {
    expect(cartSubtotal({ americano: 1, latte: 1 })).toBe(4100);
    expect(cartSubtotal({ oat: 3 })).toBe(7800);
    expect(cartSubtotal({})).toBe(0);
  });

  test.each([null, undefined, 'broken', 5, false, [], ['americano']])('拒绝非购物袋对象：%j', raw => {
    expect(normalizeCart(raw)).toEqual({});
  });

  test.each([-1, 0, 1.5, 100, 99999, '1', NaN, Infinity, null, true])('拒绝非法数量：%j', quantity => {
    expect(normalizeCart({ americano: quantity })).toEqual({});
  });

  test('只保留存在的商品与1至99的整数数量', () => {
    expect(normalizeCart({ americano: 1, latte: 99, oat: -2, unknown: 10 })).toEqual({ americano: 1, latte: 99 });
  });

  test.each([[0, '¥0.00'], [1, '¥0.01'], [3899, '¥38.99'], [3900, '¥39.00'], [3901, '¥39.01'], [7800, '¥78.00']])('金额始终保留两位小数：%i', (cents, expected) => {
    expect(money(Number(cents))).toBe(expected);
  });
});
