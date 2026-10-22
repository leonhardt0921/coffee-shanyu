import { useRef, useState } from 'react';
import { COUPON_ID, COUPON_KEY, emptyCoupon, normalizeCoupon, type CouponState } from './coupon';

function readCoupon(): CouponState {
  try { return normalizeCoupon(JSON.parse(localStorage.getItem(COUPON_KEY) ?? 'null')); }
  catch { return emptyCoupon(); }
}

export function useCoupon() {
  const [coupon, setCoupon] = useState<CouponState>(readCoupon);
  const latest = useRef(coupon);
  const [storageError, setStorageError] = useState('');
  const save = (next: CouponState) => {
    try {
      localStorage.setItem(COUPON_KEY, JSON.stringify(next));
      latest.current = next;
      setCoupon(next);
      setStorageError('');
      return true;
    } catch {
      setStorageError('浏览器未能保存礼券，本次修改未生效。请释放存储空间后重试。');
      return false;
    }
  };
  const claim = () => {
    // Synchronous state also guards consecutive events before React renders.
    if (latest.current.claimed) return false;
    return save({ activityId: COUPON_ID, claimed: true, enabled: true });
  };
  const toggle = () => {
    if (!latest.current.claimed) return false;
    return save({ ...latest.current, enabled: !latest.current.enabled });
  };
  return { coupon, claim, toggle, storageError };
}
