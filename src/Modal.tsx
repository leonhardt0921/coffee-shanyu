import { type ReactNode, useEffect, useRef } from 'react';
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
  return <dialog ref={ref} className={`modal ${className}`} aria-labelledby="modal-title" onCancel={e => { e.preventDefault(); onClose(); }} onClick={e => { if (e.target === ref.current) onClose(); }}>
    <div className="modal-inner">
      <header className="modal-header"><div><span className="eyebrow">SHANYU COFFEE</span><h2 id="modal-title">{title}</h2></div><button className="icon-button" aria-label="关闭弹窗" onClick={onClose}>×</button></header>
      {children}
    </div>
  </dialog>;
}
