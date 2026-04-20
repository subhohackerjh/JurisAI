'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardHeader from '@/components/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
  Users
} from 'lucide-react';
import { mockAvailableCases } from '@/lib/mock-data';

export default function AdvocateCaseDetail({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'updates' | 'hearing' | 'client'>('updates');
  const [newUpdate, setNewUpdate] = useState('');
  const [isSubmittingUpdate, setIsSubmittingUpdate] = useState(false);

  const caseDetail = mockAvailableCases.find(c => c.id === params.id);

  // Mock case updates and hearing dates
  const caseUpdates = [
    {
      id: 'update-1',
      date: '2024-04-22 10:30 AM',
      title: 'Case Document Review',
      description: 'Reviewed all property documents provided by client. Boundary survey maps are clear and legally valid.',
      type: 'document_review',
      author: 'You'
    },
    {
      id: 'update-2',
      date: '2024-04-21 02:15 PM',
      title: 'Client Consultation',
      description: 'Had initial consultation with client. Discussed case strategy and next steps for legal proceedings.',
      type: 'consultation',
      author: 'You'
    },
    {
      id: 'update-3',
      date: '2024-04-20 04:45 PM',
      title: 'Case Accepted',
      description: 'Successfully accepted the case through LEGAL 24 platform. Ready to begin legal proceedings.',
      type: 'case_accepted',
      author: 'System'
    }
  ];

  const hearingDates = [
    {
      id: 'hearing-1',
      date: '2024-05-15',
      time: '10:30 AM',
      type: 'Initial Hearing',
      court: 'Mumbai Civil Court',
      judge: 'Hon. Justice Sharma',
      location: 'Court Room 12, Mumbai Civil Court',
      description: 'Initial hearing for property boundary dispute. Both parties to present evidence.',
      status: 'upcoming'
    },
    {
      id: 'hearing-2',
      date: '2024-06-10',
      time: '2:00 PM',
      type: 'Evidence Submission',
      court: 'Mumbai Civil Court',
      judge: 'Hon. Justice Sharma',
      location: 'Court Room 8, Mumbai Civil Court',
      description: 'Deadline for submitting all evidence and witness statements.',
      status: 'upcoming'
    },
    {
      id: 'hearing-3',
      date: '2024-07-05',
      time: '11:00 AM',
      type: 'Final Arguments',
      court: 'Mumbai Civil Court',
      judge: 'Hon. Justice Sharma',
      location: 'Court Room 12, Mumbai Civil Court',
      description: 'Final arguments and verdict expected.',
      status: 'upcoming'
    }
  ];

  const handleAddUpdate = async () => {
    if (!newUpdate.trim()) return;
    
    setIsSubmittingUpdate(true);
    
    // Simulate adding update
    setTimeout(() => {
      setNewUpdate('');
      setIsSubmittingUpdate(false);
      alert('Case update added successfully!');
    }, 1000);
  };

  if (!user || !caseDetail) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Case Not Found</h1>
          <p className="text-muted-foreground">The case you're looking for doesn't exist or you don't have access to it.</p>
          <Button onClick={() => router.push('/dashboard/advocate')} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} onLogout={() => {}} />
      <main className="px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 max-w-6xl mx-auto">
        {/* Case Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{caseDetail.title}</h1>
              <p className="text-sm text-muted-foreground">Case ID: {caseDetail.id}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Budget</p>
                  <p className="font-semibold">₹{caseDetail.budget.toLocaleString()}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-semibold">{caseDetail.location}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Client</p>
                  <p className="font-semibold">{caseDetail.customerName}</p>
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
          <div>
            <h3 className="font-medium mb-2">Required Skills:</h3>
            <div className="flex flex-wrap gap-2">
              {caseDetail.requirements.map((req, index) => (
                <Badge key={index} variant="secondary">{req}</Badge>
              ))}
            </div>
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
            Hearing Dates
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
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Add Case Update</h3>
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
              <div className="space-y-4">
                {caseUpdates.map(update => (
                  <div key={update.id} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{update.title}</h4>
                      <span className="text-sm text-muted-foreground">{update.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{update.description}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {update.type.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground">by {update.author}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Hearing Dates Tab */}
        {activeTab === 'hearing' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Upcoming Hearings</h3>
            <div className="space-y-4">
              {hearingDates.map(hearing => (
                <div key={hearing.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-lg">{hearing.type}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(hearing.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{hearing.time}</span>
                        </div>
                      </div>
                    </div>
                    <Badge className={
                      hearing.status === 'upcoming' 
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }>
                      {hearing.status.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Gavel className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Judge:</span>
                      <span>{hearing.judge}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Court:</span>
                      <span>{hearing.court}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Location:</span>
                      <span>{hearing.location}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 p-3 bg-muted/30 rounded">
                    <p className="text-sm">{hearing.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
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
                    <p className="font-semibold text-lg">{caseDetail.customerName}</p>
                    <p className="text-sm text-muted-foreground">Client ID: {caseDetail.customerId}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>Email: customer@example.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>Phone: +91-9876543220</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>Location: {caseDetail.location}</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Message Client
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Request Documents
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Meeting
                </Button>
                <Button className="w-full justify-start">
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
