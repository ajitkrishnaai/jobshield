import Link from 'next/link';

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-navy text-white px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <Link href="/app" className="flex items-center gap-2">
          <ShieldIcon className="w-6 h-6 text-orange" />
          <span className="font-bold text-lg">JobShield</span>
        </Link>
      </header>
      <main className="flex-1 flex flex-col page-enter">
        {children}
      </main>
    </div>
  );
}
