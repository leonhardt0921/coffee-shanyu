import { type KeyboardEvent, type ReactNode, useEffect, useRef } from 'react';
export function Modal({ title, children, onClose, className = '' }: { title: string; children: ReactNode; onClose: () => void; className?: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const returnTarget = useRef(document.activeElement as HTMLElement | null);
  useEffect(() => {
    const dialog = ref.current;
    const target = returnTarget.current;
    if (dialog && !dialog.open) dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
      target?.focus();
    };
  }, []);
  const keepFocusInside = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key !== 'Tab') return;
    const dialog = event.currentTarget;
    const targets = [...dialog.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])')]
      .filter(element => element.getClientRects().length > 0);
    const first = targets[0];
    const last = targets.at(-1);
    if (!first || !last) { event.preventDefault(); dialog.focus(); return; }
    // Cycle explicitly: WebKit keyboard preferences may skip buttons in native Tab navigation.
    event.preventDefault();
    const current = targets.indexOf(document.activeElement as HTMLElement);
    const next = current < 0 ? (event.shiftKey ? targets.length - 1 : 0)
      : (current + (event.shiftKey ? -1 : 1) + targets.length) % targets.length;
    targets[next].focus();
  };
  return <dialog ref={ref} tabIndex={-1} className={`modal ${className}`} aria-labelledby="modal-title" onKeyDown={keepFocusInside} onCancel={e => { e.preventDefault(); onClose(); }} onClick={e => { if (e.target === ref.current) onClose(); }}>
    <div className="modal-inner">
      <header className="modal-header"><div><span className="eyebrow">SHANYU COFFEE</span><h2 id="modal-title">{title}</h2></div><button className="icon-button" aria-label="关闭弹窗" onClick={onClose}>×</button></header>
      {children}
    </div>
  </dialog>;
}
