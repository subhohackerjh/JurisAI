'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import DashboardHeader from '@/components/DashboardHeader';
import { ArrowLeft } from 'lucide-react';

export default function FileCasePage() {
  const { session } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'criminal',
    budget: '',
  });

  if (!session.user) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      router.push('/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={session.user} onLogout={() => {}} />

      <main className="max-w-2xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Link href="/dashboard">
          <Button variant="ghost" className="gap-2 mb-4 sm:mb-6 -ml-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back</span>
          </Button>
        </Link>

        <Card className="border border-border bg-card">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="text-xl sm:text-2xl">File a New Case</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Provide details about your legal matter
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-foreground">Case Title *</label>
                <Input
                  type="text"
                  name="title"
                  placeholder="Brief, descriptive title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  e.g., "Traffic Accident Compensation Claim"
                </p>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-foreground">Description *</label>
                <textarea
                  name="description"
                  placeholder="Provide detailed information about your case..."
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Include relevant dates, parties involved, and key facts
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-xs sm:text-sm font-semibold text-foreground">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="criminal">Criminal Law</option>
                    <option value="civil">Civil Law</option>
                    <option value="family">Family Law</option>
                    <option value="property">Property Rights</option>
                    <option value="labor">Labor Law</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-xs sm:text-sm font-semibold text-foreground">Budget (₹) *</label>
                  <Input
                    type="number"
                    name="budget"
                    placeholder="e.g., 50000"
                    value={formData.budget}
                    onChange={handleChange}
                    required
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                <h3 className="font-semibold text-blue-900 text-xs sm:text-sm mb-2 sm:mb-3">What Happens Next?</h3>
                <ul className="space-y-1 text-xs sm:text-sm text-blue-800">
                  <li className="flex gap-2">
                    <span className="font-bold flex-shrink-0">1.</span>
                    <span>Your case is reviewed and published</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold flex-shrink-0">2.</span>
                    <span>Advocates see your case details</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold flex-shrink-0">3.</span>
                    <span>Compare and select qualified advocates</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold flex-shrink-0">4.</span>
                    <span>Start working together on your case</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                <Link href="/dashboard" className="flex-1">
                  <Button variant="outline" className="w-full text-sm sm:text-base">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" className="flex-1 text-sm sm:text-base" disabled={isSubmitting}>
                  {isSubmitting ? 'Filing...' : 'File Case'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
