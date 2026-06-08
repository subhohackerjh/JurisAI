'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import DashboardHeader from '@/components/DashboardHeader';
import { apiCall } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import ReactMarkdown from 'react-markdown';
import {
  FileText, Clock, CheckCircle2, XCircle, Loader2,
  Sparkles, Download, Copy, CheckCheck, User,
  AlertCircle, RefreshCw, Wand2, Eye, PenTool
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending:     { label: 'New Request',  color: 'bg-yellow-100 text-yellow-700' },
  accepted:    { label: 'Accepted',     color: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'In Progress',  color: 'bg-indigo-100 text-indigo-700' },
  review:      { label: 'Under Review', color: 'bg-purple-100 text-purple-700' },
  completed:   { label: 'Completed',    color: 'bg-green-100 text-green-700' },
  cancelled:   { label: 'Cancelled',    color: 'bg-gray-100 text-gray-500' },
};

const DOC_LABELS: Record<string, string> = {
  contract: 'Contract Agreement', notice: 'Legal Notice',
  power_of_attorney: 'Power of Attorney', will: 'Will & Testament',
  partnership: 'Partnership Deed', rental: 'Rental Agreement',
  employment: 'Employment Contract', nda: 'NDA',
  mou: 'MOU', complaint: 'Legal Complaint', other: 'Other',
};

export default function AdvocateDraftsInboxPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [drafts, setDrafts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);

  // AI draft generation state
  const [aiDraft, setAiDraft] = useState('');
  const [generating, setGenerating] = useState(false);
  const [tab, setTab] = useState<'preview' | 'edit'>('preview');
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Status update
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [agreedPrice, setAgreedPrice] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'advocate') router.push('/dashboard');
    else loadDrafts();
  }, [user]);

  const loadDrafts = async () => {
    setLoading(true);
    const res = await apiCall<any>('/cases/drafts/');
    if (res.data) {
      const list = Array.isArray(res.data) ? res.data : (res.data as any).results ?? [];
      setDrafts(list);
    }
    setLoading(false);
  };

  const updateStatus = async (draftId: string, status: string, extra?: any) => {
    setUpdatingStatus(true);
    const res = await apiCall<any>(`/cases/drafts/${draftId}/status/`, {
      method: 'PUT',
      body: JSON.stringify({ status, ...extra }),
    });
    if (!res.error) {
      await loadDrafts();
      if (selected?.id === draftId) {
        setSelected((prev: any) => ({ ...prev, status, ...extra }));
      }
    }
    setUpdatingStatus(false);
    return res;
  };

  const submitDraftDoc = async () => {
    if (!selected || !aiDraft.trim()) return;
    setSubmitting(true);
    const res = await updateStatus(selected.id, 'completed', {
      draft_document: aiDraft,
      ...(agreedPrice ? { agreed_price: parseFloat(agreedPrice) } : {}),
    });
    if (!res.error) {
      setAiDraft('');
    }
    setSubmitting(false);
  };

  // Generate AI draft for the selected request
  const generateAIDraft = useCallback(async () => {
    if (!selected) return;
    setGenerating(true);
    setAiDraft('');
    setTab('preview');
    abortRef.current = new AbortController();

    try {
      const res = await fetch('/api/ai-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentType: selected.document_type,
          requirements: selected.requirements,
          additionalContext: selected.additional_notes,
          advocateName: user?.name,
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) { const e = await res.json(); setAiDraft(`**Error:** ${e.error}`); return; }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let acc = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value, { stream: true }).split('\n')) {
          if (!line.startsWith('data: ')) continue;
          try {
            const p = JSON.parse(line.slice(6));
            if (p.text) { acc += p.text; setAiDraft(acc); }
          } catch {}
        }
      }
    } catch (e: any) {
      if (e.name !== 'AbortError') setAiDraft('**Error:** Generation failed. Please try again.');
    } finally {
      setGenerating(false);
    }
  }, [selected, user?.name]);

  const downloadDraft = () => {
    if (!aiDraft) return;
    const blob = new Blob([aiDraft], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${DOC_LABELS[selected?.document_type] || 'draft'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!user) return null;

  const pending = drafts.filter(d => d.status === 'pending');
  const active  = drafts.filter(d => ['accepted', 'in_progress', 'review'].includes(d.status));
  const done    = drafts.filter(d => ['completed', 'cancelled'].includes(d.status));

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} onLogout={logout} />

      <main className="px-4 md:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Drafting Requests</h1>
              <p className="text-sm text-muted-foreground">
                Client requests • Use AI to draft instantly
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadDrafts}>
              <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button size="sm" onClick={() => router.push('/dashboard/advocate/draft')}
              className="bg-violet-600 hover:bg-violet-700">
              <Wand2 className="w-4 h-4 mr-1" /> AI Draft Tool
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'New',        count: pending.length, color: 'text-yellow-600' },
            { label: 'In Progress', count: active.length,  color: 'text-indigo-600' },
            { label: 'Completed',  count: done.filter(d=>d.status==='completed').length, color: 'text-green-600' },
          ].map(s => (
            <Card key={s.label} className="p-4 text-center">
              <p className={`text-3xl font-bold ${s.color}`}>{s.count}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ── LEFT: Requests list ── */}
          <div className="space-y-4">

            {loading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : drafts.length === 0 ? (
              <Card className="p-10 text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
                <p className="font-medium text-muted-foreground">No draft requests yet</p>
                <p className="text-sm text-muted-foreground mt-1">Clients will send requests from their dashboard</p>
              </Card>
            ) : (
              <>
                {pending.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      New Requests ({pending.length})
                    </p>
                    {pending.map(d => <DraftCard key={d.id} draft={d} selected={selected} onSelect={setSelected} />)}
                  </div>
                )}
                {active.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 mt-4">
                      In Progress ({active.length})
                    </p>
                    {active.map(d => <DraftCard key={d.id} draft={d} selected={selected} onSelect={setSelected} />)}
                  </div>
                )}
                {done.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 mt-4">
                      Completed / Cancelled ({done.length})
                    </p>
                    {done.map(d => <DraftCard key={d.id} draft={d} selected={selected} onSelect={setSelected} />)}
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── RIGHT: Detail + AI drafting ── */}
          <div>
            {!selected ? (
              <Card className="p-10 text-center h-full flex flex-col items-center justify-center">
                <Wand2 className="w-14 h-14 text-violet-200 mb-4" />
                <p className="font-medium text-muted-foreground">Select a request to view details and use AI drafting</p>
              </Card>
            ) : (
              <Card className="flex flex-col h-full">
                {/* Request details */}
                <div className="p-5 border-b space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{DOC_LABELS[selected.document_type] || selected.document_type}</h3>
                        <Badge className={`text-xs border-0 ${STATUS_CONFIG[selected.status]?.color}`}>
                          {STATUS_CONFIG[selected.status]?.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {selected.customer?.name || 'Client'} •{' '}
                        {new Date(selected.created_at).toLocaleDateString('en-IN')}
                      </p>
                    </div>

                    {/* Action buttons based on status */}
                    <div className="flex gap-2 shrink-0">
                      {selected.status === 'pending' && (
                        <>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8 text-xs"
                            disabled={updatingStatus}
                            onClick={() => updateStatus(selected.id, 'accepted')}>
                            {updatingStatus ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3 mr-1" />}
                            Accept
                          </Button>
                          <Button size="sm" variant="destructive" className="h-8 text-xs"
                            disabled={updatingStatus}
                            onClick={() => updateStatus(selected.id, 'cancelled')}>
                            <XCircle className="w-3 h-3 mr-1" /> Decline
                          </Button>
                        </>
                      )}
                      {selected.status === 'accepted' && (
                        <Button size="sm" className="h-8 text-xs"
                          disabled={updatingStatus}
                          onClick={() => updateStatus(selected.id, 'in_progress')}>
                          Start Work
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="bg-muted/40 rounded-xl p-3 text-sm">
                    <p className="font-medium text-xs text-muted-foreground mb-1">Requirements</p>
                    <p className="text-sm leading-relaxed">{selected.requirements}</p>
                    {selected.additional_notes && (
                      <p className="mt-2 text-xs text-muted-foreground">{selected.additional_notes}</p>
                    )}
                  </div>

                  {/* Pricing + delivery */}
                  {['accepted', 'in_progress'].includes(selected.status) && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Agreed Price (₹)</Label>
                        <Input type="number" className="mt-1 h-8 text-sm" placeholder="5000"
                          value={agreedPrice} onChange={e => setAgreedPrice(e.target.value)} />
                      </div>
                      <div>
                        <Label className="text-xs">Expected Delivery</Label>
                        <Input type="date" className="mt-1 h-8 text-sm"
                          value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} />
                      </div>
                    </div>
                  )}
                </div>

                {/* AI Drafting section */}
                {['accepted', 'in_progress', 'review'].includes(selected.status) && (
                  <div className="flex-1 flex flex-col p-4 gap-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-violet-500" /> AI Draft
                      </h4>
                      <div className="flex items-center gap-2">
                        <div className="flex rounded-lg overflow-hidden border">
                          <button className={`px-3 py-1 text-xs ${tab === 'preview' ? 'bg-muted font-medium' : ''}`}
                            onClick={() => setTab('preview')}>
                            <Eye className="w-3 h-3 inline mr-1" />Preview
                          </button>
                          <button className={`px-3 py-1 text-xs ${tab === 'edit' ? 'bg-muted font-medium' : ''}`}
                            onClick={() => setTab('edit')}>
                            <PenTool className="w-3 h-3 inline mr-1" />Edit
                          </button>
                        </div>
                        {aiDraft && (
                          <>
                            <button onClick={() => { navigator.clipboard.writeText(aiDraft); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                              className="text-muted-foreground hover:text-foreground">
                              {copied ? <CheckCheck className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                            </button>
                            <button onClick={downloadDraft} className="text-muted-foreground hover:text-foreground">
                              <Download className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 border rounded-xl overflow-hidden min-h-[280px]">
                      {!aiDraft && !generating ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-6">
                          <Sparkles className="w-10 h-10 text-violet-200 mb-3" />
                          <p className="text-sm text-muted-foreground mb-3">
                            Click below to generate a draft using AI
                          </p>
                          <Button onClick={generateAIDraft}
                            className="bg-violet-600 hover:bg-violet-700">
                            <Sparkles className="w-4 h-4 mr-2" /> Generate with AI
                          </Button>
                        </div>
                      ) : tab === 'edit' ? (
                        <Textarea
                          className="h-full w-full rounded-none border-0 font-mono text-xs resize-none focus-visible:ring-0 p-3"
                          value={aiDraft}
                          onChange={e => setAiDraft(e.target.value)}
                        />
                      ) : (
                        <ScrollArea className="h-[280px]">
                          <div className="p-4 prose prose-xs max-w-none dark:prose-invert">
                            <ReactMarkdown>{aiDraft}</ReactMarkdown>
                            {generating && <span className="inline-block w-2 h-4 bg-violet-500 animate-pulse rounded-sm" />}
                          </div>
                        </ScrollArea>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1"
                        onClick={generating ? () => abortRef.current?.abort() : generateAIDraft}>
                        {generating
                          ? <><Loader2 className="w-3 h-3 animate-spin mr-1" /> Stop</>
                          : <><RefreshCw className="w-3 h-3 mr-1" /> {aiDraft ? 'Regenerate' : 'Generate'}</>}
                      </Button>
                      <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700"
                        disabled={!aiDraft.trim() || submitting}
                        onClick={submitDraftDoc}>
                        {submitting
                          ? <Loader2 className="w-3 h-3 animate-spin mr-1" />
                          : <CheckCircle2 className="w-3 h-3 mr-1" />}
                        Submit to Client
                      </Button>
                    </div>
                  </div>
                )}

                {selected.status === 'completed' && selected.draft_document && (
                  <div className="p-4">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Submitted Document</p>
                    <ScrollArea className="h-48 border rounded-xl">
                      <div className="p-4 prose prose-xs max-w-none dark:prose-invert">
                        <ReactMarkdown>{selected.draft_document}</ReactMarkdown>
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function DraftCard({ draft, selected, onSelect }: { draft: any; selected: any; onSelect: (d: any) => void }) {
  const sc = STATUS_CONFIG[draft.status] || STATUS_CONFIG.pending;
  const isActive = selected?.id === draft.id;
  return (
    <Card
      className={`p-4 cursor-pointer transition-all hover:shadow-md mb-2 ${isActive ? 'border-violet-400 bg-violet-50/30' : ''}`}
      onClick={() => onSelect(draft)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
            <p className="font-medium text-sm truncate">
              {DOC_LABELS[draft.document_type] || draft.document_type}
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {draft.customer?.name || 'Client'} • {new Date(draft.created_at).toLocaleDateString('en-IN')}
          </p>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{draft.requirements}</p>
        </div>
        <Badge className={`text-xs border-0 shrink-0 ${sc.color}`}>{sc.label}</Badge>
      </div>
    </Card>
  );
}
