'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardHeader from '@/components/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  MapPin, 
  Star, 
  Phone, 
  Mail, 
  Filter,
  MessageCircle,
  User,
  Clock,
  DollarSign,
  Navigation,
  RefreshCw
} from 'lucide-react';
import { advocatesApi } from '@/lib/api';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('all');
  const [maxDistance, setMaxDistance] = useState('10');
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'experience'>('distance');
  const [advocates, setAdvocates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const specializations = ['all', 'Criminal Law', 'Family Law', 'Property Law', 'Labor Law', 'Corporate Law', 'Tax Law'];
  
  // Load advocates on component mount
  useEffect(() => {
    loadAdvocates();
  }, []);

  const loadAdvocates = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await advocatesApi.listAdvocates();
      if (response.data && !response.error) {
        const allAdvocates = Array.isArray(response.data) ? response.data : [];
        // Filter only approved advocates
        const approvedAdvocates = allAdvocates.filter((a) => a.approval_status === 'approved');
        setAdvocates(approvedAdvocates);
      }
    } catch (err) {
      setError('Failed to load advocates');
      console.error('Advocates loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAdvocates = advocates.filter(advocate => {
    const matchesSearch = advocate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (advocate.specialization && advocate.specialization.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSpecialization = selectedSpecialization === 'all' || 
                               (advocate.specialization === selectedSpecialization);
    
    return matchesSearch && matchesSpecialization;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'experience':
        return (b.experience_years || 0) - (a.experience_years || 0);
      default:
        return 0;
    }
  });

  const handleConnectAdvocate = (advocateId: string) => {
    router.push(`/dashboard/customer/advocates/${advocateId}`);
  };

  const handleChatWithAI = () => {
    router.push('/dashboard/customer/ai-chat');
  };

  const handleFileCase = () => {
    router.push('/dashboard/customer/file-case');
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader user={user} onLogout={() => {}} />
        <main className="px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading advocates...</span>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader user={user} onLogout={() => {}} />
        <main className="px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-800">Error: {error}</p>
              <Button onClick={loadAdvocates} className="mt-4">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} onLogout={() => {}} />
      <main className="px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Customer Dashboard</h1>
            <p className="text-sm text-muted-foreground">Find nearby advocates and get legal assistance</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={handleChatWithAI}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">AI Legal Assistant</h3>
                <p className="text-sm text-muted-foreground">Chat with AI for legal queries</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={handleFileCase}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Search className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">File a Case</h3>
                <p className="text-sm text-muted-foreground">Submit your legal issue</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">My Cases</h3>
                <p className="text-sm text-muted-foreground">Track ongoing cases</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Find Advocates</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Search Advocates</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, specialization, or location..."
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Specialization</label>
              <select
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
              >
                {specializations.map(spec => (
                  <option key={spec} value={spec}>
                    {spec === 'all' ? 'All Specializations' : spec}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
              >
                <option value="rating">Rating</option>
                <option value="experience">Experience</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {filteredAdvocates.length} Advocates Found
          </h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>Available for consultation</span>
          </div>
        </div>

        {/* Advocates List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAdvocates.map(advocate => (
            <Card key={advocate.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{advocate.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium">{advocate.rating || 'N/A'}</span>
                      </div>
                      <span>â¢</span>
                      <span>{advocate.experience_years || 0} years exp.</span>
                    </div>
                  </div>
                </div>
                <Badge className={
                  advocate.approval_status === 'approved'
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }>
                  {advocate.approval_status === 'approved' ? 'Available' : 'Unavailable'}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Specialization:</span>
                  <span>{advocate.specialization || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Rate:</span>
                  <span>{advocate.consultation_fee ? `Rs. ${advocate.consultation_fee}/hr` : 'Contact for rates'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Location:</span>
                  <span>{advocate.city || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Phone:</span>
                  <span>{advocate.phone || 'N/A'}</span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium mb-2">Bio:</p>
                <p className="text-sm text-muted-foreground">{advocate.bio || 'No bio available'}</p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleConnectAdvocate(advocate.id)}
                  disabled={advocate.approval_status !== 'approved'}
                  className="flex-1"
                >
                  Connect
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/dashboard/customer/advocates/${advocate.id}`)}
                  className="flex-1"
                >
                  View Profile
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredAdvocates.length === 0 && (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Advocates Found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Try adjusting your search criteria.
            </p>
            <Button onClick={() => {
              setSearchTerm('');
              setSelectedSpecialization('all');
            }}>
              Clear Filters
            </Button>
          </Card>
        )}
      </main>
    </div>
  );
}
