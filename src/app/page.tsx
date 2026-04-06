import Link from 'next/link';

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function FileTextIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function AlertTriangleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="bg-navy text-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldIcon className="w-7 h-7 text-orange" />
            <span className="text-xl font-bold tracking-tight">JobShield</span>
          </div>
          <Link
            href="/app"
            className="bg-orange hover:bg-orange-dark text-white font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
          >
            Open App
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-navy text-white">
        <div className="max-w-4xl mx-auto px-4 py-20 md:py-28 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <ShieldIcon className="w-4 h-4 text-orange" />
            The dashcam for contractors
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
            One claim can cost you{' '}
            <span className="text-orange">thousands.</span>
            <br />
            Prove every job, every time.
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10">
            Document before &amp; after with guided photos. Generate professional
            reports. Send review requests. All from your phone in under 5 minutes.
          </p>
          <Link
            href="/app"
            className="inline-flex items-center gap-2 bg-orange hover:bg-orange-dark text-white font-bold text-lg px-8 py-4 rounded-xl transition-colors shadow-lg shadow-orange/25"
          >
            Start documenting for free
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <p className="text-gray-400 text-sm mt-4">No signup needed. Open and start shooting.</p>
        </div>
      </section>

      {/* Problem */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-extrabold text-navy text-center mb-4">
            You&apos;re one dispute away from a bad month
          </h2>
          <p className="text-gray-500 text-center text-lg mb-12 max-w-2xl mx-auto">
            Small contractors face these problems every week — and most have zero protection.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <AlertTriangleIcon className="w-8 h-8" />,
                title: 'Disputes & false claims',
                desc: '"You cracked my driveway." Without proof of the condition before you arrived, it\'s your word against theirs.',
              },
              {
                icon: <StarIcon className="w-8 h-8" />,
                title: 'Missed reviews',
                desc: 'Happy customers forget to review within hours. By the time you text them, the moment is gone.',
              },
              {
                icon: <FileTextIcon className="w-8 h-8" />,
                title: 'No proof when it matters',
                desc: 'Insurance claims, warranty disputes, quality complaints — you need timestamped evidence you don\'t have.',
              },
            ].map((card) => (
              <div
                key={card.title}
                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-14 h-14 rounded-xl bg-red-50 text-red-500 flex items-center justify-center mb-4">
                  {card.icon}
                </div>
                <h3 className="text-lg font-bold text-navy mb-2">{card.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution / How it works */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-orange font-semibold text-sm uppercase tracking-wide mb-2">
              How it works
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-navy mb-4">
              The dashcam for contractors
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Three steps. Five minutes. Complete protection.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                icon: <CameraIcon className="w-8 h-8" />,
                title: 'Before photos',
                desc: 'Guided prompts tell you exactly what to shoot. Document the work area before you start.',
              },
              {
                step: '2',
                icon: <CheckCircleIcon className="w-8 h-8" />,
                title: 'After photos',
                desc: 'Same guided flow after the job. Timestamped proof of your completed work.',
              },
              {
                step: '3',
                icon: <FileTextIcon className="w-8 h-8" />,
                title: 'Report + Review',
                desc: 'Auto-generated professional report. One-tap review request to the customer.',
              },
            ].map((step) => (
              <div key={step.step} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-orange/10 text-orange flex items-center justify-center mx-auto mb-4">
                  {step.icon}
                </div>
                <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-navy text-white text-xs font-bold mb-3">
                  {step.step}
                </div>
                <h3 className="text-lg font-bold text-navy mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 bg-navy">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-orange/20 text-orange rounded-full px-4 py-1.5 text-sm font-semibold mb-6">
            Early Access
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4">
            Be one of our first 100 contractors
          </h2>
          <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto">
            JobShield is free during early access. Start protecting your work today —
            no credit card, no signup, no catch.
          </p>
          <div className="flex justify-center gap-8 text-center">
            {[
              { num: '5 min', label: 'Per job' },
              { num: '100%', label: 'Free' },
              { num: '0', label: 'Signups needed' },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-2xl md:text-3xl font-extrabold text-orange">{s.num}</div>
                <div className="text-gray-400 text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-navy mb-4">
            Stop risking it. Start proving it.
          </h2>
          <p className="text-gray-500 text-lg mb-8 max-w-xl mx-auto">
            The next time a customer says &quot;you damaged my property,&quot; you&apos;ll have
            timestamped proof that says otherwise.
          </p>
          <Link
            href="/app"
            className="inline-flex items-center gap-2 bg-orange hover:bg-orange-dark text-white font-bold text-lg px-8 py-4 rounded-xl transition-colors shadow-lg shadow-orange/25"
          >
            Start documenting for free
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-dark text-gray-400 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldIcon className="w-5 h-5 text-orange" />
            <span className="text-white font-semibold">JobShield</span>
          </div>
          <p className="text-sm">&copy; 2026 JobShield. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
