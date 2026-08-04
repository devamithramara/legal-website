'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Error Boundary caught an error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex flex-col justify-center items-center p-6 text-center">
      <div className="max-w-md w-full bg-white p-8 rounded-xl border border-[#DCD6C5] shadow-lg space-y-6">
        <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-[#0A1628]">Something went wrong</h2>
          <p className="text-xs text-gray-500 font-medium">
            An unexpected error occurred in the workspace session.
          </p>
        </div>
        <div className="flex gap-3 justify-center pt-2">
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-[#0A1628] hover:bg-[#0A1628]/90 text-white text-xs font-semibold rounded-lg transition"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-4 py-2 bg-[#C9A84C] hover:bg-[#C9A84C]/90 text-[#0A1628] text-xs font-semibold rounded-lg transition inline-block"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
