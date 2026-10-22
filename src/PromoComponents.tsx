import { money } from './data';
import { THRESHOLD, THRESHOLD_VALUE, type Quote } from './pricing';

export function MemberSwitch({ isMember, onToggle }: { isMember: boolean; onToggle: () => void }) {
  return <button type="button" className="coupon-switch" role="switch" aria-checked={isMember} aria-label="会员95折" onClick={onToggle}>
    <span className="switch-track"><span/></span><span>{isMember ? '已开启' : '未开启'}</span>
  </button>;
}

export function PromoCard({ onOpen }: { onOpen: (trigger: HTMLButtonElement) => void }) {
  return <section className="coupon-card" aria-label="第二杯半价活动">
    <div className="coupon-value"><span>第2杯</span><strong>5折</strong><small>咖啡专享 · 甜品不参与</small></div>
    <div className="coupon-copy"><span className="eyebrow">TWO CUPS, ONE PLEASURE</span><h2>多带一杯，刚刚好。</h2><p>咖啡第二杯半价 · 满 ¥50.00 再减 ¥8.00 · 会员 95 折自动择优</p></div>
    <button className="coupon-card-button" onClick={event => onOpen(event.currentTarget)}>查看优惠规则<span aria-hidden="true">↗</span></button>
  </section>;
}

export function PromoRules() {
  return <div className="coupon-rules">
    <div className="coupon-ticket"><p className="eyebrow">MORE CUPS, MORE SAVING</p><div><strong>5折</strong></div><h3>咖啡第二杯半价</h3><p>每两杯中较便宜的那杯，半价。</p></div>
    <h3 className="rules-heading">优惠使用说明</h3>
    <ol>
      <li>第二杯半价仅限咖啡，甜品不参与。把同一单里的每杯咖啡按单价从高到低两两配对，每对中较便宜的一杯半价。</li>
      <li>三杯按两杯计算（一杯半价，第三杯原价），四杯两两配对（两杯半价）。配对方式已按最省钱的方案自动计算。</li>
      <li>满 ¥50.00 减 ¥8.00：按第二杯半价之后的金额判定，每单只减一次，未满额不减。</li>
      <li>会员享 95 折，同样按半价后的金额计算。会员折扣与满减不叠加，系统自动选用更优惠的一项。</li>
      <li>咖啡中杯为菜单价，大杯加 ¥3.00；甜品为单份，不参与第二杯半价。</li>
      <li>修改杯型、数量或增删商品后，以上优惠会在购物袋里自动重新计算。</li>
      <li>本活动仅用于本地演示的金额试算，不下单、不扣款，没有真实付款或现金价值。</li>
    </ol>
    <p className="quiet-note">活动编号 second-cup-50 · 演示会员专属</p>
  </div>;
}

export function CartPromo({ order, isMember, onToggleMember, storageError }: {
  order: Quote; isMember: boolean; onToggleMember: () => void; storageError: string;
}) {
  const gap = order.thresholdGap;
  const exclusive = order.plan;
  const diff = Math.abs(order.thresholdDiscount - order.memberDiscount);
  const hint = order.subtotal === 0 ? '选一杯咖啡，第二杯起自动半价。'
    : exclusive === 'threshold' ? (isMember
      ? `已自动选用「满 ${money(THRESHOLD)} 减 ${money(THRESHOLD_VALUE)}」，比会员 95 折多省 ${money(diff)}。两项不叠加。`
      : `已选用「满 ${money(THRESHOLD)} 减 ${money(THRESHOLD_VALUE)}」。开启会员 95 折后会自动比较，选更省的一项。`)
    : exclusive === 'member' ? `已自动选用「会员 95 折」，比满减多省 ${money(diff)}。两项不叠加。`
    : gap > 0 && order.bogoDiscount ? `已享第二杯半价，再选 ${money(gap)} 即可满 ${money(THRESHOLD)} 减 ${money(THRESHOLD_VALUE)}。`
    : gap > 0 ? `再选 ${money(gap)}，即可享满 ${money(THRESHOLD)} 减 ${money(THRESHOLD_VALUE)}。`
    : '暂无可用优惠。';
  return <div className="cart-promo">
    <div className="cart-coupon-heading">
      <div><span className="eyebrow">BEST OFFER, PICKED FOR YOU</span><h3>会员 95 折 <span>与满减不叠加</span></h3></div>
      <MemberSwitch isMember={isMember} onToggle={onToggleMember}/>
    </div>
    <ul className="promo-lines">
      <li><span>商品小计</span><strong>{money(order.subtotal)}</strong></li>
      <li className="discount-line"><span>第二杯半价{order.halfCups ? ` · ${order.halfCups} 杯半价` : ''}（仅咖啡）</span><strong>{order.bogoDiscount ? `−${money(order.bogoDiscount)}` : money(0)}</strong></li>
      <li><span>半价后小计</span><strong>{money(order.afterBogo)}</strong></li>
      <li className={`promo-choice ${exclusive === 'threshold' ? 'is-active' : 'is-muted'}`}>
        <span>满 {money(THRESHOLD)} 减 {money(THRESHOLD_VALUE)}<em>{order.thresholdDiscount ? '已选用' : gap ? `还差 ${money(gap)}` : '未满额'}</em></span>
        <strong>{order.thresholdDiscount ? `−${money(order.thresholdDiscount)}` : money(0)}</strong>
      </li>
      <li className={`promo-choice ${exclusive === 'member' ? 'is-active' : 'is-muted'}`}>
        <span>会员 95 折<em>{isMember ? (order.plan === 'member' ? '已选用' : '未选用') : '未开启'}</em></span>
        <strong>{order.memberDiscount ? `−${money(order.memberDiscount)}` : money(0)}</strong>
      </li>
    </ul>
    <p className="coupon-hint" role="status">{hint}</p>
    {storageError && <p className="inline-error" role="alert">{storageError}</p>}
  </div>;
}
