'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Send, Loader } from 'lucide-react';
import DashboardHeader from '@/components/DashboardHeader';
import { ChatMessage } from '@/lib/types';
import { searchLegalKnowledgeBase } from '@/lib/legal-kb';

function ChatPageContent({ session, logout }: { session: any; logout: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      content:
        'Hello! I&apos;m your Legal AI Assistant. I can help answer questions about Indian Penal Code sections, legal procedures, and general legal guidance. What would you like to know?',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Math.random().toString(),
      sender: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    setTimeout(() => {
      const results = searchLegalKnowledgeBase(input);

      let assistantResponse: ChatMessage;

      if (results.length > 0) {
        const topResult = results[0];
        assistantResponse = {
          id: Math.random().toString(),
          sender: 'assistant',
          content: `Based on your query, here&apos;s relevant legal information:\n\n**Section ${topResult.number}: ${topResult.title}**\n\n${topResult.description}\n\n**Punishment:** ${topResult.punishment}`,
          timestamp: new Date().toISOString(),
          metadata: {
            sourceDocument: `IPC Section ${topResult.number}`,
            ipcSections: [topResult.number],
          },
        };
      } else {
        assistantResponse = {
          id: Math.random().toString(),
          sender: 'assistant',
          content:
            'I couldn&apos;t find specific legal information matching your query. Please try asking about Indian Penal Code sections, legal procedures, or related legal matters. For specific legal advice, please consult with a qualified advocate.',
          timestamp: new Date().toISOString(),
        };
      }

      setMessages((prev) => [...prev, assistantResponse]);
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardHeader user={session.user} onLogout={logout} />

      <main className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-3 sm:px-4 py-4 sm:py-8">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-lg sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Legal AI Assistant</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Ask about legal matters. Get instant guidance from our legal knowledge base.
          </p>
        </div>

        {/* Messages Container */}
        <Card className="border border-border bg-card flex-1 flex flex-col mb-3 sm:mb-4">
          <CardContent className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-foreground border border-border'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  {message.metadata?.ipcSections && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {message.metadata.ipcSections.map((section) => (
                        <Badge
                          key={section}
                          variant="outline"
                          className={`text-xs ${
                            message.sender === 'user'
                              ? 'bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30'
                              : 'bg-primary/10 text-primary border-primary/30'
                          }`}
                        >
                          IPC {section}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-secondary text-foreground border border-border px-3 sm:px-4 py-2 sm:py-3 rounded-lg">
                  <Loader className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Input Form */}
          <div className="border-t border-border p-2.5 sm:p-4">
            <form onSubmit={handleSendMessage} className="flex gap-1.5 sm:gap-2">
              <Input
                type="text"
                placeholder="Ask legal question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="flex-1 text-sm"
              />
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="gap-1 px-2 sm:px-4 text-xs sm:text-sm"
              >
                <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Send</span>
              </Button>
            </form>
          </div>
        </Card>

        {/* Sample Questions */}
        <div className="mt-3 sm:mt-6">
          <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">Sample questions:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              'What is Section 304A?',
              'Tell me about assault laws',
              'What are cheating laws?',
              'Information about criminal intimidation',
            ].map((question) => (
              <button
                key={question}
                onClick={() => setInput(question)}
                className="p-2 sm:p-3 rounded-lg border border-border bg-card hover:bg-secondary/50 transition text-left text-xs sm:text-sm text-foreground line-clamp-2"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ChatPage() {
  const { session, logout } = useAuth();

  if (!session.user) {
    return null;
  }

  return <ChatPageContent session={session} logout={logout} />;
}
