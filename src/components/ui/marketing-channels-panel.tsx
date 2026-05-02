/**
 * Marketing Channels Panel
 * 
 * UI component for configuring marketing channel settings.
 * Users can enable/disable Instagram, Facebook, WhatsApp, and Website feed.
 */

'use client';

import { useState, useEffect } from 'react';
import { Instagram, Facebook, Globe, Phone, Loader2, Check, X } from 'lucide-react';
import { Button } from './button';

interface ChannelField {
  key: string;
  label: string;
  type: string;
  placeholder?: string;
}

interface ChannelConfig {
  instagram?: {
    accessToken: string;
    igUserId: string;
  };
  facebook?: {
    accessToken: string;
    pageId: string;
  };
  whatsapp?: {
    twilioSid: string;
    authToken: string;
    senderNumber: string;
  };
  website?: {
    feedUrl: string;
  };
}

interface ChannelState {
  enabled: boolean;
  config?: ChannelConfig;
}

interface MarketingChannelsPanelProps {
  userId?: string;
}

export function MarketingChannelsPanel({ userId }: MarketingChannelsPanelProps) {
  const [channels, setChannels] = useState<Record<string, ChannelState>>({
    instagram: { enabled: false },
    facebook: { enabled: false },
    whatsapp: { enabled: false },
    website: { enabled: false },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [configModal, setConfigModal] = useState<string | null>(null);
  const [configForm, setConfigForm] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchChannels();
  }, [userId]);

  const fetchChannels = async () => {
    try {
      const res = await fetch('/api/v1/marketing/channels', {
        headers: userId ? { 'x-user-id': userId } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setChannels(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch channels:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleChannel = async (channel: string, enabled: boolean) => {
    setSaving(channel);
    try {
      const res = await fetch('/api/v1/marketing/channels', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          ...(userId ? { 'x-user-id': userId } : {}),
        },
        body: JSON.stringify({
          channel,
          enabled,
          config: enabled ? channels[channel]?.config : undefined,
        }),
      });

      if (res.ok) {
        setChannels(prev => ({
          ...prev,
          [channel]: { ...prev[channel], enabled },
        }));
      }
    } catch (error) {
      console.error('Failed to toggle channel:', error);
    } finally {
      setSaving(null);
    }
  };

  const openConfig = (channel: string) => {
    const config = channels[channel]?.config as Record<string, string> || {};
    setConfigForm(config);
    setConfigModal(channel);
  };

  const saveConfig = async () => {
    if (!configModal) return;
    
    setSaving(configModal);
    try {
      let parsedConfig: ChannelConfig | undefined;
      
      if (configModal === 'instagram') {
        parsedConfig = {
          instagram: {
            accessToken: configForm.accessToken || '',
            igUserId: configForm.igUserId || '',
          },
        };
      } else if (configModal === 'facebook') {
        parsedConfig = {
          facebook: {
            accessToken: configForm.accessToken || '',
            pageId: configForm.pageId || '',
          },
        };
      } else if (configModal === 'whatsapp') {
        parsedConfig = {
          whatsapp: {
            twilioSid: configForm.twilioSid || '',
            authToken: configForm.authToken || '',
            senderNumber: configForm.senderNumber || '',
          },
        };
      } else if (configModal === 'website') {
        parsedConfig = {
          website: {
            feedUrl: configForm.feedUrl || '',
          },
        };
      }

      const res = await fetch('/api/v1/marketing/channels', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          ...(userId ? { 'x-user-id': userId } : {}),
        },
        body: JSON.stringify({
          channel: configModal,
          enabled: channels[configModal]?.enabled ?? false,
          config: parsedConfig,
        }),
      });

      if (res.ok) {
        setChannels(prev => ({
          ...prev,
          [configModal]: { ...prev[configModal], config: parsedConfig },
        }));
        setConfigModal(null);
      }
    } catch (error) {
      console.error('Failed to save config:', error);
    } finally {
      setSaving(null);
    }
  };

  const channelList: { id: string; name: string; icon: typeof Instagram; description: string; fields: ChannelField[] }[] = [
    {
      id: 'instagram',
      name: 'Instagram',
      icon: Instagram,
      description: 'Post vacant properties to your Instagram Business account',
      fields: [
        { key: 'accessToken', label: 'Access Token', type: 'password' },
        { key: 'igUserId', label: 'Instagram User ID', type: 'text' },
      ],
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      description: 'Post vacant properties to your Facebook Page',
      fields: [
        { key: 'accessToken', label: 'Page Access Token', type: 'password' },
        { key: 'pageId', label: 'Page ID', type: 'text' },
      ],
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: Phone,
      description: 'Broadcast to tenants via Twilio WhatsApp API',
      fields: [
        { key: 'twilioSid', label: 'Twilio Account SID', type: 'text' },
        { key: 'authToken', label: 'Twilio Auth Token', type: 'password' },
        { key: 'senderNumber', label: 'WhatsApp Sender Number', type: 'text' },
      ],
    },
    {
      id: 'website',
      name: 'Website Feed',
      icon: Globe,
      description: 'Generate JSON/RSS feed for your rental website',
      fields: [
        { key: 'feedUrl', label: 'Your Website URL', type: 'text', placeholder: 'https://your-rental-site.com' },
      ],
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Marketing Channels</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure which channels to automatically post vacant properties to.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {channelList.map(channel => {
          const Icon = channel.icon;
          const isEnabled = channels[channel.id]?.enabled ?? false;
          const isSaving = saving === channel.id;

          return (
            <div
              key={channel.id}
              className={`border rounded-lg p-4 transition-colors ${
                isEnabled ? 'border-primary bg-primary/5' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isEnabled ? 'bg-primary/10' : 'bg-muted'}`}>
                    <Icon className={`h-5 w-5 ${isEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <h3 className="font-medium">{channel.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {channel.description}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => toggleChannel(channel.id, !isEnabled)}
                  disabled={isSaving}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isEnabled ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {isEnabled && (
                <div className="mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openConfig(channel.id)}
                  >
                    Configure
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Config Modal */}
      {configModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-md p-6 m-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Configure {channelList.find(c => c.id === configModal)?.name}
              </h3>
              <button
                onClick={() => setConfigModal(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {channelList.find(c => c.id === configModal)?.fields.map(field => (
                <div key={field.key}>
                  <label className="block text-sm font-medium mb-1">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    value={configForm[field.key] || ''}
                    onChange={e => setConfigForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 border rounded-md bg-background text-sm"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setConfigModal(null)}>
                Cancel
              </Button>
              <Button onClick={saveConfig} disabled={saving === configModal}>
                {saving === configModal ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Save Configuration
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
