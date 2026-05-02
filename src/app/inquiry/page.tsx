'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { trackEvent } from '@/lib/analytics';

interface Message {
  role: 'user' | 'airene';
  content: string;
  timestamp: Date;
}

interface UserData {
  name: string;
  phone: string;
  email: string;
  requirements: string;
}

const WELCOME_MESSAGE: Message = {
  role: 'airene',
  content: "Hi! I'm AIrene, your AI assistant at AMR Home Solutions. I'll help you find your perfect room in KL! What's your name?",
  timestamp: new Date(),
};

export default function InquiryPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [step, setStep] = useState(0);
  const [userData, setUserData] = useState<UserData>({ name: '', phone: '', email: '', requirements: '' });
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    trackEvent({ event: 'chat_launched', params: { source: 'inquiry_page' } });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const saveSession = useCallback(async (msgs: Message[], data: UserData, currentStep: number) => {
    try {
      const res = await fetch('/api/ai/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          messages: msgs.map(m => ({ role: m.role === 'airene' ? 'assistant' : 'user', content: m.content, timestamp: m.timestamp })),
          prospectData: data,
          step: currentStep,
          status: currentStep >= 4 ? 'completed' : 'active',
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (!sessionId && json.sessionId) {
          setSessionId(json.sessionId);
        }
      }
    } catch {
      // Silently fail — chat still works
    }
  }, [sessionId]);

  const callAIrene = useCallback(async (userMessage: string, history: Message[]) => {
    setIsTyping(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: history.map(m => ({ role: m.role === 'airene' ? 'assistant' : 'user', content: m.content })),
          step,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to get response');
      }

      const data = await res.json();
      return data.reply as string;
    } catch {
      setError('Connection issue. Please try again.');
      return "I'm having trouble connecting right now. Please try again in a moment!";
    } finally {
      setIsTyping(false);
    }
  }, [step]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    const newUserMsg: Message = { role: 'user', content: userMessage, timestamp: new Date() };
    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    setInput('');

    trackEvent({
      event: 'inquiry_start',
      params: { step, value: userMessage },
    });

    const reply = await callAIrene(userMessage, updatedMessages);
    const aireneMsg: Message = { role: 'airene', content: reply, timestamp: new Date() };
    const finalMessages = [...updatedMessages, aireneMsg];
    setMessages(finalMessages);

    if (step === 0) {
      setUserData(prev => ({ ...prev, name: userMessage }));
      setStep(1);
    } else if (step === 1) {
      setUserData(prev => ({ ...prev, phone: userMessage }));
      setStep(2);
    } else if (step === 2) {
      if (userMessage.toLowerCase() !== 'skip') {
        setUserData(prev => ({ ...prev, email: userMessage }));
      }
      setStep(3);
    } else if (step === 3) {
      setUserData(prev => ({ ...prev, requirements: userMessage }));
      setStep(4);
      trackEvent({
        event: 'inquiry_complete',
        params: { name: userData.name, phone: userData.phone },
      });
    }

    const dataToSave = step === 0
      ? { name: userMessage, phone: '', email: '', requirements: '' }
      : step === 1
        ? { ...userData, name: userData.name || userMessage, phone: userMessage }
        : step === 2
          ? { ...userData, email: userMessage.toLowerCase() === 'skip' ? userData.email : userMessage }
          : step === 3
            ? { ...userData, requirements: userMessage }
            : userData;

    await saveSession(finalMessages, dataToSave, step < 4 ? step + 1 : 4);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FF6600] flex items-center justify-center text-white font-bold">
              A
            </div>
            <div>
              <h1 className="font-bold text-slate-800">AIrene Chat</h1>
              <p className="text-sm text-green-600 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                24/7 Online
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push('/')}
            className="text-slate-500 hover:text-slate-700 transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto py-6 px-4" style={{ maxHeight: 'calc(100vh - 180px)' }}>
        <div className="container mx-auto max-w-2xl space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-[#FF6600] text-white rounded-br-md'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-md'
                }`}
              >
                {msg.role === 'airene' && (
                  <p className="text-xs font-bold text-[#FF6600] mb-1">AIrene</p>
                )}
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3">
                <p className="text-xs font-bold text-[#FF6600] mb-1">AIrene</p>
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100" />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
          {error && (
            <div className="flex justify-center">
              <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg">{error}</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-200 bg-white py-4">
        <div className="container mx-auto max-w-2xl px-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                step === 0 ? 'Type your name...' :
                step === 1 ? 'e.g., +60123456789' :
                step === 2 ? 'email@domain.com or "skip"' :
                step === 3 ? 'e.g., Near LRT Damai, RM600-800, move in May' :
                'Type here...'
              }
              className="flex-1"
              disabled={isTyping}
              autoFocus
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="bg-[#FF6600] hover:bg-[#e55a00] text-white px-6"
            >
              {isTyping ? '...' : 'Send'}
            </Button>
          </div>
          <p className="text-xs text-slate-500 mt-2 text-center">
            AIrene typically replies within 2 minutes • 24/7 available
          </p>
        </div>
      </div>
    </main>
  );
}
