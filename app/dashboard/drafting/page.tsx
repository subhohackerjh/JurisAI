'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCreateDraft, useDrafts } from '@/hooks/useDrafts';
import { downloadAsDocx } from '@/lib/download-docx';
import { useAdvocates } from '@/hooks/useAdvocates';
import DashboardHeader from '@/components/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  PenTool, 
  Download, 
  Clock, 
  CheckCircle,
  User,
  Calendar,
  DollarSign,
  Send,
  Eye,
  Edit3,
  Star,
  Briefcase,
  AlertCircle
} from 'lucide-react';

export default function DraftingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedAdvocate, setSelectedAdvocate] = useState<string>('');
  const [documentType, setDocumentType] = useState('');
  const [requirements, setRequirements] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { createDraft, isLoading: createLoading } = useCreateDraft();
  const { drafts, isLoading: draftsLoading } = useDrafts();
  const { advocates, isLoading: advocatesLoading } = useAdvocates();

  // Values must match backend DraftRequest.DOCUMENT_TYPE_CHOICES exactly
  const documentTypes = [
    'contract',
    'notice',
    'power_of_attorney',
    'will',
    'partnership',
    'rental',
    'employment',
    'nda',
    'mou',
    'complaint',
    'other',
  ];

  const handleSubmitDraft = async () => {
    if (!selectedAdvocate || !documentType || !requirements) return;
    
    setIsSubmitting(true);
    setMessage(null);

    const result = await createDraft({
      advocate: selectedAdvocate,
      document_type: documentType,
      requirements,
      additional_notes: additionalNotes || undefined,
    });

    if (result.success) {
      setMessage({ type: 'success', text: 'Draft request submitted successfully!' });
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to submit draft request' });
    }

    setIsSubmitting(false);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen">
      <DashboardHeader user={user} onLogout={() => {}} />
      <main className="px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg">
            <PenTool className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Legal Document Drafting</h1>
            <p className="text-sm text-muted-foreground">Connect with expert lawyers for professional document drafting</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Advocates Selection */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Available Advocates</h2>
              {advocatesLoading ? (
                <p className="text-sm text-muted-foreground">Loading advocates...</p>
              ) : advocates.length === 0 ? (
                <p className="text-sm text-muted-foreground">No advocates available.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {advocates.map(advocate => (
                    <Card 
                      key={advocate.id}
                      className={`p-4 cursor-pointer transition-all ${
                        selectedAdvocate === String(advocate.id) 
                          ? 'ring-2 ring-primary bg-primary/5' 
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => setSelectedAdvocate(String(advocate.id))}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm">{advocate.name}</h3>
                          <p className="text-xs text-muted-foreground">{advocate.specialization || 'General Practice'}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                              <span className="text-xs font-medium">{advocate.rating || 'N/A'}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {advocate.experience_years ? `${advocate.experience_years} yrs` : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>

            {/* Document Requirements */}
            <Card className="p-6 mt-6">
              <h2 className="text-lg font-semibold mb-4">Document Requirements</h2>
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
                  <Label htmlFor="documentType">Document Type *</Label>
                  <Select value={documentType} onValueChange={setDocumentType}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select document type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contract">Contract Agreement</SelectItem>
                      <SelectItem value="notice">Legal Notice</SelectItem>
                      <SelectItem value="power_of_attorney">Power of Attorney</SelectItem>
                      <SelectItem value="will">Will & Testament</SelectItem>
                      <SelectItem value="partnership">Partnership Deed</SelectItem>
                      <SelectItem value="rental">Rental Agreement</SelectItem>
                      <SelectItem value="employment">Employment Contract</SelectItem>
                      <SelectItem value="nda">NDA Agreement</SelectItem>
                      <SelectItem value="mou">Memorandum of Understanding</SelectItem>
                      <SelectItem value="complaint">Legal Complaint</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="requirements">Detailed Requirements *</Label>
                  <Textarea
                    id="requirements"
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    placeholder="Please describe your document requirements in detail..."
                    rows={6}
                    className="mt-1 resize-none"
                  />
                </div>

                <div>
                  <Label htmlFor="additionalNotes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="additionalNotes"
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="Any additional information or special requests..."
                    rows={3}
                    className="mt-1 resize-none"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">What happens next?</h3>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>1. Selected advocate will review your requirements</li>
                    <li>2. You'll receive a draft within 2-3 business days</li>
                    <li>3. Two revisions included in the base price</li>
                    <li>4. Final document delivered in PDF & Word format</li>
                  </ul>
                </div>

                <Button
                  onClick={handleSubmitDraft}
                  disabled={!selectedAdvocate || !documentType || !requirements || isSubmitting}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Submitting Request...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Draft Request
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Selected Advocate Info */}
            {selectedAdvocate && (() => {
              const selected = advocates.find(a => String(a.id) === selectedAdvocate);
              if (!selected) return null;
              const advocate = selected as any;
              return (
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Selected Advocate</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{selected.name}</h4>
                      <p className="text-sm text-muted-foreground">{advocate.specialization || 'General Practice'}</p>
                      <p className="text-xs text-muted-foreground">
                        {advocate.experience ? `${advocate.experience} years experience` : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rating:</span>
                      <span className="font-medium">{advocate.rating || 'N/A'}</span>
                    </div>
                    {advocate.hourlyRate && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Rate:</span>
                        <span className="font-medium text-primary">₹{advocate.hourlyRate}/hr</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="font-medium">{advocate.isAvailable ? 'Available' : 'Busy'}</span>
                    </div>
                  </div>
                </Card>
              );
            })()}

            {/* Process Overview */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Drafting Process</h3>
              <div className="space-y-4">
                {[
                  { icon: Edit3, label: 'Requirements', desc: 'You provide details' },
                  { icon: Briefcase, label: 'Advocate Review', desc: 'Expert analysis' },
                  { icon: FileText, label: 'Draft Creation', desc: 'Document drafted' },
                  { icon: Eye, label: 'Review & Revise', desc: 'Your feedback' },
                  { icon: Download, label: 'Final Delivery', desc: 'Ready to use' }
                ].map((step, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <step.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{step.label}</p>
                      <p className="text-xs text-muted-foreground">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Features */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Features</h3>
              <div className="space-y-2">
                {[
                  'Expert legal professionals',
                  '2 revisions included',
                  '24-48 hour delivery',
                  'Multiple formats',
                  'Legal compliance check',
                  'Confidential service'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* My Draft Requests */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">My Draft Requests</h3>
              {draftsLoading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : drafts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No draft requests yet.</p>
              ) : (
                <div className="space-y-2">
                  {drafts.map((draft: any) => (
                    <div key={draft.id} className={`p-3 border rounded-lg ${draft.status === 'completed' ? 'border-green-200 bg-green-50/40' : ''}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium capitalize">{draft.document_type.replace(/_/g, ' ')}</span>
                        <Badge variant="outline" className={`text-xs capitalize ${
                          draft.status === 'completed' ? 'border-green-400 text-green-700' :
                          draft.status === 'pending' ? 'border-yellow-400 text-yellow-700' :
                          draft.status === 'in_progress' ? 'border-blue-400 text-blue-700' : ''
                        }`}>
                          {draft.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{new Date(draft.created_at).toLocaleDateString()}</p>
                      {/* Show completed AI draft text to customer */}
                      {draft.status === 'completed' && draft.draft_text && (
                        <div className="mt-2">
                          <details className="group">
                            <summary className="text-xs font-medium text-green-700 cursor-pointer flex items-center gap-1">
                              <Eye className="w-3 h-3" /> View Delivered Document
                            </summary>
                            <div className="mt-2 p-3 bg-white rounded-lg border border-green-200 text-xs font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
                              {draft.draft_text}
                            </div>
                            <button
                              className="mt-1 text-xs text-blue-600 hover:underline"
                              onClick={() => {
                                downloadAsDocx(draft.draft_text, `${draft.document_type}_draft`, draft.document_type).catch(() => alert('Download failed'));
                              }}
                            >
                              ⬇ Download
                            </button>
                          </details>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
