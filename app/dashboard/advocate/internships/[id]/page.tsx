'use client';

import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardHeader from '@/components/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GraduationCap, Clock } from 'lucide-react';

export default function InternshipApplicationDetail() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} onLogout={() => {}} />
      <main className="px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Internship Application</h1>
            <p className="text-sm text-muted-foreground">Application ID: {id}</p>
          </div>
        </div>

        <Card className="p-10 text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-muted rounded-full">
              <Clock className="w-10 h-10 text-muted-foreground" />
            </div>
          </div>
          <h2 className="text-xl font-semibold">Internship Module Coming Soon</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            The internship applications feature is under development and will be available in a future update.
          </p>
          <Button onClick={() => router.push('/dashboard/advocate')} className="mt-2">
            Back to Dashboard
          </Button>
        </Card>
      </main>
    </div>
  );
}
