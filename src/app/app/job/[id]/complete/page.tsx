'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getJob, getPhotosForJob } from '@/lib/storage';
import type { Job, JobPhoto } from '@/lib/types';
import { TRADE_LABELS, TRADE_ICONS } from '@/lib/types';

export default function CompletePage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [beforePhotos, setBeforePhotos] = useState<JobPhoto[]>([]);
  const [afterPhotos, setAfterPhotos] = useState<JobPhoto[]>([]);
  const [smsText, setSmsText] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const j = getJob(jobId);
    if (!j) {
      router.replace('/app');
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading from localStorage/IndexedDB
    setJob(j);

    const name = j.customerName || 'there';
    setSmsText(
      `Hi ${name}, it was great working with you today! If you were happy with the work, a quick review would mean the world to us: [your review link]`
    );

    Promise.all([
      getPhotosForJob(jobId, 'before'),
      getPhotosForJob(jobId, 'after'),
    ]).then(([b, a]) => {
      setBeforePhotos(b);
      setAfterPhotos(a);
    });
  }, [jobId, router]);

  function handleCopy() {
    navigator.clipboard.writeText(smsText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (!job) return null;

  return (
    <div className="flex-1 flex flex-col p-4 max-w-lg mx-auto w-full">
      {/* Success header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-extrabold text-navy">Job Complete!</h1>
        <p className="text-gray-500 mt-1">
          {TRADE_ICONS[job.trade]} {TRADE_LABELS[job.trade]}
          {job.customerName ? ` — ${job.customerName}` : ''}
        </p>
      </div>

      {/* Photo grid */}
      <div className="mb-6">
        {beforePhotos.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Before ({beforePhotos.length})
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {beforePhotos.map((p, i) => (
                <div key={p.id} className="aspect-square rounded-lg overflow-hidden bg-gray-200">
                  {p.blob && <PhotoThumb blob={p.blob} alt={`Before ${i + 1}`} />}
                </div>
              ))}
            </div>
          </div>
        )}
        {afterPhotos.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
              After ({afterPhotos.length})
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {afterPhotos.map((p, i) => (
                <div key={p.id} className="aspect-square rounded-lg overflow-hidden bg-gray-200">
                  {p.blob && <PhotoThumb blob={p.blob} alt={`After ${i + 1}`} />}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-3 mb-6">
        <Link
          href={`/app/job/${job.id}/report`}
          className="w-full bg-navy hover:bg-navy-light text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          View Report
        </Link>
      </div>

      {/* Review request */}
      <div className="bg-orange/5 border border-orange/20 rounded-xl p-4">
        <h3 className="font-bold text-navy mb-2 flex items-center gap-2">
          <svg className="w-5 h-5 text-orange" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Send Review Request
        </h3>
        <p className="text-sm text-gray-500 mb-3">Copy this message and send it to your customer via SMS:</p>
        <textarea
          value={smsText}
          onChange={(e) => setSmsText(e.target.value)}
          rows={3}
          className="w-full p-3 border border-gray-200 rounded-lg text-sm text-navy bg-white resize-none focus:outline-none focus:ring-2 focus:ring-orange/30"
        />
        <button
          onClick={handleCopy}
          className="mt-2 w-full bg-orange hover:bg-orange-dark text-white font-semibold py-3 rounded-lg transition-colors text-sm"
        >
          {copied ? 'Copied!' : 'Copy to Clipboard'}
        </button>
      </div>

      {/* Back to home */}
      <Link
        href="/app"
        className="mt-6 text-center text-gray-400 hover:text-gray-600 text-sm transition-colors block"
      >
        Back to all jobs
      </Link>
    </div>
  );
}

function PhotoThumb({ blob, alt }: { blob: Blob; alt: string }) {
  const [url, setUrl] = useState<string>('');
  useEffect(() => {
    const u = URL.createObjectURL(blob);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- blob URL from IndexedDB
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);
  // eslint-disable-next-line @next/next/no-img-element -- blob URL
  return url ? <img src={url} alt={alt} className="w-full h-full object-cover" /> : null;
}
