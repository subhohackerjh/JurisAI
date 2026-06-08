'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import DashboardHeader from '@/components/DashboardHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, Scale, Clock, ShoppingCart, FileText, IndianRupee, AlertCircle, CheckCircle2, HeartHandshake, Search } from 'lucide-react';

// ── Court Fee Calculator (Court Fees Act 1870) ────────────────────────────────
function CourtFeeCalculator() {
  const [claimType, setClaimType] = useState('money');
  const [amount, setAmount] = useState('');
  const [court, setCourt] = useState('district');
  const [result, setResult] = useState<{ fee: number; breakdown: string[] } | null>(null);

  const calculate = () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) return;
    let fee = 0;
    const breakdown: string[] = [];

    if (claimType === 'money') {
      // Court Fees Act 1870 — Schedule I, Article 1 (ad valorem)
      if (val <= 10000) {
        fee = val * 0.075; // 7.5%
        breakdown.push(`7.5% on ₹${val.toLocaleString('en-IN')} = ₹${fee.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`);
      } else if (val <= 50000) {
        fee = 750 + (val - 10000) * 0.06;
        breakdown.push(`₹750 on first ₹10,000`);
        breakdown.push(`6% on next ₹${(val - 10000).toLocaleString('en-IN')} = ₹${((val - 10000) * 0.06).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`);
      } else if (val <= 200000) {
        fee = 750 + 2400 + (val - 50000) * 0.05;
        breakdown.push('₹750 on first ₹10,000');
        breakdown.push('₹2,400 on next ₹40,000 (6%)');
        breakdown.push(`5% on next ₹${(val - 50000).toLocaleString('en-IN')} = ₹${((val - 50000) * 0.05).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`);
      } else {
        fee = 750 + 2400 + 7500 + (val - 200000) * 0.04;
        breakdown.push('₹10,650 on first ₹2,00,000');
        breakdown.push(`4% on balance ₹${(val - 200000).toLocaleString('en-IN')} = ₹${((val - 200000) * 0.04).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`);
      }
      // High Court surcharge ~10%
      if (court === 'high') { fee *= 1.1; breakdown.push('+ 10% High Court surcharge'); }
    } else if (claimType === 'injunction') {
      fee = court === 'district' ? 200 : 400;
      breakdown.push(`Fixed fee for injunction application — ₹${fee}`);
    } else if (claimType === 'divorce') {
      fee = court === 'district' ? 150 : 300;
      breakdown.push(`Fixed fee for matrimonial petition — ₹${fee}`);
    } else if (claimType === 'probate') {
      fee = val * 0.02; // 2% of estate value
      breakdown.push(`2% of estate value ₹${val.toLocaleString('en-IN')} = ₹${fee.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`);
    }

    setResult({ fee: Math.max(Math.ceil(fee), 10), breakdown });
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Type of Suit / Application</Label>
          <Select value={claimType} onValueChange={setClaimType}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="money">Money Recovery / Damages</SelectItem>
              <SelectItem value="injunction">Injunction Application</SelectItem>
              <SelectItem value="divorce">Matrimonial / Divorce Petition</SelectItem>
              <SelectItem value="probate">Probate / Letters of Administration</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Court Level</Label>
          <Select value={court} onValueChange={setCourt}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="district">District / Civil Court</SelectItem>
              <SelectItem value="high">High Court</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {(claimType === 'money' || claimType === 'probate') && (
        <div>
          <Label>{claimType === 'probate' ? 'Estimated Estate Value (₹)' : 'Claim Amount (₹)'}</Label>
          <Input type="number" className="mt-1" placeholder="e.g. 500000"
            value={amount} onChange={e => setAmount(e.target.value)} />
        </div>
      )}

      <Button onClick={calculate} className="w-full bg-indigo-600 hover:bg-indigo-700">
        <Calculator className="w-4 h-4 mr-2" /> Calculate Court Fee
      </Button>

      {result && (
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
          <p className="text-2xl font-bold text-indigo-700 mb-3">
            ₹{result.fee.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </p>
          <div className="space-y-1">
            {result.breakdown.map((b, i) => (
              <p key={i} className="text-sm text-indigo-600">• {b}</p>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            * Based on Court Fees Act 1870. Actual fees vary by state. Consult your advocate.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Limitation Period Calculator (Limitation Act 1963) ────────────────────────
const LIMITATION_TYPES = [
  { label: 'Money Recovery (contract)', days: 3 * 365, article: 'Art. 113' },
  { label: 'Cheque Bounce — Section 138 NI Act', days: 30, article: 'Complaint within 30 days' },
  { label: 'Specific Performance of Contract', days: 3 * 365, article: 'Art. 54' },
  { label: 'Recovery of Immovable Property (possession)', days: 12 * 365, article: 'Art. 64/65' },
  { label: 'Mortgage suit (for possession)', days: 30 * 365, article: 'Art. 61' },
  { label: 'Tort / Negligence claim', days: 3 * 365, article: 'Art. 113' },
  { label: 'Consumer Complaint (Consumer Protection Act 2019)', days: 2 * 365, article: 'Section 69' },
  { label: 'Labour / Workmen Compensation', days: 2 * 365, article: 'WCA s.3' },
  { label: 'Execution of Decree', days: 12 * 365, article: 'Art. 136' },
  { label: 'Appeal (Civil) — High Court', days: 90, article: 'Art. 116' },
  { label: 'Appeal to Supreme Court', days: 90, article: 'Art. 133' },
  { label: 'Criminal Revision (Magistrate order)', days: 90, article: 'CrPC s.397' },
];

function LimitationCalculator() {
  const [type, setType] = useState('');
  const [date, setDate] = useState('');
  const [result, setResult] = useState<any>(null);

  const calculate = () => {
    const selected = LIMITATION_TYPES.find(t => t.label === type);
    if (!selected || !date) return;
    const start = new Date(date);
    const deadline = new Date(start);
    deadline.setDate(deadline.getDate() + selected.days);
    const today = new Date();
    const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 86400));
    setResult({ deadline, daysLeft, article: selected.article, days: selected.days });
  };

  return (
    <div className="space-y-5">
      <div>
        <Label>Type of Cause of Action</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="mt-1"><SelectValue placeholder="Select type..." /></SelectTrigger>
          <SelectContent>
            {LIMITATION_TYPES.map(t => (
              <SelectItem key={t.label} value={t.label}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Date of Cause of Action / Date of Default</Label>
        <Input type="date" className="mt-1" value={date} onChange={e => setDate(e.target.value)} />
      </div>
      <Button onClick={calculate} className="w-full bg-indigo-600 hover:bg-indigo-700">
        <Clock className="w-4 h-4 mr-2" /> Calculate Limitation Deadline
      </Button>
      {result && (
        <div className={`p-4 rounded-xl border ${result.daysLeft < 0 ? 'bg-red-50 border-red-300' : result.daysLeft < 30 ? 'bg-amber-50 border-amber-300' : 'bg-green-50 border-green-200'}`}>
          <p className="font-semibold text-lg mb-1">
            Deadline: {result.deadline.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <p className={`text-sm font-medium ${result.daysLeft < 0 ? 'text-red-700' : result.daysLeft < 30 ? 'text-amber-700' : 'text-green-700'}`}>
            {result.daysLeft < 0 ? `⛔ Limitation EXPIRED ${Math.abs(result.daysLeft)} days ago` :
             result.daysLeft === 0 ? '🚨 Deadline is TODAY' :
             `⏳ ${result.daysLeft} days remaining`}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Limitation period: {Math.round(result.days / 365 * 10) / 10} year(s) | Reference: {result.article}
          </p>
          {result.daysLeft < 30 && result.daysLeft >= 0 && (
            <p className="text-xs text-amber-700 mt-1 font-medium">⚠️ File IMMEDIATELY — less than 30 days left!</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Consumer Forum Jurisdiction (Consumer Protection Act 2019) ─────────────────
function ConsumerForumCalculator() {
  const [amount, setAmount] = useState('');
  const result = (() => {
    const val = parseFloat(amount);
    if (!val) return null;
    if (val <= 5000000) return {       // up to ₹50 lakhs
      forum: 'District Consumer Disputes Redressal Commission',
      short: 'District Forum',
      color: 'green', icon: '🏛️',
      jurisdiction: 'Up to ₹50 Lakhs',
      address: 'File at District Collectorate / District Court Complex',
      fee: val <= 100000 ? 200 : val <= 500000 ? 400 : val <= 1000000 ? 1000 : val <= 3000000 ? 2500 : 4000,
    };
    if (val <= 200000000) return {     // ₹50L to ₹2 Cr
      forum: 'State Consumer Disputes Redressal Commission',
      short: 'State Commission',
      color: 'blue', icon: '⚖️',
      jurisdiction: '₹50 Lakhs – ₹2 Crore',
      address: 'State capital — check your state consumer helpline',
      fee: 5000,
    };
    return {                           // above ₹2 Cr
      forum: 'National Consumer Disputes Redressal Commission (NCDRC)',
      short: 'National Commission',
      color: 'purple', icon: '🏦',
      jurisdiction: 'Above ₹2 Crore',
      address: 'Janpath, New Delhi — 110 001',
      fee: 7500,
    };
  })();

  return (
    <div className="space-y-5">
      <div>
        <Label>Value of Goods/Services / Compensation Claimed (₹)</Label>
        <Input type="number" className="mt-1" placeholder="e.g. 2500000 (25 lakhs)"
          value={amount} onChange={e => setAmount(e.target.value)} />
        <p className="text-xs text-muted-foreground mt-1">Under Consumer Protection Act 2019, Section 34/47/58</p>
      </div>
      {result && (
        <div className="p-5 bg-muted/40 rounded-xl border space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{result.icon}</span>
            <div>
              <p className="font-bold text-base">{result.forum}</p>
              <Badge className="text-xs mt-0.5">{result.jurisdiction}</Badge>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-white rounded-lg p-3 border">
              <p className="text-xs text-muted-foreground">Filing Fee (approx.)</p>
              <p className="font-semibold">₹{result.fee.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border">
              <p className="text-xs text-muted-foreground">Where to File</p>
              <p className="font-medium text-xs">{result.address}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            ⏱️ Limitation: 2 years from date of cause of action | Complaint on plain paper, no advocate required
          </p>
        </div>
      )}

      {/* Quick reference table */}
      <div className="rounded-xl border overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-muted/60">
            <tr>
              {['Forum', 'Jurisdiction', 'Appeal to'].map(h => (
                <th key={h} className="text-left px-3 py-2 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {[
              ['District', 'Up to ₹50 Lakhs', 'State Commission'],
              ['State', '₹50L – ₹2 Crore', 'NCDRC'],
              ['National (NCDRC)', 'Above ₹2 Crore', 'Supreme Court'],
            ].map(([f, j, a]) => (
              <tr key={f} className="hover:bg-muted/20">
                <td className="px-3 py-2">{f}</td>
                <td className="px-3 py-2">{j}</td>
                <td className="px-3 py-2">{a}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Stamp Duty Guide ──────────────────────────────────────────────────────────
const STAMP_DATA: Record<string, { duty: string; notes: string }> = {
  'Maharashtra':  { duty: '5% residential / 6% commercial',    notes: '1% Metro Cess added. Women buyers get 1% concession.' },
  'Delhi':        { duty: '4% women / 6% men / 5% joint',       notes: 'Circle rate applies. Registration fee 1%.' },
  'Karnataka':    { duty: '5.6% (incl. surcharge)',              notes: '0.5% BBMP cess for urban areas.' },
  'Tamil Nadu':   { duty: '7% (incl. surcharges)',               notes: 'Highest in India. Registration fee 1%.' },
  'Uttar Pradesh':{ duty: '5% women / 7% men',                  notes: 'Stamp Duty Act 2010 applies.' },
  'Rajasthan':    { duty: '6%',                                  notes: 'Additional surcharge 1%.' },
  'Gujarat':      { duty: '4.9%',                                notes: 'Registration fee 1%.' },
  'West Bengal':  { duty: '5% rural / 6% urban',                notes: 'Includes surcharge and cess.' },
  'Punjab':       { duty: '6%',                                  notes: 'Registration fee 1%.' },
  'Telangana':    { duty: '4% + 0.5% registration',             notes: 'One of the lower rates in India.' },
};

function StampDutyGuide() {
  const [state, setState] = useState('');
  const [value, setValue] = useState('');
  const sd = STAMP_DATA[state];
  const numVal = parseFloat(value);

  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label>State</Label>
          <Select value={state} onValueChange={setState}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Select state..." /></SelectTrigger>
            <SelectContent>
              {Object.keys(STAMP_DATA).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Property Value / Agreement Value (₹)</Label>
          <Input type="number" className="mt-1" placeholder="e.g. 5000000"
            value={value} onChange={e => setValue(e.target.value)} />
        </div>
      </div>

      {sd && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-3">
          <div>
            <p className="font-semibold text-blue-800">{state} — Stamp Duty</p>
            <p className="text-xl font-bold text-blue-700 mt-1">{sd.duty}</p>
            <p className="text-sm text-blue-600 mt-1">{sd.notes}</p>
          </div>
          {numVal > 0 && (
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: 'Min (4%)', val: numVal * 0.04 },
                { label: 'Mid (5%)', val: numVal * 0.05 },
                { label: 'Max (7%)', val: numVal * 0.07 },
              ].map(r => (
                <div key={r.label} className="bg-white rounded-lg p-2 border border-blue-100">
                  <p className="text-xs text-muted-foreground">{r.label}</p>
                  <p className="font-bold text-sm">₹{r.val.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
            ⚠️ Rates are indicative and subject to change. Verify with Sub-Registrar's office before transaction.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Legal Aid Eligibility (Legal Services Authorities Act 1987, S.12) ─────────
const LEGAL_AID_CATEGORIES = [
  { id: 'sc_st', label: 'SC / ST (Scheduled Caste / Scheduled Tribe)', eligible: true },
  { id: 'woman', label: 'Woman or Child (any income)', eligible: true },
  { id: 'disabled', label: 'Person with Disability (≥40% disability certificate)', eligible: true },
  { id: 'victim', label: 'Victim of mass disaster / ethnic violence / industrial accident', eligible: true },
  { id: 'custody', label: 'Person in custody / under-trial prisoner', eligible: true },
  { id: 'industrial', label: 'Workmen — industrial disputes', eligible: true },
];

function LegalAidChecker() {
  const [income, setIncome] = useState('');
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [state, setState] = useState('');
  const [result, setResult] = useState<any>(null);

  // State income limits (annual, approx.) — NALSA + state LSA criteria 2024
  const STATE_LIMITS: Record<string, number> = {
    'Central (NALSA)': 300000,
    'Delhi': 300000,
    'Maharashtra': 300000,
    'Karnataka': 300000,
    'Tamil Nadu': 300000,
    'West Bengal': 300000,
    'Uttar Pradesh': 200000,
    'Bihar': 200000,
    'Rajasthan': 300000,
    'Gujarat': 300000,
    'Madhya Pradesh': 250000,
    'Odisha': 200000,
    'Jharkhand': 200000,
    'Assam': 200000,
    'Kerala': 300000,
  };

  const check = () => {
    const ann = parseFloat(income) * 12;
    const limit = STATE_LIMITS[state] || 300000;
    const catEligible = selectedCats.some(c => LEGAL_AID_CATEGORIES.find(x => x.id === c)?.eligible);
    const incomeEligible = !isNaN(ann) && ann <= limit;
    const eligible = catEligible || incomeEligible;

    const reasons: string[] = [];
    if (catEligible) {
      const matched = selectedCats.filter(c => LEGAL_AID_CATEGORIES.find(x => x.id === c)?.eligible);
      matched.forEach(m => reasons.push(LEGAL_AID_CATEGORIES.find(x => x.id === m)!.label));
    }
    if (incomeEligible && !isNaN(ann)) reasons.push(`Annual income ₹${ann.toLocaleString('en-IN')} ≤ ₹${limit.toLocaleString('en-IN')} limit`);

    setResult({ eligible, reasons, limit, state: state || 'Central (NALSA)' });
  };

  const toggle = (id: string) =>
    setSelectedCats(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return (
    <div className="space-y-5">
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
        Under <strong>Section 12, Legal Services Authorities Act 1987</strong>, eligible citizens receive FREE legal aid — advocate fees, court fees, and document preparation — from State/District Legal Services Authority (SLSA/DLSA).
      </div>

      <div>
        <Label>State / Authority</Label>
        <Select value={state} onValueChange={setState}>
          <SelectTrigger className="mt-1"><SelectValue placeholder="Select state..." /></SelectTrigger>
          <SelectContent>
            {Object.keys(STATE_LIMITS).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Monthly Income (₹) — leave blank if not applicable</Label>
        <Input type="number" className="mt-1" placeholder="e.g. 12000"
          value={income} onChange={e => setIncome(e.target.value)} />
      </div>

      <div>
        <Label className="mb-2 block">Special Categories (tick all that apply)</Label>
        <div className="space-y-2">
          {LEGAL_AID_CATEGORIES.map(cat => (
            <label key={cat.id} className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/30 transition-colors">
              <input type="checkbox" className="mt-0.5" checked={selectedCats.includes(cat.id)}
                onChange={() => toggle(cat.id)} />
              <span className="text-sm">{cat.label}</span>
            </label>
          ))}
        </div>
      </div>

      <Button onClick={check} className="w-full bg-indigo-600 hover:bg-indigo-700">
        <HeartHandshake className="w-4 h-4 mr-2" /> Check Eligibility
      </Button>

      {result && (
        <div className={`p-5 rounded-xl border ${result.eligible ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
          <div className="flex items-center gap-3 mb-3">
            {result.eligible
              ? <CheckCircle2 className="w-7 h-7 text-green-600" />
              : <AlertCircle className="w-7 h-7 text-red-600" />}
            <p className={`text-lg font-bold ${result.eligible ? 'text-green-800' : 'text-red-800'}`}>
              {result.eligible ? 'You likely QUALIFY for Free Legal Aid' : 'You may NOT qualify (based on info provided)'}
            </p>
          </div>
          {result.reasons.length > 0 && (
            <ul className="text-sm space-y-1 mb-3">
              {result.reasons.map((r: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span> {r}
                </li>
              ))}
            </ul>
          )}
          {result.eligible && (
            <div className="text-sm bg-white rounded-lg p-3 border space-y-1">
              <p className="font-semibold">Next Steps:</p>
              <p>1. Visit your <strong>District Legal Services Authority (DLSA)</strong> — usually at the District Court Complex</p>
              <p>2. Or call <strong>NALSA Helpline: 15100</strong> (toll-free)</p>
              <p>3. Or apply online at <strong>nalsa.gov.in</strong></p>
              <p className="text-xs text-muted-foreground mt-2">Bring: Aadhaar card, income certificate, and relevant case documents</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── BNS / IPC Section Quick Lookup ───────────────────────────────────────────
const BNS_SECTIONS = [
  { bns: '103', ipc: '302', title: 'Murder', punishment: 'Death or life imprisonment + fine', category: 'Criminal' },
  { bns: '104', ipc: '304', title: 'Culpable homicide not amounting to murder', punishment: 'Up to 10 years / life + fine', category: 'Criminal' },
  { bns: '109', ipc: '307', title: 'Attempt to murder', punishment: 'Up to 10 years + fine; life if hurt caused', category: 'Criminal' },
  { bns: '115', ipc: '323', title: 'Voluntarily causing hurt', punishment: 'Up to 1 year / ₹10,000 fine or both', category: 'Criminal' },
  { bns: '117', ipc: '325', title: 'Voluntarily causing grievous hurt', punishment: 'Up to 7 years + fine', category: 'Criminal' },
  { bns: '130', ipc: '354', title: 'Assault on woman — outraging modesty', punishment: 'Up to 5 years + fine (min 1 year)', category: 'Criminal' },
  { bns: '131', ipc: '354A', title: 'Sexual harassment', punishment: 'Up to 3 years + fine or both', category: 'Criminal' },
  { bns: '63', ipc: '375/376', title: 'Rape', punishment: 'Min 7 years to life (or death in aggravated cases)', category: 'Criminal' },
  { bns: '296', ipc: '379', title: 'Theft', punishment: 'Up to 3 years + fine', category: 'Criminal' },
  { bns: '308', ipc: '392', title: 'Robbery', punishment: 'Up to 10 years + fine', category: 'Criminal' },
  { bns: '316', ipc: '406', title: 'Criminal breach of trust', punishment: 'Up to 3 years / fine or both', category: 'Criminal' },
  { bns: '318', ipc: '420', title: 'Cheating and dishonestly inducing delivery', punishment: 'Up to 7 years + fine', category: 'Criminal' },
  { bns: '336', ipc: '441', title: 'Criminal trespass', punishment: 'Up to 3 months / ₹500 or both', category: 'Criminal' },
  { bns: '351', ipc: '499', title: 'Defamation', punishment: 'Up to 2 years / fine or both', category: 'Criminal' },
  { bns: '356', ipc: '506', title: 'Criminal intimidation', punishment: 'Up to 2 years / fine or both', category: 'Criminal' },
  // NI Act
  { bns: '138 NI', ipc: '138 NI', title: 'Dishonour of cheque (NI Act 1881)', punishment: 'Up to 2 years / double the cheque amount or both', category: 'NI Act' },
  // IPC sections unchanged (not replaced by BNS yet)
  { bns: '420 IPC', ipc: '420', title: 'Cheating (legacy reference)', punishment: 'Up to 7 years + fine', category: 'Civil/Other' },
  // CrPC → BNSS
  { bns: 'BNSS 173', ipc: 'CrPC 154', title: 'FIR — First Information Report', punishment: 'Procedure: cognizable offence trigger', category: 'Procedure' },
  { bns: 'BNSS 187', ipc: 'CrPC 167', title: 'Remand — police custody / judicial custody', punishment: 'Max 15 days PC; 60/90 days JC before bail default', category: 'Procedure' },
  { bns: 'BNSS 479', ipc: 'CrPC 436A', title: 'Bail — half the max period served (default bail)', punishment: 'Entitled to bail as of right', category: 'Bail' },
  { bns: 'BNSS 480', ipc: 'CrPC 437', title: 'Bail in non-bailable offence (Sessions / HC)', punishment: 'Discretionary bail from Sessions Court / HC', category: 'Bail' },
  { bns: 'BNSS 528', ipc: 'CrPC 482', title: 'Inherent powers of High Court', punishment: 'Quashing of FIR / proceedings', category: 'Procedure' },
];

function BNSLookup() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');

  const categories = ['All', 'Criminal', 'NI Act', 'Bail', 'Procedure', 'Civil/Other'];

  const filtered = BNS_SECTIONS.filter(s => {
    const q = query.toLowerCase();
    const matchQuery = !q || s.title.toLowerCase().includes(q) || s.bns.toLowerCase().includes(q) || s.ipc.toLowerCase().includes(q) || s.punishment.toLowerCase().includes(q);
    const matchCat = filter === 'All' || s.category === filter;
    return matchQuery && matchCat;
  });

  return (
    <div className="space-y-4">
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
        The <strong>Bharatiya Nyaya Sanhita (BNS) 2023</strong> replaced IPC from 1 July 2024. <strong>Bharatiya Nagarik Suraksha Sanhita (BNSS)</strong> replaced CrPC. Both references are shown for cross-reference.
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search by section, offence, or keyword..."
            value={query} onChange={e => setQuery(e.target.value)} />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="text-xs text-muted-foreground">{filtered.length} sections shown</div>

      <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
        {filtered.map((s, i) => (
          <div key={i} className="border rounded-xl p-4 hover:bg-muted/30 transition-colors">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
              <div className="flex items-center gap-2">
                <Badge className="text-xs font-mono bg-indigo-100 text-indigo-800 border-indigo-200">BNS §{s.bns}</Badge>
                {s.ipc !== s.bns && <Badge variant="outline" className="text-xs font-mono text-slate-500">IPC §{s.ipc}</Badge>}
              </div>
              <Badge variant="outline" className="text-xs">{s.category}</Badge>
            </div>
            <p className="font-semibold text-sm">{s.title}</p>
            <p className="text-xs text-muted-foreground mt-1">⚖️ {s.punishment}</p>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-8 text-sm">No sections match your search.</p>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Reference only. Punishment depends on facts, prior convictions, and judicial discretion. Consult an advocate for advice.
      </p>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function CalculatorsPage() {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} onLogout={logout} />
      <main className="px-4 md:px-6 lg:px-8 py-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Legal Calculators</h1>
            <p className="text-sm text-muted-foreground">Court fees · Limitation periods · Consumer forum · Stamp duty</p>
          </div>
        </div>

        <Tabs defaultValue="courtfee">
          <TabsList className="mb-6 flex-wrap h-auto gap-1">
            <TabsTrigger value="courtfee"><Scale className="w-3.5 h-3.5 mr-1" />Court Fee</TabsTrigger>
            <TabsTrigger value="limitation"><Clock className="w-3.5 h-3.5 mr-1" />Limitation</TabsTrigger>
            <TabsTrigger value="consumer"><ShoppingCart className="w-3.5 h-3.5 mr-1" />Consumer Forum</TabsTrigger>
            <TabsTrigger value="stamp"><FileText className="w-3.5 h-3.5 mr-1" />Stamp Duty</TabsTrigger>
            <TabsTrigger value="legalaid"><HeartHandshake className="w-3.5 h-3.5 mr-1" />Legal Aid</TabsTrigger>
            <TabsTrigger value="bns"><Search className="w-3.5 h-3.5 mr-1" />BNS / IPC</TabsTrigger>
          </TabsList>

          <Card className="p-6">
            <TabsContent value="courtfee"><CourtFeeCalculator /></TabsContent>
            <TabsContent value="limitation"><LimitationCalculator /></TabsContent>
            <TabsContent value="consumer"><ConsumerForumCalculator /></TabsContent>
            <TabsContent value="stamp"><StampDutyGuide /></TabsContent>
            <TabsContent value="legalaid"><LegalAidChecker /></TabsContent>
            <TabsContent value="bns"><BNSLookup /></TabsContent>
          </Card>
        </Tabs>

        <p className="text-center text-xs text-muted-foreground mt-6">
          All calculations are indicative only and based on central acts. State-specific rules may vary. Always verify with a qualified advocate.
        </p>
      </main>
    </div>
  );
}
