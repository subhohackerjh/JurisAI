'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardHeader from '@/components/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Send, Loader, ArrowLeft, MessageSquare, User } from 'lucide-react';
import { messagingApi } from '@/lib/messaging-api';

// ─── Conversation View ────────────────────────────────────────────────────────
function ConversationView({ conversationId, currentUser, onBack }: {
  conversationId: string;
  currentUser: any;
  onBack: () => void;
}) {
  const [conversation, setConversation] = useState<any>(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  const loadConversation = async () => {
    try {
      const res = await messagingApi.getConversation(conversationId);
      if (res.data) {
        setConversation(res.data);
        await messagingApi.markMessagesRead(conversationId);
      } else {
        setError(res.error || 'Conversation not found');
      }
    } catch {
      setError('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadConversation(); }, [conversationId]);
  useEffect(() => { scrollToBottom(); }, [conversation?.messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      const res = await messagingApi.sendMessage(conversationId, { content: input.trim() });
      if (res.data) {
        setInput('');
        await loadConversation(); // reload to get latest messages
      }
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">{error || 'Conversation not found'}</p>
        <Button variant="outline" onClick={onBack}>Back to conversations</Button>
      </div>
    );
  }

  const otherPerson = currentUser?.role === 'customer' ? conversation.advocate : conversation.customer;

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-card rounded-t-lg">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-semibold">{otherPerson?.name}</p>
          <p className="text-xs text-muted-foreground capitalize">{otherPerson?.role}</p>
        </div>
        <div className="ml-auto">
          {conversation.status !== 'active' && (
            <Badge variant="secondary" className="text-xs capitalize">
              {conversation.status?.replace('_', ' ')}
            </Badge>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/10">
        {(!conversation.messages || conversation.messages.length === 0) ? (
          <p className="text-center text-muted-foreground text-sm py-8">
            No messages yet. Say hello!
          </p>
        ) : (
          conversation.messages.map((msg: any) => {
            const isMe = String(msg.sender?.id) === String(currentUser?.id);
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                  isMe
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-card border border-border rounded-bl-sm'
                }`}>
                  <p className="break-words">{msg.content}</p>
                  <p className={`text-xs mt-1 ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {isMe && msg.is_read && <span className="ml-1">✓✓</span>}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-border bg-card rounded-b-lg flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          disabled={sending}
          className="flex-1"
          autoFocus
        />
        <Button type="submit" disabled={!input.trim() || sending} size="sm">
          {sending ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </form>
    </div>
  );
}

// ─── Conversations List ───────────────────────────────────────────────────────
function ConversationsList({ currentUser, onSelect }: {
  currentUser: any;
  onSelect: (id: string) => void;
}) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await messagingApi.listConversations();
        if (res.data) {
          const data = res.data as any;
          setConversations(Array.isArray(data) ? data : data.results ?? []);
        } else {
          setError(res.error || 'Failed to load conversations');
        }
      } catch {
        setError('Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-destructive py-8">{error}</p>;
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
        <p className="text-muted-foreground">No conversations yet.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Go to an advocate's profile and click "Send Message" to start one.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conv: any) => {
        const other = currentUser?.role === 'customer' ? conv.advocate : conv.customer;
        const lastMsg = conv.messages?.[conv.messages.length - 1];
        return (
          <Card
            key={conv.id}
            className="p-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onSelect(conv.id)}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm truncate">{other?.name}</p>
                  {conv.unread_count > 0 && (
                    <Badge className="bg-primary text-primary-foreground text-xs ml-2 flex-shrink-0">
                      {conv.unread_count}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {lastMsg ? lastMsg.content : 'No messages yet'}
                </p>
              </div>
              <p className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                {conv.updated_at
                  ? new Date(conv.updated_at).toLocaleDateString()
                  : ''}
              </p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
function ChatPageContent() {
  const { session, logout } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeConversation, setActiveConversation] = useState<string | null>(
    searchParams.get('conversation')
  );

  if (!session.user) return null;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={session.user} onLogout={logout} />
      <main className="px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 max-w-3xl mx-auto">
        {!activeConversation ? (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Messages</h1>
                <p className="text-sm text-muted-foreground">Your conversations with advocates</p>
              </div>
            </div>
            <ConversationsList
              currentUser={session.user}
              onSelect={(id) => {
                setActiveConversation(id);
                router.replace(`/dashboard/chat?conversation=${id}`);
              }}
            />
          </>
        ) : (
          <ConversationView
            conversationId={activeConversation}
            currentUser={session.user}
            onBack={() => {
              setActiveConversation(null);
              router.replace('/dashboard/chat');
            }}
          />
        )}
      </main>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader className="w-6 h-6 animate-spin" /></div>}>
      <ChatPageContent />
    </Suspense>
  );
}
