'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import DashboardHeader from '@/components/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import ReactMarkdown from 'react-markdown';
import {
  Sparkles, FileText, Download, Copy, CheckCheck,
  Loader2, RefreshCw, BookOpen, Scale, Gavel,
  PenTool, Eye, AlertCircle, ChevronRight, Wand2
} from 'lucide-react';

const DOCUMENT_TYPES = [
  { value: 'notice',            label: 'Legal Notice',            icon: '📬', desc: 'Section 80 CPC / Section 138 NI Act' },
  { value: 'contract',          label: 'Contract Agreement',       icon: '📄', desc: 'Indian Contract Act 1872' },
  { value: 'power_of_attorney', label: 'Power of Attorney',        icon: '✍️', desc: 'Registration Act 1908' },
  { value: 'will',              label: 'Will & Testament',         icon: '📜', desc: 'Indian Succession Act 1925' },
  { value: 'partnership',       label: 'Partnership Deed',         icon: '🤝', desc: 'Indian Partnership Act 1932' },
  { value: 'rental',            label: 'Rental / Lease Agreement', icon: '🏠', desc: 'Transfer of Property Act 1882' },
  { value: 'employment',        label: 'Employment Contract',      icon: '💼', desc: 'Industrial Disputes Act / POSH Act' },
  { value: 'nda',               label: 'NDA',                      icon: '🔒', desc: 'Indian Contract Act + Specific Relief Act' },
  { value: 'mou',               label: 'MOU',                      icon: '🗒️', desc: 'Memorandum of Understanding' },
  { value: 'complaint',         label: 'Legal Complaint / FIR',    icon: '⚖️', desc: 'IPC / BNS + CrPC / BNSS' },
  { value: 'other',             label: 'Other Legal Document',     icon: '📋', desc: 'Custom document' },
];

const LAW_REFERENCE_CHIPS = [
  'Indian Contract Act 1872', 'Transfer of Property Act 1882', 'IPC Section 138',
  'CrPC Section 437', 'Hindu Marriage Act 1955', 'Consumer Protection Act 2019',
  'RTI Act 2005', 'POSH Act 2013', 'Companies Act 2013', 'Arbitration Act 1996',
];

export default function AdvocateAIDraftPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [docType, setDocType] = useState('');
  const [requirements, setRequirements] = useState('');
  const [partiesInfo, setPartiesInfo] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [generating, setGenerating] = useState(false);
  const [draftContent, setDraftContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (user && user.role !== 'advocate') router.push('/dashboard');
  }, [user]);

  const generateDraft = useCallback(async () => {
    if (!docType || !requirements.trim()) return;
    setGenerating(true);
    setDraftContent('');
    setActiveTab('preview');
    abortRef.current = new AbortController();

    try {
      const res = await fetch('/api/ai-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentType: docType,
          requirements: requirements.trim(),
          partiesInfo: partiesInfo.trim() || undefined,
          additionalContext: additionalContext.trim() || undefined,
          advocateName: user?.name,
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const err = await res.json();
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
            if (parsed.text) {
              accumulated += parsed.text;
              setDraftContent(accumulated);
            }
          } catch {}
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setDraftContent('**Error:** Draft generation failed. Please try again.');
      }
    } finally {
      setGenerating(false);
    }
  }, [docType, requirements, partiesInfo, additionalContext, user?.name]);

  const copyDraft = async () => {
    if (!draftContent) return;
    await navigator.clipboard.writeText(draftContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadDraft = () => {
    if (!draftContent) return;
    const docLabel = DOCUMENT_TYPES.find(d => d.value === docType)?.label || 'Legal Document';
    const branded = draftContent + '\n\n' + '─'.repeat(60) + `\nDocument Type: ${docLabel}\nGenerated by Legal24 AI — India's Legal Services Platform\nPowered by Groq (llama-3.3-70b) with Indian law knowledge base\nlegal24.in\nNote: AI-generated draft. Review and customise before use.\n` + '─'.repeat(60);
    const blob = new Blob([branded], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docLabel.replace(/\s+/g, '_')}_draft.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const addLawReference = (law: string) => {
    setAdditionalContext(prev => prev ? `${prev}\nRelevant law: ${law}` : `Relevant law: ${law}`);
  };

  if (!user) return null;

  const selectedDoc = DOCUMENT_TYPES.find(d => d.value === docType);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} onLogout={logout} />

      <main className="px-4 md:px-6 lg:px-8 py-6 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Wand2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                AI Legal Drafter
                <Badge className="bg-violet-100 text-violet-700 text-xs">Powered by Groq · Free</Badge>
              </h1>
              <p className="text-sm text-muted-foreground">
                Generate professional Indian legal documents — IPC, CrPC, Contract Act & more
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ── LEFT PANEL: Inputs ──────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Document Type */}
            <Card className="p-5">
              <h2 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-violet-600" /> Select Document Type
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {DOCUMENT_TYPES.map(dt => (
                  <button
                    key={dt.value}
                    onClick={() => setDocType(dt.value)}
                    className={`w-full text-left flex items-start gap-3 p-3 rounded-xl border-2 transition-all text-sm ${
                      docType === dt.value
                        ? 'border-violet-500 bg-violet-50 text-violet-900'
                        : 'border-transparent bg-muted/40 hover:bg-muted hover:border-muted-foreground/20'
                    }`}
                  >
                    <span className="text-lg leading-none mt-0.5">{dt.icon}</span>
                    <div>
                      <p className="font-medium">{dt.label}</p>
                      <p className="text-xs text-muted-foreground">{dt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            {/* Requirements */}
            <Card className="p-5 space-y-4">
              <h2 className="font-semibold text-sm flex items-center gap-2">
                <PenTool className="w-4 h-4 text-violet-600" /> Document Requirements
              </h2>

              <div>
                <Label className="text-xs font-medium">Client Requirements *</Label>
                <Textarea
                  className="mt-1.5 resize-none text-sm"
                  rows={5}
                  placeholder={`Describe what the document should cover...\n\nExample: Client needs a rental agreement for a 2BHK flat in Mumbai, 11 months, ₹25,000/month, 2 months security deposit.`}
                  value={requirements}
                  onChange={e => setRequirements(e.target.value)}
                />
              </div>

              <div>
                <Label className="text-xs font-medium">Parties Information</Label>
                <Textarea
                  className="mt-1.5 resize-none text-sm"
                  rows={3}
                  placeholder="Party 1: Rajesh Kumar, S/o Ram Kumar, 45 yrs, Mumbai&#10;Party 2: Priya Sharma, D/o Suresh Sharma, 32 yrs, Pune"
                  value={partiesInfo}
                  onChange={e => setPartiesInfo(e.target.value)}
                />
              </div>

              <div>
                <Label className="text-xs font-medium">Additional Context / Special Clauses</Label>
                <Textarea
                  className="mt-1.5 resize-none text-sm"
                  rows={3}
                  placeholder="Any specific clauses, state laws, or circumstances to include..."
                  value={additionalContext}
                  onChange={e => setAdditionalContext(e.target.value)}
                />
              </div>

              {/* Quick law reference chips */}
              <div>
                <Label className="text-xs font-medium mb-2 block">Add Law Reference</Label>
                <div className="flex flex-wrap gap-1.5">
                  {LAW_REFERENCE_CHIPS.map(law => (
                    <button
                      key={law}
                      onClick={() => addLawReference(law)}
                      className="text-xs px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors"
                    >
                      + {law}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                className="w-full bg-violet-600 hover:bg-violet-700"
                onClick={generating ? () => abortRef.current?.abort() : generateDraft}
                disabled={!docType || !requirements.trim()}
              >
                {generating ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Stop Generating</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" /> Generate Draft</>
                )}
              </Button>
            </Card>
          </div>

          {/* ── RIGHT PANEL: Draft Output ───────────────────────────────────── */}
          <div className="lg:col-span-3">
            <Card className="flex flex-col h-full min-h-[700px]">

              {/* Toolbar */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-violet-600" />
                  <h2 className="font-semibold text-sm">
                    {selectedDoc ? `${selectedDoc.icon} ${selectedDoc.label}` : 'Generated Document'}
                  </h2>
                  {generating && (
                    <Badge className="bg-violet-100 text-violet-700 text-xs animate-pulse">
                      Drafting…
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Tabs value={activeTab} onValueChange={v => setActiveTab(v as any)}>
                    <TabsList className="h-8">
                      <TabsTrigger value="editor" className="text-xs h-6 px-2">
                        <PenTool className="w-3 h-3 mr-1" /> Edit
                      </TabsTrigger>
                      <TabsTrigger value="preview" className="text-xs h-6 px-2">
                        <Eye className="w-3 h-3 mr-1" /> Preview
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <Button variant="ghost" size="sm" onClick={copyDraft} disabled={!draftContent} title="Copy">
                    {copied ? <CheckCheck className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={downloadDraft} disabled={!draftContent} title="Download .txt">
                    <Download className="w-4 h-4" />
                  </Button>
                  {draftContent && (
                    <Button variant="ghost" size="sm" onClick={generateDraft} disabled={generating} title="Regenerate">
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Content area */}
              <div className="flex-1 overflow-hidden">
                {!draftContent && !generating ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <div className="w-20 h-20 bg-violet-50 rounded-2xl flex items-center justify-center mb-4">
                      <Gavel className="w-10 h-10 text-violet-300" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Ready to Draft</h3>
                    <p className="text-muted-foreground text-sm max-w-sm">
                      Select a document type, describe your requirements, and click{' '}
                      <span className="text-violet-600 font-medium">Generate Draft</span>.
                    </p>
                    <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-left w-full max-w-sm">
                      {[
                        ['📚', 'Full Indian law knowledge base'],
                        ['⚖️', 'Proper IPC/CrPC section citations'],
                        ['📝', 'Standard court-accepted format'],
                        ['🔧', 'Editable placeholders included'],
                      ].map(([icon, text], i) => (
                        <div key={i} className="flex items-center gap-2 p-2.5 bg-muted/50 rounded-lg">
                          <span>{icon}</span>
                          <span className="text-muted-foreground">{text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : activeTab === 'editor' ? (
                  <Textarea
                    className="h-full w-full rounded-none border-0 resize-none font-mono text-sm focus-visible:ring-0 p-4"
                    value={draftContent}
                    onChange={e => setDraftContent(e.target.value)}
                    placeholder="Your draft will appear here..."
                  />
                ) : (
                  <ScrollArea className="h-full">
                    <div className="p-6 prose prose-sm max-w-none dark:prose-invert
                      prose-headings:font-bold prose-headings:text-foreground
                      prose-p:text-foreground prose-li:text-foreground
                      prose-strong:text-foreground">
                      <ReactMarkdown>{draftContent}</ReactMarkdown>
                      {generating && (
                        <span className="inline-block w-2 h-5 bg-violet-500 animate-pulse rounded-sm ml-0.5" />
                      )}
                    </div>
                  </ScrollArea>
                )}
              </div>

              {/* Footer disclaimer */}
              {draftContent && !generating && (
                <div className="p-3 border-t bg-amber-50/60 flex items-start gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">
                    AI-generated draft — review all clauses, fill placeholders, and verify with current laws before use. Advocate responsibility applies.
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Law Reference Panel */}
        <Card className="mt-6 p-5">
          <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-500" /> Indian Law Knowledge Base
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { title: 'Contract Law',    laws: ['Indian Contract Act 1872', 'Specific Relief Act 1963', 'Sale of Goods Act 1930'] },
              { title: 'Property Law',    laws: ['Transfer of Property Act 1882', 'Registration Act 1908', 'Stamp Act 1899'] },
              { title: 'Criminal Law',    laws: ['IPC 1860 / BNS 2023', 'CrPC 1973 / BNSS 2023', 'Evidence Act 1872'] },
              { title: 'Family Law',      laws: ['Hindu Marriage Act 1955', 'Special Marriage Act 1954', 'DV Act 2005'] },
              { title: 'Commercial',      laws: ['Companies Act 2013', 'NI Act 1881', 'IBC 2016'] },
              { title: 'Labour Law',      laws: ['Industrial Disputes Act 1947', 'POSH Act 2013', 'PF Act 1952'] },
            ].map(group => (
              <div key={group.title} className="bg-muted/40 rounded-xl p-3">
                <p className="text-xs font-semibold text-foreground mb-2">{group.title}</p>
                {group.laws.map(law => (
                  <p key={law} className="text-xs text-muted-foreground leading-relaxed">{law}</p>
                ))}
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
}
