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
  User, 
  Mail, 
  Phone, 
  Calendar, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Star,
  GraduationCap,
  Briefcase,
  MessageSquare,
  Download,
  Clock
} from 'lucide-react';
import { mockInternshipApplications } from '@/lib/mock-data';

export default function InternshipApplicationDetail({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [response, setResponse] = useState('');
  const [status, setStatus] = useState<'pending' | 'reviewed' | 'accepted' | 'rejected'>('pending');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const application = mockInternshipApplications.find(app => app.id === params.id);

  const handleUpdateStatus = async (newStatus: typeof status) => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setStatus(newStatus);
      setIsSubmitting(false);
      alert(`Application status updated to ${newStatus}!`);
    }, 1000);
  };

  const handleRespond = async () => {
    if (!response.trim()) return;
    
    setIsSubmitting(true);
    
    // Simulate sending response
    setTimeout(() => {
      setResponse('');
      setIsSubmitting(false);
      alert('Response sent to student!');
    }, 1000);
  };

  if (!user || !application) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Application Not Found</h1>
          <p className="text-muted-foreground">The internship application you're looking for doesn't exist.</p>
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
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Internship Application</h1>
            <p className="text-sm text-muted-foreground">Review and respond to student applications</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Student Information</h2>
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{application.studentName}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Application ID: {application.id}</span>
                    <Badge className={
                      status === 'accepted' 
                        ? 'bg-green-100 text-green-800'
                        : status === 'reviewed'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }>
                      {status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Email:</span>
                  <span>{application.studentEmail}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Phone:</span>
                  <span>{application.studentPhone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Education:</span>
                  <span>{application.education}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Graduation:</span>
                  <span>{application.year}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">University</h4>
                  <p className="text-sm text-muted-foreground">{application.university}</p>
                </div>
                
                {application.experience && (
                  <div>
                    <h4 className="font-medium mb-2">Experience</h4>
                    <p className="text-sm text-muted-foreground">{application.experience}</p>
                  </div>
                )}

                {application.skills && (
                  <div>
                    <h4 className="font-medium mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {application.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Cover Letter */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Cover Letter</h3>
              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-sm italic leading-relaxed">
                  "{application.coverLetter}"
                </p>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download Resume
                </Button>
                <Button variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  View Documents
                </Button>
              </div>
            </Card>
          </div>

          {/* Actions Sidebar */}
          <div className="space-y-6">
            {/* Status Update */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Application Status</h3>
              <div className="space-y-3">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as typeof status)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                >
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
                <Button
                  onClick={() => handleUpdateStatus(status)}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? 'Updating...' : 'Update Status'}
                </Button>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Student
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Student
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Interview
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Request Documents
                </Button>
              </div>
            </Card>

            {/* Response */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Send Response</h3>
              <div className="space-y-4">
                <Textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Write your response to the student..."
                  rows={4}
                  className="resize-none"
                />
                <Button
                  onClick={handleRespond}
                  disabled={!response.trim() || isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? 'Sending...' : 'Send Response'}
                </Button>
              </div>
            </Card>

            {/* Application Timeline */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Application Timeline</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Application Submitted</p>
                    <p className="text-xs text-muted-foreground">{application.appliedDate}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Under Review</p>
                    <p className="text-xs text-muted-foreground">Application is being reviewed</p>
                  </div>
                </div>
                {status !== 'pending' && (
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      status === 'accepted' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {status === 'accepted' ? 'Application Accepted' : 'Application Rejected'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {status === 'accepted' 
                          ? 'Student has been accepted for internship'
                          : 'Application was not suitable at this time'
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
