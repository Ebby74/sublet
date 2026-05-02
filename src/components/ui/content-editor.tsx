'use client';

import { useState } from 'react';
import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RefreshCw, Save, Clock, RotateCcw } from 'lucide-react';

interface ContentEditorProps {
  roomId: string;
  initialDescription?: string;
  history?: Array<{
    version: number;
    text: string;
    createdAt: string;
    createdBy: string;
    source: 'ai' | 'manual';
  }>;
}

export const ContentEditor: FC<ContentEditorProps> = ({
  roomId,
  initialDescription = '',
  history = [],
}) => {
  const [description, setDescription] = useState(initialDescription);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/v1/rooms/${roomId}/content`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      });

      if (!response.ok) {
        throw new Error('Failed to save');
      }

      setIsEditing(false);
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const response = await fetch(`/api/v1/rooms/${roomId}/content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'regenerate' }),
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate');
      }

      const data = await response.json();
      setDescription(data.data.description);
    } catch (error) {
      console.error('Regenerate error:', error);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleRevert = async (version: number) => {
    try {
      const response = await fetch(`/api/v1/rooms/${roomId}/content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'revert', version }),
      });

      if (!response.ok) {
        throw new Error('Failed to revert');
      }

      // Refresh to get reverted text
      const refreshResponse = await fetch(`/api/v1/rooms/${roomId}/content`);
      const data = await refreshResponse.json();
      setDescription(data.data.description);
      setShowHistory(false);
    } catch (error) {
      console.error('Revert error:', error);
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Room Content</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
          >
            <Clock className="h-4 w-4 mr-1" />
            History ({history.length})
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRegenerate}
            disabled={isRegenerating}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isRegenerating ? 'animate-spin' : ''}`} />
            Regenerate
          </Button>
        </div>
      </div>

      {isEditing ? (
        <>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[150px]"
            placeholder="Enter room description..."
          />
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-1" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="p-4 bg-muted rounded-md min-h-[100px]">
            <p className="whitespace-pre-wrap">{description || 'No description yet.'}</p>
          </div>
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
        </>
      )}

      {showHistory && history.length > 0 && (
        <div className="border-t pt-4 mt-4">
          <h4 className="font-medium mb-2">Version History</h4>
          <div className="space-y-2">
            {history
              .sort((a, b) => b.version - a.version)
              .map((item) => (
                <div
                  key={item.version}
                  className="flex items-center justify-between p-2 bg-muted rounded"
                >
                  <div>
                    <span className="font-medium">v{item.version}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      ({item.source})
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRevert(item.version)}
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};