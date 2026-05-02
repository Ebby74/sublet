'use client';

import { useState } from 'react';
import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';

interface CaptionCopyProps {
  text: string;
  channel: string;
}

export const CaptionCopy: FC<CaptionCopyProps> = ({ text, channel }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground uppercase">{channel}</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        className="h-8 w-8 p-0"
        aria-label={`Copy ${channel} caption`}
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};