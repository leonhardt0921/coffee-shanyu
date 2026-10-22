import { describe, expect, test } from 'vitest';
import { couponDiscount, normalizeCoupon, type CouponState } from '../../src/coupon';

const active: CouponState = { activityId: 'opening-10', claimed: true, enabled: true };
const empty: CouponState = { activityId: 'opening-10', claimed: false, enabled: false };

describe('开业礼规则——需求中的金额边界', () => {
  test.each([[0, 0], [1, 0], [3899, 0], [3900, 1000], [3901, 1000], [4100, 1000], [7800, 1000], [780000, 1000]])('小计%i分应减%i分', (subtotal, expectedDiscount) => {
    const discount = couponDiscount(subtotal, active);
    expect(discount).toBe(expectedDiscount);
    expect(Number.isInteger(discount)).toBe(true);
    expect(subtotal - discount).toBeGreaterThanOrEqual(0);
  });

  test.each([0, 3899, 3900, 4100, 7800])('未领取或未启用均不优惠：%i', subtotal => {
    expect(couponDiscount(subtotal, empty)).toBe(0);
    expect(couponDiscount(subtotal, { ...active, enabled: false })).toBe(0);
    expect(couponDiscount(subtotal, { ...empty, enabled: true })).toBe(0);
  });

  test('达到门槛、减购失效、恢复门槛的连续纯规则验证', () => {
    expect([4100, 1900, 4100, 0].map(subtotal => subtotal - couponDiscount(subtotal, active))).toEqual([3100, 1900, 3100, 0]);
  });

  test.each([-1, 3900.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])('非法整数分不产生优惠：%j', subtotal => {
    expect(couponDiscount(subtotal, active)).toBe(0);
  });

  test.each([null, undefined, 'broken', 1, [], {}, { activityId: 'other', claimed: true, enabled: true }, { activityId: 'opening-10', claimed: 'true', enabled: true }, { activityId: 'opening-10', claimed: true, enabled: 'true' }, { activityId: 'opening-10', claimed: false, enabled: true }])('畸形优惠状态安全恢复：%j', raw => {
    expect(normalizeCoupon(raw)).toEqual(empty);
  });

  test('已领取的开和关状态都能恢复，重复规范化不会产生额外礼券', () => {
    expect(normalizeCoupon(active)).toEqual(active);
    expect(normalizeCoupon(normalizeCoupon(active))).toEqual(active);
    expect(normalizeCoupon({ ...active, enabled: false })).toEqual({ ...active, enabled: false });
  });
});
