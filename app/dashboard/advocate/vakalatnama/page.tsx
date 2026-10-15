'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import DashboardHeader from '@/components/DashboardHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Copy, Check, Printer } from 'lucide-react';
import DownloadButton from '@/components/DownloadButton';

interface VForm {
  // Client
  clientName: string;
  clientFatherName: string;
  clientAddress: string;
  clientPhone: string;
  // Advocate
  advocateName: string;
  advocateEnrollment: string;
  barCouncil: string;
  // Case
  courtName: string;
  caseNumber: string;
  caseYear: string;
  caseType: string;
  petitioner: string;
  respondent: string;
  // Meta
  date: string;
  place: string;
}

const BLANK: VForm = {
  clientName: '', clientFatherName: '', clientAddress: '', clientPhone: '',
  advocateName: '', advocateEnrollment: '', barCouncil: '',
  courtName: '', caseNumber: '', caseYear: '', caseType: 'Civil',
  petitioner: '', respondent: '',
  date: new Date().toISOString().slice(0, 10), place: '',
};

const BAR_COUNCILS = [
  'Bar Council of Delhi', 'Bar Council of Maharashtra & Goa',
  'Bar Council of Karnataka', 'Bar Council of Tamil Nadu & Puducherry',
  'Bar Council of Uttar Pradesh', 'Bar Council of Rajasthan',
  'Bar Council of Gujarat', 'Bar Council of West Bengal',
  'Bar Council of Punjab & Haryana', 'Bar Council of Telangana',
  'Bar Council of Kerala', 'Bar Council of Madhya Pradesh',
  'Bar Council of Bihar', 'Bar Council of Odisha',
  'Bar Council of Jharkhand', 'Supreme Court Bar Association',
];

function generateVakalatnama(f: VForm): string {
  const fmtDate = (d: string) => {
    if (!d) return '_______________';
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const cn = f.caseNumber && f.caseYear
    ? `${f.caseType} Case No. ${f.caseNumber} of ${f.caseYear}`
    : '_______________';

  return `VAKALATNAMA

IN THE ${(f.courtName || '_____________________').toUpperCase()}

${cn}

BETWEEN:

${f.petitioner || '_____________________'}                          ...PETITIONER/PLAINTIFF

                                    AND

${f.respondent || '_____________________'}                          ...RESPONDENT/DEFENDANT


VAKALATNAMA

I/We, ${f.clientName || '_____________________'}, Son/Daughter/Wife of ${f.clientFatherName || '_____________________'}, residing at ${f.clientAddress || '_____________________'}, Phone: ${f.clientPhone || '_____________________'}, do hereby appoint and retain:

${f.advocateName || '_____________________'}
Enrollment No.: ${f.advocateEnrollment || '_____________________'}
${f.barCouncil || '_____________________'}

as my/our Advocate/Advocates to appear, plead and act for me/us in the above-mentioned case and in all proceedings connected therewith, and to represent me/us in all stages of the above proceeding including execution and appeals.

I/We authorise my/our said Advocate(s) to:

1. File, sign, verify and present plaints, written statements, petitions, applications, affidavits and other documents in the above matter and all connected proceedings.

2. Conduct and prosecute (or defend) the said case and all proceedings in the said Court and other Courts competent to deal with the above matter.

3. Compromise or refer to arbitration the said dispute, compound matters, obtain interim injunctions and execute all documents necessary for the purpose.

4. Withdraw or not press any suit, appeal, application or proceedings as my/our said Advocate(s) may think fit.

5. Engage and instruct junior advocates, clerks and others for the proper conduct of the case.

6. Generally to do all acts, deeds and things as may be necessary for the proper conduct of the aforesaid proceedings.

I/We further declare that I/We have not been declared an insolvent and that there is no impediment to my/our giving this Vakalatnama.

I/We also agree that the fees payable to my/our Advocate(s) shall be as agreed between us.


SIGNED AND VERIFIED

Place: ${f.place || '_____________________'}
Date: ${fmtDate(f.date)}


_________________________________
Signature of Client
Name: ${f.clientName || '_____________________'}


ACCEPTED

I, ${f.advocateName || '_____________________'}, Advocate, do hereby accept the above Vakalatnama.

Enrollment No.: ${f.advocateEnrollment || '_____________________'}
${f.barCouncil || '_____________________'}

Place: ${f.place || '_____________________'}
Date: ${fmtDate(f.date)}


_________________________________
Signature of Advocate
(${f.advocateName || '_____________________'})


Note: This Vakalatnama is executed in accordance with Order III Rule 4, Code of Civil Procedure 1908 / Section 302, Bharatiya Nagarik Suraksha Sanhita 2023.
`;
}

export default function VakalatnamaPage() {
  const { user, logout } = useAuth();
  const [form, setForm] = useState<VForm>({
    ...BLANK,
    advocateName:      user?.name || '',
    advocateEnrollment: (user as any)?.enrollment_number || '',
    barCouncil:        (user as any)?.bar_council || '',
  });
  const [copied, setCopied] = useState(false);
  const [preview, setPreview] = useState(false);

  const set = (k: keyof VForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));
  const setS = (k: keyof VForm) => (v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const text = generateVakalatnama(form);

  const copyText = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };


  const print = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<html><head><title>Vakalatnama — JurisAI</title><style>
      body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.8; margin: 2cm; white-space: pre-wrap; }
      .brand { border-top: 1px solid #ccc; margin-top: 2em; padding-top: 0.5em; font-size: 9pt; color: #666; font-family: Arial, sans-serif; text-align: center; }
    </style></head><body>${text.replace(/</g, '&lt;')}<div class="brand">Generated by <strong>JurisAI</strong> — India's Legal Services Platform &nbsp;|&nbsp; JurisAI<br>AI-assisted document. Verify with a qualified advocate before use.</div></body></html>`);
    win.document.close();
    win.print();
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} onLogout={logout} />
      <main className="px-4 md:px-6 lg:px-8 py-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-3 sm:gap-4 mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Vakalatnama Generator</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Order III Rule 4 CPC / BNSS §302 — auto-filled, print-ready</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Form */}
          <div className="space-y-5">
            <Card className="p-5 space-y-4">
              <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Client Details</h2>
              <div>
                <Label>Client Full Name</Label>
                <Input className="mt-1" placeholder="e.g. Ramesh Kumar Sharma" value={form.clientName} onChange={set('clientName')} />
              </div>
              <div>
                <Label>Father's / Husband's / Wife's Name</Label>
                <Input className="mt-1" placeholder="e.g. Suresh Kumar Sharma" value={form.clientFatherName} onChange={set('clientFatherName')} />
              </div>
              <div>
                <Label>Address</Label>
                <Textarea className="mt-1" rows={2} placeholder="Full residential address" value={form.clientAddress} onChange={set('clientAddress')} />
              </div>
              <div>
                <Label>Phone Number</Label>
                <Input className="mt-1" placeholder="+91 98765 43210" value={form.clientPhone} onChange={set('clientPhone')} />
              </div>
            </Card>

            <Card className="p-5 space-y-4">
              <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Advocate Details</h2>
              <div>
                <Label>Advocate Full Name</Label>
                <Input className="mt-1" value={form.advocateName} onChange={set('advocateName')} />
              </div>
              <div>
                <Label>Enrollment Number</Label>
                <Input className="mt-1" placeholder="e.g. D/1234/2018" value={form.advocateEnrollment} onChange={set('advocateEnrollment')} />
              </div>
              <div>
                <Label>Bar Council</Label>
                <Select value={form.barCouncil} onValueChange={setS('barCouncil')}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {BAR_COUNCILS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </Card>

            <Card className="p-5 space-y-4">
              <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Case Details</h2>
              <div>
                <Label>Court Name</Label>
                <Input className="mt-1" placeholder="e.g. District Court, New Delhi" value={form.courtName} onChange={set('courtName')} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Case Type</Label>
                  <Select value={form.caseType} onValueChange={setS('caseType')}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['Civil', 'Criminal', 'Family', 'Consumer', 'Writ', 'Labour', 'Arbitration', 'Other'].map(t =>
                        <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Case No.</Label>
                  <Input className="mt-1" placeholder="e.g. 1234" value={form.caseNumber} onChange={set('caseNumber')} />
                </div>
              </div>
              <div>
                <Label>Year</Label>
                <Input className="mt-1" placeholder="e.g. 2024" value={form.caseYear} onChange={set('caseYear')} />
              </div>
              <div>
                <Label>Petitioner / Plaintiff Name</Label>
                <Input className="mt-1" value={form.petitioner} onChange={set('petitioner')} />
              </div>
              <div>
                <Label>Respondent / Defendant Name</Label>
                <Input className="mt-1" value={form.respondent} onChange={set('respondent')} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Place of Signing</Label>
                  <Input className="mt-1" placeholder="City" value={form.place} onChange={set('place')} />
                </div>
                <div>
                  <Label>Date</Label>
                  <Input type="date" className="mt-1" value={form.date} onChange={set('date')} />
                </div>
              </div>
            </Card>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Live Preview</h2>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={copyText}>
                  {copied ? <Check className="w-4 h-4 mr-1 text-green-600" /> : <Copy className="w-4 h-4 mr-1" />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
                <DownloadButton
                  getContent={() => {
                    const docTitle = `Vakalatnama_${form.clientName || 'client'}${form.caseNumber ? '_' + form.caseNumber : ''}`;
                    return { content: text, title: docTitle, docType: 'Vakalatnama' };
                  }}
                />
                <Button size="sm" variant="outline" onClick={print}>
                  <Printer className="w-4 h-4 mr-1" /> Print
                </Button>
              </div>
            </div>
            <Card className="p-5 bg-white">
              <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed text-slate-800 overflow-auto max-h-[400px] sm:max-h-[680px]">
                {text}
              </pre>
            </Card>
            <p className="text-xs text-muted-foreground text-center">
              This template is for guidance. Have the executed Vakalatnama reviewed before filing. Stamp paper may be required in some states.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
