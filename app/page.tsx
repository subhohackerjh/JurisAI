'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, MessageSquare, Shield, ArrowRight, Scale, Gavel, Clock, Award, Rocket, Lightbulb, Building, Handshake, Wallet, Sparkles, LineChart, Lock, Quote, Check, Mail, Phone, MapPin, Send, Facebook, Linkedin } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dotted-bg">
      {/* Header */}
      <header className="border-b border-blue-100/80 bg-white/95 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">L</span>
            </div>
            <span className="text-xl font-bold text-slate-900">Legal24</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#services" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              Services
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              How It Works
            </a>
            <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              Pricing
            </a>
            <a href="#contact" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              Contact
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="border-blue-600 text-blue-600 hover:bg-blue-50 text-sm font-medium">
              Book Consultation
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight">
                24/7 Legal Help for <span className="text-blue-600">Everyday People</span>
              </h1>

              <p className="text-xl text-slate-600 leading-relaxed">
                Get instant legal guidance with AI-powered assistance. Connect with vetted lawyers for personal legal matters, document drafting, and expert advice.
              </p>

              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold px-8 py-4 shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 transition-all">
                Get Legal Help Now
              </Button>

              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-slate-700">Vetted Lawyers for Personal Matters</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-slate-700">AI Legal Document Assistance</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-slate-700">24/7 Legal Guidance Available</span>
                </div>
              </div>
            </div>

            {/* Right - AI Chat Widget */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                {/* Chat Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Legal24 AI</h3>
                      <p className="text-blue-100 text-sm">Online</p>
                    </div>
                  </div>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                </div>

                {/* Chat Messages */}
                <div className="p-6 space-y-4 bg-gradient-to-b from-white to-blue-50/30">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="bg-gray-100 rounded-2xl rounded-tl-none p-4 max-w-[80%]">
                      <p className="text-gray-800 text-sm">Hello! I'm your AI legal assistant. How can I help you today?</p>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end">
                    <div className="bg-blue-600 text-white rounded-2xl rounded-tr-none p-4 max-w-[80%]">
                      <p className="text-sm">I need help with a property issue</p>
                    </div>
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-gray-600 text-xs font-semibold">U</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="bg-gray-100 rounded-2xl rounded-tl-none p-4 max-w-[80%]">
                      <p className="text-gray-800 text-sm">I understand you're dealing with a property issue. Let me connect you with one of our qualified lawyers who specializes in property law. They'll be able to review your situation and provide expert guidance.</p>
                    </div>
                  </div>
                </div>

                {/* Chat Input */}
                <div className="border-t border-gray-200 p-4 bg-white">
                  <div className="flex items-center gap-3">
                    <input 
                      type="text" 
                      placeholder="Type your message..." 
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-full text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full">
                      Send
                    </Button>
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
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
              How <span className="text-blue-600">Legal24</span> Works
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Get legal help in 4 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                number: '01',
                title: 'Describe Your Issue',
                description: 'Tell us about your legal situation - from property disputes to family matters',
              },
              {
                number: '02',
                title: 'AI Guidance',
                description: 'Get instant AI analysis and initial legal guidance for your situation',
              },
              {
                number: '03',
                title: 'Lawyer Match',
                description: 'Connect with experienced lawyers who specialize in your type of case',
              },
              {
                number: '04',
                title: 'Get Resolution',
                description: 'Receive expert help with documents, notices, and legal representation',
              },
            ].map((step, idx) => (
              <div key={idx} className="relative">
                <div className="text-6xl font-bold text-blue-100 mb-4">{step.number}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Legal Support Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
              Legal support for <span className="text-blue-600">every legal need</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              From property disputes to family matters — Legal24 is here for all your legal concerns.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Featured Contracts & Agreements Card */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 text-white h-full relative overflow-hidden group">
                {/* Arrow icon in top right */}
                <div className="absolute top-6 right-6 opacity-50 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="h-6 w-6" />
                </div>
                
                {/* Icon */}
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                
                {/* Content */}
                <h3 className="text-2xl font-bold mb-4">Contracts & Agreements</h3>
                <p className="text-blue-100 mb-8 leading-relaxed">
                  Drafting, review, and negotiation of contracts — NDAs, MSAs, employment, vendor.
                </p>
                
                {/* Button */}
                <Button className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-6 py-3 rounded-lg">
                  Start with a contract review
                </Button>
                
                {/* Decorative elements */}
                <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-xl" />
              </div>
            </div>

            {/* Smaller Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
              {[
                {
                  icon: Shield,
                  title: 'Compliance',
                  description: 'Stay audit-ready across GDPR, DPDP, SOC2 and regulatory filings.',
                },
                {
                  icon: Building,
                  title: 'Startup Legal',
                  description: 'Incorporation, cap tables, SAFEs, term sheets, founder agreements.',
                },
                {
                  icon: Lightbulb,
                  title: 'Intellectual Property',
                  description: 'Trademarks, copyrights, patents and brand protection.',
                },
                {
                  icon: Handshake,
                  title: 'Disputes',
                  description: 'Mediation, arbitration and litigation support for commercial disputes.',
                },
              ].map((service, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 group">
                  {/* Arrow icon in top right */}
                  <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-50 transition-opacity">
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </div>
                  
                  <div className="relative">
                    {/* Icon */}
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                      <service.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    
                    {/* Content */}
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{service.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{service.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WHY LEGAL24 Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">WHY LEGAL24</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
              Legal muscle, startup speed — <span className="text-blue-600">always on.</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Get enterprise-grade legal support that moves at the speed of your business.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Clock,
                title: '24/7 Availability',
                description: 'Round-the-clock AI + human support — no waiting rooms.',
              },
              {
                icon: Wallet,
                title: 'Flat, Transparent Pricing',
                description: 'Know your cost upfront. No surprise hourly bills.',
              },
              {
                icon: Sparkles,
                title: 'AI-Augmented Workflows',
                description: 'Draft, review & compare documents in minutes — not days.',
              },
              {
                icon: Users,
                title: 'Vetted Expert Lawyers',
                description: 'Top 5% legal talent, matched.',
              },
              {
                icon: LineChart,
                title: 'Built for Startups',
                description: 'Scale from incorporation to IPO with legal that grows with you.',
              },
              {
                icon: Lock,
                title: 'Enterprise-Grade Security',
                description: 'Bank-level encryption and confidentiality for your sensitive data.',
              },
            ].map((feature, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-8 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 group">
                {/* Icon */}
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-200 transition-colors">
                  <feature.icon className="h-8 w-8 text-blue-600" />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">SOCIAL PROOF</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
              Trusted by <span className="text-blue-600">ambitious founders</span>
            </h2>
          </div>

          {/* Testimonial Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {[
              {
                quote: "Legal24 transformed how we handle contracts. What used to take weeks now gets done in hours with their AI-powered review system.",
                name: "Sarah Chen",
                title: "CEO & Co-founder",
                company: "TechFlow",
                avatar: "SC",
              },
              {
                quote: "The flat pricing model is a game-changer for startups. We know exactly what our legal costs will be, no surprises.",
                name: "Marcus Rodriguez",
                title: "Founder",
                company: "DataSync",
                avatar: "MR",
              },
              {
                quote: "Having 24/7 access to vetted lawyers means we can make critical business decisions faster than our competitors.",
                name: "Emily Watson",
                title: "CTO",
                company: "CloudBase",
                avatar: "EW",
              },
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-8 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
                {/* Quote Icon */}
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                  <Quote className="h-6 w-6 text-blue-600" />
                </div>
                
                {/* Quote */}
                <blockquote className="text-slate-700 leading-relaxed mb-6 italic">
                  "{testimonial.quote}"
                </blockquote>
                
                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{testimonial.name}</div>
                    <div className="text-sm text-slate-600">{testimonial.title}, {testimonial.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Trusted By Teams */}
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-8">TRUSTED BY TEAMS AT</p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
              {[
                'NovaLabs',
                'Stackly', 
                'Folio',
                'Brightpath',
                'Kairos',
                'Orbit'
              ].map((company, idx) => (
                <div key={idx} className="text-slate-400 font-semibold text-lg hover:text-slate-600 transition-colors">
                  {company}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
              Simple, transparent <span className="text-blue-600">pricing</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Choose the perfect plan for your business needs. No hidden fees.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: 'Starter',
                description: 'Perfect for early-stage startups',
                price: '$299',
                period: '/month',
                popular: false,
                features: [
                  'Up to 5 contract reviews per month',
                  'Basic legal templates',
                  'Email support',
                  'AI legal assistant',
                  '1 lawyer consultation per month'
                ],
                buttonText: 'Start with Starter',
                buttonVariant: 'outline'
              },
              {
                name: 'Growth',
                description: 'Ideal for growing companies',
                price: '$799',
                period: '/month',
                popular: true,
                features: [
                  'Unlimited contract reviews',
                  'Advanced legal templates',
                  'Priority support',
                  'AI legal assistant + workflows',
                  '4 lawyer consultations per month',
                  'Compliance monitoring',
                  'Document storage'
                ],
                buttonText: 'Upgrade to Growth',
                buttonVariant: 'default'
              },
              {
                name: 'Scale',
                description: 'For enterprise teams',
                price: 'Custom',
                period: '',
                popular: false,
                features: [
                  'Everything in Growth',
                  'Custom legal workflows',
                  'Dedicated legal team',
                  '24/7 phone support',
                  'Advanced analytics',
                  'Custom integrations',
                  'SLA guarantees'
                ],
                buttonText: 'Contact Sales',
                buttonVariant: 'outline'
              }
            ].map((plan, idx) => (
              <div key={idx} className={`relative bg-white border-2 rounded-2xl p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                plan.popular 
                  ? 'border-blue-600 shadow-lg shadow-blue-500/20' 
                  : 'border-slate-200'
              }`}>
                {/* Most Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      MOST POPULAR
                    </div>
                  </div>
                )}
                
                {/* Plan Name */}
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                <p className="text-slate-600 mb-6">{plan.description}</p>
                
                {/* Price */}
                <div className="mb-8">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                    <span className="text-slate-600 ml-1">{plan.period}</span>
                  </div>
                </div>
                
                {/* Features */}
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIdx) => (
                    <div key={featureIdx} className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="h-3 w-3 text-blue-600" />
                      </div>
                      <span className="text-slate-700 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                
                {/* Button */}
                <Button 
                  className={`w-full py-3 font-semibold ${
                    plan.popular 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'border-slate-300 text-slate-900 hover:bg-slate-50'
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.buttonText}
                </Button>
              </div>
            ))}
          </div>
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
      <footer className="bg-white text-slate-900 py-16 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Company Info */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">L</span>
                </div>
                <span className="text-xl font-bold text-slate-900">Legal24</span>
              </div>
              <p className="text-slate-600 mb-8 leading-relaxed">
                Legal24 is a tech-enabled legal platform offering 24/7 support to modern businesses, startups and founders. 
                General info only — not a substitute for personalized legal advice.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-slate-600">
                  <Mail className="h-5 w-5 text-blue-500" />
                  <span>info@legal24.in</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <Phone className="h-5 w-5 text-blue-500" />
                  <span>+91 96632 02292</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <MapPin className="h-5 w-5 text-blue-500" />
                  <span className="text-sm">K Ravi, #51 Chokkanahalli, Yenigadale post, Chintamani Taluk, Chikkaballapur District, Karnataka - 563125</span>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="mt-8">
                <h4 className="text-lg font-semibold mb-4 text-slate-900">Follow Us</h4>
                <div className="flex items-center gap-6">
                  <a 
                    href="https://t.me/legal24in" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center justify-center transition-all hover:scale-110"
                    aria-label="Telegram"
                  >
                    <Send className="h-6 w-6 text-black hover:text-blue-600" />
                  </a>
                  <a 
                    href="https://www.instagram.com/legal24.in" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center justify-center transition-all hover:scale-110"
                    aria-label="Instagram"
                  >
                    <svg className="h-6 w-6 text-black hover:text-pink-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1 1 12.324 0 6.162 6.162 0 0 1-12.324 0zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.965-10.405a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001z"/>
                    </svg>
                  </a>
                  <a 
                    href="https://www.facebook.com/share/1D6qJEq2zW/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center justify-center transition-all hover:scale-110"
                    aria-label="Facebook"
                  >
                    <Facebook className="h-6 w-6 text-black hover:text-blue-600" />
                  </a>
                  <a 
                    href="https://www.linkedin.com/company/legal24.in" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center justify-center transition-all hover:scale-110"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="h-6 w-6 text-black hover:text-blue-700" />
                  </a>
                </div>
              </div>
            </div>

            {/* Platform Links */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-slate-900">PLATFORM</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#services" className="text-slate-600 hover:text-blue-600 transition-colors">Services</a>
                </li>
                <li>
                  <a href="#how-it-works" className="text-slate-600 hover:text-blue-600 transition-colors">How it works</a>
                </li>
                <li>
                  <a href="#pricing" className="text-slate-600 hover:text-blue-600 transition-colors">Pricing</a>
                </li>
                <li>
                  <a href="#why-legal24" className="text-slate-600 hover:text-blue-600 transition-colors">Why Legal24</a>
                </li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-slate-900">COMPANY</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#about" className="text-slate-600 hover:text-blue-600 transition-colors">About</a>
                </li>
                <li>
                  <a href="#blog" className="text-slate-600 hover:text-blue-600 transition-colors">Blog</a>
                </li>
                <li>
                  <a href="#privacy" className="text-slate-600 hover:text-blue-600 transition-colors">Privacy Policy</a>
                </li>
                <li>
                  <a href="#terms" className="text-slate-600 hover:text-blue-600 transition-colors">Terms of Service</a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-gray-200 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-slate-600 text-sm">
                © 2024 Legal24. All rights reserved.
              </div>
              <div className="flex items-center gap-6">
                <span className="text-slate-600 text-sm">Built for founders. Always on.</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-600 text-sm">Made for Indians - Easy access to law</span>
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
