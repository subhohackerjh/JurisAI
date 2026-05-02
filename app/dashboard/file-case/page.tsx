'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCreateCase } from '@/hooks/useCases';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import DashboardHeader from '@/components/DashboardHeader';
import { ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';

export default function FileCasePage() {
  const { session } = useAuth();
  const router = useRouter();
  const { createCase, isLoading, error } = useCreateCase();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    case_type: 'civil',
    description: '',
    advocate: '',
    court_name: '',
    court_address: '',
    judge_name: '',
    filing_date: '',
    advocate_fee: '',
  });

  if (!session.user) {
    return null;
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const payload: any = {
      title: formData.title,
      case_type: formData.case_type,
      description: formData.description,
    };

    if (formData.advocate) payload.advocate = formData.advocate;
    if (formData.court_name) payload.court_name = formData.court_name;
    if (formData.court_address) payload.court_address = formData.court_address;
    if (formData.judge_name) payload.judge_name = formData.judge_name;
    if (formData.filing_date) payload.filing_date = formData.filing_date;
    if (formData.advocate_fee) payload.advocate_fee = parseFloat(formData.advocate_fee);

    const result = await createCase(payload);

    if (result.success) {
      setMessage({ type: 'success', text: 'Case filed successfully!' });
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to file case' });
    }
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
            {message && (
              <div className={`mb-6 p-4 rounded-lg border flex gap-2 ${
                message.type === 'success' 
                  ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                  : 'bg-destructive/10 border-destructive/30'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                )}
                <p className="text-sm">{message.text}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="title">Case Title *</Label>
                <Input
                  id="title"
                  placeholder="Brief, descriptive title"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  required
                  className="text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  e.g., "Traffic Accident Compensation Claim"
                </p>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="case_type">Case Type *</Label>
                <Select value={formData.case_type} onValueChange={(value) => handleChange('case_type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="civil">Civil Law</SelectItem>
                    <SelectItem value="criminal">Criminal Law</SelectItem>
                    <SelectItem value="family">Family Law</SelectItem>
                    <SelectItem value="property">Property Law</SelectItem>
                    <SelectItem value="corporate">Corporate Law</SelectItem>
                    <SelectItem value="labour">Labour Law</SelectItem>
                    <SelectItem value="consumer">Consumer Law</SelectItem>
                    <SelectItem value="writ">Writ Petition</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Provide detailed information about your case..."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={5}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Include relevant dates, parties involved, and key facts
                </p>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="court_name">Court Name (Optional)</Label>
                <Input
                  id="court_name"
                  placeholder="e.g., Delhi High Court"
                  value={formData.court_name}
                  onChange={(e) => handleChange('court_name', e.target.value)}
                  className="text-sm"
                />
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="court_address">Court Address (Optional)</Label>
                <Textarea
                  id="court_address"
                  placeholder="Court address..."
                  value={formData.court_address}
                  onChange={(e) => handleChange('court_address', e.target.value)}
                  rows={2}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="filing_date">Filing Date (Optional)</Label>
                  <Input
                    id="filing_date"
                    type="date"
                    value={formData.filing_date}
                    onChange={(e) => handleChange('filing_date', e.target.value)}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="advocate_fee">Advocate Fee (₹) (Optional)</Label>
                  <Input
                    id="advocate_fee"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 50000"
                    value={formData.advocate_fee}
                    onChange={(e) => handleChange('advocate_fee', e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                <h3 className="font-semibold text-blue-900 text-xs sm:text-sm mb-2 sm:mb-3">What Happens Next?</h3>
                <ul className="space-y-1 text-xs sm:text-sm text-blue-800">
                  <li className="flex gap-2">
                    <span className="font-bold flex-shrink-0">1.</span>
                    <span>Your case is created and saved</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold flex-shrink-0">2.</span>
                    <span>You can add documents and schedule hearings</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold flex-shrink-0">3.</span>
                    <span>Track case updates and progress</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                <Link href="/dashboard" className="flex-1">
                  <Button variant="outline" className="w-full text-sm sm:text-base">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" className="flex-1 text-sm sm:text-base" disabled={isLoading}>
                  {isLoading ? 'Filing...' : 'File Case'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
