'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import DashboardHeader from '@/components/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Bot, Send, User, FileText, AlertCircle,
  Lightbulb, BookOpen, Scale, Gavel, Loader2,
  RefreshCw, Copy, CheckCheck, Sparkles
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
}

const QUICK_PROMPTS = [
  { icon: FileText, label: 'Divorce Process', prompt: 'Explain the divorce process in India step by step, including timeline and documents required.' },
  { icon: Scale,    label: 'Property Dispute', prompt: 'What are my legal options if someone has illegally occupied my property?' },
  { icon: BookOpen, label: 'Labour Rights', prompt: 'What are my rights as an employee if I am unfairly terminated?' },
  { icon: Gavel,    label: 'File an FIR', prompt: 'How do I file an FIR and what happens after it is filed?' },
  { icon: AlertCircle, label: 'Section 498A', prompt: 'Explain IPC Section 498A (cruelty by husband/relatives) — what constitutes an offence and how to file a complaint.' },
  { icon: Lightbulb, label: 'eCourts Filing', prompt: 'How do I file a case online using the eCourts portal in India?' },
];

export default function AIChatPage() {
  const { user, logout } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `**Welcome to LEGAL 24 AI Assistant!** 👋

I'm powered by Claude AI and trained on Indian law. I can help you with:

- 📋 **Legal procedures** — how to file cases, FIRs, complaints
- ⚖️ **Your rights** — under IPC, Constitution, Consumer law, Labour law
- 🏠 **Property & family matters** — disputes, divorce, inheritance
- 📱 **eCourts system** — online filing, case tracking, e-services
- 📄 **Document guidance** — what documents you need for legal processes

Ask me anything about Indian law. How can I help you today?`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
    };

    const assistantId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      isStreaming: true,
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setInput('');
    setIsLoading(true);

    // Build conversation history (exclude the empty streaming message)
    const history = [...messages, userMessage].map(m => ({
      role: m.role,
      content: m.content,
    }));

    abortRef.current = new AbortController();

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history,
          context: { userRole: user?.role },
        }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to get response');
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (!data.trim()) continue;

          try {
            const parsed = JSON.parse(data);
            if (parsed.text) {
              accumulated += parsed.text;
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantId
                    ? { ...m, content: accumulated, isStreaming: true }
                    : m
                )
              );
            } else if (parsed.done) {
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantId ? { ...m, isStreaming: false } : m
                )
              );
            } else if (parsed.error) {
              throw new Error(parsed.error);
            }
          } catch (parseErr) {
            // skip malformed chunks
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;

      const errorText = err.message || 'Something went wrong. Please try again.';
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId
            ? { ...m, content: `⚠️ **Error:** ${errorText}`, isStreaming: false }
            : m
        )
      );
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }, [messages, isLoading, user?.role]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const copyMessage = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const resetChat = () => {
    abortRef.current?.abort();
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: `**New conversation started.** Ask me anything about Indian law!`,
      timestamp: new Date().toISOString(),
    }]);
    setIsLoading(false);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} onLogout={logout} />

      <main className="px-3 sm:px-4 md:px-6 lg:px-8 py-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg relative shrink-0">
              <Bot className="h-6 w-6 text-white" />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full" />
            </div>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                AI Legal Assistant
                <Badge className="bg-orange-100 text-orange-700 text-xs">Powered by Groq · Free</Badge>
              </h1>
              <p className="text-sm text-muted-foreground">Real-time Indian law guidance</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={resetChat} title="New conversation">
            <RefreshCw className="w-4 h-4 mr-1" /> New Chat
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main chat */}
          <div className="lg:col-span-2">
            <Card className="flex flex-col h-[620px]">
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map(message => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.role === 'assistant' && (
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shrink-0 mt-1">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      )}

                      <div className={`max-w-[85%] group ${message.role === 'user' ? 'order-first' : ''}`}>
                        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                          message.role === 'user'
                            ? 'bg-indigo-600 text-white rounded-br-sm'
                            : 'bg-muted rounded-bl-sm'
                        }`}>
                          {message.role === 'assistant' ? (
                            <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-semibold prose-p:leading-relaxed">
                              <ReactMarkdown>{message.content}</ReactMarkdown>
                              {message.isStreaming && (
                                <span className="inline-block w-2 h-4 bg-indigo-500 animate-pulse ml-0.5 rounded-sm" />
                              )}
                            </div>
                          ) : (
                            <p className="whitespace-pre-wrap">{message.content}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-1 px-1">
                          <span className="text-xs text-muted-foreground">
                            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {message.role === 'assistant' && !message.isStreaming && message.content && (
                            <button
                              onClick={() => copyMessage(message.id, message.content)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                            >
                              {copiedId === message.id
                                ? <CheckCheck className="w-3.5 h-3.5 text-green-500" />
                                : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>
                      </div>

                      {message.role === 'user' && (
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center shrink-0 mt-1">
                          <User className="w-4 h-4 text-indigo-600" />
                        </div>
                      )}
                    </div>
                  ))}

                  {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-muted px-4 py-3 rounded-2xl rounded-bl-sm">
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="border-t p-4">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask your legal question… (Shift+Enter for new line)"
                    rows={2}
                    className="flex-1 resize-none text-sm"
                    disabled={isLoading}
                  />
                  <div className="flex flex-col gap-2">
                    <Button
                      type="submit"
                      size="sm"
                      disabled={!input.trim() || isLoading}
                      className="h-full bg-indigo-600 hover:bg-indigo-700"
                    >
                      {isLoading
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Send className="w-4 h-4" />}
                    </Button>
                  </div>
                </form>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  General legal information only — not a substitute for professional legal advice
                </p>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Quick prompts */}
            <Card className="p-4">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                Quick Questions
              </h3>
              <div className="space-y-2">
                {QUICK_PROMPTS.map((qp, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(qp.prompt)}
                    disabled={isLoading}
                    className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-muted transition-colors disabled:opacity-50"
                  >
                    <qp.icon className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span>{qp.label}</span>
                  </button>
                ))}
              </div>
            </Card>

            {/* Legal topics */}
            <Card className="p-4">
              <h3 className="font-semibold text-sm mb-3">Topics I Cover</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  'IPC / BNS', 'CrPC / BNSS', 'Family Law', 'Property',
                  'Consumer Law', 'Labour Law', 'RTI', 'eCourts',
                  'Bail & Custody', 'FIR Filing', 'Constitution', 'IBC',
                ].map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs cursor-pointer hover:bg-indigo-100"
                    onClick={() => sendMessage(`Explain ${tag} in simple terms`)}>
                    {tag}
                  </Badge>
                ))}
              </div>
            </Card>

            {/* Disclaimer */}
            <Card className="p-4 border-amber-200 bg-amber-50">
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2 text-amber-800">
                <AlertCircle className="w-4 h-4" /> Disclaimer
              </h3>
              <ul className="text-xs text-amber-700 space-y-1">
                <li>• AI provides general legal information</li>
                <li>• Not a substitute for professional advice</li>
                <li>• Laws vary by state & circumstances</li>
                <li>• Consult a qualified advocate for your case</li>
              </ul>
              <Button
                size="sm"
                className="w-full mt-3 bg-amber-600 hover:bg-amber-700 text-white"
                onClick={() => window.location.href = '/dashboard/advocates'}
              >
                Find Qualified Advocates
              </Button>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
