import { useState, useRef, useEffect } from 'react';
import { cn } from '../lib/cn.js';

export function Dropdown({ trigger, children, className }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <div className={cn('absolute z-50 mt-2 min-w-[8rem] rounded-md border bg-popover p-1 shadow-md', className)}>
          {children}
        </div>
      )}
    </div>
  );
}
