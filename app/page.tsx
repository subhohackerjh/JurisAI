'use client';

import Link from 'next/link';
import Image from 'next/image';
import JurisAILogo from '@/components/JurisAILogo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, MessageSquare, Shield, ArrowRight, Scale, Gavel, Clock, Award, GraduationCap, Briefcase, Handshake, MapPin, Sparkles, LineChart, Lock, Quote, Check, Mail, Phone, Send, Bot, ChevronRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">

      {/* Header */}
      <header className="border-b border-white/20 bg-white/60 backdrop-blur-2xl sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <JurisAILogo href="/" size="md" />
          <nav className="hidden md:flex items-center gap-8 bg-white/50 px-6 py-2 rounded-full border border-slate-200/60 shadow-sm backdrop-blur-md">
            {['Ecosystem', 'Features', 'Reviews'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors relative group">
                {item}
                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-indigo-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full" />
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <span className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer hidden sm:block">Log In</span>
            </Link>
            <Link href="/login">
              <Button className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-full px-5 shadow-md hover:shadow-lg transition-all duration-300 sm:hidden">
                Log In
              </Button>
            </Link>
            <Link href="/register" className="hidden sm:block">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-full px-6 shadow-md hover:shadow-lg transition-all duration-300">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 md:pt-24 md:pb-32 lg:pt-32 lg:pb-40 overflow-hidden">
        {/* Background Visuals */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <svg className="absolute inset-0 w-full h-full opacity-40 [mask-image:radial-gradient(ellipse_80%_80%_at_50%_40%,#000_70%,transparent_100%)]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dotPattern" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="#cbd5e1" />
              </pattern>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#dotPattern)" />
          </svg>
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[80%] bg-indigo-200/50 rounded-full blur-[120px] opacity-60 mix-blend-multiply animate-pulse" />
          <div className="absolute top-[20%] right-[-10%] w-[30%] h-[70%] bg-blue-200/50 rounded-full blur-[120px] opacity-60 mix-blend-multiply" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="space-y-10 pr-0 lg:pr-8 relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100/80 shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
                <span className="text-xs font-semibold text-indigo-700 uppercase tracking-widest">India's Unified Legal Network</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.15] tracking-tight max-w-2xl">
                One platform for <br className="hidden md:block" />
                <span className="text-3xl md:text-4xl lg:text-5xl bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600 bg-clip-text text-transparent inline-block mt-2">
                  Advocates, Citizens & Students
                </span>
              </h1>

              <p className="text-xl text-slate-600 leading-relaxed font-medium max-w-xl">
                JurisAI delivers instant, highly accurate AI legal advice by referencing real court cases and law books before you even hire a lawyer. We dynamically connect citizens to advocates, while empowering law students with renowned internships.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/login">
                  <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white text-base font-semibold px-8 py-6 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transition-all hover:-translate-y-0.5 border border-indigo-500/50 w-full sm:w-auto">
                    Get Legal Help <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="lg" variant="outline" className="text-slate-700 text-base border-slate-300 hover:bg-slate-100 font-semibold px-8 py-6 rounded-full shadow-sm hover:shadow-md transition-all w-full sm:w-auto">
                    Join as Advocate
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-8 border-t border-slate-200/60 text-sm font-medium text-slate-600">
                <div className="flex items-center gap-2 bg-white/60 px-3 py-1.5 rounded-full border border-slate-200/50 shadow-sm backdrop-blur-sm">
                  <Briefcase className="h-4 w-4 text-emerald-500" /> On-Demand Cases
                </div>
                <div className="flex items-center gap-2 bg-white/60 px-3 py-1.5 rounded-full border border-slate-200/50 shadow-sm backdrop-blur-sm">
                  <Bot className="h-4 w-4 text-indigo-500" /> AI Bot Support
                </div>
                <div className="flex items-center gap-2 bg-white/60 px-3 py-1.5 rounded-full border border-slate-200/50 shadow-sm backdrop-blur-sm">
                  <GraduationCap className="h-4 w-4 text-amber-500" /> Verified Internships
                </div>
              </div>
            </div>

            {/* Right - Modern AI Widget */}
            <div className="relative z-10 lg:ml-auto w-full max-w-lg" style={{ perspective: '1000px' }}>
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-[2.5rem] blur-2xl opacity-30 animate-pulse" />
              <div className="relative bg-white/80 backdrop-blur-2xl rounded-[2rem] border border-white/60 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden transition-transform duration-700 hover:scale-[1.02]">

                {/* Chat Header */}
                <div className="bg-slate-900/5 border-b border-white/40 px-6 py-5 flex items-center justify-between backdrop-blur-md">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center shadow-inner relative">
                      <Bot className="h-6 w-6 text-white" />
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                      <h3 className="text-slate-900 font-bold text-lg leading-tight">JurisAI Assistant</h3>
                      <p className="text-slate-500 text-xs font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                        Online &middot; AI Triage
                      </p>
                    </div>
                  </div>
                  <div className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wide">Live</div>
                </div>

                {/* Chat Messages */}
                <div className="p-4 md:p-6 space-y-6 bg-gradient-to-b from-transparent to-slate-50/50 h-[320px] md:h-[380px] overflow-hidden flex flex-col justify-end">

                  {/* User Message */}
                  <div className="flex gap-3 justify-end transform translate-y-2 opacity-0 animate-[fade-in-up_0.5s_ease-out_0.2s_forwards]">
                    <div className="bg-slate-900 text-white rounded-2xl rounded-tr-sm p-4 max-w-[85%] shadow-md">
                      <p className="text-[15px] leading-relaxed">I'm facing a property dispute and need an advocate in Bangalore immediately.</p>
                    </div>
                  </div>

                  {/* AI Response */}
                  <div className="flex gap-3 transform translate-y-2 opacity-0 animate-[fade-in-up_0.5s_ease-out_0.8s_forwards]">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                      <Bot className="h-4 w-4 text-indigo-700" />
                    </div>
                    <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm p-4 max-w-[85%] shadow-sm">
                      <p className="text-slate-700 text-[15px] leading-relaxed">
                        I can help. Based on your location, I found 3 highly-rated property advocates nearby. <br /><br />
                        <span className="font-semibold text-slate-900">Should I send your case details to them directly?</span>
                      </p>
                    </div>
                  </div>

                  {/* User Message */}
                  <div className="flex gap-3 justify-end transform translate-y-2 opacity-0 animate-[fade-in-up_0.5s_ease-out_1.8s_forwards]">
                    <div className="bg-slate-900 text-white rounded-2xl rounded-tr-sm px-5 py-3 shadow-md">
                      <p className="text-[15px] font-medium">Yes, please match me.</p>
                    </div>
                  </div>
                </div>

                {/* Chat Input */}
                <div className="border-t border-white/50 p-4 bg-white/90 backdrop-blur-xl">
                  <div className="relative group">
                    <input
                      type="text"
                      placeholder="Ask JurisAI anything..."
                      className="w-full pl-6 pr-24 py-4 bg-slate-50 border border-slate-200 rounded-full text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-inner"
                      readOnly
                    />
                    <Link href="/login">
                      <Button size="sm" className="absolute right-2 top-2 bottom-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 rounded-full font-semibold shadow-md transition-all">
                        Send
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid (The 3 Core Platforms) */}
      <section id="ecosystem" className="py-16 md:py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[50%] h-full bg-gradient-to-l from-indigo-900/40 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-widest mb-6">
                The JurisAI Ecosystem
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight leading-tight">
                Designed for everyone. <br /><span className="text-indigo-400">Powered by connectivity.</span>
              </h2>
              <p className="text-slate-400 text-lg">
                Whether you need legal help, want to take on cases, or are looking to start your legal career, JurisAI is your dedicated partner.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* For Customers */}
            <div className="group relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-indigo-500/50 rounded-3xl p-6 md:p-10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/20 overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-indigo-500/20 transition-all" />
              <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg">
                <Users className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">For Citizens &amp; Businesses</h3>
              <p className="text-slate-400 leading-relaxed mb-6">
                Facing a legal issue? Our AI bot provides correct legal advice by referencing comprehensive law books and court cases before you move to a lawyer. Once ready, find and hire nearby advocates instantly.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-slate-300 text-sm"><Check className="h-4 w-4 text-emerald-400" /> AI Query Assistant</li>
                <li className="flex items-center gap-3 text-slate-300 text-sm"><Check className="h-4 w-4 text-emerald-400" /> Find Nearby Advocates</li>
                <li className="flex items-center gap-3 text-slate-300 text-sm"><Check className="h-4 w-4 text-emerald-400" /> Seamless Secure Payments</li>
              </ul>
              <Link href="/login" className="block">
                <Button variant="outline" className="w-full border-slate-600 bg-slate-800/50 hover:bg-indigo-600 hover:border-indigo-600 hover:text-white transition-all text-white rounded-full">
                  Get Legal Help
                </Button>
              </Link>
            </div>

            {/* For Advocates */}
            <div className="group relative bg-indigo-600 backdrop-blur-sm border border-indigo-500 rounded-3xl p-6 md:p-10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/40 overflow-hidden transform md:scale-105 z-10">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
              <div className="absolute -bottom-4 -right-4 bg-white text-indigo-800 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider transform -rotate-12">
                Most Popular
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-8 shadow-inner backdrop-blur-md">
                <Gavel className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">For Advocates</h3>
              <p className="text-indigo-100 leading-relaxed mb-6">
                Operate like a modern platform. Accept cases dynamically (just like a ride app), track upcoming hearing dates seamlessly, and recruit driven interns to build your firm.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-white text-sm"><Check className="h-4 w-4 text-emerald-300" /> Ride-App Style Case Acceptance</li>
                <li className="flex items-center gap-3 text-white text-sm"><Check className="h-4 w-4 text-emerald-300" /> Next Hearing Reminders</li>
                <li className="flex items-center gap-3 text-white text-sm"><Check className="h-4 w-4 text-emerald-300" /> Manage Internship Requests</li>
              </ul>
              <Link href="/register" className="block">
                <Button className="w-full bg-white text-indigo-700 hover:bg-slate-100 transition-all font-bold rounded-full">
                  Join the Network
                </Button>
              </Link>
            </div>

            {/* For Students */}
            <div className="group relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-blue-500/50 rounded-3xl p-6 md:p-10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/20 overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-blue-500/20 transition-all" />
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg">
                <GraduationCap className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">For Law Students</h3>
              <p className="text-slate-400 leading-relaxed mb-6">
                Jumpstart your legal career. Search for renowned or local advocates, upload your CV, and secure verified internships directly through our portal.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-slate-300 text-sm"><Check className="h-4 w-4 text-emerald-400" /> Discover Renowned Law Firms</li>
                <li className="flex items-center gap-3 text-slate-300 text-sm"><Check className="h-4 w-4 text-emerald-400" /> One-Click CV Submissions</li>
                <li className="flex items-center gap-3 text-slate-300 text-sm"><Check className="h-4 w-4 text-emerald-400" /> Direct Advocate Networking</li>
              </ul>
              <Link href="/register" className="block">
                <Button variant="outline" className="w-full border-slate-600 bg-slate-800/50 hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all text-white font-semibold rounded-full">
                  Explore Internships
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Features (Platform benefits) */}
      <section id="features" className="py-16 md:py-24 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
              A unified system , <span className="text-indigo-600">built for speed.</span>
            </h2>
            <p className="text-lg text-slate-600">
              JurisAI replaces fragmented processes with a seamless, tech-forward experience.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: MapPin, title: 'Location Matching', desc: 'Instantly connect with advocates or law firms located near you via GPS.', color: 'text-blue-600', bg: 'bg-blue-100/50' },
              { icon: MessageSquare, title: 'AI Legal Advice', desc: 'Get accurate legal guidance generated directly from court rulings and law books before ever speaking to a lawyer.', color: 'text-violet-600', bg: 'bg-violet-100/50' },
              { icon: Clock, title: 'Hearing Sync', desc: 'Advocates receive automated notifications for their upcoming case hearing dates.', color: 'text-amber-600', bg: 'bg-amber-100/50' },
              { icon: FileText, title: 'CV Pipeline', desc: 'Students can effortlessly send application letters and CVs directly to top tier advocates.', color: 'text-emerald-600', bg: 'bg-emerald-100/50' },
              { icon: Handshake, title: 'Dynamic Acceptance', desc: 'Advocates can accept nearby client leads dynamically, similar to delivery platforms.', color: 'text-rose-600', bg: 'bg-rose-100/50' },
              { icon: Lock, title: 'Bank-Grade Security', desc: 'Secure document vaults and uncompromised encryption for all communications.', color: 'text-slate-700', bg: 'bg-slate-200/50' },
            ].map((feature, idx) => (
              <div key={idx} className="bg-white border text-center border-slate-200/60 rounded-3xl p-6 md:p-8 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 group hover:-translate-y-1">
                <div className={`w-16 h-16 ${feature.bg} mx-auto rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`h-8 w-8 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="reviews" className="py-16 md:py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest mb-6">
              Success Stories
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
              Trusted by our community
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                text: "The dynamic case acceptance is revolutionary. Instead of waiting for clients, I get notifications for nearby cases and can build my practice seamlessly.",
                author: "Ananya Sharma", role: "High Court Advocate", initial: "A"
              },
              {
                text: "I was dealing with a sudden property dispute. Within 10 minutes of chatting with the AI bot, I was matched with an incredible advocate right down the street.",
                author: "Rohan V.", role: "Citizen & Client", initial: "R"
              },
              {
                text: "Finding an internship used to mean walking door-to-door to chambers. JurisAI let me upload my CV and secure a placement at a top firm in days.",
                author: "Priya Desai", role: "3rd Year Law Student", initial: "P"
              }
            ].map((test, i) => (
              <div key={i} className="bg-slate-50 p-6 md:p-8 rounded-3xl shadow-inner border border-slate-200/60 relative">
                <Quote className="absolute top-6 right-6 md:right-8 text-slate-200 h-12 w-12 md:h-16 md:w-16 -z-10" />
                <p className="text-slate-700 italic mb-8 relative z-10 font-medium leading-relaxed">"{test.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-600 shadow-md shadow-indigo-200 text-white flex items-center justify-center font-bold text-lg">
                    {test.initial}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{test.author}</p>
                    <p className="text-slate-500 text-xs font-semibold">{test.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2.5rem] md:rounded-[3rem] bg-indigo-600 p-8 md:p-12 lg:p-20 text-center shadow-2xl shadow-indigo-500/25">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[150%] bg-white/10 blur-[100px] transform rotate-12" />
            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-500/50 rounded-full blur-3xl opacity-50" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
                Ready to Join the Revolution?
              </h2>
              <p className="text-lg text-indigo-100 mb-10 max-w-2xl mx-auto font-medium">
                Whether you're seeking justice, offering legal expertise, or starting your learning journey, JurisAI is built for you.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/register">
                  <Button size="lg" className="bg-white hover:bg-slate-50 text-indigo-600 font-bold text-lg px-8 py-7 rounded-full shadow-xl hover:shadow-2xl transition-all w-full sm:w-auto hover:-translate-y-0.5">
                    Get Started Free
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="border-indigo-400 bg-indigo-700/30 text-white hover:bg-indigo-700/50 font-bold text-lg px-8 py-7 rounded-full w-full sm:w-auto backdrop-blur-sm transition-all hover:-translate-y-0.5">
                    Log In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-300 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
            <div className="lg:col-span-1">
              <div className="mb-6">
                <JurisAILogo href="/" size="lg" />
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-8 pr-4">
                Transforming legal engagement for citizens, empowering advocates, and inspiring students across the nation.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6 tracking-wide">Platform</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li><a href="#ecosystem" className="text-slate-400 hover:text-indigo-400 transition-colors">Ecosystem</a></li>
                <li><a href="#features" className="text-slate-400 hover:text-indigo-400 transition-colors">Features</a></li>
                <li><a href="#reviews" className="text-slate-400 hover:text-indigo-400 transition-colors">Reviews</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 tracking-wide">Contact</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li className="flex items-center gap-3 text-slate-400"><Mail className="h-4 w-4 text-indigo-400" /> sg8293104@gmail.com</li>
                <li className="flex items-center gap-3 text-slate-400"><Phone className="h-4 w-4 text-indigo-400" /> +91 8293104191</li>
                <li className="flex items-start gap-3 text-slate-400"><MapPin className="h-5 w-5 text-indigo-400 shrink-0" /> <span className="text-xs leading-relaxed max-w-[200px]">Devanahalli,Bengaluru,Karnataka - 562110</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-500">
            <p>© 2026 JurisAI. All rights reserved.</p>
            <p className="flex items-center gap-2">Built for normal people for their help in law.</p>
          </div>
        </div>
      </footer>

      {/* Global CSS for fade-in animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
