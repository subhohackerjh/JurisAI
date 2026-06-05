'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCaseDetail, useCaseUpdates, useCaseHearings, useCaseDocuments } from '@/hooks/useCases';
import { casesApi } from '@/lib/api';
import DashboardHeader from '@/components/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  FileText, 
  Phone, 
  Mail,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Gavel,
  Users,
  ArrowLeft
} from 'lucide-react';

export default function AdvocateCaseDetail() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [activeTab, setActiveTab] = useState<'updates' | 'hearing' | 'client' | 'documents'>('updates');
  const [newUpdate, setNewUpdate] = useState('');
  const [isSubmittingUpdate, setIsSubmittingUpdate] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { case: caseDetail, isLoading: caseLoading, error: caseError, refetch: refetchCase } = useCaseDetail(id);
  const { updates, isLoading: updatesLoading, createUpdate } = useCaseUpdates(id);
  const { hearings, isLoading: hearingsLoading, createHearing, updateHearing } = useCaseHearings(id);
  const { documents, isLoading: documentsLoading, uploadDocument, deleteDocument } = useCaseDocuments(id);

  // Document upload
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadType, setUploadType] = useState('other');
  const [uploadDescription, setUploadDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Fee editing
  const [editingFee, setEditingFee] = useState(false);
  const [feeValue, setFeeValue] = useState('');
  const [isSavingFee, setIsSavingFee] = useState(false);

  // Case status update
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showStatusForm, setShowStatusForm] = useState(false);

  // Schedule hearing form
  const [showHearingForm, setShowHearingForm] = useState(false);
  const [hearingForm, setHearingForm] = useState({
    hearing_date: '',
    hearing_type: 'miscellaneous',
    court_room: '',
    judge_name: '',
    purpose: '',
  });
  const [isScheduling, setIsScheduling] = useState(false);

  // Mark hearing completed
  const [completingHearingId, setCompletingHearingId] = useState<string | null>(null);
  const [hearingOutcome, setHearingOutcome] = useState('');
  const [isCompletingHearing, setIsCompletingHearing] = useState(false);

  const handleSaveFee = async () => {
    const fee = parseFloat(feeValue);
    if (isNaN(fee) || fee < 0) return;
    setIsSavingFee(true);
    setMessage(null);
    try {
      const res = await casesApi.updateCaseStatus(id, { status: caseDetail?.status || 'filed' });
      // Use a direct PATCH via casesApi detail update
      const patchRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/cases/${id}/`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
          body: JSON.stringify({ advocate_fee: fee }),
        }
      );
      if (patchRes.ok) {
        setMessage({ type: 'success', text: 'Advocate fee updated!' });
        setEditingFee(false);
        refetchCase();
      } else {
        setMessage({ type: 'error', text: 'Failed to update fee' });
      }
    } finally {
      setIsSavingFee(false);
    }
  };

  // Update case status
  const handleUpdateStatus = async () => {
    if (!newStatus) return;
    setIsUpdatingStatus(true);
    setMessage(null);
    try {
      const res = await casesApi.updateCaseStatus(id, { status: newStatus, note: statusNote });
      if (res.error) {
        setMessage({ type: 'error', text: res.error });
      } else {
        setMessage({ type: 'success', text: `Case status updated to "${newStatus}"` });
        setShowStatusForm(false);
        setStatusNote('');
        setNewStatus('');
        refetchCase();
      }
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Schedule a new hearing
  const handleScheduleHearing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hearingForm.hearing_date || !hearingForm.purpose) return;
    setIsScheduling(true);
    setMessage(null);
    try {
      const result = await createHearing(hearingForm);
      if (result.success) {
        setMessage({ type: 'success', text: 'Hearing scheduled successfully!' });
        setShowHearingForm(false);
        setHearingForm({ hearing_date: '', hearing_type: 'miscellaneous', court_room: '', judge_name: '', purpose: '' });
        refetchCase();
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to schedule hearing' });
      }
    } finally {
      setIsScheduling(false);
    }
  };

  // Mark a hearing as completed
  const handleCompleteHearing = async (hearingId: string) => {
    if (!hearingOutcome.trim()) return;
    setIsCompletingHearing(true);
    setMessage(null);
    try {
      const result = await updateHearing(hearingId, { is_completed: true, outcome: hearingOutcome });
      if (result.success) {
        setMessage({ type: 'success', text: 'Hearing marked as completed!' });
        setCompletingHearingId(null);
        setHearingOutcome('');
        refetchCase();
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update hearing' });
      }
    } finally {
      setIsCompletingHearing(false);
    }
  };

  const handleAddUpdate = async () => {
    if (!newUpdate.trim()) return;
    
    setIsSubmittingUpdate(true);
    setMessage(null);

    const result = await createUpdate({
      update_type: 'note',
      title: 'Case Update',
      description: newUpdate,
      is_customer_visible: true,
    });

    if (result.success) {
      setNewUpdate('');
      setMessage({ type: 'success', text: 'Case update added successfully!' });
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to add update' });
    }

    setIsSubmittingUpdate(false);
  };

  const handleUploadDocument = async () => {
    if (!uploadFile || !uploadTitle.trim()) return;
    
    setIsUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('title', uploadTitle);
    formData.append('document_type', uploadType);
    if (uploadDescription) {
      formData.append('description', uploadDescription);
    }

    const result = await uploadDocument(formData);

    if (result.success) {
      setUploadFile(null);
      setUploadTitle('');
      setUploadType('other');
      setUploadDescription('');
      setMessage({ type: 'success', text: 'Document uploaded successfully!' });
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to upload document' });
    }

    setIsUploading(false);
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    const result = await deleteDocument(documentId);
    if (result.success) {
      setMessage({ type: 'success', text: 'Document deleted successfully!' });
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to delete document' });
    }
  };

  if (!user) return null;

  if (caseLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading case details...</p>
      </div>
    );
  }

  if (caseError || !caseDetail) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Case Not Found</h1>
          <p className="text-muted-foreground mb-4">{caseError || 'The case you are looking for does not exist or you do not have access to it.'}</p>
          <Button onClick={() => router.push('/dashboard/advocate')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader user={user} onLogout={() => {}} />
      <main className="px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 max-w-6xl mx-auto">
        <Button variant="ghost" onClick={() => router.push('/dashboard/advocate')} className="gap-2 mb-4 -ml-2">
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Back to Dashboard</span>
        </Button>

        {/* Case Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{caseDetail.title}</h1>
              <p className="text-sm text-muted-foreground">
                {caseDetail.cnr_number && `CNR: ${caseDetail.cnr_number} • `}
                Case ID: {caseDetail.id}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">Advocate Fee</p>
                  {editingFee ? (
                    <div className="flex gap-1 mt-1">
                      <input
                        type="number"
                        min="0"
                        step="100"
                        placeholder="Enter fee (₹)"
                        value={feeValue}
                        onChange={(e) => setFeeValue(e.target.value)}
                        className="w-full text-sm border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                        autoFocus
                      />
                      <Button size="sm" className="h-7 px-2 text-xs" onClick={handleSaveFee} disabled={isSavingFee}>
                        {isSavingFee ? '...' : 'Save'}
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => setEditingFee(false)}>✕</Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">
                        {caseDetail.advocate_fee ? `₹${Number(caseDetail.advocate_fee).toLocaleString()}` : 'Not set'}
                      </p>
                      <button
                        onClick={() => { setFeeValue(caseDetail.advocate_fee ? String(caseDetail.advocate_fee) : ''); setEditingFee(true); }}
                        className="text-xs text-primary hover:underline"
                      >
                        {caseDetail.advocate_fee ? 'Edit' : '+ Set fee'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold">{caseDetail.status_display || caseDetail.status}</p>
                    {!['closed','dismissed'].includes(caseDetail.status) && (
                      <button onClick={() => { setNewStatus(caseDetail.status); setShowStatusForm(true); setActiveTab('updates'); }}
                        className="text-xs text-primary hover:underline">Update</button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Client</p>
                  <p className="font-semibold">{caseDetail.customer_name || caseDetail.customer.name}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Case Description */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Case Description</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            {caseDetail.description}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {caseDetail.court_name && (
              <div className="flex items-center gap-2">
                <Gavel className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Court:</span>
                <span>{caseDetail.court_name}</span>
              </div>
            )}
            {caseDetail.case_type_display && (
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Type:</span>
                <Badge variant="secondary">{caseDetail.case_type_display}</Badge>
              </div>
            )}
            {caseDetail.next_hearing_date && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Next Hearing:</span>
                <span>{new Date(caseDetail.next_hearing_date).toLocaleDateString()}</span>
              </div>
            )}
            {caseDetail.filing_date && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Filing Date:</span>
                <span>{new Date(caseDetail.filing_date).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-border">
          <button
            onClick={() => setActiveTab('updates')}
            className={`pb-3 px-1 font-medium transition-colors ${
              activeTab === 'updates'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Case Updates
          </button>
          <button
            onClick={() => setActiveTab('hearing')}
            className={`pb-3 px-1 font-medium transition-colors ${
              activeTab === 'hearing'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Hearings
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`pb-3 px-1 font-medium transition-colors ${
              activeTab === 'documents'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Documents
          </button>
          <button
            onClick={() => setActiveTab('client')}
            className={`pb-3 px-1 font-medium transition-colors ${
              activeTab === 'client'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Client Info
          </button>
        </div>

        {/* Updates Tab */}
        {activeTab === 'updates' && (
          <div className="space-y-4">

            {/* ── Status Update Form ── */}
            {showStatusForm && (
              <Card className="p-5 border-primary/30 bg-primary/5">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" /> Update Case Status
                </h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">New Status *</Label>
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select new status..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="hearing">Hearing Scheduled</SelectItem>
                        <SelectItem value="evidence">Evidence Phase</SelectItem>
                        <SelectItem value="arguments">Arguments</SelectItem>
                        <SelectItem value="judgment">Judgment Pending</SelectItem>
                        <SelectItem value="closed">✅ Closed (Case Won/Settled)</SelectItem>
                        <SelectItem value="dismissed">❌ Dismissed</SelectItem>
                        <SelectItem value="appealed">Appealed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Note (visible to client)</Label>
                    <Textarea
                      className="mt-1 text-sm resize-none"
                      rows={2}
                      placeholder="e.g., Judge has reserved judgment, next date 15 Jan..."
                      value={statusNote}
                      onChange={(e) => setStatusNote(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1" onClick={handleUpdateStatus} disabled={!newStatus || isUpdatingStatus}>
                      {isUpdatingStatus ? 'Updating...' : 'Confirm Status Update'}
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => setShowStatusForm(false)}>Cancel</Button>
                  </div>
                </div>
              </Card>
            )}

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Add Case Update</h3>
              {message && (
                <div className={`mb-4 p-3 rounded-lg border ${
                  message.type === 'success' 
                    ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                    : 'bg-destructive/10 border-destructive/30'
                }`}>
                  <p className="text-sm">{message.text}</p>
                </div>
              )}
              <div className="space-y-4">
                <Textarea
                  value={newUpdate}
                  onChange={(e) => setNewUpdate(e.target.value)}
                  placeholder="Enter case update details..."
                  rows={3}
                  className="resize-none"
                />
                <Button
                  onClick={handleAddUpdate}
                  disabled={!newUpdate.trim() || isSubmittingUpdate}
                  className="w-full"
                >
                  {isSubmittingUpdate ? 'Adding Update...' : 'Add Update'}
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Updates</h3>
              {updatesLoading ? (
                <p className="text-sm text-muted-foreground">Loading updates...</p>
              ) : updates.length === 0 ? (
                <p className="text-sm text-muted-foreground">No updates yet.</p>
              ) : (
                <div className="space-y-4">
                  {updates.map((update) => (
                    <div key={update.id} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{update.title}</h4>
                        <span className="text-sm text-muted-foreground">
                          {new Date(update.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{update.description}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {update.update_type.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          by {update.created_by_name || 'Unknown'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Hearing Dates Tab */}
        {activeTab === 'hearing' && (
          <div className="space-y-4">
            {/* Schedule Hearing Form */}
            {showHearingForm ? (
              <Card className="p-5 border-primary/30 bg-primary/5">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" /> Schedule New Hearing
                </h3>
                <form onSubmit={handleScheduleHearing} className="space-y-3">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Hearing Date & Time *</Label>
                      <Input type="datetime-local" className="mt-1 text-sm"
                        value={hearingForm.hearing_date}
                        onChange={(e) => setHearingForm(f => ({ ...f, hearing_date: e.target.value }))}
                        required />
                    </div>
                    <div>
                      <Label className="text-xs">Hearing Type *</Label>
                      <Select value={hearingForm.hearing_type} onValueChange={(v) => setHearingForm(f => ({ ...f, hearing_type: v }))}>
                        <SelectTrigger className="mt-1 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mention">Mention</SelectItem>
                          <SelectItem value="arguments">Arguments</SelectItem>
                          <SelectItem value="evidence">Evidence</SelectItem>
                          <SelectItem value="cross_examination">Cross Examination</SelectItem>
                          <SelectItem value="judgment">Judgment</SelectItem>
                          <SelectItem value="miscellaneous">Miscellaneous</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Court Room</Label>
                      <Input className="mt-1 text-sm" placeholder="e.g., Room 3"
                        value={hearingForm.court_room}
                        onChange={(e) => setHearingForm(f => ({ ...f, court_room: e.target.value }))} />
                    </div>
                    <div>
                      <Label className="text-xs">Judge Name</Label>
                      <Input className="mt-1 text-sm" placeholder="Hon. Justice..."
                        value={hearingForm.judge_name}
                        onChange={(e) => setHearingForm(f => ({ ...f, judge_name: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Purpose *</Label>
                    <Textarea className="mt-1 text-sm resize-none" rows={2}
                      placeholder="Purpose of this hearing..."
                      value={hearingForm.purpose}
                      onChange={(e) => setHearingForm(f => ({ ...f, purpose: e.target.value }))}
                      required />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" type="submit" className="flex-1" disabled={isScheduling}>
                      {isScheduling ? 'Scheduling...' : 'Schedule Hearing'}
                    </Button>
                    <Button size="sm" type="button" variant="outline" className="flex-1" onClick={() => setShowHearingForm(false)}>Cancel</Button>
                  </div>
                </form>
              </Card>
            ) : (
              <Button variant="outline" className="w-full border-dashed" onClick={() => setShowHearingForm(true)}>
                <Calendar className="w-4 h-4 mr-2" /> Schedule New Hearing
              </Button>
            )}

            {/* Hearings list */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Scheduled Hearings</h3>
              {hearingsLoading ? (
                <p className="text-sm text-muted-foreground">Loading hearings...</p>
              ) : hearings.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hearings scheduled yet. Use the button above to add one.</p>
              ) : (
                <div className="space-y-4">
                  {hearings.map((hearing) => (
                    <div key={hearing.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{hearing.hearing_type.replace('_', ' ').toUpperCase()}</h4>
                          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(hearing.hearing_date).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(hearing.hearing_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {hearing.court_room && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{hearing.court_room}</span>}
                            {hearing.judge_name && <span className="flex items-center gap-1"><Gavel className="w-3 h-3" />{hearing.judge_name}</span>}
                          </div>
                        </div>
                        <Badge className={hearing.is_completed ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                          {hearing.is_completed ? '✓ Done' : 'Upcoming'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{hearing.purpose}</p>
                      {hearing.outcome && (
                        <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded text-sm text-green-800 dark:text-green-200">
                          <span className="font-medium">Outcome: </span>{hearing.outcome}
                        </div>
                      )}
                      {/* Mark as completed */}
                      {!hearing.is_completed && (
                        completingHearingId === hearing.id ? (
                          <div className="mt-3 space-y-2">
                            <Textarea
                              className="text-sm resize-none" rows={2}
                              placeholder="Enter hearing outcome / next steps..."
                              value={hearingOutcome}
                              onChange={(e) => setHearingOutcome(e.target.value)}
                            />
                            <div className="flex gap-2">
                              <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700"
                                onClick={() => handleCompleteHearing(hearing.id)}
                                disabled={!hearingOutcome.trim() || isCompletingHearing}>
                                {isCompletingHearing ? 'Saving...' : '✓ Mark Completed'}
                              </Button>
                              <Button size="sm" variant="outline" className="flex-1" onClick={() => { setCompletingHearingId(null); setHearingOutcome(''); }}>Cancel</Button>
                            </div>
                          </div>
                        ) : (
                          <Button size="sm" variant="outline" className="mt-3 w-full" onClick={() => setCompletingHearingId(hearing.id)}>
                            <CheckCircle className="w-3 h-3 mr-1" /> Mark as Completed
                          </Button>
                        )
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Upload Document</h3>
              {message && (
                <div className={`mb-4 p-3 rounded-lg border ${
                  message.type === 'success' 
                    ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                    : 'bg-destructive/10 border-destructive/30'
                }`}>
                  <p className="text-sm">{message.text}</p>
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file">Document File *</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="title">Document Title *</Label>
                  <Input
                    id="title"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="e.g., Petition Document"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Document Type</Label>
                  <Select value={uploadType} onValueChange={setUploadType}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="petition">Petition</SelectItem>
                      <SelectItem value="affidavit">Affidavit</SelectItem>
                      <SelectItem value="evidence">Evidence</SelectItem>
                      <SelectItem value="order">Court Order</SelectItem>
                      <SelectItem value="judgment">Judgment</SelectItem>
                      <SelectItem value="agreement">Agreement</SelectItem>
                      <SelectItem value="notice">Notice</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    placeholder="Document description..."
                    rows={2}
                    className="mt-1 resize-none"
                  />
                </div>
                <Button
                  onClick={handleUploadDocument}
                  disabled={!uploadFile || !uploadTitle.trim() || isUploading}
                  className="w-full"
                >
                  {isUploading ? 'Uploading...' : 'Upload Document'}
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Case Documents</h3>
              {documentsLoading ? (
                <p className="text-sm text-muted-foreground">Loading documents...</p>
              ) : documents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div key={doc.id} className="border rounded-lg p-4 flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold">{doc.title}</h4>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          <Badge variant="outline" className="text-xs">
                            {doc.document_type.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <span>Uploaded by {doc.uploaded_by_name || 'Unknown'}</span>
                          <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                        </div>
                        {doc.description && (
                          <p className="text-sm text-muted-foreground mt-2">{doc.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {doc.file_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                              <FileText className="w-4 h-4 mr-1" />
                              View
                            </a>
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteDocument(doc.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Client Info Tab */}
        {activeTab === 'client' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Client Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{caseDetail.customer.name}</p>
                    <p className="text-sm text-muted-foreground">Client ID: {caseDetail.customer.id}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>Email: {caseDetail.customer.email}</span>
                  </div>
                  {caseDetail.customer.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>Phone: {caseDetail.customer.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button className="w-full justify-start" variant="outline"
                  onClick={() => router.push('/dashboard/chat')}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Message Client
                </Button>
                <Button className="w-full justify-start" variant="outline"
                  onClick={() => setActiveTab('documents')}>
                  <FileText className="w-4 h-4 mr-2" />
                  View / Upload Documents
                </Button>
                <Button className="w-full justify-start" variant="outline"
                  onClick={() => { setActiveTab('hearing'); setShowHearingForm(true); }}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Hearing
                </Button>
                <Button className="w-full justify-start"
                  disabled={['closed','dismissed'].includes(caseDetail.status)}
                  onClick={() => { setActiveTab('updates'); setShowStatusForm(true); }}>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Update Case Status
                </Button>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
