'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardHeader from '@/components/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  MessageCircle, 
  FileText, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Sparkles,
  Brain,
  Zap
} from 'lucide-react';

export default function AISolutionsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [solution, setSolution] = useState('');
  const [formData, setFormData] = useState({
    caseType: '',
    description: '',
    urgency: 'medium',
  });

  const caseTypes = [
    'Property Dispute',
    'Contract Review',
    'Employment Issue',
    'Family Law',
    'Criminal Defense',
    'Business Formation',
    'Intellectual Property',
    'Tax Advisory',
    'Immigration',
    'Personal Injury'
  ];

  const handleGenerateSolution = async () => {
    setIsProcessing(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const mockSolution = `
# AI-Generated Legal Solution

## Case Analysis
Based on your ${formData.caseType} case, here's an instant solution:

### Immediate Actions Required:
1. **Document Collection**: Gather all relevant contracts, emails, and evidence
2. **Legal Standing**: Verify your legal position and rights
3. **Timeline Assessment**: Review statutory limitations and deadlines

### Recommended Strategy:
- **Primary Approach**: ${formData.urgency === 'high' ? 'Expedited legal proceedings' : 'Standard negotiation process'}
- **Alternative Resolution**: Mediation or arbitration options available
- **Risk Assessment**: Medium risk with proper documentation

### Key Legal Points:
- **Jurisdiction**: Local courts have primary jurisdiction
- **Precedent Cases**: Similar cases favor your position 70% of the time
- **Estimated Timeline**: ${formData.urgency === 'high' ? '2-4 weeks' : '2-3 months'}

### Next Steps:
1. Schedule consultation with specialized attorney
2. Prepare evidence portfolio
3. File necessary documentation within 30 days
4. Consider settlement options

### Cost Estimate:
- **Initial Consultation**: $200-500
- **Full Representation**: $2,000-8,000 (depending on complexity)
- **Success Rate**: 85% with proper preparation

*This AI-generated solution is for informational purposes only. Please consult with a qualified attorney for legal advice.*
      `;
      
      setSolution(mockSolution);
      setIsProcessing(false);
    }, 3000);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen">
      <DashboardHeader user={user} onLogout={() => {}} />
      <main className="px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">AI Legal Solutions</h1>
            <p className="text-sm text-muted-foreground">Get instant AI-powered legal guidance</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Describe Your Legal Issue</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Case Type</label>
                <select
                  value={formData.caseType}
                  onChange={(e) => setFormData({...formData, caseType: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                >
                  <option value="">Select case type...</option>
                  {caseTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Urgency Level</label>
                <div className="flex gap-2">
                  {['low', 'medium', 'high'].map(level => (
                    <Button
                      key={level}
                      variant={formData.urgency === level ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFormData({...formData, urgency: level})}
                      className="capitalize"
                    >
                      {level}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Case Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Provide details about your legal situation..."
                  rows={6}
                  className="resize-none"
                />
              </div>

              <Button
                onClick={handleGenerateSolution}
                disabled={!formData.caseType || !formData.description || isProcessing}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {isProcessing ? (
                  <>
                    <Zap className="w-4 h-4 mr-2 animate-pulse" />
                    AI Processing...
                  </>
                ) : (
                  <>
                    <Bot className="w-4 h-4 mr-2" />
                    Generate AI Solution
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* AI Solution Output */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">AI-Generated Solution</h2>
            </div>

            {isProcessing ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-primary/20 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-sm text-muted-foreground">AI is analyzing your case...</p>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                </div>
              </div>
            ) : solution ? (
              <div className="prose prose-sm max-w-none">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">AI Analysis Complete</span>
                  </div>
                  <p className="text-xs text-blue-700">Solution generated in 3.2 seconds</p>
                </div>
                <div className="whitespace-pre-wrap text-sm">{solution}</div>
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-medium">Disclaimer</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This AI-generated solution is for informational purposes only and does not constitute legal advice. 
                    Please consult with a qualified attorney for professional legal guidance.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bot className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-2">
                  No solution generated yet
                </p>
                <p className="text-xs text-muted-foreground">
                  Describe your legal issue and click "Generate AI Solution" to get instant guidance
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Features Overview */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">AI Capabilities</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Zap, label: 'Instant Analysis', desc: 'Get results in seconds' },
              { icon: FileText, label: 'Document Review', desc: 'Analyze legal documents' },
              { icon: Clock, label: '24/7 Available', desc: 'Round-the-clock assistance' },
              { icon: Brain, label: 'ML-Powered', desc: 'Advanced AI algorithms' }
            ].map((feature, index) => (
              <Card key={index} className="p-4 text-center">
                <feature.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h4 className="font-medium text-sm mb-1">{feature.label}</h4>
                <p className="text-xs text-muted-foreground">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
