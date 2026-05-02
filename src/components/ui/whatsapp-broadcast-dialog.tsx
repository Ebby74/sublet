'use client';

import { useState, useCallback } from 'react';
import { Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface WhatsAppBroadcastDialogProps {
  propertyId: string;
  propertyName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type BroadcastStatus = 'idle' | 'loading' | 'success' | 'error';

interface BroadcastResult {
  success: boolean;
  sentCount: number;
  failedCount: number;
  errors?: string[];
}

export function WhatsAppBroadcastDialog({
  propertyId,
  propertyName,
  open,
  onOpenChange,
}: WhatsAppBroadcastDialogProps) {
  const [status, setStatus] = useState<BroadcastStatus>('idle');
  const [result, setResult] = useState<BroadcastResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleClose = useCallback(() => {
    setStatus('idle');
    setResult(null);
    setErrorMessage('');
    onOpenChange(false);
  }, [onOpenChange]);

  const handleSendBroadcast = useCallback(async () => {
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/v1/marketing/whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ propertyId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send WhatsApp broadcast');
      }

      setResult(data);
      setStatus('success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setErrorMessage(message);
      setStatus('error');
    }
  }, [propertyId]);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={handleClose}
        />
      )}

      {/* Dialog */}
      <div
        className={cn(
          'fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-background p-6 shadow-lg transition-all',
          open ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        )}
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Send WhatsApp Broadcast</h2>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-2">Property</p>
          <p className="font-medium">{propertyName}</p>
        </div>

        {/* Info message */}
        <div className="mb-6 rounded-md bg-muted p-4">
          <p className="text-sm text-muted-foreground">
            This will send a broadcast message to all tenants with phone numbers
            in your database about this vacant property.
          </p>
        </div>

        {/* Status Messages */}
        {status === 'success' && result && (
          <div className="mb-4 rounded-md bg-green-50 p-4 border border-green-200">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Broadcast sent successfully!</span>
            </div>
            <p className="text-sm text-green-600 mt-2">
              Sent to {result.sentCount} tenant(s)
              {result.failedCount > 0 && `, ${result.failedCount} failed`}
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="mb-4 rounded-md bg-red-50 p-4 border border-red-200">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Broadcast failed</span>
            </div>
            <p className="text-sm text-red-600 mt-2">{errorMessage}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={status === 'loading'}
          >
            {status === 'success' ? 'Close' : 'Cancel'}
          </Button>

          {status !== 'success' && (
            <Button
              onClick={handleSendBroadcast}
              disabled={status === 'loading'}
              className="gap-2"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Broadcast
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </>
  );
}