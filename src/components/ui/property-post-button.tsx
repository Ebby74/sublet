/**
 * Property Post Button
 * 
 * Button component for manually triggering social media posts for vacant properties.
 */

'use client';

import { useState } from 'react';
import { Share2, Loader2 } from 'lucide-react';
import { Button } from './button';

interface PropertyPostButtonProps {
  propertyId: string;
  propertyName?: string;
  onSuccess?: () => void;
}

export function PropertyPostButton({ propertyId, propertyName, onSuccess }: PropertyPostButtonProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePost = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Get userId from localStorage or use default
      const userId = undefined;
      
      const res = await fetch('/api/v1/marketing/post', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ propertyId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to post');
        return;
      }

      setSuccess(true);
      onSuccess?.();
    } catch (err) {
      setError('Failed to post property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handlePost}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Share2 className="h-4 w-4 mr-2" />
        )}
        {success ? 'Posted!' : 'Post to Social'}
      </Button>

      {error && (
        <span className="text-xs text-red-500">{error}</span>
      )}

      {success && (
        <span className="text-xs text-green-600">Successfully posted to social media</span>
      )}
    </div>
  );
}
