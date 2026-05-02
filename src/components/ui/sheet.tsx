'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Sheet({ open, onOpenChange, children }: SheetProps) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => onOpenChange(false)}
        />
      )}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-full flex-col bg-background transition-transform duration-300',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between border-b px-4 py-4">
          <span className="font-semibold text-lg">Menu</span>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </>
  );
}
