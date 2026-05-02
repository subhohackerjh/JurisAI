'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { advocatesApi, casesApi } from '@/lib/api';
import DashboardHeader from '@/components/DashboardHeader';
import { ArrowLeft, Star, Phone, Mail, MapPin, Award } from 'lucide-react';

export default function AdvocateDetailPage() {
  const { id } = useParams();
  const { session, logout } = useAuth();

  if (!session.user) {
    return null;
  }

  const [advocate, setAdvocate] = useState<any>(null);
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdvocateData = async () => {
      try {
        setLoading(true);
        const [advocateResponse, casesResponse] = await Promise.all([
          advocatesApi.getAdvocateDetail(id as string),
          casesApi.listCases()
        ]);
        
        if (advocateResponse.data) {
          setAdvocate(advocateResponse.data);
        } else {
          setError('Advocate not found');
        }
        
        if (casesResponse.data) {
          setCases(Array.isArray(casesResponse.data) ? casesResponse.data : []);
        }
      } catch (err) {
        setError('Failed to load advocate details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAdvocateData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader user={session.user} onLogout={logout} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <p className="text-muted-foreground">Loading advocate details...</p>
        </div>
      </div>
    );
  }

  if (error || !advocate) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader user={session.user} onLogout={logout} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <p className="text-muted-foreground">Advocate not found</p>
          <Link href="/dashboard/advocates">
            <Button className="mt-4">Back to Advocates</Button>
          </Link>
        </div>
      </div>
    );
  }

  const casesHandled = cases.filter((c: any) => c.advocate?.id === advocate.id).length;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={session.user} onLogout={logout} />

      <main className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Link href="/dashboard/advocates">
          <Button variant="ghost" className="gap-2 mb-4 sm:mb-6 -ml-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back</span>
          </Button>
        </Link>

        {/* Advocate Header Card */}
        <Card className="border border-border bg-card mb-4 sm:mb-6">
          <CardHeader className="pb-4 sm:pb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
              <div className="flex-1">
                <CardTitle className="text-2xl sm:text-3xl mb-1">{advocate.name}</CardTitle>
                <CardDescription className="text-xs sm:text-sm">{advocate.licenseNumber}</CardDescription>
              </div>
              <Badge
                className={`flex-shrink-0 text-xs sm:text-sm ${
                  advocate.isAvailable
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {advocate.isAvailable ? '● Available' : '● Unavailable'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            <p className="text-foreground text-sm sm:text-base leading-relaxed">{advocate.bio}</p>

            {/* Stats Grid */}
            <div className="grid sm:grid-cols-4 gap-3 sm:gap-4 pt-4 border-t border-border">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">Rating</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-foreground text-lg">{advocate.rating}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {advocate.reviewCount} reviews
                </p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">Experience</p>
                <p className="font-bold text-foreground text-lg mt-0.5">
                  {advocate.experience} yrs
                </p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">Cases</p>
                <p className="font-bold text-foreground text-lg mt-0.5">{casesHandled}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">Rate</p>
                <p className="font-bold text-foreground text-lg mt-0.5">₹{advocate.hourlyRate}/hr</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="border border-border bg-card mb-6">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium text-foreground">{advocate.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium text-foreground">{advocate.phone}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Specializations */}
        <Card className="border border-border bg-card mb-6">
          <CardHeader>
            <CardTitle>Specializations</CardTitle>
            <CardDescription>Areas of expertise</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {advocate.specializations?.map((spec: any) => (
                <Badge key={spec} className="bg-primary/10 text-primary border-primary/30">
                  {spec}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Availability */}
        <Card className="border border-border bg-card">
          <CardHeader>
            <CardTitle>Availability</CardTitle>
          </CardHeader>
          <CardContent>
            {advocate.isAvailable ? (
              <div className="space-y-4">
                <p className="text-foreground">
                  This advocate is currently available for consultation and case handling.
                </p>
                <Button className="w-full">Engage Advocate</Button>
              </div>
            ) : (
              <p className="text-muted-foreground">
                This advocate is currently unavailable. Please check back later or browse other
                advocates.
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
