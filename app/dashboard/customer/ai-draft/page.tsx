'use client';

import { useState, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import DashboardHeader from '@/components/DashboardHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReactMarkdown from 'react-markdown';
import {
  Sparkles, FileText, Copy, CheckCheck,
  Loader2, Wand2, Eye, PenTool
} from 'lucide-react';
import DownloadButton from '@/components/DownloadButton';

const DOCUMENT_TYPES = [
  { value: 'notice',            label: 'Legal Notice',            icon: '📬', desc: 'Section 80 CPC / Section 138 NI Act' },
  { value: 'contract',          label: 'Contract Agreement',       icon: '📄', desc: 'Indian Contract Act 1872' },
  { value: 'power_of_attorney', label: 'Power of Attorney',        icon: '✍️', desc: 'Registration Act 1908' },
  { value: 'will',              label: 'Will & Testament',         icon: '📜', desc: 'Indian Succession Act 1925' },
  { value: 'rental',            label: 'Rental / Lease Agreement', icon: '🏠', desc: 'Transfer of Property Act 1882' },
  { value: 'nda',               label: 'Non-Disclosure Agreement', icon: '🔒', desc: 'Indian Contract Act 1872' },
  { value: 'complaint',         label: 'Legal Complaint / FIR',    icon: '⚖️', desc: 'CrPC / BNSS' },
  { value: 'affidavit',         label: 'Affidavit',                icon: '📋', desc: 'Oaths Act 1969' },
];

// ── Drafting UI (same as advocate tool, customer variant) ─────────────────────
function DraftingTool() {
  const { user } = useAuth();
  const [docType, setDocType] = useState('notice');
  const [requirements, setRequirements] = useState('');
  // Pre-fill customer's own name and address as Sender/Party
  const [partiesInfo, setPartiesInfo] = useState(() => {
    const parts: string[] = [];
    if (user?.name) parts.push(`Sender / Party: ${user.name}`);
    if (user?.phone) parts.push(`Phone: ${user.phone}`);
    if (user?.address) {
      const addr = [user.address, user.city, user.state, user.pincode].filter(Boolean).join(', ');
      if (addr) parts.push(`Address: ${addr}`);
    }
    return parts.join('\n');
  });
  const [additionalContext, setAdditionalContext] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<'edit' | 'preview'>('edit');
  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(async () => {
    if (!requirements.trim()) return;
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setGenerating(true);
    setDraftContent('');
    setTab('preview');
    try {
      const token = localStorage.getItem('accessToken') ?? '';
      const res = await fetch('/api/ai-draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ docType, requirements, partiesInfo, additionalContext, userName: user?.name }),
        signal: abortRef.current.signal,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setDraftContent(`**Error:** ${err.error || 'Failed to generate draft'}`);
        return;
      }
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue;
          try {
            const parsed = JSON.parse(line.slice(6));
            if (parsed.text) { accumulated += parsed.text; setDraftContent(accumulated); }
          } catch {}
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') setDraftContent('**Error:** Draft generation failed. Please try again.');
    } finally {
      setGenerating(false);
    }
  }, [docType, requirements, partiesInfo, additionalContext, user?.name]);

  const copy = async () => {
    if (!draftContent) return;
    await navigator.clipboard.writeText(draftContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };


  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Left — inputs */}
      <div className="space-y-5">
        <div>
          <Label className="mb-2 block font-semibold">Document Type</Label>
          <div className="grid grid-cols-2 gap-2">
            {DOCUMENT_TYPES.map(dt => (
              <button
                key={dt.value}
                onClick={() => setDocType(dt.value)}
                className={`p-3 rounded-xl border text-left transition-all ${docType === dt.value ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-300' : 'hover:border-indigo-300 hover:bg-muted/30'}`}
              >
                <span className="text-lg">{dt.icon}</span>
                <p className="text-xs font-semibold mt-1">{dt.label}</p>
                <p className="text-xs text-muted-foreground">{dt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label>Requirements / Key Details <span className="text-destructive">*</span></Label>
          <Textarea className="mt-1" rows={4}
            placeholder="Describe what you need. E.g.: Notice to landlord for not returning security deposit of ₹50,000 paid on 15 Jan 2024 for flat at Delhi."
            value={requirements} onChange={e => setRequirements(e.target.value)} />
        </div>

        <div>
          <Label>Parties Involved</Label>
          <Input className="mt-1" placeholder="e.g. Sender: Priya Sharma; Recipient: Rajesh Gupta, landlord"
            value={partiesInfo} onChange={e => setPartiesInfo(e.target.value)} />
        </div>

        <div>
          <Label>Additional Context (optional)</Label>
          <Textarea className="mt-1" rows={2}
            placeholder="Any specific laws, dates, amounts, or circumstances to include"
            value={additionalContext} onChange={e => setAdditionalContext(e.target.value)} />
        </div>

        <Button onClick={generate} disabled={generating || !requirements.trim()}
          className="w-full bg-indigo-600 hover:bg-indigo-700">
          {generating
            ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating…</>
            : <><Wand2 className="w-4 h-4 mr-2" /> Generate Document</>}
        </Button>
      </div>

      {/* Right — preview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            <button onClick={() => setTab('edit')} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${tab === 'edit' ? 'bg-indigo-100 text-indigo-700' : 'text-muted-foreground hover:bg-muted'}`}>
              <PenTool className="w-3 h-3 inline mr-1" />Edit
            </button>
            <button onClick={() => setTab('preview')} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${tab === 'preview' ? 'bg-indigo-100 text-indigo-700' : 'text-muted-foreground hover:bg-muted'}`}>
              <Eye className="w-3 h-3 inline mr-1" />Preview
            </button>
          </div>
          {draftContent && (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={copy}>
                {copied ? <CheckCheck className="w-3.5 h-3.5 mr-1 text-green-600" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
              <DownloadButton
                getContent={() => {
                  const label = DOCUMENT_TYPES.find(d => d.value === docType)?.label || 'Legal Document';
                  return { content: draftContent, title: `${label}_Draft`, docType: label };
                }}
              />
            </div>
          )}
        </div>

        <Card className="p-5 min-h-[500px] bg-white">
          {!draftContent && !generating && (
            <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground gap-3">
              <Sparkles className="w-10 h-10 opacity-20" />
              <p className="text-sm">Fill in the details and click Generate</p>
            </div>
          )}
          {tab === 'edit' && draftContent && (
            <Textarea
              className="w-full min-h-[460px] font-mono text-xs border-0 focus-visible:ring-0 p-0 resize-none"
              value={draftContent}
              onChange={e => setDraftContent(e.target.value)}
            />
          )}
          {tab === 'preview' && draftContent && (
            <div className="chat-markdown text-slate-800">
              <ReactMarkdown>{draftContent}</ReactMarkdown>
            </div>
          )}
          {generating && !draftContent && (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            </div>
          )}
        </Card>

        <p className="text-xs text-muted-foreground text-center">
          AI-generated draft based on Indian law. Review with a qualified advocate before use.
        </p>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CustomerAIDraftPage() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} onLogout={logout} />
      <main className="px-4 md:px-6 lg:px-8 py-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <Wand2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">AI Legal Document Drafter</h1>
            </div>
            <p className="text-sm text-muted-foreground">Generate professional Indian legal documents instantly with AI</p>
          </div>
        </div>

        <DraftingTool />
      </main>
    </div>
  );
}
