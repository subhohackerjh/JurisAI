'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, MessageSquare, Shield, ArrowRight, CheckCircle } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <span className="text-base sm:text-xl font-bold text-foreground">LegalConnect</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition">
              Features
            </a>
            <a href="#advocates" className="text-sm text-muted-foreground hover:text-foreground transition">
              Advocates
            </a>
            <a href="#services" className="text-sm text-muted-foreground hover:text-foreground transition">
              Services
            </a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/login">
              <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                Sign In
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm" className="text-xs sm:text-sm">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto px-3 sm:px-6 py-12 sm:py-20 lg:py-32">
        <div className="text-center space-y-4 sm:space-y-6">
          <div className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-accent/10 rounded-full border border-accent/30">
            <span className="text-xs sm:text-sm font-medium text-accent">Legal Services Made Simple</span>
          </div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground text-balance leading-tight">
            Connect with Expert Advocates <span className="text-primary">Instantly</span>
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            LegalConnect is your trusted platform to find qualified legal professionals, manage cases, and access expert legal guidance.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2 sm:pt-4">
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full gap-2 text-sm sm:text-base">
                Explore Advocates
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full text-sm sm:text-base">
                File a Case
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="mx-auto px-3 sm:px-6 py-12 sm:py-20">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
            Why Choose LegalConnect?
          </h2>
          <p className="text-xs sm:text-sm lg:text-base text-muted-foreground max-w-2xl mx-auto">
            Comprehensive legal services designed for citizens, advocates, and law enforcement
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            {
              icon: Users,
              title: 'Expert Advocates',
              description: 'Access to verified, experienced legal professionals across various specializations',
            },
            {
              icon: FileText,
              title: 'Case Management',
              description: 'Organized case tracking with documents, notes, and timeline updates in one place',
            },
            {
              icon: MessageSquare,
              title: 'AI Legal Assistant',
              description: 'Get instant answers to legal questions with AI-powered guidance and IPC references',
            },
            {
              icon: Shield,
              title: 'Secure & Private',
              description: 'Your data is protected with industry-leading security and confidentiality standards',
            },
          ].map((feature, idx) => (
            <Card key={idx} className="border border-border bg-card hover:shadow-lg transition">
              <CardHeader>
                <feature.icon className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="mx-auto px-3 sm:px-6 py-12 sm:py-20 bg-primary/5 rounded-2xl my-12 sm:my-20">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-4">
            How LegalConnect Works
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
          {[
            {
              number: '1',
              title: 'Create Your Account',
              description: 'Sign up as a citizen, advocate, or law enforcement officer in seconds',
            },
            {
              number: '2',
              title: 'Browse or File',
              description: 'Find the right advocate for your case or file a new legal matter',
            },
            {
              number: '3',
              title: 'Manage & Succeed',
              description: 'Track your case progress, get legal advice, and achieve your desired outcome',
            },
          ].map((step, idx) => (
            <div key={idx} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-lg mb-4">
                {step.number}
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Advocates Stats */}
      <section id="advocates" className="mx-auto px-3 sm:px-6 py-12 sm:py-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            { label: 'Expert Advocates', value: '500+' },
            { label: 'Cases Resolved', value: '10K+' },
            { label: 'Happy Clients', value: '25K+' },
            { label: 'Success Rate', value: '95%' },
          ].map((stat, idx) => (
            <Card key={idx} className="border border-border bg-card text-center">
              <CardContent className="pt-6">
                <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section id="services" className="mx-auto px-3 sm:px-6 py-12 sm:py-20 text-center">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4 sm:mb-6">
          Ready to Get Legal Help?
        </h2>
        <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto">
          Join thousands of people who have found the right legal guidance through LegalConnect
        </p>
        <Link href="/login">
          <Button size="lg" className="gap-2 text-sm sm:text-base">
            Start Now <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background/50 mt-12 sm:mt-20">
        <div className="mx-auto px-3 sm:px-6 py-8 sm:py-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-primary" />
                <span className="font-semibold">LegalConnect</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Making legal services accessible to everyone
              </p>
            </div>
            {[
              {
                title: 'Product',
                links: ['Features', 'Pricing', 'Security'],
              },
              {
                title: 'Company',
                links: ['About', 'Blog', 'Careers'],
              },
              {
                title: 'Legal',
                links: ['Privacy', 'Terms', 'Contact'],
              },
            ].map((section, idx) => (
              <div key={idx}>
                <h4 className="font-semibold mb-4 text-sm">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
            <p className="text-xs sm:text-sm text-muted-foreground">
              © 2024 LegalConnect. All rights reserved.
            </p>
            <div className="flex gap-4 sm:gap-6">
              {['Twitter', 'LinkedIn', 'Facebook'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
