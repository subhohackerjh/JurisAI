'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useAdvocates } from '@/hooks/useAdvocates';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DashboardHeader from '@/components/DashboardHeader';
import { Star, Search, AlertCircle } from 'lucide-react';

export default function AdvocatesPage() {
  const { session, logout } = useAuth();
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [availability, setAvailability] = useState('');

  const { advocates, isLoading, error } = useAdvocates({
    search: search || undefined,
    specialization: specialization || undefined,
    availability: availability || undefined,
  });

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

        {/* Filters */}
        <div className="mb-6 p-4 rounded-lg border border-border bg-card">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or specialization..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Specialization</label>
              <Select value={specialization} onValueChange={setSpecialization}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="All specializations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All specializations</SelectItem>
                  <SelectItem value="Criminal Law">Criminal Law</SelectItem>
                  <SelectItem value="Civil Law">Civil Law</SelectItem>
                  <SelectItem value="Family Law">Family Law</SelectItem>
                  <SelectItem value="Corporate Law">Corporate Law</SelectItem>
                  <SelectItem value="Property Law">Property Law</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Availability</label>
              <Select value={availability} onValueChange={setAvailability}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="busy">Busy</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
            <p className="text-muted-foreground">No advocates found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {advocates.map((advocate) => (
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
                          {advocate.bar_council_id || advocate.email}
                        </CardDescription>
                      </div>
                      {advocate.is_active && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                          <span className="text-xs text-green-700 font-medium">Active</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {advocate.specialization && (
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{advocate.specialization}</p>
                    )}

                    {advocate.rating && (
                      <div className="flex items-center gap-0.5">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-semibold text-foreground">
                          {advocate.rating}
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50 text-xs sm:text-sm">
                      {advocate.experience_years && (
                        <div>
                          <p className="text-muted-foreground text-xs">Experience</p>
                          <p className="font-semibold text-foreground">{advocate.experience_years} yrs</p>
                        </div>
                      )}
                      {advocate.cases_handled && (
                        <div>
                          <p className="text-muted-foreground text-xs">Cases</p>
                          <p className="font-semibold text-foreground">{advocate.cases_handled}</p>
                        </div>
                      )}
                    </div>

                    {advocate.specialization && (
                      <div>
                        <p className="text-muted-foreground text-xs mb-1.5">Specialization</p>
                        <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                          {advocate.specialization}
                        </Badge>
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
