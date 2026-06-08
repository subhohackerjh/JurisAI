'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import DashboardHeader from '@/components/DashboardHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, Clock, ChevronRight, ChevronLeft, Copy, Download, IndianRupee, FileText } from 'lucide-react';

// ── Step data ─────────────────────────────────────────────────────────────────
const STEPS = [
  { id: 'details',   title: 'Cheque Details',    icon: IndianRupee },
  { id: 'dates',     title: 'Key Dates',          icon: Clock },
  { id: 'notice',    title: 'Legal Notice',       icon: FileText },
  { id: 'complaint', title: 'File Complaint',     icon: CheckCircle2 },
];

interface Form {
  // Drawer (accused)
  drawerName: string; drawerAddress: string; drawerPhone: string;
  // Payee (complainant)
  payeeName: string; payeeAddress: string;
  // Cheque
  chequeNo: string; chequeDate: string; chequeAmount: string; bankName: string; ifsc: string;
  // Dishonour
  dishonourDate: string; dishonourReason: string;
  // Notice
  noticeDate: string; noticeSentBy: string;
  // Complaint
  complainantAdvocate: string; courtName: string;
}

const BLANK: Form = {
  drawerName: '', drawerAddress: '', drawerPhone: '',
  payeeName: '', payeeAddress: '',
  chequeNo: '', chequeDate: '', chequeAmount: '', bankName: '', ifsc: '',
  dishonourDate: '', dishonourReason: 'Insufficient Funds',
  noticeDate: '', noticeSentBy: 'Registered Post AD',
  complainantAdvocate: '', courtName: '',
};

function addDays(dateStr: string, days: number): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d;
}

function fmtDate(d: Date | null): string {
  if (!d) return '—';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

function generateNotice(f: Form): string {
  return `BY REGISTERED POST A.D.
Date: ${fmtDate(f.noticeDate ? new Date(f.noticeDate) : null)}

To,
${f.drawerName || '_____________________'}
${f.drawerAddress || '_____________________'}

Sub: Legal Notice under Section 138 read with Section 142, Negotiable Instruments Act, 1881 demanding payment of ₹${parseFloat(f.chequeAmount || '0').toLocaleString('en-IN')} — dishonoured cheque bearing No. ${f.chequeNo || '______'}

Sir / Madam,

I, ${f.payeeName || '_____________________'}, residing at ${f.payeeAddress || '_____________________'}, hereby serve upon you this legal notice under Section 138 of the Negotiable Instruments Act, 1881 as follows:

1. That you issued Cheque No. ${f.chequeNo || '______'} dated ${fmtDate(f.chequeDate ? new Date(f.chequeDate) : null)} drawn on ${f.bankName || '______'} (IFSC: ${f.ifsc || '______'}) for an amount of ₹${parseFloat(f.chequeAmount || '0').toLocaleString('en-IN')} (Rupees ${f.chequeAmount ? numberToWords(parseFloat(f.chequeAmount)) : '___'} only) towards discharge of a legally enforceable debt/liability.

2. That the said cheque was presented for payment and was returned/dishonoured on ${fmtDate(f.dishonourDate ? new Date(f.dishonourDate) : null)} with the bank memo stating: "${f.dishonourReason || 'Insufficient Funds'}".

3. That by reason of the above dishonour, you have committed an offence under Section 138 of the Negotiable Instruments Act, 1881.

4. That you are hereby called upon to make payment of the said amount of ₹${parseFloat(f.chequeAmount || '0').toLocaleString('en-IN')} (Rupees ${f.chequeAmount ? numberToWords(parseFloat(f.chequeAmount)) : '___'} only) together with interest at the rate of 18% per annum from the date of dishonour, within FIFTEEN (15) days from the receipt of this notice.

5. In case you fail to make the aforesaid payment within the stipulated period, I shall be constrained to initiate criminal proceedings against you under Section 138 of the Negotiable Instruments Act, 1881, which is punishable with imprisonment up to 2 years or fine up to twice the cheque amount or both, without any further notice.

Yours faithfully,

${f.payeeName || '_____________________'}
(Complainant)

Sent via: ${f.noticeSentBy}
`;
}

// Simplified Indian number-to-words
function numberToWords(n: number): string {
  if (!n || isNaN(n)) return '';
  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const rem = Math.floor(n % 1000);
  const parts: string[] = [];
  if (crore) parts.push(`${crore} Crore`);
  if (lakh) parts.push(`${lakh} Lakh`);
  if (thousand) parts.push(`${thousand} Thousand`);
  if (rem) parts.push(`${rem}`);
  return parts.join(' ') || '0';
}

// ── Steps UI ─────────────────────────────────────────────────────────────────
function DetailsStep({ f, set }: { f: Form; set: (k: keyof Form) => any }) {
  return (
    <div className="space-y-5">
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
        <strong>Section 138, Negotiable Instruments Act 1881</strong> — dishonour of cheque is a criminal offence punishable with up to 2 years imprisonment or fine up to twice the cheque amount, or both.
      </div>
      <h3 className="font-semibold">Cheque Details</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        <div><Label>Cheque Number</Label><Input className="mt-1" placeholder="e.g. 001234" value={f.chequeNo} onChange={set('chequeNo')} /></div>
        <div><Label>Cheque Date</Label><Input type="date" className="mt-1" value={f.chequeDate} onChange={set('chequeDate')} /></div>
        <div><Label>Cheque Amount (₹)</Label><Input type="number" className="mt-1" placeholder="e.g. 500000" value={f.chequeAmount} onChange={set('chequeAmount')} /></div>
        <div><Label>Bank Name</Label><Input className="mt-1" placeholder="e.g. State Bank of India" value={f.bankName} onChange={set('bankName')} /></div>
        <div><Label>IFSC Code</Label><Input className="mt-1" placeholder="e.g. SBIN0001234" value={f.ifsc} onChange={set('ifsc')} /></div>
      </div>
      <h3 className="font-semibold pt-2">Drawer (Accused)</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        <div><Label>Full Name</Label><Input className="mt-1" value={f.drawerName} onChange={set('drawerName')} /></div>
        <div><Label>Phone</Label><Input className="mt-1" value={f.drawerPhone} onChange={set('drawerPhone')} /></div>
        <div className="sm:col-span-2"><Label>Address</Label><Input className="mt-1" value={f.drawerAddress} onChange={set('drawerAddress')} /></div>
      </div>
      <h3 className="font-semibold pt-2">Payee / Complainant (You)</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        <div><Label>Full Name</Label><Input className="mt-1" value={f.payeeName} onChange={set('payeeName')} /></div>
        <div className="sm:col-span-2"><Label>Address</Label><Input className="mt-1" value={f.payeeAddress} onChange={set('payeeAddress')} /></div>
      </div>
    </div>
  );
}

function DatesStep({ f, set }: { f: Form; set: (k: keyof Form) => any }) {
  const dishonour = f.dishonourDate ? new Date(f.dishonourDate) : null;
  const noticeDeadline = addDays(f.dishonourDate, 30);
  const noticeGiven = f.noticeDate ? new Date(f.noticeDate) : null;
  const replyDeadline = noticeGiven ? addDays(f.noticeDate, 15) : null;
  const complaintDeadline = replyDeadline ? new Date(replyDeadline.getTime() + 30 * 86400000) : null;
  const today = new Date();

  const statusOf = (d: Date | null) => {
    if (!d) return null;
    const diff = Math.ceil((d.getTime() - today.getTime()) / 86400000);
    if (diff < 0) return { label: `Expired ${Math.abs(diff)}d ago`, cls: 'bg-red-100 text-red-800' };
    if (diff <= 5) return { label: `⚠️ ${diff}d left`, cls: 'bg-amber-100 text-amber-800' };
    return { label: `${diff}d remaining`, cls: 'bg-green-100 text-green-800' };
  };

  const timeline = [
    { label: 'Cheque Dishonoured', date: dishonour, note: 'Start of the 30-day notice window' },
    { label: 'Notice must be sent by', date: noticeDeadline, note: 'Within 30 days of dishonour (S.138 proviso a)' },
    { label: 'Notice sent on', date: noticeGiven, note: 'Date you actually sent the legal notice' },
    { label: 'Accused must pay by (15-day window)', date: replyDeadline, note: '15 days from receipt of notice (S.138 proviso b)' },
    { label: 'Complaint must be filed by', date: complaintDeadline, note: 'Within 30 days of expiry of 15-day notice period (S.142)' },
  ];

  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label>Date of Dishonour (Bank Return Date)</Label>
          <Input type="date" className="mt-1" value={f.dishonourDate} onChange={set('dishonourDate')} />
        </div>
        <div>
          <Label>Reason for Dishonour</Label>
          <select value={f.dishonourReason} onChange={e => set('dishonourReason')({ target: { value: e.target.value } } as any)}
            className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-sm">
            {['Insufficient Funds', 'Account Closed', 'Stop Payment', 'Signature Mismatch', 'Exceeds Arrangement', 'Post-dated Cheque'].map(r =>
              <option key={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <Label>Date Notice Sent</Label>
          <Input type="date" className="mt-1" value={f.noticeDate} onChange={set('noticeDate')} />
        </div>
        <div>
          <Label>Notice Sent Via</Label>
          <select value={f.noticeSentBy} onChange={e => set('noticeSentBy')({ target: { value: e.target.value } } as any)}
            className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-sm">
            {['Registered Post AD', 'Speed Post', 'Courier with acknowledgement', 'Email + WhatsApp (keep proof)'].map(r =>
              <option key={r}>{r}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-2 pt-2">
        <h3 className="font-semibold text-sm">Section 138 Timeline</h3>
        {timeline.map((t, i) => (
          <div key={i} className="flex items-start gap-3 p-3 border rounded-xl">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5 ${t.date ? 'bg-indigo-100 text-indigo-700' : 'bg-muted text-muted-foreground'}`}>{i + 1}</div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium">{t.label}</p>
                {t.date && (() => { const s = statusOf(t.date); return s ? <Badge className={`text-xs ${s.cls}`}>{s.label}</Badge> : null; })()}
              </div>
              <p className="text-xs text-indigo-700 font-semibold">{t.date ? fmtDate(t.date) : 'Enter date above'}</p>
              <p className="text-xs text-muted-foreground">{t.note}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NoticeStep({ f }: { f: Form }) {
  const [copied, setCopied] = useState(false);
  const notice = generateNotice(f);

  const copy = async () => { await navigator.clipboard.writeText(notice); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const download = () => {
    const blob = new Blob([notice], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `Legal_Notice_S138_${f.drawerName || 'accused'}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
        Send this notice via <strong>Registered Post with Acknowledgement Due (AD)</strong> or Speed Post. Keep the postal receipt and acknowledgement card as evidence.
      </div>
      <div className="flex gap-2 justify-end">
        <Button size="sm" variant="outline" onClick={copy}>
          {copied ? <CheckCircle2 className="w-4 h-4 mr-1 text-green-600" /> : <Copy className="w-4 h-4 mr-1" />}
          {copied ? 'Copied' : 'Copy'}
        </Button>
        <Button size="sm" variant="outline" onClick={download}><Download className="w-4 h-4 mr-1" /> Download</Button>
      </div>
      <Card className="p-5 bg-white">
        <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed text-slate-800 overflow-auto max-h-[500px]">{notice}</pre>
      </Card>
    </div>
  );
}

function ComplaintStep({ f, set }: { f: Form; set: (k: keyof Form) => any }) {
  const checklist = [
    { done: !!f.chequeNo && !!f.chequeAmount && !!f.bankName, label: 'Original dishonoured cheque (keep original, submit certified copy)' },
    { done: !!f.dishonourDate, label: 'Bank return memo / dishonour slip' },
    { done: !!f.noticeDate, label: 'Copy of legal notice with postal receipt' },
    { done: !!f.noticeDate, label: 'Acknowledgement card (AD) from registered post' },
    { done: false, label: 'Affidavit / verification of complainant' },
    { done: false, label: 'Proof of debt (contract, invoice, agreement)' },
    { done: false, label: 'ID proof of complainant (Aadhaar / PAN)' },
  ];

  return (
    <div className="space-y-5">
      <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800">
        File the complaint before a <strong>Judicial Magistrate First Class (JMFC)</strong> in the court having jurisdiction — where the cheque was drawn, presented, or the bank branch of the payee.
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label>Court Name (where filing)</Label>
          <Input className="mt-1" placeholder="e.g. JMFC Court, Bengaluru" value={f.courtName} onChange={set('courtName')} />
        </div>
        <div>
          <Label>Your Advocate's Name (if any)</Label>
          <Input className="mt-1" value={f.complainantAdvocate} onChange={set('complainantAdvocate')} />
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Documents Checklist</h3>
        <div className="space-y-2">
          {checklist.map((item, i) => (
            <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${item.done ? 'bg-green-50 border-green-200' : 'bg-muted/30'}`}>
              {item.done
                ? <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                : <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />}
              <p className="text-sm">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      <Card className="p-4 bg-indigo-50 border-indigo-200 space-y-3">
        <h3 className="font-semibold text-indigo-900">Key Legal Points</h3>
        <ul className="text-sm text-indigo-800 space-y-1.5">
          <li>• Complaint must be filed within <strong>30 days</strong> after the 15-day notice period expires (S.142)</li>
          <li>• Limitation period for the entire proceeding: <strong>2 years</strong> from date of cause of action</li>
          <li>• If convicted: imprisonment up to <strong>2 years</strong> OR fine up to <strong>twice the cheque amount</strong> OR both</li>
          <li>• Court can order interim compensation up to <strong>20%</strong> of the cheque amount during trial</li>
          <li>• Compounding is allowed — parties can settle at any stage (S.147 NI Act)</li>
          <li>• Multiple cheques = multiple complaints (each cheque is a separate cause of action)</li>
        </ul>
      </Card>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ChequeBounce138Page() {
  const { user, logout } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(BLANK);

  const setField = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} onLogout={logout} />
      <main className="px-4 md:px-6 lg:px-8 py-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center">
            <IndianRupee className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Cheque Bounce — Section 138 Wizard</h1>
            <p className="text-sm text-muted-foreground">Step-by-step guide to file a complaint under NI Act 1881</p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-1">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => setStep(i)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${i === step ? 'bg-indigo-600 text-white' : i < step ? 'bg-indigo-100 text-indigo-700' : 'bg-muted text-muted-foreground'}`}
              >
                <s.icon className="w-3.5 h-3.5" />
                {s.title}
              </button>
              {i < STEPS.length - 1 && <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
            </div>
          ))}
        </div>

        <Card className="p-6">
          {step === 0 && <DetailsStep f={form} set={setField} />}
          {step === 1 && <DatesStep f={form} set={setField} />}
          {step === 2 && <NoticeStep f={form} />}
          {step === 3 && <ComplaintStep f={form} set={setField} />}
        </Card>

        <div className="flex justify-between mt-5">
          <Button variant="outline" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          {step < STEPS.length - 1 && (
            <Button onClick={() => setStep(s => s + 1)} className="bg-indigo-600 hover:bg-indigo-700">
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
