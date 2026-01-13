import { createPortal } from 'react-dom';
import { cn } from '../../lib/cn.js';

export function Modal({ open, onClose, children, className }) {
  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className={cn('bg-background rounded-lg shadow-lg p-6 max-w-md w-full', className)}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
