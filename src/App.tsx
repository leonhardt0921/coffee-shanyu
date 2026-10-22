import { useEffect, useState } from 'react';
import { products, money } from './data';
import { useCart } from './useCart';
import { useCoupon } from './useCoupon';
import { couponDiscount } from './coupon';
import { CouponCard, CouponRules, CartCoupon } from './CouponComponents';
import { Modal } from './Modal';
import { Icon } from './Icon';
type Page = 'home' | 'menu' | 'orders' | 'me';
const pageFromHash = (): Page => (['home', 'menu', 'orders', 'me'].includes(location.hash.slice(1)) ? location.hash.slice(1) : 'home') as Page;
export default function App() {
  const [page, setPage] = useState<Page>(pageFromHash);
  const [modal, setModal] = useState<'cart' | 'store' | 'coupon' | null>(null);
  const [notice, setNotice] = useState('');
  const openModal = (next: 'cart' | 'store' | 'coupon', trigger: HTMLButtonElement) => {
    // Safari touch clicks need an explicit focus target for dialog restoration.
    trigger.focus();
    setModal(next);
  };
  const basket = useCart();
  const offer = useCoupon();
  const discount = couponDiscount(basket.subtotal, offer.coupon);
  const total = basket.subtotal - discount;
  const claimCoupon = () => {
    if (offer.claim()) { setModal(null); setNotice('开业礼券已领取，已为你启用'); }
  };
  useEffect(() => { const handle = () => { setPage(pageFromHash()); setModal(null); window.scrollTo(0, 0); }; window.addEventListener('hashchange', handle); return () => window.removeEventListener('hashchange', handle); }, []);
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(''), 2000); return () => clearTimeout(timer); }, [notice]);
  const add = (id: string, name: string) => { if (basket.changeQuantity(id, 1)) setNotice(`${name}已加入购物袋`); };
  return <>
    <div className="site-shell">
      <header className="site-header"><a href="#home" className="brand" aria-label="山隅咖啡首页"><img src="/assets/mark.svg" alt=""/><span><strong>山隅咖啡</strong><small>SHANYU COFFEE</small></span></a><button className="store-chip" onClick={event => openModal('store', event.currentTarget)}><Icon name="pin" size={17}/><span>山隅 · 梧桐里店</span><span aria-hidden="true">⌄</span></button></header>
      <main>
        {page === 'home' ? <>
          <section className="hero" aria-labelledby="home-title"><img src="/assets/hero.png" alt="暖阳下木桌上的一杯拉花咖啡" fetchPriority="high"/><div className="hero-shade"/><div className="hero-copy"><p className="eyebrow">A LITTLE PAUSE, A BETTER DAY.</p><h1 id="home-title">把日子，<br/>泡慢一点。</h1><p>一杯山野，一刻松弛。<br/>在城市的转角，遇见好咖啡。</p><a className="hero-link" href="#seasonal" onClick={e => { e.preventDefault(); document.getElementById('seasonal')?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' }); }}>探索本季风味 <Icon name="arrow" size={18}/></a></div><span className="hero-number">01 / DAILY RITUAL</span></section>
          <section className="service-card" aria-label="咖啡与门店"><button onClick={() => document.getElementById('seasonal')?.scrollIntoView({ block: 'start' })}><span className="service-icon"><Icon name="cup" size={29}/></span><span><strong>选一杯喜欢的</strong><small>现磨风味 · 随心搭配</small></span><Icon name="arrow" size={18}/></button><button onClick={event => openModal('store', event.currentTarget)}><span className="service-icon"><Icon name="pin" size={29}/></span><span><strong>来山隅坐坐</strong><small>门店空间 · 营业信息</small></span><Icon name="arrow" size={18}/></button></section>
          <section className="member-card"><div><span className="eyebrow">THE SHANYU CLUB</span><h2>每一杯，都值得慢慢喜欢。</h2><p>把片刻留给自己，把日常交给咖啡。</p></div><div className="member-mark" aria-hidden="true">山<br/><span>隅</span></div></section>
          <CouponCard coupon={offer.coupon} onOpen={trigger => openModal('coupon', trigger)}/>
          <section className="seasonal" id="seasonal"><div className="section-heading"><div><p className="eyebrow">A CUP FOR EVERY MOOD</p><h2>今日，想喝哪一杯？</h2></div><span className="section-note">好豆子 · 新鲜研磨</span></div><div className="product-grid">{products.map(product => <article className="product-card" key={product.id}><div className="product-image"><img src={product.image} alt={product.name} loading="lazy"/>{product.tag && <span className="product-tag">{product.tag}</span>}</div><div className="product-info"><span className="eyebrow">{product.english}</span><h3>{product.name}</h3><p>{product.note}</p><div className="product-action"><strong>{money(product.price)}</strong><button className="add-button" aria-label={`加入购物袋 ${product.name}`} onClick={() => add(product.id, product.name)}>+</button></div></div></article>)}</div></section>
          <section className="story-card"><div className="story-photo"><img src="/assets/hero.png" alt="山隅的咖啡时光" loading="lazy"/></div><div className="story-copy"><span className="eyebrow">OUR LITTLE CORNER</span><h2>咖啡之外，<br/>还有生活的余味。</h2><p>我们喜欢自然的风味，也喜欢不被催促的日常。愿这一杯，成为你今天的小小停顿。</p><span className="story-sign">山隅 · 自在一隅</span></div></section>
          <p className="demo-footer">原创品牌概念演示 · 商品及门店均为本地示例数据<br/>仅供浏览与金额试算，不产生真实订单</p>
        </> : page === 'menu' ? <section className="display-page"><p className="eyebrow">THE COFFEE JOURNAL</p><h1>一页咖啡，<br/>六种好心情。</h1><p className="page-intro">认真对待每一颗豆子，也照顾每一种偏爱。</p><div className="menu-list">{products.map((p, i) => <article key={p.id}><span className="menu-index">0{i + 1}</span><img src={p.image} alt={p.name}/><div><small>{p.english}</small><h2>{p.name}</h2><p>{p.note}</p></div><strong>{money(p.price)}</strong></article>)}</div><p className="quiet-note">菜单展示页 · 可返回首页将喜欢的咖啡加入购物袋</p></section> : page === 'orders' ? <section className="display-page"><p className="eyebrow">YOUR COFFEE MOMENTS</p><h1>每一杯，<br/>都有它的时光。</h1><p className="page-intro">这里展示一张示例订单，记录美好的咖啡日常。</p><article className="order-example"><header><span>山隅 · 梧桐里店</span><span className="pill">示例 · 已完成</span></header><div className="order-item"><img src="/assets/latte.png" alt="云朵拿铁"/><div><h2>云朵拿铁</h2><p>热饮 · 常规杯 · ×1</p><small>示例订单 #DEMO001</small></div><strong>¥22.00</strong></div><footer>展示数据，不可操作，不对应真实交易。</footer></article><div className="order-quote"><Icon name="cup" size={42}/><p>下次见面，<br/>也从一杯咖啡开始。</p></div></section> : <section className="display-page"><p className="eyebrow">HELLO, COFFEE FRIEND</p><h1>在山隅，<br/>做一会儿自己。</h1><div className="profile-card"><div className="avatar"><Icon name="user" size={31}/></div><div><h2>山隅体验官</h2><p>本地演示会员</p></div><span className="pill">你好，朋友</span></div><div className="club-display"><span className="eyebrow">SHANYU COFFEE CLUB</span><h2>一杯咖啡的距离，<br/>刚刚好。</h2><div className="club-line"/><p>享受此刻 / COLLECT LITTLE JOYS</p></div><div className="profile-facts"><div><Icon name="leaf"/><span>用一杯咖啡，亲近自然</span></div><div><Icon name="cup"/><span>关于山隅：原创品牌概念演示</span></div><div><Icon name="pin"/><span>门店与会员信息均为示例</span></div></div><p className="quiet-note">个人页为静态展示，无账户、积分或实际权益。</p></section>}
      </main>
    </div>
    {page === 'home' && <div className="cart-dock"><button className="cart-trigger" aria-label={`打开购物袋，${basket.count}件商品`} onClick={event => openModal('cart', event.currentTarget)}><span className="bag-symbol"><Icon name="bag"/>{basket.count > 0 && <span>{basket.count}</span>}</span><span className="cart-dock-copy"><strong>{basket.count ? money(total) : '给今天，加一杯咖啡'}</strong><small>{basket.count ? `${basket.count} 件商品 · ${discount ? '已减 ¥10.00' : '预估合计'}` : '随心选一杯，慢慢享受'}</small></span><span className="cart-open">查看购物袋 <span aria-hidden="true">→</span></span></button></div>}
    <nav className="bottom-nav" aria-label="主导航">{([['home', 'home', '首页'], ['menu', 'cup', '菜单'], ['orders', 'bag', '订单'], ['me', 'user', '我的']] as const).map(([key, icon, label]) => <a key={key} href={`#${key}`} aria-current={page === key ? 'page' : undefined}><Icon name={icon}/><span>{label}</span></a>)}</nav>
    {notice && <div className="toast" role="status">{notice}</div>}
    {!modal && (basket.storageError || offer.storageError) && <div className="storage-error" role="alert">{basket.storageError || offer.storageError}</div>}
    {modal === 'coupon' && <Modal title="送你一份开业礼" onClose={() => setModal(null)}><CouponRules claimed={offer.coupon.claimed} onClaim={claimCoupon} storageError={offer.storageError}/></Modal>}
    {modal === 'store' && <Modal title="来山隅坐坐" onClose={() => setModal(null)}><img className="store-photo" src="/assets/hero.png" alt="咖啡门店概念场景"/><div className="store-details"><h3>山隅 · 梧桐里店</h3><p>营业时间 08:30 — 19:00</p><p>梧桐里街区 18 号 · 概念地址</p><p className="quiet-note">本门店为演示场景，不提供真实定位、配送或预订。</p></div></Modal>}
    {modal === 'cart' && <Modal title="我的购物袋" onClose={() => setModal(null)}>
      {basket.count ? <><div className="cart-list">{products.filter(p => basket.cart[p.id]).map(p => <article className="cart-row" key={p.id} data-testid={`cart-row-${p.id}`}><img src={p.image} alt=""/><div className="cart-row-main"><h3>{p.name}</h3><span>{money(p.price)}</span><button className="remove-button" onClick={() => basket.remove(p.id)} aria-label={`删除 ${p.name}`}>删除</button></div><div className="quantity"><button onClick={() => basket.changeQuantity(p.id, -1)} aria-label={`减少 ${p.name}`}>−</button><output aria-label={`${p.name}数量`}>{basket.cart[p.id]}</output><button onClick={() => basket.changeQuantity(p.id, 1)} disabled={basket.cart[p.id] >= 99} aria-label={`增加 ${p.name}`}>+</button></div></article>)}</div><button className="clear-button" onClick={() => basket.clear()}>清空购物袋</button></> : <div className="empty-cart"><Icon name="bag" size={46}/><h3>购物袋里，留一点期待。</h3><p>挑一杯喜欢的咖啡，让今天慢下来。</p><button className="primary-button" onClick={() => setModal(null)}>去选咖啡</button></div>}
      {basket.storageError && <p className="inline-error" role="alert">{basket.storageError}</p>}
      <CartCoupon coupon={offer.coupon} subtotal={basket.subtotal} onToggle={offer.toggle} storageError={offer.storageError}/>
      <div className="cart-summary"><div><span>商品小计</span><strong data-testid="cart-subtotal">{money(basket.subtotal)}</strong></div><div className="discount-line"><span>开业礼券优惠</span><strong data-testid="cart-discount">{discount ? `−${money(discount)}` : money(0)}</strong></div><div className="total"><span>预估合计</span><strong data-testid="cart-total">{money(total)}</strong></div></div>
      <p className="quiet-note">仅为本地金额试算，不下单、不扣款。<br/>商品图片为原创 AI 概念图，同系列口味共用示意图片。</p>
    </Modal>}
  </>;
}
