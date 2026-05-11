import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children, footer, className = '' }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-grid-2"
      onClick={onClose}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-surface border border-border rounded-[2px] w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col ${className}`}
      >
        <div className="flex items-center justify-between px-grid-3 py-grid-2 border-b border-border">
          <h3 className="text-h3 text-text-primary">{title}</h3>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <div className="px-grid-3 py-grid-3 overflow-y-auto flex-1">{children}</div>
        {footer && (
          <div className="px-grid-3 py-grid-2 border-t border-border flex justify-end gap-grid-1">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
