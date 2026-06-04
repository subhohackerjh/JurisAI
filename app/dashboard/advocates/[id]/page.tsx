'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { advocatesApi } from '@/lib/api';
import DashboardHeader from '@/components/DashboardHeader';
import { ArrowLeft, Star, Phone, Mail, Award, Briefcase } from 'lucide-react';

export default function AdvocateDetailPage() {
  const { id } = useParams();
  const { session, logout } = useAuth();
  const [advocate, setAdvocate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdvocate = async () => {
      try {
        setLoading(true);
        const response = await advocatesApi.getAdvocateDetail(id as string);
        if (response.data) {
          setAdvocate(response.data);
        } else {
          setError(response.error || 'Advocate not found');
        }
      } catch {
        setError('Failed to load advocate details');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchAdvocate();
  }, [id]);

  if (!session.user) return null;

  if (loading) {
    return (
      <div className="min-h-screen">
        <DashboardHeader user={session.user} onLogout={logout} />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">Loading advocate details...</p>
        </div>
      </div>
    );
  }

  if (error || !advocate) {
    return (
      <div className="min-h-screen">
        <DashboardHeader user={session.user} onLogout={logout} />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">Advocate not found</p>
          <Link href="/dashboard/advocates"><Button className="mt-4">Back to Advocates</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader user={session.user} onLogout={logout} />
      <main className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Link href="/dashboard/advocates">
          <Button variant="ghost" className="gap-2 mb-4 sm:mb-6 -ml-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back</span>
          </Button>
        </Link>

        {/* Header Card */}
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="pb-4 sm:pb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
              <div className="flex-1">
                <CardTitle className="text-2xl sm:text-3xl mb-1">{advocate.name}</CardTitle>
                {advocate.bar_council_id && (
                  <CardDescription className="text-xs sm:text-sm">Bar Council ID: {advocate.bar_council_id}</CardDescription>
                )}
              </div>
              <Badge className={advocate.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                {advocate.is_active ? '● Active' : '● Inactive'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {advocate.specialization && (
              <p className="text-foreground text-sm mb-6">{advocate.specialization}</p>
            )}
            <div className="grid sm:grid-cols-3 gap-4 pt-4 border-t border-border text-sm">
              {advocate.rating && (
                <div>
                  <p className="text-muted-foreground mb-1">Rating</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-lg">{Number(advocate.rating).toFixed(1)}</span>
                  </div>
                </div>
              )}
              {advocate.experience_years && (
                <div>
                  <p className="text-muted-foreground mb-1">Experience</p>
                  <p className="font-bold text-lg">{advocate.experience_years} yrs</p>
                </div>
              )}
              {advocate.cases_handled !== undefined && (
                <div>
                  <p className="text-muted-foreground mb-1">Cases Handled</p>
                  <p className="font-bold text-lg">{advocate.cases_handled}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-6">
          <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{advocate.email}</p>
              </div>
            </div>
            {advocate.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{advocate.phone}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Specialization */}
        {advocate.specialization && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Specialization</CardTitle>
              <CardDescription>Area of expertise</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge className="bg-primary/10 text-primary border-primary/30">
                {advocate.specialization}
              </Badge>
            </CardContent>
          </Card>
        )}

        {/* Engage */}
        <Card>
          <CardHeader><CardTitle>Engage Advocate</CardTitle></CardHeader>
          <CardContent>
            {advocate.is_active && advocate.approval_status === 'approved' ? (
              <div className="space-y-4">
                <p className="text-sm text-foreground">
                  This advocate is active and available for consultation and case handling.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/dashboard/chat" className="flex-1">
                    <Button className="w-full">Send Message</Button>
                  </Link>
                  <Link href="/dashboard/file-case" className="flex-1">
                    <Button variant="outline" className="w-full">File a Case</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                This advocate is currently unavailable. Please check back later or browse other advocates.
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
