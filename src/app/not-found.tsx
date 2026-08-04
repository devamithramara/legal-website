import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F5F0E8] flex flex-col justify-center items-center p-6 text-center">
      <div className="max-w-md w-full bg-white p-8 rounded-xl border border-[#DCD6C5] shadow-lg space-y-6">
        <h1 className="text-6xl font-extrabold text-[#C9A84C]">404</h1>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-[#0A1628]">Page Not Found</h2>
          <p className="text-xs text-gray-500 font-medium">
            The page or record you are looking for does not exist or has been moved.
          </p>
        </div>
        <Link
          href="/"
          className="inline-block px-5 py-2.5 bg-[#0A1628] hover:bg-[#0A1628]/90 text-white text-xs font-semibold rounded-lg transition"
        >
          Return to Workspace
        </Link>
      </div>
    </div>
  );
}
