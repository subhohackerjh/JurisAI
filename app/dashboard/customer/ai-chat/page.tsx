'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardHeader from '@/components/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Bot, 
  Send, 
  User, 
  MessageCircle, 
  Clock, 
  FileText, 
  AlertCircle,
  CheckCircle,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  BookOpen,
  Scale,
  Gavel
} from 'lucide-react';
import { AIChatMessage } from '@/lib/types';

export default function AIChatPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      content: 'Hello! I\'m your LEGAL 24 AI assistant. I\'m here to help you with legal queries, provide information about legal procedures, and guide you through your legal concerns. How can I assist you today?',
      timestamp: new Date().toISOString(),
      category: 'general'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: AIChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputMessage);
      const aiMessage: AIChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        content: aiResponse.content,
        timestamp: new Date().toISOString(),
        category: aiResponse.category,
        suggestedActions: aiResponse.suggestedActions
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Legal advice responses
    if (lowerMessage.includes('divorce') || lowerMessage.includes('separation')) {
      return {
        content: 'Divorce proceedings in India are governed by the Hindu Marriage Act, 1955, and the Special Marriage Act, 1954. The process typically involves:\n\n1. **Filing a petition** - Either mutual consent or contested\n2. **Cooling period** - 6 months for mutual consent cases\n3. **Counseling** - Mandatory counseling session\n4. **Final decree** - Court decision\n\nWould you like me to explain any specific aspect of the divorce process?',
        category: 'legal_advice',
        suggestedActions: ['File Divorce Petition', 'Know Your Rights', 'Find Divorce Lawyers']
      };
    }

    if (lowerMessage.includes('property') || lowerMessage.includes('land dispute')) {
      return {
        content: 'Property disputes in India can involve:\n\n🏠 **Title Issues** - Ownership verification\n⚖️ **Boundary Disputes** - Property line disagreements\n📋 **Illegal Possession** - Unauthorized occupation\n\n**Key Steps:**\n1. Gather all property documents\n2. File civil suit in appropriate court\n3. Consider mediation for faster resolution\n4. Register property with authorities\n\n**Important:** Always keep original documents safe and maintain proper records.',
        category: 'legal_advice',
        suggestedActions: ['Verify Property Documents', 'File Civil Suit', 'Consider Mediation']
      };
    }

    if (lowerMessage.includes('labor') || lowerMessage.includes('employment')) {
      return {
        content: 'Labor law protections in India include:\n\n💼 **Working Hours** - 8 hours/day, 48 hours/week\n⏰ **Overtime** - Must be paid at double rate\n🏥 **Minimum Wage** - Varies by state\n🏖️ **Leave** - 12 days earned leave + public holidays\n\n**For Employment Issues:**\n1. Document everything\n2. Send formal complaint to HR\n3. File complaint with Labor Commissioner\n4. Consider legal action if unresolved\n\nNeed help with a specific employment issue?',
        category: 'legal_advice',
        suggestedActions: ['Know Labor Rights', 'File Workplace Complaint', 'Consult Labor Lawyer']
      };
    }

    if (lowerMessage.includes('criminal') || lowerMessage.includes('fir')) {
      return {
        content: 'For criminal matters in India:\n\n🚨 **FIR (First Information Report)**\n- Must be filed at the nearest police station\n- Can be filed by victim or informant\n- Keep a copy for your records\n\n⚖️ **Legal Process:**\n1. Investigation by police\n2. Chargesheet filing\n3. Court proceedings\n4. Bail application (if applicable)\n\n**Important Rights:**\n- Right to remain silent\n- Right to legal counsel\n- Right to be informed of charges\n\nWould you like guidance on filing an FIR or understanding the criminal process?',
        category: 'legal_advice',
        suggestedActions: ['File FIR Online', 'Find Criminal Lawyer', 'Know Your Rights']
      };
    }

    // General legal information
    if (lowerMessage.includes('court') || lowerMessage.includes('legal procedure')) {
      return {
        content: 'Indian Court System Structure:\n\n🏛️ **Supreme Court** - Final appellate authority\n🏛️ **High Courts** - State-level courts\n⚖️ **District Courts** - Trial courts\n🏛️ **Specialized Tribunals** - NCLT, NGT, etc.\n\n**E-Court Services:**\n- Case filing online\n- Virtual hearings\n- E-filing of documents\n- Case status tracking\n\n**Benefits of E-Courts:**\n✅ Save time and travel\n✅ Transparent process\n✅ Easy document access\n\nNeed help with a specific court procedure?',
        category: 'procedure',
        suggestedActions: ['File Case Online', 'Check Case Status', 'Find Court Lawyers']
      };
    }

    // Document help
    if (lowerMessage.includes('document') || lowerMessage.includes('draft')) {
      return {
        content: 'Common Legal Documents Required:\n\n📋 **Identity Documents:**\n- Aadhaar Card\n- PAN Card\n- Voter ID\n- Passport\n\n📄 **Property Documents:**\n- Sale Deed\n- Title Deed\n- Encumbrance Certificate\n- Tax Receipts\n\n📝 **Legal Agreements:**\n- Rental/Lease Agreements\n- Employment Contracts\n- Partnership Deeds\n- Loan Agreements\n\n**Tips:**\n- Always self-attest documents\n- Keep both originals and copies\n- Use registered e-stamps where required\n\nWhich type of document do you need help with?',
        category: 'document_help',
        suggestedActions: ['Draft Legal Document', 'Find Document Templates', 'Get Notary Services']
      };
    }

    // Default response
    return {
      content: `I understand you're asking about "${userMessage}". While I can provide general legal information and guidance, please note:\n\n⚠️ **Important Disclaimer:**\nI am an AI assistant and cannot provide specific legal advice for your situation. For personalized legal advice, please consult with a qualified advocate.\n\n🤖 **How I Can Help:**\n- Explain legal procedures\n- Provide information about laws\n- Suggest next steps\n- Help with document requirements\n- General legal guidance\n\nCould you please provide more details about your specific legal concern so I can assist you better?`,
      category: 'general',
      suggestedActions: ['Find Qualified Lawyer', 'Schedule Consultation', 'Legal Aid Resources']
    };
  };

  const handleQuickAction = (action: string) => {
    setInputMessage(`Tell me more about ${action}`);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} onLogout={() => {}} />
      <main className="px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">AI Legal Assistant</h1>
            <p className="text-sm text-muted-foreground">Get instant answers to your legal questions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="h-[600px] flex flex-col">
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Legal AI Chat</h3>
                  {isTyping && (
                    <div className="flex items-center gap-2 ml-auto">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-muted-foreground">AI is typing...</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(message => (
                  <div key={message.id} className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                      <div className={`flex items-start gap-2 p-3 rounded-lg ${
                        message.sender === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}>
                        {message.sender === 'ai' && (
                          <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <Bot className="w-3 h-3 text-white" />
                          </div>
                        )}
                        {message.sender === 'user' && (
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-3 h-3 text-primary-foreground" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-sm leading-relaxed">{message.content}</p>
                          {message.category && (
                            <Badge variant="secondary" className="text-xs mt-2">
                              {message.category.replace('_', ' ').toUpperCase()}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggested Actions */}
              {messages[messages.length - 1]?.sender === 'ai' && messages[messages.length - 1]?.suggestedActions && (
                <div className="p-4 border-t border-border">
                  <p className="text-sm font-medium mb-3">Suggested Actions:</p>
                  <div className="flex flex-wrap gap-2">
                    {messages[messages.length - 1].suggestedActions?.map((action, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickAction(action)}
                        className="text-xs"
                      >
                        {action}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask your legal question..."
                    rows={2}
                    className="flex-1 resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isTyping}
                    size="sm"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Actions & Info */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleQuickAction('divorce process')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Divorce Procedures
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleQuickAction('property disputes')}
                >
                  <Scale className="w-4 h-4 mr-2" />
                  Property Issues
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleQuickAction('employment rights')}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Labor Laws
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleQuickAction('filing FIR')}
                >
                  <Gavel className="w-4 h-4 mr-2" />
                  Criminal Cases
                </Button>
              </div>
            </Card>

            {/* Legal Categories */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Legal Topics</h3>
              <div className="space-y-2">
                {[
                  { icon: FileText, title: 'Family Law', desc: 'Divorce, custody, marriage' },
                  { icon: Scale, title: 'Property Law', desc: 'Disputes, registration, deeds' },
                  { icon: BookOpen, title: 'Criminal Law', desc: 'FIR, bail, court procedures' },
                  { icon: AlertCircle, title: 'Labor Law', desc: 'Rights, termination, wages' },
                  { icon: Lightbulb, title: 'Civil Law', desc: 'Contracts, torts, compensation' }
                ].map((topic, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                    <topic.icon className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{topic.title}</p>
                      <p className="text-xs text-muted-foreground">{topic.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Disclaimer */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                Important Disclaimer
              </h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>• This AI provides general legal information only</p>
                <p>• Not a substitute for professional legal advice</p>
                <p>• Consult qualified advocates for specific cases</p>
                <p>• Laws vary by jurisdiction and circumstances</p>
              </div>
              <Button className="w-full mt-4">
                Find Qualified Advocates
              </Button>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
