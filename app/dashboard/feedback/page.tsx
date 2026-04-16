'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardHeader from '@/components/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { addFeedback } from '@/lib/mock-data';
import { AlertCircle, CheckCircle2, MessageSquare } from 'lucide-react';

type FeedbackCategory = 'bug' | 'feature' | 'improvement' | 'usability' | 'other';

export default function FeedbackPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    rating: 5,
    category: 'improvement' as FeedbackCategory,
    subject: '',
    message: '',
  });

  if (!user) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create feedback object
      const feedback = {
        id: `fb-${Date.now()}`,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userRole: user.role,
        rating: formData.rating,
        category: formData.category,
        subject: formData.subject,
        message: formData.message,
        status: 'new' as const,
        createdAt: new Date().toISOString(),
      };

      // Add to mock storage
      addFeedback(feedback);
      setIsSubmitted(true);

      // Reset form after 2 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsLoading(false);
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
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-foreground mb-2 sm:mb-3">
                How would you rate your experience? <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2 sm:gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, rating: star }))}
                    className={`flex-1 sm:flex-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg font-semibold text-sm sm:text-base transition-colors ${
                      formData.rating === star
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-foreground hover:bg-border'
                    }`}
                  >
                    {star}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
                <option value="improvement">Improvement</option>
                <option value="usability">Usability Issue</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Subject */}
            <div>
              <label htmlFor="subject" className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                Subject <span className="text-red-500">*</span>
              </label>
              <Input
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Brief subject"
                required
                className="bg-background text-sm"
              />
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                Detailed Feedback <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Please provide detailed feedback..."
                required
                rows={5}
                className="bg-background text-sm resize-none"
              />
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
