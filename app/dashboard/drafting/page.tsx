'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardHeader from '@/components/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
  Briefcase
} from 'lucide-react';

export default function DraftingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [documentType, setDocumentType] = useState('');
  const [requirements, setRequirements] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftSubmitted, setDraftSubmitted] = useState(false);

  const documentTypes = [
    'Contract Agreement',
    'Legal Notice',
    'Power of Attorney',
    'Will & Testament',
    'Partnership Deed',
    'Rental Agreement',
    'Employment Contract',
    'ND Agreement',
    'Memorandum of Understanding',
    'Legal Complaint'
  ];

  const mockLawyers = [
    {
      id: 1,
      name: 'Adv. Sarah Johnson',
      specialization: 'Contract Law',
      experience: '12 years',
      rating: 4.9,
      cases: 450,
      price: '$150-300',
      availability: 'Available',
      image: '/api/placeholder/100/100'
    },
    {
      id: 2,
      name: 'Adv. Michael Chen',
      specialization: 'Corporate Law',
      experience: '8 years',
      rating: 4.8,
      cases: 320,
      price: '$200-400',
      availability: 'Busy',
      image: '/api/placeholder/100/100'
    },
    {
      id: 3,
      name: 'Adv. Emily Rodriguez',
      specialization: 'Family Law',
      experience: '15 years',
      rating: 4.9,
      cases: 580,
      price: '$120-250',
      availability: 'Available',
      image: '/api/placeholder/100/100'
    },
    {
      id: 4,
      name: 'Adv. James Wilson',
      specialization: 'Real Estate',
      experience: '10 years',
      rating: 4.7,
      cases: 410,
      price: '$180-350',
      availability: 'Available',
      image: '/api/placeholder/100/100'
    }
  ];

  const handleSubmitDraft = async () => {
    if (!selectedLawyer || !documentType || !requirements) return;
    
    setIsSubmitting(true);
    
    // Simulate submission process
    setTimeout(() => {
      setDraftSubmitted(true);
      setIsSubmitting(false);
    }, 2000);
  };

  if (!user) return null;

  if (draftSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader user={user} onLogout={() => {}} />
        <main className="flex items-center justify-center p-6 min-h-[calc(100vh-60px)]">
          <Card className="w-full max-w-md p-8 text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Draft Request Submitted!</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Your document drafting request has been sent to {selectedLawyer?.name}. 
              You'll receive the draft within 2-3 business days.
            </p>
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <p className="text-xs text-blue-900 mb-2">
                <strong>Request ID:</strong> DRFT-{Date.now()}
              </p>
              <p className="text-xs text-blue-900">
                <strong>Estimated Delivery:</strong> {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </p>
            </div>
            <Button onClick={() => router.push('/dashboard')} className="w-full">
              Back to Dashboard
            </Button>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
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
          {/* Lawyers Selection */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Available Drafting Lawyers</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockLawyers.map(lawyer => (
                  <Card 
                    key={lawyer.id}
                    className={`p-4 cursor-pointer transition-all ${
                      selectedLawyer?.id === lawyer.id 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedLawyer(lawyer)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">{lawyer.name}</h3>
                        <p className="text-xs text-muted-foreground">{lawyer.specialization}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            <span className="text-xs font-medium">{lawyer.rating}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">({lawyer.cases} cases)</span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant={lawyer.availability === 'Available' ? 'default' : 'secondary'} className="text-xs">
                            {lawyer.availability}
                          </Badge>
                          <span className="text-xs font-medium text-primary">{lawyer.price}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            {/* Document Requirements */}
            <Card className="p-6 mt-6">
              <h2 className="text-lg font-semibold mb-4">Document Requirements</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Document Type</label>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  >
                    <option value="">Select document type...</option>
                    {documentTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Detailed Requirements</label>
                  <Textarea
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    placeholder="Please describe your document requirements in detail..."
                    rows={6}
                    className="resize-none"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">What happens next?</h3>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>1. Selected lawyer will review your requirements</li>
                    <li>2. You'll receive a draft within 2-3 business days</li>
                    <li>3. Two revisions included in the base price</li>
                    <li>4. Final document delivered in PDF & Word format</li>
                  </ul>
                </div>

                <Button
                  onClick={handleSubmitDraft}
                  disabled={!selectedLawyer || !documentType || !requirements || isSubmitting}
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
            {/* Selected Lawyer Info */}
            {selectedLawyer && (
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Selected Lawyer</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{selectedLawyer.name}</h4>
                    <p className="text-sm text-muted-foreground">{selectedLawyer.specialization}</p>
                    <p className="text-xs text-muted-foreground">{selectedLawyer.experience}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rating:</span>
                    <span className="font-medium">{'\u2b50'.repeat(Math.floor(selectedLawyer.rating))} {selectedLawyer.rating}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cases:</span>
                    <span className="font-medium">{selectedLawyer.cases}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-medium text-primary">{selectedLawyer.price}</span>
                  </div>
                </div>
              </Card>
            )}

            {/* Process Overview */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Drafting Process</h3>
              <div className="space-y-4">
                {[
                  { icon: Edit3, label: 'Requirements', desc: 'You provide details' },
                  { icon: Briefcase, label: 'Lawyer Review', desc: 'Expert analysis' },
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
          </div>
        </div>
      </main>
    </div>
  );
}
