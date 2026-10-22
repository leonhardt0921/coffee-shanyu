type IconName = 'home' | 'cup' | 'bag' | 'user' | 'pin' | 'arrow' | 'leaf';
export function Icon({ name, size = 22 }: { name: IconName; size?: number }) {
  const shapes: Record<IconName, React.ReactNode> = {
    home: <><path d="m3 10 9-7 9 7v10H3Z"/><path d="M9 20v-7h6v7"/></>,
    cup: <><path d="M4 7h13v7a6.5 6.5 0 0 1-13 0Z"/><path d="M17 8h2a3 3 0 0 1 0 6h-2M3 22h16M8 2v2m5-2v2"/></>,
    bag: <><path d="M4 7h16l1 14H3Z"/><path d="M8 9V6a4 4 0 0 1 8 0v3"/></>,
    user: <><circle cx="12" cy="7" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3"/></>,
    pin: <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0Z"/><circle cx="12" cy="10" r="2"/></>,
    arrow: <><path d="M3 12h18m-6-6 6 6-6 6"/></>,
    leaf: <><path d="M20 3C8 2 1 9 6 17c8 5 15-2 14-14Z"/><path d="M3 22 16 9"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{shapes[name]}</svg>;
}
