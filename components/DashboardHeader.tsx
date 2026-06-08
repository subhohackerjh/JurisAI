'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User, LogOut, Menu, X, Home, MessageSquare, FileText, Briefcase, Users, Search, IndianRupee, BarChart2, Wand2, Calculator, Handshake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User as UserType } from '@/lib/types';
import Legal24Logo from './Legal24Logo';
import { cn } from '@/lib/utils';

interface DashboardHeaderProps {
  user: UserType;
  onLogout: () => void;
}

export default function DashboardHeader({ user, onLogout }: DashboardHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    onLogout();
    router.push('/');
  };

  // Role-specific nav — each role has its own Dashboard link, no shared one
  const roleLinks: { href: string; label: string; icon: any }[] =
    user.role === 'customer'
      ? [
          { href: '/dashboard', label: 'Dashboard', icon: Home },
          { href: '/dashboard/advocates', label: 'Find Advocates', icon: Search },
          { href: '/dashboard/chat', label: 'Messages', icon: MessageSquare },
          { href: '/dashboard/ecourts', label: 'eCourts', icon: Briefcase },
          { href: '/dashboard/customer/ai-chat', label: 'AI Assistant', icon: FileText },
          { href: '/dashboard/drafting', label: 'My Drafts', icon: Briefcase },
          { href: '/dashboard/hearing-updates', label: 'Hearings', icon: Handshake },
          { href: '/dashboard/cheque-bounce', label: 'Cheque Bounce', icon: IndianRupee },
          { href: '/dashboard/calculators', label: 'Calculators', icon: Calculator },
          { href: '/dashboard/payments', label: 'Payments', icon: IndianRupee },
        ]
      : user.role === 'advocate'
        ? [
            { href: '/dashboard/advocate', label: 'Dashboard', icon: Home },
            { href: '/dashboard/advocate/cases', label: 'My Cases', icon: FileText },
            { href: '/dashboard/advocate/drafts', label: 'Drafts', icon: Briefcase },
            { href: '/dashboard/advocate/draft', label: 'AI Draft', icon: Wand2 },
            { href: '/dashboard/advocate/vakalatnama', label: 'Vakalatnama', icon: FileText },
            { href: '/dashboard/chat', label: 'Messages', icon: MessageSquare },
            { href: '/dashboard/ecourts', label: 'eCourts', icon: Search },
            { href: '/dashboard/calculators', label: 'Calculators', icon: Calculator },
            { href: '/dashboard/payments', label: 'Earnings', icon: IndianRupee },
          ]
        : user.role === 'admin'
          ? [
              { href: '/dashboard', label: 'Dashboard', icon: Home },
              { href: '/dashboard/admin/approvals', label: 'Approvals', icon: Users },
              { href: '/dashboard/admin/analytics', label: 'Analytics', icon: BarChart2 },
            ]
          : [
              { href: '/dashboard', label: 'Dashboard', icon: Home },
            ];

  const navLinks = [
    ...roleLinks,
    { href: '/dashboard/feedback', label: 'Feedback', icon: MessageSquare },
  ];

  const isActive = (href: string) => {
    if (pathname === href) return true;
    // Exact-match-only for routes that have children to avoid double-highlight
    const exactOnly = ['/dashboard', '/dashboard/advocate'];
    if (exactOnly.includes(href)) return false;
    return pathname.startsWith(`${href}/`);
  };

  return (
    <header className="border-b border-white/20 bg-white/60 backdrop-blur-2xl sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between gap-4">
        <Legal24Logo href="/dashboard" />

        <nav className="hidden lg:flex items-center gap-1 bg-white/50 px-2 py-1.5 rounded-full border border-slate-200/60 shadow-sm backdrop-blur-md">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm font-semibold px-4 py-2 rounded-full transition-colors relative',
                isActive(link.href)
                  ? 'text-indigo-700 bg-indigo-50'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-white/80',
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden rounded-full"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 rounded-full border-slate-200/80 bg-white/70 shadow-sm hover:bg-white"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-white">
                  <User className="h-3.5 w-3.5" />
                </span>
                <span className="hidden sm:inline text-sm font-semibold text-slate-800 max-w-[120px] truncate">
                  {user.name.split(' ')[0]}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 rounded-xl border-slate-200/80 shadow-lg">
              <div className="px-3 py-2.5 text-sm">
                <p className="font-semibold text-slate-900">{user.name}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
                <p className="text-xs text-indigo-600 mt-1 font-medium capitalize">
                  {user.role.replace('_', ' ')}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile" className="gap-2 cursor-pointer font-medium">
                  <User className="h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="gap-2 text-destructive font-medium">
                <LogOut className="h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav className="lg:hidden border-t border-slate-200/60 bg-white/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition',
                  isActive(link.href)
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50',
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
