'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, MessageSquare, Shield, ArrowRight, Scale, Gavel, Clock, Award } from 'lucide-react';
import Legal24Logo from '@/components/Legal24Logo';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Legal24Logo />
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-500 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-500 transition-colors">
              How It Works
            </a>
            <a href="#stats" className="text-sm font-medium text-slate-600 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-500 transition-colors">
              Statistics
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="hidden sm:flex text-sm font-medium">
                Sign In
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-950/50 rounded-full border border-amber-200 dark:border-amber-800">
                <span className="w-2 h-2 bg-amber-600 rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-amber-800 dark:text-amber-400">Legal Services Available 24/7</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white leading-tight">
                Justice Made <span className="text-amber-600">Accessible</span> for Everyone
              </h1>

              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
                Connect with verified expert advocates, manage your cases seamlessly, and get AI-powered legal guidance — all in one trusted platform.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/login" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full bg-amber-600 hover:bg-amber-700 text-white text-base font-semibold gap-2 shadow-lg shadow-amber-600/20 hover:shadow-xl hover:shadow-amber-600/30 transition-all">
                    Find an Advocate
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/login" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full border-slate-300 dark:border-slate-700 text-base font-semibold hover:bg-slate-100 dark:hover:bg-slate-800">
                    File a Case
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border-2 border-white dark:border-slate-900 flex items-center justify-center text-xs font-bold text-white">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-slate-900 dark:text-white">25,000+</span> clients served
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 shadow-2xl">
                <div className="absolute -top-4 -right-4 bg-amber-500 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg">
                  24/7 Available
                </div>
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur rounded-xl">
                    <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
                      <Scale className="h-6 w-6 text-amber-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Expert Legal Advice</p>
                      <p className="text-sm text-slate-400">Verified professionals at your service</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur rounded-xl">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                      <Shield className="h-6 w-6 text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Secure & Confidential</p>
                      <p className="text-sm text-slate-400">Bank-grade encryption</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur rounded-xl">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Clock className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Instant Response</p>
                      <p className="text-sm text-slate-400">AI-powered assistance</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3">Features</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Why Choose Legal24?
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Comprehensive legal services designed for citizens, advocates, and law enforcement
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Users,
              title: 'Expert Advocates',
              description: 'Access to verified, experienced legal professionals across various specializations',
              color: 'from-blue-500 to-blue-600',
            },
            {
              icon: FileText,
              title: 'Case Management',
              description: 'Organized case tracking with documents, notes, and timeline updates in one place',
              color: 'from-emerald-500 to-emerald-600',
            },
            {
              icon: MessageSquare,
              title: 'AI Legal Assistant',
              description: 'Get instant answers to legal questions with AI-powered guidance and IPC references',
              color: 'from-violet-500 to-violet-600',
            },
            {
              icon: Shield,
              title: 'Secure & Private',
              description: 'Your data is protected with industry-leading security and confidentiality standards',
              color: 'from-amber-500 to-amber-600',
            },
          ].map((feature, idx) => (
            <Card key={idx} className="group border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-slate-900 dark:bg-slate-950 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-amber-500 uppercase tracking-wider mb-3">Process</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              How Legal24 Works
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Three simple steps to get the legal help you need
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                number: '01',
                title: 'Create Your Account',
                description: 'Sign up as a citizen, advocate, or law enforcement officer in seconds with our streamlined registration',
                icon: Users,
              },
              {
                number: '02',
                title: 'Find or File',
                description: 'Browse verified advocates by specialization or file a new legal matter with ease',
                icon: Gavel,
              },
              {
                number: '03',
                title: 'Connect & Resolve',
                description: 'Communicate directly with your advocate, track progress, and achieve your legal goals',
                icon: Award,
              },
            ].map((step, idx) => (
              <div key={idx} className="relative text-center group">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white font-bold text-2xl mb-6 shadow-lg shadow-amber-500/25 group-hover:scale-110 transition-transform">
                  <step.icon className="h-10 w-10" />
                </div>
                <div className="absolute top-0 right-0 -mr-4 text-6xl font-bold text-slate-800 dark:text-slate-800/50 opacity-50">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-slate-400 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Expert Advocates', value: '500+', suffix: '' },
            { label: 'Cases Resolved', value: '10', suffix: 'K+' },
            { label: 'Happy Clients', value: '25', suffix: 'K+' },
            { label: 'Success Rate', value: '95', suffix: '%' },
          ].map((stat, idx) => (
            <Card key={idx} className="border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 text-center py-8 hover:shadow-lg transition-shadow">
              <CardContent className="pt-2">
                <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent mb-2">
                  {stat.value}{stat.suffix}
                </div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-12 lg:p-16 text-center">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23f59e0b%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Get Legal Help?
            </h2>
            <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
              Join thousands of people who have found the right legal guidance through Legal24. Your justice journey starts here.
            </p>
            <Link href="/login">
              <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-lg px-8 py-6 shadow-xl shadow-amber-500/25 hover:shadow-2xl hover:shadow-amber-500/40 transition-all">
                Get Started Now
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="sm:col-span-2 lg:col-span-1">
              <Legal24Logo />
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 max-w-xs">
                Making legal services accessible to everyone, 24 hours a day, 7 days a week.
              </p>
            </div>
            {[
              {
                title: 'Services',
                links: ['Find Advocates', 'File a Case', 'AI Assistant', 'Case Tracking'],
              },
              {
                title: 'Company',
                links: ['About Us', 'Careers', 'Blog', 'Contact'],
              },
              {
                title: 'Legal',
                links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'],
              },
            ].map((section, idx) => (
              <div key={idx}>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-4 text-sm uppercase tracking-wide">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-500 transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              © 2024 Legal24. All rights reserved.
            </p>
            <div className="flex gap-6">
              {['Twitter', 'LinkedIn', 'Facebook', 'Instagram'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-500 transition-colors"
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
