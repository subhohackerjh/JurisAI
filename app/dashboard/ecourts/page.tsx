'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardHeader from '@/components/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ecourtsApi } from '@/lib/api';
import { Search, Download, AlertCircle, CheckCircle, FileText, Gavel, Calendar, User } from 'lucide-react';

export default function ECourtsPage() {
  const { user } = useAuth();
  const router = useRouter();

  // CNR lookup
  const [cnr, setCnr] = useState('');
  const [caseData, setCaseData] = useState<any>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Import
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState<{ type: 'success' | 'error'; text: string; caseId?: string } | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cnr.trim()) return;
    setSearching(true);
    setSearchError(null);
    setCaseData(null);
    setImportMsg(null);
    try {
      const res = await ecourtsApi.getCaseByCNR(cnr.trim());
      if (res.error) {
        setSearchError(res.error);
      } else {
        setCaseData((res.data as any)?.data || res.data);
      }
    } finally {
      setSearching(false);
    }
  };

  const handleImport = async () => {
    setImporting(true);
    setImportMsg(null);
    try {
      const res = await ecourtsApi.importCase({ cnr: cnr.trim() });
      if (res.error) {
        setImportMsg({ type: 'error', text: res.error });
      } else {
        const d = res.data as any;
        setImportMsg({
          type: 'success',
          text: `Case imported successfully! CNR: ${d?.cnr || cnr}`,
          caseId: d?.case_id,
        });
      }
    } finally {
      setImporting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} onLogout={() => {}} />
      <main className="px-3 sm:px-4 md:px-6 lg:px-8 py-6 max-w-3xl mx-auto">

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg">
            <Gavel className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">eCourts Integration</h1>
            <p className="text-sm text-muted-foreground">Fetch and import cases directly from eCourts India</p>
          </div>
        </div>

        {/* CNR Search */}
        <Card className="p-6 mb-6">
          <h2 className="font-semibold text-lg mb-1">Search by CNR Number</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Enter a 16-character Case Number Record (CNR) to fetch details from eCourts.
          </p>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              value={cnr}
              onChange={(e) => setCnr(e.target.value.toUpperCase())}
              placeholder="e.g., DLHC01-123456-2024"
              className="flex-1 font-mono text-sm"
              maxLength={20}
            />
            <Button type="submit" disabled={!cnr.trim() || searching}>
              {searching ? 'Fetching...' : <><Search className="w-4 h-4 mr-1" /> Search</>}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2">
            Format: State code + Court code + Case number + Year (16 chars, hyphens optional)
          </p>
        </Card>

        {/* Error */}
        {searchError && (
          <Card className="p-4 mb-4 border-destructive/30 bg-destructive/5">
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p>{searchError}</p>
            </div>
            {searchError.includes('API key') && (
              <p className="text-xs text-muted-foreground mt-2">
                The eCourts API key is not configured on this server. Contact the administrator to set <code>ECOURTS_API_KEY</code>.
              </p>
            )}
          </Card>
        )}

        {/* Import message */}
        {importMsg && (
          <Card className={`p-4 mb-4 ${importMsg.type === 'success' ? 'border-green-200 bg-green-50' : 'border-destructive/30 bg-destructive/5'}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm">
                {importMsg.type === 'success'
                  ? <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  : <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />}
                <p className={importMsg.type === 'success' ? 'text-green-800' : 'text-destructive'}>{importMsg.text}</p>
              </div>
              {importMsg.caseId && (
                <Button size="sm" onClick={() => router.push(`/dashboard/case/${importMsg.caseId}`)}>
                  View Case →
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* Case Result */}
        {caseData && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Case Details from eCourts</h3>
              <Badge className="bg-blue-100 text-blue-800">Live Data</Badge>
            </div>

            <div className="space-y-3 text-sm mb-6">
              {caseData.case_title && (
                <div className="flex gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div><p className="text-muted-foreground text-xs">Case Title</p><p className="font-medium">{caseData.case_title}</p></div>
                </div>
              )}
              {caseData.case_type && (
                <div className="flex gap-2">
                  <Gavel className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div><p className="text-muted-foreground text-xs">Case Type</p><p className="font-medium">{caseData.case_type}</p></div>
                </div>
              )}
              {caseData.court_name && (
                <div className="flex gap-2">
                  <Gavel className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div><p className="text-muted-foreground text-xs">Court</p><p className="font-medium">{caseData.court_name}</p></div>
                </div>
              )}
              {caseData.judge_name && (
                <div className="flex gap-2">
                  <User className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div><p className="text-muted-foreground text-xs">Judge</p><p className="font-medium">{caseData.judge_name}</p></div>
                </div>
              )}
              {caseData.filing_date && (
                <div className="flex gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div><p className="text-muted-foreground text-xs">Filing Date</p><p className="font-medium">{caseData.filing_date}</p></div>
                </div>
              )}
              {caseData.case_status && (
                <div className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div><p className="text-muted-foreground text-xs">Status</p>
                    <Badge className="bg-yellow-100 text-yellow-800">{caseData.case_status}</Badge>
                  </div>
                </div>
              )}
              {caseData.case_description && (
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Description</p>
                  <p className="text-sm bg-muted/30 p-3 rounded">{caseData.case_description}</p>
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground mb-3">
                Import this case into Legal24 to track hearings, upload documents, and manage it through our platform.
              </p>
              <Button onClick={handleImport} disabled={importing} className="w-full">
                {importing ? 'Importing...' : <><Download className="w-4 h-4 mr-2" /> Import Case into Legal24</>}
              </Button>
            </div>
          </Card>
        )}

        {/* Info box */}
        {!caseData && !searchError && (
          <Card className="p-6 border-dashed">
            <div className="text-center space-y-2">
              <Gavel className="w-12 h-12 text-muted-foreground mx-auto opacity-30" />
              <p className="font-medium text-muted-foreground">Enter a CNR number above to fetch case details</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                The CNR (Case Number Record) is a unique 16-digit identifier assigned to every case filed in Indian courts.
                You can find it on court documents, cause lists, or the eCourts website.
              </p>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
