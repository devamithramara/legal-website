'use client';

import React, { useState, useEffect } from 'react';
import { signIn, useSession, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/providers';

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Redirect if already logged in
    if (status === 'authenticated' && session?.user) {
      handleRoleRedirect(session.user.role);
    }
  }, [status, session]);

  const handleRoleRedirect = (role?: string) => {
    if (role === 'ADMIN') {
      window.location.href = '/admin';
    } else if (role === 'JUNIOR' || role === 'INTERN') {
      window.location.href = '/junior';
    } else if (role === 'SENIOR') {
      window.location.href = '/senior/dashboard';
    } else if (role === 'CLIENT') {
      window.location.href = '/dashboard';
    } else {
      window.location.href = '/admin';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      toast('Please enter both email and password.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await signIn('credentials', {
        email: cleanEmail,
        password,
        redirect: false,
      });

      if (res?.error) {
        toast(
          res.error === 'CredentialsSignin'
            ? 'Incorrect email or password. Please check your credentials.'
            : res.error,
          'error'
        );
        setLoading(false);
      } else {
        toast('Logged in successfully! Redirecting...', 'success');
        const session = await getSession();
        handleRoleRedirect(session?.user?.role);
      }
    } catch (err: any) {
      toast(err?.message || 'An unexpected error occurred during login.', 'error');
      setLoading(false);
    }
  };

  const handleQuickLogin = async (roleEmail: string, rolePass: string, label: string) => {
    setLoading(true);
    setEmail(roleEmail);
    setPassword(rolePass);
    try {
      const res = await signIn('credentials', {
        email: roleEmail.toLowerCase(),
        password: rolePass,
        redirect: false,
      });

      if (res?.error) {
        toast(
          res.error === 'CredentialsSignin'
            ? 'Incorrect credentials for ' + label
            : res.error,
          'error'
        );
        setLoading(false);
      } else {
        toast(`Logged in as ${label}! Redirecting...`, 'success');
        const session = await getSession();
        handleRoleRedirect(session?.user?.role);
      }
    } catch (err: any) {
      toast(err?.message || 'An unexpected error occurred.', 'error');
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F5F0E8] min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-[#0A1628] border-t-[#C9A84C] rounded-full animate-spin"></div>
          <p className="text-[#0A1628] font-medium text-sm">Securing Connection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-[#F5F0E8] px-4 py-12 min-h-screen relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#C9A84C]/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-[#0A1628]/10 blur-[150px]" />

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-heading text-[#0A1628] tracking-wider mb-2">MLR ASSOCIATES</h1>
          <p className="text-sm text-gray-600 font-medium">Advocate &amp; Law Firm Management Console</p>
        </div>

        <Card className="border border-[#DCD6C5] shadow-xl bg-white/80 backdrop-blur-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-heading text-[#0A1628]">Sign In</CardTitle>
            <CardDescription className="text-gray-500">
              Access your personalized firm workspace
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#0A1628] font-semibold">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@firm.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-[#DCD6C5] focus:border-[#C9A84C] focus:ring-[#C9A84C]"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#0A1628] font-semibold">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-[#DCD6C5] focus:border-[#C9A84C] focus:ring-[#C9A84C]"
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full bg-[#0A1628] text-[#F5F0E8] hover:bg-[#0A1628]/90 focus:ring-2 focus:ring-[#C9A84C] font-semibold py-2"
                disabled={loading}
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </Button>
              
              <div className="relative w-full my-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-[#DCD6C5]" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#F5F0E8] px-2 text-gray-500 font-semibold">Demo Quick Access</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 w-full">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin@firm.com', 'admin123', 'Admin')}
                  className="text-xs bg-[#0A1628]/5 border border-[#0A1628]/20 hover:border-[#C9A84C] hover:bg-[#0A1628]/10 text-[#0A1628] font-semibold py-2 px-1 rounded transition duration-200"
                  disabled={loading}
                >
                  Admin Portal
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('junior@firm.com', 'junior123', 'Junior')}
                  className="text-xs bg-[#0A1628]/5 border border-[#0A1628]/20 hover:border-[#C9A84C] hover:bg-[#0A1628]/10 text-[#0A1628] font-semibold py-2 px-1 rounded transition duration-200"
                  disabled={loading}
                >
                  Junior Hub
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('client@firm.com', 'client123', 'Client')}
                  className="text-xs bg-[#0A1628]/5 border border-[#0A1628]/20 hover:border-[#C9A84C] hover:bg-[#0A1628]/10 text-[#0A1628] font-semibold py-2 px-1 rounded transition duration-200"
                  disabled={loading}
                >
                  Client Desk
                </button>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
