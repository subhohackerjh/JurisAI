'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useAdvocates } from '@/hooks/useAdvocates';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import DashboardHeader from '@/components/DashboardHeader';
import { Star, AlertCircle, MapPin } from 'lucide-react';

export default function NearbyAdvocatesPage() {
  const { session, logout } = useAuth();
  const { advocates, isLoading, error } = useAdvocates({ nearby: true });

  if (!session.user) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader user={session.user} onLogout={logout} />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8 flex items-center gap-2">
          <MapPin className="h-6 w-6 text-indigo-600" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">Nearby Advocates</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Advocates matched to your city and state, closest first
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/30 flex gap-2">
            <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading advocates...</p>
          </div>
        ) : advocates.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No advocates found. Add your city in your profile to find advocates near you.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {advocates.map((advocate) => (
              <Link key={advocate.id} href={`/dashboard/advocates/${advocate.id}`}>
                <Card className="border border-border bg-card hover:shadow-xl hover:border-primary/30 transition-all duration-300 cursor-pointer h-full group">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base sm:text-lg group-hover:text-primary transition-colors">
                      {advocate.name}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {advocate.city ? `${advocate.city}${advocate.state ? `, ${advocate.state}` : ''}` : advocate.email}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {advocate.specialization && (
                      <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                        {advocate.specialization}
                      </Badge>
                    )}
                    {advocate.rating && (
                      <div className="flex items-center gap-0.5">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-semibold text-foreground">{advocate.rating}</span>
                      </div>
                    )}
                    <Button className="w-full mt-2 group-hover:bg-primary/90 transition-colors">View Profile</Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
