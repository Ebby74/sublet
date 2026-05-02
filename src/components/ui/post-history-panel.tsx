'use client';

import { useState, useEffect } from 'react';
import type { FC } from 'react';

interface Post {
  id: string;
  roomId: string;
  channel: string;
  content?: string;
  status: 'pending' | 'published' | 'failed';
  postedAt: string;
  error?: string;
}

interface PostHistoryPanelProps {
  roomId: string;
  onRePost?: () => void;
}

export const PostHistoryPanel: FC<PostHistoryPanelProps> = ({ roomId, onRePost }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [reposting, setReposting] = useState(false);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch(`/api/v1/marketing/posts?roomId=${roomId}`);
        const json = await res.json();
        setPosts(json.data || []);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, [roomId]);

  const handleRePost = async () => {
    setReposting(true);
    try {
      const res = await fetch('/api/v1/marketing/room-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, manual: true }),
      });
      await res.json();
      onRePost?.();
      // Refresh posts list
      const resPosts = await fetch(`/api/v1/marketing/posts?roomId=${roomId}`);
      const jsonPosts = await resPosts.json();
      setPosts(jsonPosts.data || []);
    } catch (error) {
      console.error('Failed to re-post:', error);
    } finally {
      setReposting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'text-green-600 bg-green-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-yellow-600 bg-yellow-50';
    }
  };

  const getChannelIcon = (channel: string) => {
    const icons: Record<string, string> = {
      instagram: '📸',
      facebook: '📘',
      whatsapp: '💬',
      website: '🌐',
    };
    return icons[channel] || '📢';
  };

  const getChannelLabel = (channel: string) => {
    const labels: Record<string, string> = {
      instagram: 'Instagram',
      facebook: 'Facebook',
      whatsapp: 'WhatsApp',
      website: 'Website',
    };
    return labels[channel] || channel;
  };

  if (loading) return <div className="p-4 text-gray-500">Loading posts...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Post History</h3>
        <button
          onClick={handleRePost}
          disabled={reposting}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {reposting ? 'Reposting...' : 'Repost'}
        </button>
      </div>

      {posts.length === 0 ? (
        <p className="text-gray-500">No posts yet. Activate the room to auto-post.</p>
      ) : (
        <ul className="space-y-2">
          {posts.map((post) => (
            <li key={post.id} className="flex items-center gap-3 p-3 border rounded">
              <span className="text-xl">{getChannelIcon(post.channel)}</span>
              <div className="flex-1">
                <p className="font-medium">{getChannelLabel(post.channel)}</p>
                <p className="text-sm text-gray-500">
                  {new Date(post.postedAt).toLocaleDateString('en-MY')}
                </p>
              </div>
              <span className={`px-2 py-1 text-xs rounded ${getStatusColor(post.status)}`}>
                {post.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};