import { useEffect, useMemo, useState } from 'react';
import { LARGE_EXTRA, hasSizes, lineKey, money, products, sizeLabel, unitPrice, type Product, type Size } from './data';
import { useCart } from './useCart';
import { useMember } from './useMember';
import { quote } from './pricing';
import { CartPromo, MemberSwitch, PromoCard, PromoRules } from './PromoComponents';
import { Modal } from './Modal';
import { Icon } from './Icon';
type Page = 'home' | 'menu' | 'orders' | 'me';
const pageFromHash = (): Page => (['home', 'menu', 'orders', 'me'].includes(location.hash.slice(1)) ? location.hash.slice(1) : 'home') as Page;
const coffees = products.filter(p => p.category === 'coffee');
const desserts = products.filter(p => p.category === 'dessert');
const sizeOptions = ['medium', 'large'] as const;
const sizeOptionLabel = (size: Size) => (size === 'large' ? `大杯 +${LARGE_EXTRA / 100}` : '中杯');
function ProductCard({ product, size, onSize, onAdd }: {
  product: Product; size: Size; onSize: (size: Size) => void; onAdd: () => void;
}) {
  return <article className="product-card">
    <div className="product-image"><img src={product.image} alt={product.name} loading="lazy"/>{product.tag && <span className="product-tag">{product.tag}</span>}</div>
    <div className="product-info">
      <span className="eyebrow">{product.english}</span>
      <h3>{product.name}</h3>
      <p>{product.note}</p>
      {hasSizes(product)
        ? <div className="size-picker" role="group" aria-label={`${product.name}杯型`}>{sizeOptions.map(option => <button key={option} type="button" className={option === size ? 'is-active' : undefined} aria-pressed={option === size} onClick={() => onSize(option)}>{sizeOptionLabel(option)}</button>)}</div>
        : <p className="portion-note">单份 · 不参与第二杯半价</p>}
      <div className="product-action"><strong>{money(unitPrice(product, size))}</strong><button className="add-button" aria-label={`加入购物袋 ${product.name}`} onClick={onAdd}>+</button></div>
    </div>
  </article>;
}
export default function App() {
  const [page, setPage] = useState<Page>(pageFromHash);
  const [modal, setModal] = useState<'cart' | 'store' | 'promo' | null>(null);
  const [notice, setNotice] = useState('');
  const [pickedSizes, setPickedSizes] = useState<Record<string, Size>>({});
  const openModal = (next: 'cart' | 'store' | 'promo', trigger: HTMLButtonElement) => {
    // Safari touch clicks need an explicit focus target for dialog restoration.
    trigger.focus();
    setModal(next);
  };
  const basket = useCart();
  const member = useMember();
  // Every offer is derived from the current bag, so any change recomputes here.
  const order = useMemo(() => quote(basket.entries, member.isMember), [basket.entries, member.isMember]);
  const add = (product: Product, size: Size) => {
    if (basket.changeQuantity(lineKey(product.id, size), 1)) setNotice(`${product.name} · ${hasSizes(product) ? sizeLabel(size) : '单份'} 已加入购物袋`);
  };
  const changeSize = (product: Product, from: Size, size: Size) => {
    if (basket.changeSize(lineKey(product.id, from), size)) setNotice(`已改为${sizeLabel(size)}，优惠已重新计算`);
  };
  const changeQuantity = (product: Product, size: Size, delta: number) => {
    if (basket.changeQuantity(lineKey(product.id, size), delta)) setNotice('数量已更新，优惠已重新计算');
  };
  const toggleMember = () => {
    const next = member.toggle();
    setNotice(next ? '会员 95 折已开启，优惠已重新计算' : '会员 95 折已关闭，优惠已重新计算');
  };
  useEffect(() => { const handle = () => { setPage(pageFromHash()); setModal(null); window.scrollTo(0, 0); }; window.addEventListener('hashchange', handle); return () => window.removeEventListener('hashchange', handle); }, []);
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(''), 2000); return () => clearTimeout(timer); }, [notice]);
  return <>
    <div className="site-shell">
      <header className="site-header"><a href="#home" className="brand" aria-label="山隅咖啡首页"><img src="/assets/mark.svg" alt=""/><span><strong>山隅咖啡</strong><small>SHANYU COFFEE</small></span></a><button className="store-chip" onClick={event => openModal('store', event.currentTarget)}><Icon name="pin" size={17}/><span>山隅 · 梧桐里店</span><span aria-hidden="true">⌄</span></button></header>
      <main>
        {page === 'home' ? <>
          <section className="hero" aria-labelledby="home-title"><img src="/assets/hero.png" alt="暖阳下木桌上的一杯拉花咖啡" fetchPriority="high"/><div className="hero-shade"/><div className="hero-copy"><p className="eyebrow">A LITTLE PAUSE, A BETTER DAY.</p><h1 id="home-title">把日子，<br/>泡慢一点。</h1><p>一杯山野，一刻松弛。<br/>在城市的转角，遇见好咖啡。</p><a className="hero-link" href="#seasonal" onClick={e => { e.preventDefault(); document.getElementById('seasonal')?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' }); }}>探索本季风味 <Icon name="arrow" size={18}/></a></div><span className="hero-number">01 / DAILY RITUAL</span></section>
          <section className="service-card" aria-label="咖啡与门店"><button onClick={() => document.getElementById('seasonal')?.scrollIntoView({ block: 'start' })}><span className="service-icon"><Icon name="cup" size={29}/></span><span><strong>选一杯喜欢的</strong><small>现磨风味 · 随心搭配</small></span><Icon name="arrow" size={18}/></button><button onClick={event => openModal('store', event.currentTarget)}><span className="service-icon"><Icon name="pin" size={29}/></span><span><strong>来山隅坐坐</strong><small>门店空间 · 营业信息</small></span><Icon name="arrow" size={18}/></button></section>
          <section className="member-card"><div><span className="eyebrow">THE SHANYU CLUB</span><h2>每一杯，都值得慢慢喜欢。</h2><p>把片刻留给自己，把日常交给咖啡。</p></div><div className="member-mark" aria-hidden="true">山<br/><span>隅</span></div></section>
          <PromoCard onOpen={trigger => openModal('promo', trigger)}/>
          <section className="seasonal" id="seasonal"><div className="section-heading"><div><p className="eyebrow">A CUP FOR EVERY MOOD</p><h2>今日，想喝哪一杯？</h2></div><span className="section-note">第二杯半价 · 甜品不参与</span></div><div className="product-grid">{coffees.map(product => <ProductCard key={product.id} product={product} size={pickedSizes[product.id] ?? 'medium'} onSize={size => setPickedSizes(prev => ({ ...prev, [product.id]: size }))} onAdd={() => add(product, pickedSizes[product.id] ?? 'medium')}/>)}</div></section>
          <section className="seasonal" id="desserts"><div className="section-heading"><div><p className="eyebrow">A LITTLE SOMETHING SWEET</p><h2>再配一点甜？</h2></div><span className="section-note">甜品不参与第二杯半价</span></div><div className="product-grid dessert-grid">{desserts.map(product => <ProductCard key={product.id} product={product} size="medium" onSize={() => {}} onAdd={() => add(product, 'medium')}/>)}</div></section>
          <section className="story-card"><div className="story-photo"><img src="/assets/hero.png" alt="山隅的咖啡时光" loading="lazy"/></div><div className="story-copy"><span className="eyebrow">OUR LITTLE CORNER</span><h2>咖啡之外，<br/>还有生活的余味。</h2><p>我们喜欢自然的风味，也喜欢不被催促的日常。愿这一杯，成为你今天的小小停顿。</p><span className="story-sign">山隅 · 自在一隅</span></div></section>
          <p className="demo-footer">原创品牌概念演示 · 商品及门店均为本地示例数据<br/>仅供浏览与金额试算，不产生真实订单</p>
        </> : page === 'menu' ? <section className="display-page"><p className="eyebrow">THE COFFEE JOURNAL</p><h1>一页咖啡，<br/>六种好心情。</h1><p className="page-intro">认真对待每一颗豆子，也照顾每一种偏爱。</p>
          <h2 className="menu-group-title">咖啡 · 第二杯半价</h2>
          <div className="menu-list">{coffees.map((p, i) => <article key={p.id}><span className="menu-index">0{i + 1}</span><img src={p.image} alt={p.name}/><div><small>{p.english}</small><h2>{p.name}</h2><p>{p.note} · 中杯 {money(p.price)} / 大杯 {money(p.price + LARGE_EXTRA)}</p></div><strong>{money(p.price)}</strong></article>)}</div>
          <h2 className="menu-group-title">甜品 · 不参与第二杯半价</h2>
          <div className="menu-list">{desserts.map((p, i) => <article key={p.id}><span className="menu-index">0{i + 1}</span><img src={p.image} alt={p.name}/><div><small>{p.english}</small><h2>{p.name}</h2><p>{p.note} · 单份</p></div><strong>{money(p.price)}</strong></article>)}</div>
          <p className="quiet-note">菜单展示页 · 可返回首页将喜欢的咖啡与甜品加入购物袋</p></section> : page === 'orders' ? <section className="display-page"><p className="eyebrow">YOUR COFFEE MOMENTS</p><h1>每一杯，<br/>都有它的时光。</h1><p className="page-intro">这里展示一张示例订单，记录美好的咖啡日常。</p><article className="order-example"><header><span>山隅 · 梧桐里店</span><span className="pill">示例 · 已完成</span></header><div className="order-item"><img src="/assets/latte.png" alt="云朵拿铁"/><div><h2>云朵拿铁</h2><p>热饮 · 大杯 · ×1</p><small>示例订单 #DEMO001</small></div><strong>¥25.00</strong></div><footer>展示数据，不可操作，不对应真实交易。</footer></article><div className="order-quote"><Icon name="cup" size={42}/><p>下次见面，<br/>也从一杯咖啡开始。</p></div></section> : <section className="display-page"><p className="eyebrow">HELLO, COFFEE FRIEND</p><h1>在山隅，<br/>做一会儿自己。</h1><div className="profile-card"><div className="avatar"><Icon name="user" size={31}/></div><div><h2>山隅体验官</h2><p>本地演示会员</p></div><span className="pill">你好，朋友</span></div><div className="member-row"><div><strong>山隅会员 95 折</strong><small>{member.isMember ? '已开启 · 与满减不叠加，自动择优' : '未开启 · 开启后自动比较更省的一项'}</small></div><MemberSwitch isMember={member.isMember} onToggle={toggleMember}/></div><div className="club-display"><span className="eyebrow">SHANYU COFFEE CLUB</span><h2>一杯咖啡的距离，<br/>刚刚好。</h2><div className="club-line"/><p>享受此刻 / COLLECT LITTLE JOYS</p></div><div className="profile-facts"><div><Icon name="leaf"/><span>用一杯咖啡，亲近自然</span></div><div><Icon name="cup"/><span>关于山隅：原创品牌概念演示</span></div><div><Icon name="pin"/><span>门店与会员信息均为示例</span></div></div><p className="quiet-note">个人页为静态展示，无账户、积分或实际权益。</p></section>}
      </main>
    </div>
    {page === 'home' && <div className="cart-dock"><button className="cart-trigger" aria-label={`打开购物袋，${basket.count}件商品`} onClick={event => openModal('cart', event.currentTarget)}><span className="bag-symbol"><Icon name="bag"/>{basket.count > 0 && <span>{basket.count}</span>}</span><span className="cart-dock-copy"><strong>{basket.count ? money(order.total) : '给今天，加一杯咖啡'}</strong><small>{basket.count ? `${basket.count} 件商品 · ${order.saved ? `已省 ${money(order.saved)}` : '预估合计'}` : '随心选一杯，慢慢享受'}</small></span><span className="cart-open">查看购物袋 <span aria-hidden="true">→</span></span></button></div>}
    <nav className="bottom-nav" aria-label="主导航">{([['home', 'home', '首页'], ['menu', 'cup', '菜单'], ['orders', 'bag', '订单'], ['me', 'user', '我的']] as const).map(([key, icon, label]) => <a key={key} href={`#${key}`} aria-current={page === key ? 'page' : undefined}><Icon name={icon}/><span>{label}</span></a>)}</nav>
    {notice && <div className="toast" role="status">{notice}</div>}
    {!modal && (basket.storageError || member.storageError) && <div className="storage-error" role="alert">{basket.storageError || member.storageError}</div>}
    {modal === 'promo' && <Modal title="优惠这样算" onClose={() => setModal(null)}><PromoRules/></Modal>}
    {modal === 'store' && <Modal title="来山隅坐坐" onClose={() => setModal(null)}><img className="store-photo" src="/assets/hero.png" alt="咖啡门店概念场景"/><div className="store-details"><h3>山隅 · 梧桐里店</h3><p>营业时间 08:30 — 19:00</p><p>梧桐里街区 18 号 · 概念地址</p><p className="quiet-note">本门店为演示场景，不提供真实定位、配送或预订。</p></div></Modal>}
    {modal === 'cart' && <Modal title="我的购物袋" onClose={() => setModal(null)}>
      {basket.count ? <><div className="cart-list">{order.lines.map(line => {
        const product = line.product;
        return <article className="cart-row" key={lineKey(product.id, line.size)}>
          <img src={product.image} alt=""/>
          <div className="cart-row-main">
            <h3>{product.name}{line.halfCups > 0 && <span className="half-badge">{line.halfCups} 杯半价</span>}</h3>
            <span>{money(line.unit)} · {hasSizes(product) ? sizeLabel(line.size) : '单份'}{line.halfDiscount ? ` · 已省 ${money(line.halfDiscount)}` : ''}</span>
            {hasSizes(product)
              ? <div className="size-picker line-sizes" role="group" aria-label={`${product.name}杯型`}>{sizeOptions.map(option => <button key={option} type="button" className={option === line.size ? 'is-active' : undefined} aria-pressed={option === line.size} onClick={() => changeSize(product, line.size, option)}>{sizeOptionLabel(option)}</button>)}</div>
              : <p className="portion-note">甜品不参与第二杯半价</p>}
            <button className="remove-button" onClick={() => basket.remove(lineKey(product.id, line.size))} aria-label={`删除 ${product.name}`}>删除</button>
          </div>
          <div className="quantity"><button onClick={() => changeQuantity(product, line.size, -1)} aria-label={`减少 ${product.name}`}>−</button><output aria-label={`${product.name}数量`}>{line.qty}</output><button onClick={() => changeQuantity(product, line.size, 1)} disabled={line.qty >= 99} aria-label={`增加 ${product.name}`}>+</button></div>
        </article>;
      })}</div><button className="clear-button" onClick={() => basket.clear()}>清空购物袋</button></> : <div className="empty-cart"><Icon name="bag" size={46}/><h3>购物袋里，留一点期待。</h3><p>挑一杯喜欢的咖啡，让今天慢下来。</p><button className="primary-button" onClick={() => setModal(null)}>去选咖啡</button></div>}
      {basket.storageError && <p className="inline-error" role="alert">{basket.storageError}</p>}
      <CartPromo order={order} isMember={member.isMember} onToggleMember={toggleMember} storageError={member.storageError}/>
      <div className="cart-summary"><div><span>商品小计</span><strong>{money(order.subtotal)}</strong></div><div className="discount-line"><span>优惠合计{order.saved ? `（已省 ${money(order.saved)}）` : ''}</span><strong>{order.saved ? `−${money(order.saved)}` : money(0)}</strong></div><div className="total"><span>预估合计</span><strong>{money(order.total)}</strong></div></div>
      <p className="quiet-note">仅为本地金额试算，不下单、不扣款。<br/>商品图片为原创 AI 概念图，同系列口味共用示意图片。</p>
    </Modal>}
  </>;
}
