'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCreateFeedback } from '@/hooks/useFeedback';
import DashboardHeader from '@/components/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CheckCircle2, MessageSquare, XCircle } from 'lucide-react';

type FeedbackType = 'general' | 'bug_report' | 'feature_request' | 'complaint' | 'compliment' | 'support';

export default function FeedbackPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    feedback_type: 'general' as FeedbackType,
    subject: '',
    message: '',
    contact_email: '',
    contact_phone: '',
  });

  const { createFeedback, isLoading } = useCreateFeedback();

  if (!user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const result = await createFeedback({
      feedback_type: formData.feedback_type,
      subject: formData.subject,
      message: formData.message,
      contact_email: formData.contact_email || undefined,
      contact_phone: formData.contact_phone || undefined,
    });

    if (result.success) {
      setIsSubmitted(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to submit feedback' });
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader user={user} onLogout={() => {}} />
        <main className="flex items-center justify-center p-3 sm:p-6 min-h-[calc(100vh-60px)]">
          <Card className="w-full max-w-md p-6 sm:p-8 text-center">
            <div className="flex justify-center mb-3 sm:mb-4">
              <CheckCircle2 className="w-12 h-12 sm:w-16 sm:h-16 text-green-600" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Thank You!</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
              Your feedback has been successfully submitted. We appreciate your input and will review it shortly.
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">Redirecting to dashboard...</p>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} onLogout={() => {}} />
      <main className="px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 max-w-2xl mx-auto">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
              <MessageSquare className="w-6 h-6 sm:w-8 sm:w-8 text-primary" />
              <h1 className="text-xl sm:text-3xl font-bold text-foreground">Send Feedback</h1>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Help us improve LegalConnect. Your feedback is valuable.
            </p>
          </div>

          <Card className="p-4 sm:p-6 md:p-8">
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

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Feedback Type */}
              <div>
                <Label htmlFor="feedback_type">Feedback Type *</Label>
                <Select value={formData.feedback_type} onValueChange={(value) => setFormData(prev => ({ ...prev, feedback_type: value as FeedbackType }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Feedback</SelectItem>
                    <SelectItem value="bug_report">Bug Report</SelectItem>
                    <SelectItem value="feature_request">Feature Request</SelectItem>
                    <SelectItem value="complaint">Complaint</SelectItem>
                    <SelectItem value="compliment">Compliment</SelectItem>
                    <SelectItem value="support">Support Request</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Subject */}
              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Brief subject"
                  required
                  className="mt-1 bg-background text-sm"
                />
              </div>

              {/* Message */}
              <div>
                <Label htmlFor="message">Detailed Feedback *</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Please provide detailed feedback..."
                  required
                  rows={5}
                  className="mt-1 bg-background text-sm resize-none"
                />
              </div>

              {/* Contact Information (Optional) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_email">Contact Email (Optional)</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                    placeholder="your@email.com"
                    className="mt-1 bg-background text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="contact_phone">Contact Phone (Optional)</Label>
                  <Input
                    id="contact_phone"
                    type="tel"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                    placeholder="+91-9876543210"
                    className="mt-1 bg-background text-sm"
                  />
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 flex gap-2 sm:gap-3">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs sm:text-sm text-blue-900">
                    <strong>Privacy:</strong> Your feedback will only be seen by the admin team.
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button
                  type="submit"
                  disabled={!formData.subject.trim() || !formData.message.trim() || isLoading}
                  className="flex-1 bg-primary hover:bg-primary/90 text-sm sm:text-base"
                >
                  {isLoading ? 'Submitting...' : 'Submit Feedback'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                  className="flex-1 text-sm sm:text-base"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
}
