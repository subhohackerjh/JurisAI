'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardHeader from '@/components/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Loader, ArrowLeft, MessageSquare, User, Gavel, CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react';
import { messagingApi } from '@/lib/messaging-api';

// ─── Conversation View ────────────────────────────────────────────────────────
function ConversationView({ conversationId, currentUser, onBack }: {
  conversationId: string;
  currentUser: any;
  onBack: () => void;
}) {
  const router = useRouter();
  const [conversation, setConversation] = useState<any>(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Case Request Form (customer)
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [caseForm, setCaseForm] = useState({ title: '', case_type: 'civil', description: '', court_name: '' });
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  // Reject form (advocate)
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  // Track last known message count so we only scroll on NEW messages
  const lastMsgCountRef = useRef(0);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingRef = useRef(false); // prevent overlapping polls

  const loadConversation = async (silent = false) => {
    // silent=true means background poll — don't show loading spinner
    if (!silent) setLoading(true);
    try {
      const res = await messagingApi.getConversation(conversationId);
      if (res.data) {
        const conv = res.data as any;
        setConversation((prev: any) => {
          // Only update if something changed (avoid unnecessary re-renders)
          const prevCount = prev?.messages?.length ?? 0;
          const newCount = conv.messages?.length ?? 0;
          if (silent && prevCount === newCount && prev?.status === conv.status) return prev;
          return conv;
        });
        // Mark messages read on initial load only
        if (!silent) await messagingApi.markMessagesRead(conversationId);
      } else if (!silent) {
        setError(res.error || 'Conversation not found');
      }
    } catch {
      if (!silent) setError('Failed to load conversation');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadConversation(false);
  }, [conversationId]);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    const count = conversation?.messages?.length ?? 0;
    if (count > lastMsgCountRef.current) {
      scrollToBottom();
      lastMsgCountRef.current = count;
    }
  }, [conversation?.messages?.length]);

  // Polling — every 3 seconds while tab is visible
  useEffect(() => {
    const poll = async () => {
      if (isPollingRef.current) return; // skip if previous poll still running
      if (document.visibilityState === 'hidden') return;
      isPollingRef.current = true;
      await loadConversation(true);
      isPollingRef.current = false;
    };

    pollingRef.current = setInterval(poll, 3000);

    // Pause polling when tab is hidden, resume when visible
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') poll();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [conversationId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      const res = await messagingApi.sendMessage(conversationId, { content: input.trim() });
      if (res.data) { setInput(''); await loadConversation(false); }
    } finally { setSending(false); }
  };

  // Customer: submit case request
  const handleRequestCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseForm.title.trim() || !caseForm.description.trim()) return;
    setIsRequesting(true);
    setRequestError(null);
    try {
      const res = await messagingApi.requestCase(conversationId, {
        title: caseForm.title,
        case_type: caseForm.case_type,
        description: caseForm.description,
        court_name: caseForm.court_name || undefined,
      });
      if (res.error) { setRequestError(res.error); }
      else { setShowRequestForm(false); await loadConversation(false); }
    } finally { setIsRequesting(false); }
  };

  // Advocate: confirm case
  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      const res = await messagingApi.confirmCase(conversationId, 'Case accepted');
      if (!res.error) await loadConversation(false);
    } finally { setIsConfirming(false); }
  };

  // Advocate: reject case
  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectReason.trim()) return;
    setIsRejecting(true);
    try {
      const res = await messagingApi.rejectCase(conversationId, rejectReason);
      if (!res.error) { setShowRejectForm(false); setRejectReason(''); await loadConversation(false); }
    } finally { setIsRejecting(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  );

  if (error || !conversation) return (
    <div className="text-center py-12">
      <p className="text-muted-foreground mb-4">{error || 'Conversation not found'}</p>
      <Button variant="outline" onClick={onBack}>Back</Button>
    </div>
  );

  const isCustomer = currentUser?.role === 'customer';
  const isAdvocate = currentUser?.role === 'advocate';
  const otherPerson = isCustomer ? conversation.advocate : conversation.customer;
  const caseDetails = conversation.case_details || {};
  const convStatus = conversation.status;

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-card rounded-t-lg flex-shrink-0">
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="w-4 h-4" /></Button>
        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{otherPerson?.name}</p>
          <p className="text-xs text-muted-foreground capitalize">{otherPerson?.role} {otherPerson?.specialization ? `· ${otherPerson.specialization}` : ''}</p>
        </div>
        <Badge variant="secondary" className="text-xs capitalize flex-shrink-0">
          {convStatus === 'active' ? 'Active' :
           convStatus === 'case_requested' ? '⏳ Case Requested' :
           convStatus === 'case_created' ? '✅ Case Created' :
           convStatus?.replace('_', ' ')}
        </Badge>
      </div>

      {/* ── Status Banners ── */}

      {/* Case Created banner */}
      {convStatus === 'case_created' && (
        <div className="flex-shrink-0 mx-4 mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold">Case Created Successfully!</p>
              <p className="text-xs">Your case has been created and assigned.</p>
            </div>
          </div>
          <Button size="sm" className="bg-green-700 hover:bg-green-800 flex-shrink-0" onClick={() => {
            if (conversation.case_id) router.push(`/dashboard/case/${conversation.case_id}`);
            else router.push('/dashboard');
          }}>
            <ExternalLink className="w-3 h-3 mr-1" /> View Case
          </Button>
        </div>
      )}

      {/* Customer: case request pending */}
      {isCustomer && convStatus === 'case_requested' && (
        <div className="flex-shrink-0 mx-4 mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
          <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0" />
          <div className="text-yellow-800">
            <p className="text-sm font-semibold">Case request sent!</p>
            <p className="text-xs">Waiting for the advocate to confirm. You'll see an update here.</p>
          </div>
        </div>
      )}

      {/* Advocate: case request action */}
      {isAdvocate && convStatus === 'case_requested' && !showRejectForm && (
        <div className="flex-shrink-0 mx-4 mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
          <div className="flex items-center gap-2 text-blue-800">
            <Gavel className="w-5 h-5 flex-shrink-0" />
            <p className="font-semibold text-sm">New Case Request from {conversation.customer?.name}</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-2 text-xs bg-white rounded p-2 border border-blue-100">
            <div><span className="text-muted-foreground">Title:</span> <span className="font-medium">{caseDetails.title || '—'}</span></div>
            <div><span className="text-muted-foreground">Type:</span> <span className="font-medium capitalize">{caseDetails.case_type || '—'}</span></div>
            {caseDetails.court_name && <div><span className="text-muted-foreground">Court:</span> <span className="font-medium">{caseDetails.court_name}</span></div>}
            {caseDetails.description && (
              <div className="sm:col-span-2">
                <span className="text-muted-foreground">Description:</span>
                <p className="font-medium mt-0.5 whitespace-pre-wrap">{caseDetails.description}</p>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              size="sm" className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={handleConfirm} disabled={isConfirming}
            >
              {isConfirming ? <Loader className="w-3 h-3 animate-spin mr-1" /> : <CheckCircle className="w-3 h-3 mr-1" />}
              Accept & Create Case
            </Button>
            <Button
              size="sm" variant="destructive" className="flex-1"
              onClick={() => setShowRejectForm(true)}
            >
              <XCircle className="w-3 h-3 mr-1" /> Decline
            </Button>
          </div>
        </div>
      )}

      {/* Advocate: reject reason form */}
      {isAdvocate && convStatus === 'case_requested' && showRejectForm && (
        <form onSubmit={handleReject} className="flex-shrink-0 mx-4 mt-3 p-4 bg-red-50 border border-red-200 rounded-lg space-y-3">
          <p className="text-sm font-semibold text-red-800">Reason for declining</p>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Explain why you are declining this case request..."
            rows={3}
            className="resize-none text-sm"
            required
          />
          <div className="flex gap-2">
            <Button size="sm" variant="destructive" type="submit" disabled={isRejecting || !rejectReason.trim()} className="flex-1">
              {isRejecting ? <Loader className="w-3 h-3 animate-spin mr-1" /> : null}
              Confirm Decline
            </Button>
            <Button size="sm" variant="outline" type="button" onClick={() => setShowRejectForm(false)} className="flex-1">Cancel</Button>
          </div>
        </form>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/10 min-h-0">
        {(!conversation.messages || conversation.messages.length === 0) ? (
          <div className="text-center py-12">
            <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-30" />
            <p className="text-muted-foreground text-sm">No messages yet.</p>
            {isCustomer && <p className="text-xs text-muted-foreground mt-1">Say hello and describe your legal issue!</p>}
          </div>
        ) : (
          conversation.messages.map((msg: any) => {
            const isMe = String(msg.sender?.id) === String(currentUser?.id);
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm ${
                  isMe ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-card border border-border rounded-bl-sm'
                }`}>
                  <p className="break-words whitespace-pre-wrap">{msg.content}</p>
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

      {/* ── Customer: Request Case Form ── */}
      {isCustomer && showRequestForm && convStatus === 'active' && (
        <form onSubmit={handleRequestCase} className="flex-shrink-0 border-t border-border bg-card p-4 space-y-3">
          <p className="text-sm font-semibold flex items-center gap-2">
            <Gavel className="w-4 h-4 text-primary" /> Request Case from {otherPerson?.name}
          </p>
          {requestError && <p className="text-xs text-destructive">{requestError}</p>}
          <div>
            <Label className="text-xs">Case Title *</Label>
            <Input
              className="mt-1 text-sm" placeholder="e.g., Property Dispute with Neighbour"
              value={caseForm.title} onChange={(e) => setCaseForm(f => ({ ...f, title: e.target.value }))} required
            />
          </div>
          <div>
            <Label className="text-xs">Case Type *</Label>
            <Select value={caseForm.case_type} onValueChange={(v) => setCaseForm(f => ({ ...f, case_type: v }))}>
              <SelectTrigger className="mt-1 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="civil">Civil</SelectItem>
                <SelectItem value="criminal">Criminal</SelectItem>
                <SelectItem value="family">Family</SelectItem>
                <SelectItem value="property">Property</SelectItem>
                <SelectItem value="corporate">Corporate</SelectItem>
                <SelectItem value="labour">Labour</SelectItem>
                <SelectItem value="consumer">Consumer</SelectItem>
                <SelectItem value="writ">Writ Petition</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Description *</Label>
            <Textarea
              className="mt-1 text-sm resize-none" rows={3}
              placeholder="Describe your case in detail..."
              value={caseForm.description} onChange={(e) => setCaseForm(f => ({ ...f, description: e.target.value }))} required
            />
          </div>
          <div>
            <Label className="text-xs">Court Name (Optional)</Label>
            <Input
              className="mt-1 text-sm" placeholder="e.g., Delhi High Court"
              value={caseForm.court_name} onChange={(e) => setCaseForm(f => ({ ...f, court_name: e.target.value }))}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" className="flex-1" disabled={isRequesting || !caseForm.title || !caseForm.description}>
              {isRequesting ? <Loader className="w-3 h-3 animate-spin mr-1" /> : <Gavel className="w-3 h-3 mr-1" />}
              Send Case Request
            </Button>
            <Button type="button" size="sm" variant="outline" className="flex-1" onClick={() => setShowRequestForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      {/* ── Message Input ── */}
      <div className="flex-shrink-0 border-t border-border bg-card rounded-b-lg">
        <form onSubmit={handleSend} className="p-3 flex gap-2">
          <Input
            value={input} onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..." disabled={sending}
            className="flex-1 text-sm" autoFocus
          />
          <Button type="submit" disabled={!input.trim() || sending} size="sm">
            {sending ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>

        {/* Request Case button — customer only, only when conversation is active */}
        {isCustomer && convStatus === 'active' && !showRequestForm && (
          <div className="px-3 pb-3">
            <Button
              variant="outline" size="sm" className="w-full border-dashed text-muted-foreground hover:border-primary hover:text-primary"
              onClick={() => setShowRequestForm(true)}
            >
              <Gavel className="w-3.5 h-3.5 mr-2" /> Request Case from this Advocate
            </Button>
          </div>
        )}
      </div>
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

  if (loading) return (
    <div className="flex items-center justify-center h-40">
      <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  );

  if (error) return <p className="text-center text-destructive py-8">{error}</p>;

  if (conversations.length === 0) return (
    <div className="text-center py-16">
      <MessageSquare className="w-14 h-14 text-muted-foreground mx-auto mb-3 opacity-30" />
      <p className="font-medium text-muted-foreground">No conversations yet</p>
      <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
        {currentUser?.role === 'customer'
          ? 'Go to Find Advocates, pick one, and click "Send Message" to start a conversation.'
          : 'Customers will reach out to you here. Their messages will appear in this inbox.'}
      </p>
    </div>
  );

  const getConvStatusBadge = (status: string) => {
    if (status === 'case_requested') return <Badge className="bg-yellow-100 text-yellow-800 text-xs">⏳ Needs Review</Badge>;
    if (status === 'case_created') return <Badge className="bg-green-100 text-green-800 text-xs">✅ Case Created</Badge>;
    return null;
  };

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
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-sm truncate">{other?.name}</p>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {getConvStatusBadge(conv.status)}
                    {conv.unread_count > 0 && (
                      <Badge className="bg-primary text-primary-foreground text-xs">{conv.unread_count}</Badge>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {lastMsg ? lastMsg.content : 'No messages yet'}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {conv.updated_at ? new Date(conv.updated_at).toLocaleDateString() : ''}
                  {other?.specialization ? ` · ${other.specialization}` : ''}
                </p>
              </div>
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
      <main className="px-3 sm:px-4 md:px-6 lg:px-8 py-6 max-w-3xl mx-auto">
        {!activeConversation ? (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Messages</h1>
                <p className="text-sm text-muted-foreground">
                  {session.user.role === 'customer'
                    ? 'Chat with advocates — request and track your cases here'
                    : 'Your client conversations and case requests'}
                </p>
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
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-6 h-6 animate-spin" />
      </div>
    }>
      <ChatPageContent />
    </Suspense>
  );
}
