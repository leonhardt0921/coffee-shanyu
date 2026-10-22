export const COUPON_ID = 'opening-10';
export const COUPON_KEY = 'shanyu-coupon-v1';
export const COUPON_THRESHOLD = 3900;
export const COUPON_VALUE = 1000;

export type CouponState = { activityId: typeof COUPON_ID; claimed: boolean; enabled: boolean };
export const emptyCoupon = (): CouponState => ({ activityId: COUPON_ID, claimed: false, enabled: false });

export function normalizeCoupon(raw: unknown): CouponState {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return emptyCoupon();
  const value = raw as Partial<CouponState>;
  if (value.activityId !== COUPON_ID || value.claimed !== true || typeof value.enabled !== 'boolean') return emptyCoupon();
  return { activityId: COUPON_ID, claimed: true, enabled: value.enabled };
}

/** Amounts are integer cents. This offer applies once to the whole bag. */
export function couponDiscount(subtotal: number, coupon: CouponState): number {
  return Number.isSafeInteger(subtotal) && subtotal >= COUPON_THRESHOLD
    && coupon.activityId === COUPON_ID && coupon.claimed && coupon.enabled ? COUPON_VALUE : 0;
}
