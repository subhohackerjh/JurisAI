'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { usePendingAdvocates, useApproveAdvocate, useRejectAdvocate } from '@/hooks/useAdvocates';
import DashboardHeader from '@/components/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { User, CheckCircle2, XCircle, AlertCircle, Clock } from 'lucide-react';

export default function AdvocateApprovalsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { pendingAdvocates, isLoading, error, refetch } = usePendingAdvocates();
  const { approveAdvocate, isLoading: isApproving } = useApproveAdvocate();
  const { rejectAdvocate, isLoading: isRejecting } = useRejectAdvocate();
  
  const [rejectingUserId, setRejectingUserId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const handleApprove = async (userId: string) => {
    const result = await approveAdvocate(userId);
    if (result.success) {
      setMessage({ type: 'success', text: 'Advocate approved successfully' });
      refetch();
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to approve advocate' });
    }
  };

  const handleRejectClick = (userId: string) => {
    setRejectingUserId(userId);
    setRejectionReason('');
    setShowRejectDialog(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectingUserId) return;
    
    const result = await rejectAdvocate(rejectingUserId, rejectionReason);
    if (result.success) {
      setMessage({ type: 'success', text: 'Advocate rejected successfully' });
      setShowRejectDialog(false);
      setRejectingUserId(null);
      setRejectionReason('');
      refetch();
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to reject advocate' });
    }
  };

  const handleRejectCancel = () => {
    setShowRejectDialog(false);
    setRejectingUserId(null);
    setRejectionReason('');
  };

  return (
    <div className="min-h-screen">
      <DashboardHeader user={user} onLogout={() => {}} />
      <main className="px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 max-w-6xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
            <User className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            <h1 className="text-xl sm:text-3xl font-bold text-foreground">Advocate Approvals</h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Review and approve or reject pending advocate registrations
          </p>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
              : 'bg-destructive/10 border-destructive/30'
          }`}>
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-destructive" />
              )}
              <p className="text-sm">{message.text}</p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <Card className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Approvals</h3>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={refetch} className="mt-4">Retry</Button>
          </Card>
        ) : pendingAdvocates.length === 0 ? (
          <Card className="p-12 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">All Caught Up!</h3>
            <p className="text-muted-foreground">No pending advocate approvals at the moment.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingAdvocates.map((advocate) => (
              <Card key={advocate.id} className="p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                  {/* Advocate Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base sm:text-lg">{advocate.name}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">{advocate.email}</p>
                        {advocate.phone && (
                          <p className="text-xs sm:text-sm text-muted-foreground">{advocate.phone}</p>
                        )}
                      </div>
                      <Badge variant="outline" className="flex items-center gap-1 flex-shrink-0">
                        <Clock className="w-3 h-3" />
                        Pending
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Bar Council ID:</span>
                        <span className="ml-2 font-medium">{advocate.bar_council_id || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Specialization:</span>
                        <span className="ml-2 font-medium">{advocate.specialization || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Experience:</span>
                        <span className="ml-2 font-medium">{advocate.experience_years ? `${advocate.experience_years} years` : 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Registered:</span>
                        <span className="ml-2 font-medium">
                          {advocate.date_joined ? new Date(advocate.date_joined).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 lg:flex-col lg:w-48">
                    <Button
                      onClick={() => handleApprove(String(advocate.id))}
                      disabled={isApproving}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleRejectClick(String(advocate.id))}
                      disabled={isRejecting}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Reject Dialog */}
        {showRejectDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md p-6">
              <h3 className="text-lg font-semibold mb-4">Reject Advocate Registration</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="rejection_reason">Rejection Reason *</Label>
                  <Textarea
                    id="rejection_reason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please provide a reason for rejection..."
                    rows={4}
                    className="mt-1 resize-none"
                    required
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={handleRejectCancel}
                    disabled={isRejecting}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleRejectConfirm}
                    disabled={isRejecting || !rejectionReason.trim()}
                  >
                    {isRejecting ? 'Rejecting...' : 'Confirm Rejection'}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
