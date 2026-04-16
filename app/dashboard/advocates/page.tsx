'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import DashboardHeader from '@/components/DashboardHeader';
import { mockAdvocates } from '@/lib/mock-data';
import { Star, MapPin, Award, Users } from 'lucide-react';

export default function AdvocatesPage() {
  const { session, logout } = useAuth();

  if (!session.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={session.user} onLogout={logout} />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">Find an Advocate</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Browse and connect with qualified legal professionals</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {mockAdvocates.map((advocate) => (
            <Link
              key={advocate.id}
              href={`/dashboard/advocates/${advocate.id}`}
            >
              <Card className="border border-border bg-card hover:shadow-xl hover:border-primary/30 transition-all duration-300 cursor-pointer h-full group">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base sm:text-lg group-hover:text-primary transition-colors">{advocate.name}</CardTitle>
                      <CardDescription className="text-xs truncate">
                        {advocate.licenseNumber}
                      </CardDescription>
                    </div>
                    {advocate.isAvailable && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                        <span className="text-xs text-green-700 font-medium">Available</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{advocate.bio}</p>

                  <div className="flex items-center gap-0.5">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold text-foreground">
                      {advocate.rating}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({advocate.reviewCount})
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50 text-xs sm:text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Experience</p>
                      <p className="font-semibold text-foreground">{advocate.experience} yrs</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Rate</p>
                      <p className="font-semibold text-foreground">₹{advocate.hourlyRate}/hr</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-muted-foreground text-xs mb-1.5">Expertise</p>
                    <div className="flex flex-wrap gap-1">
                      {advocate.specializations.slice(0, 2).map((spec) => (
                        <Badge key={spec} variant="secondary" className="text-xs bg-primary/10 text-primary">
                          {spec}
                        </Badge>
                      ))}
                      {advocate.specializations.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{advocate.specializations.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Button className="w-full mt-2 group-hover:bg-primary/90 transition-colors">View Profile</Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
