'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardHeader from '@/components/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Gavel, 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  User,
  FileText,
  Video,
  Phone,
  MessageSquare,
  RefreshCw,
  Filter,
  Search,
  TrendingUp,
  Eye,
  Download,
  Share2
} from 'lucide-react';

export default function HearingUpdatesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const mockCases = [
    {
      id: 'CASE-2024-001',
      title: 'Property Dispute - Johnson vs Smith',
      clientName: 'John Johnson',
      lawyerName: 'Adv. Sarah Miller',
      nextHearing: '2024-04-25',
      nextHearingTime: '10:30 AM',
      courtRoom: 'Court Room 3',
      judge: 'Hon. Justice Williams',
      status: 'upcoming',
      type: 'Civil',
      lastUpdate: '2 hours ago',
      description: 'Property boundary dispute between neighboring properties'
    },
    {
      id: 'CASE-2024-002',
      title: 'Contract Breach - Tech Corp vs StartupXYZ',
      clientName: 'Tech Corporation',
      lawyerName: 'Adv. Michael Chen',
      nextHearing: '2024-04-26',
      nextHearingTime: '2:00 PM',
      courtRoom: 'Court Room 1',
      judge: 'Hon. Justice Brown',
      status: 'upcoming',
      type: 'Commercial',
      lastUpdate: '5 hours ago',
      description: 'Breach of software development contract'
    },
    {
      id: 'CASE-2024-003',
      title: 'Employment Dispute - Davis vs CorpInc',
      clientName: 'Robert Davis',
      lawyerName: 'Adv. Emily Rodriguez',
      nextHearing: '2024-04-24',
      nextHearingTime: '11:15 AM',
      courtRoom: 'Court Room 2',
      judge: 'Hon. Justice Martinez',
      status: 'today',
      type: 'Labor',
      lastUpdate: '1 day ago',
      description: 'Wrongful termination and compensation claim'
    },
    {
      id: 'CASE-2024-004',
      title: 'Family Law - Child Custody',
      clientName: 'Maria Garcia',
      lawyerName: 'Adv. James Wilson',
      nextHearing: '2024-04-27',
      nextHearingTime: '9:00 AM',
      courtRoom: 'Court Room 4',
      judge: 'Hon. Justice Taylor',
      status: 'upcoming',
      type: 'Family',
      lastUpdate: '3 days ago',
      description: 'Child custody and visitation rights'
    },
    {
      id: 'CASE-2024-005',
      title: 'Criminal Defense - State vs Anderson',
      clientName: 'James Anderson',
      lawyerName: 'Adv. Sarah Miller',
      nextHearing: '2024-04-23',
      nextHearingTime: '3:30 PM',
      courtRoom: 'Court Room 5',
      judge: 'Hon. Justice Davis',
      status: 'completed',
      type: 'Criminal',
      lastUpdate: '1 week ago',
      description: 'Defense against criminal charges'
    }
  ];

  const hearingUpdates = [
    {
      caseId: 'CASE-2024-001',
      timestamp: '2024-04-22 08:30 AM',
      type: 'schedule_change',
      message: 'Hearing rescheduled from April 24 to April 25 at 10:30 AM',
      priority: 'high'
    },
    {
      caseId: 'CASE-2024-002',
      timestamp: '2024-04-22 07:15 AM',
      type: 'document_update',
      message: 'New evidence documents submitted by opposing counsel',
      priority: 'medium'
    },
    {
      caseId: 'CASE-2024-003',
      timestamp: '2024-04-21 04:45 PM',
      type: 'reminder',
      message: 'Tomorrow\'s hearing confirmed - please arrive 30 minutes early',
      priority: 'high'
    },
    {
      caseId: 'CASE-2024-004',
      timestamp: '2024-04-21 02:00 PM',
      type: 'judge_update',
      message: 'Judge Taylor assigned to the case',
      priority: 'low'
    },
    {
      caseId: 'CASE-2024-005',
      timestamp: '2024-04-20 11:30 AM',
      type: 'verdict',
      message: 'Case concluded with favorable verdict',
      priority: 'high'
    }
  ];

  const filteredCases = mockCases.filter(case_ => {
    const matchesSearch = case_.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         case_.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         case_.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || case_.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'today': return 'bg-red-100 text-red-800 border-red-200';
      case 'upcoming': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case 'schedule_change': return <Calendar className="w-4 h-4" />;
      case 'document_update': return <FileText className="w-4 h-4" />;
      case 'reminder': return <Bell className="w-4 h-4" />;
      case 'judge_update': return <Gavel className="w-4 h-4" />;
      case 'verdict': return <CheckCircle className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  if (!user) return null;

  if (selectedCase) {
    const caseDetail = mockCases.find(c => c.id === selectedCase);
    const caseUpdates = hearingUpdates.filter(u => u.caseId === selectedCase);
    
    if (!caseDetail) {
      setSelectedCase(null);
      return null;
    }

    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader user={user} onLogout={() => {}} />
        <main className="px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 max-w-4xl mx-auto">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => setSelectedCase(null)}
              className="mb-4"
            >
              Back to All Cases
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{caseDetail.title}</h1>
            <p className="text-sm text-muted-foreground">Case ID: {caseDetail.id}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Case Details */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Case Details</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Client</p>
                      <p className="font-medium">{caseDetail.clientName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Lawyer</p>
                      <p className="font-medium">{caseDetail.lawyerName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Case Type</p>
                      <Badge variant="outline">{caseDetail.type}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge className={getStatusColor(caseDetail.status)}>
                        {caseDetail.status.charAt(0).toUpperCase() + caseDetail.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Description</p>
                    <p className="text-sm">{caseDetail.description}</p>
                  </div>
                </div>
              </Card>

              {/* Hearing Information */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Next Hearing</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-medium">{new Date(caseDetail.nextHearing).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Time</p>
                      <p className="font-medium">{caseDetail.nextHearingTime}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">{caseDetail.courtRoom}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Gavel className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Judge</p>
                      <p className="font-medium">{caseDetail.judge}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Updates Timeline */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Recent Updates</h2>
                <div className="space-y-4">
                  {caseUpdates.map((update, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getPriorityColor(update.priority)} text-white`}>
                          {getUpdateIcon(update.type)}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{update.message}</p>
                        <p className="text-xs text-muted-foreground">{update.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    Add to Calendar
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Bell className="w-4 h-4 mr-2" />
                    Set Reminder
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Updates
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    Download Documents
                  </Button>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-4">Contact Lawyer</h3>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Lawyer
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Video className="w-4 h-4 mr-2" />
                    Schedule Meeting
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} onLogout={() => {}} />
      <main className="px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg">
            <Gavel className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Court Hearing Updates</h1>
            <p className="text-sm text-muted-foreground">Real-time updates on your court cases and hearings</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-muted-foreground">Upcoming Hearings</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">1</p>
                <p className="text-sm text-muted-foreground">Today's Hearings</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">1</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">5</p>
                <p className="text-sm text-muted-foreground">New Updates</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search cases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 rounded-lg border border-border bg-background"
            >
              <option value="all">All Status</option>
              <option value="today">Today</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
            </select>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Cases List */}
        <div className="space-y-4">
          {filteredCases.map(case_ => (
            <Card key={case_.id} className="p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedCase(case_.id)}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{case_.title}</h3>
                    <Badge className={getStatusColor(case_.status)}>
                      {case_.status.charAt(0).toUpperCase() + case_.status.slice(1)}
                    </Badge>
                    {case_.status === 'today' && (
                      <Badge variant="destructive" className="animate-pulse">
                        Today
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{case_.description}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Client:</span>
                      <span className="font-medium">{case_.clientName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Next:</span>
                      <span className="font-medium">{new Date(case_.nextHearing).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Time:</span>
                      <span className="font-medium">{case_.nextHearingTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Room:</span>
                      <span className="font-medium">{case_.courtRoom}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Last updated: {case_.lastUpdate}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Lawyer:</span>
                    <span className="text-xs font-medium">{case_.lawyerName}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Recent Updates Feed */}
        <Card className="p-6 mt-6">
          <h2 className="text-lg font-semibold mb-4">Recent Updates</h2>
          <div className="space-y-3">
            {hearingUpdates.slice(0, 3).map((update, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${getPriorityColor(update.priority)}`}></div>
                <div className="flex-1">
                  <p className="text-sm">{update.message}</p>
                  <p className="text-xs text-muted-foreground">{update.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
}
