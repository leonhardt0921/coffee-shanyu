import { type CouponState, COUPON_THRESHOLD, couponDiscount } from './coupon';
import { money } from './data';

export function CouponCard({ coupon, onOpen }: { coupon: CouponState; onOpen: (trigger: HTMLButtonElement) => void }) {
  return <section className={`coupon-card ${coupon.claimed ? 'is-claimed' : ''}`} aria-label="山隅开业礼">
    <div className="coupon-value"><span>¥</span><strong>10</strong><small>满 ¥39.00 可用</small></div>
    <div className="coupon-copy"><span className="eyebrow">A LITTLE WELCOME</span><h2>初次相遇，一点心意。</h2><p>{coupon.claimed ? (coupon.enabled ? '礼券已领取 · 已启用，满额自动减' : '礼券已领取 · 可在购物袋开启使用') : '山隅开业礼 · 每位体验会员限领一张'}</p></div>
    <button className="coupon-card-button" onClick={event => onOpen(event.currentTarget)}>{coupon.claimed ? '查看礼券' : '领取开业礼'}<span aria-hidden="true">↗</span></button>
  </section>;
}

export function CouponRules({ claimed, onClaim, storageError }: { claimed: boolean; onClaim: () => void; storageError: string }) {
  return <div className="coupon-rules">
    <div className="coupon-ticket"><p className="eyebrow">YOUR FIRST SHANYU MOMENT</p><div><span>¥</span><strong>10</strong></div><h3>开业礼券 · 满 ¥39.00 减 ¥10.00</h3><p>让第一杯相遇，多一点好心情。</p></div>
    <h3 className="rules-heading">礼券使用说明</h3>
    <ol><li>当前浏览器的本地演示会员，每个活动限领一张。所有咖啡均可参与。</li><li>商品小计满 ¥39.00，整袋减 ¥10.00；满 ¥78.00 也只减一次。</li><li>领取后默认启用。可在购物袋取消或恢复使用；未满门槛时不减，再次满额自动恢复。</li><li>领取、使用选择和购物袋会保存在当前浏览器。清除浏览器数据后会重置；不支持跨设备同步。</li><li>本券仅用于本地演示的金额试算，没有真实付款、核销或现金价值。</li></ol>
    {storageError && <p className="inline-error" role="alert">{storageError}</p>}
    {claimed ? <p className="coupon-claimed-note" role="status">已领取 · 可在购物袋选择是否使用</p> : <button className="primary-button claim-button" onClick={onClaim}>确认领取并启用</button>}
    <p className="quiet-note">活动编号 opening-10 · 演示会员专属</p>
  </div>;
}

export function CartCoupon({ coupon, subtotal, onToggle, storageError }: { coupon: CouponState; subtotal: number; onToggle: () => void; storageError: string }) {
  const discount = couponDiscount(subtotal, coupon);
  const hint = !coupon.claimed ? '可在首页领取开业礼，满额减 ¥10.00。'
    : !coupon.enabled ? '已暂停使用，本次按商品小计试算。'
    : discount ? '已满足使用门槛，本袋已减 ¥10.00。'
    : `再选 ${money(Math.max(0, COUPON_THRESHOLD - subtotal))}，即可使用开业礼券。`;
  return <div className="cart-coupon"><div className="cart-coupon-heading"><div><span className="eyebrow">WELCOME GIFT</span><h3>开业礼券 <span>满39减10</span></h3></div>{coupon.claimed && <button type="button" className="coupon-switch" role="switch" aria-checked={coupon.enabled} aria-label="使用开业礼券" onClick={onToggle}><span className="switch-track"><span/></span><span>{coupon.enabled ? '已启用' : '未启用'}</span></button>}</div><p className="coupon-hint" role="status">{hint}</p>{storageError && <p className="inline-error" role="alert">{storageError}</p>}</div>;
}
