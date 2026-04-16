'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, LogOut, Menu, X, Home, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User as UserType } from '@/lib/types';

interface DashboardHeaderProps {
  user: UserType;
  onLogout: () => void;
}

export default function DashboardHeader({ user, onLogout }: DashboardHeaderProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    onLogout();
    router.push('/');
  };

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    ...(user.role === 'citizen'
      ? [
          { href: '/dashboard/chat', label: 'Legal AI', icon: MessageSquare },
          { href: '/dashboard/advocates', label: 'Advocates', icon: User },
        ]
      : []),
    { href: '/dashboard/feedback', label: 'Feedback', icon: MessageSquare },
  ];

  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0">
          <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
            L
          </div>
          <span className="font-bold text-foreground hidden sm:inline">LegalConnect</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground transition"
          >
            Dashboard
          </Link>
          {user.role === 'citizen' && (
            <>
              <Link
                href="/dashboard/chat"
                className="text-sm text-muted-foreground hover:text-foreground transition"
              >
                Legal AI
              </Link>
              <Link
                href="/dashboard/advocates"
                className="text-sm text-muted-foreground hover:text-foreground transition"
              >
                Advocates
              </Link>
            </>
          )}
          <Link
            href="/dashboard/feedback"
            className="text-sm text-muted-foreground hover:text-foreground transition flex items-center gap-1"
          >
            <MessageSquare className="h-4 w-4" />
            Feedback
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline text-sm">{user.name.split(' ')[0]}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5 text-sm">
                <p className="font-medium text-foreground">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                <p className="text-xs text-muted-foreground mt-1 capitalize">
                  {user.role.replace('_', ' ')}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="gap-2 text-destructive">
                <LogOut className="h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <nav className="md:hidden border-t border-border bg-card/95 backdrop-blur-sm">
          <div className="px-4 py-3 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition"
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
