'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { getJob, getPhotosForJob } from '@/lib/storage';
import type { Job, JobPhoto } from '@/lib/types';
import { TRADE_LABELS } from '@/lib/types';

function formatDateTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;
  const reportRef = useRef<HTMLDivElement>(null);

  const [job, setJob] = useState<Job | null>(null);
  const [beforePhotos, setBeforePhotos] = useState<JobPhoto[]>([]);
  const [afterPhotos, setAfterPhotos] = useState<JobPhoto[]>([]);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const j = getJob(jobId);
    if (!j) {
      router.replace('/app');
      return;
    }
    setJob(j);
    Promise.all([
      getPhotosForJob(jobId, 'before'),
      getPhotosForJob(jobId, 'after'),
    ]).then(([b, a]) => {
      setBeforePhotos(b);
      setAfterPhotos(a);
    });
  }, [jobId, router]);

  async function handleDownloadPDF() {
    if (!reportRef.current) return;
    setGenerating(true);

    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = pdfHeight;
      let position = 0;
      const pageHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = -(pdfHeight - heightLeft);
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      const filename = `JobShield-Report-${job?.trade || 'job'}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('PDF generation failed. Try again.');
    } finally {
      setGenerating(false);
    }
  }

  if (!job) return null;

  return (
    <div className="flex-1 flex flex-col bg-gray-100">
      {/* Action bar */}
      <div className="no-print bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-[52px] z-40">
        <button
          onClick={() => router.back()}
          className="text-gray-500 hover:text-navy font-medium text-sm flex items-center gap-1 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <button
          onClick={handleDownloadPDF}
          disabled={generating}
          className="bg-navy hover:bg-navy-light text-white font-semibold px-5 py-2 rounded-lg transition-colors text-sm disabled:opacity-50 flex items-center gap-2"
        >
          {generating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download PDF
            </>
          )}
        </button>
      </div>

      {/* Report content */}
      <div className="p-4">
        <div ref={reportRef} className="bg-white max-w-2xl mx-auto rounded-xl shadow-sm overflow-hidden">
          {/* Report header */}
          <div className="bg-navy text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <svg className="w-7 h-7 text-orange" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span className="text-xl font-bold">JobShield</span>
              </div>
              <span className="text-white/60 text-sm">Job Completion Report</span>
            </div>
            <h1 className="text-2xl font-extrabold mb-1">
              {TRADE_LABELS[job.trade]} — Completion Report
            </h1>
            {job.customerName && (
              <p className="text-white/80">Customer: {job.customerName}</p>
            )}
          </div>

          {/* Job details */}
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Job Details</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Trade</p>
                <p className="font-semibold text-navy">{TRADE_LABELS[job.trade]}</p>
              </div>
              {job.address && (
                <div>
                  <p className="text-gray-400">Address</p>
                  <p className="font-semibold text-navy">{job.address}</p>
                </div>
              )}
              <div>
                <p className="text-gray-400">Date</p>
                <p className="font-semibold text-navy">{formatDate(job.createdAt)}</p>
              </div>
              {job.startedAt && (
                <div>
                  <p className="text-gray-400">Work Started</p>
                  <p className="font-semibold text-navy">{formatDateTime(job.startedAt)}</p>
                </div>
              )}
              {job.completedAt && (
                <div>
                  <p className="text-gray-400">Completed</p>
                  <p className="font-semibold text-navy">{formatDateTime(job.completedAt)}</p>
                </div>
              )}
              {job.startedAt && job.completedAt && (
                <div>
                  <p className="text-gray-400">Duration</p>
                  <p className="font-semibold text-navy">
                    {formatDuration(new Date(job.startedAt), new Date(job.completedAt))}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Before photos */}
          {beforePhotos.length > 0 && (
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Before — Site Condition
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {beforePhotos.map((p, i) => (
                  <div key={p.id} className="space-y-1">
                    <div className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
                      {p.blob && <PhotoDisplay blob={p.blob} alt={`Before ${i + 1}`} />}
                    </div>
                    <p className="text-xs text-gray-500">{p.prompt}</p>
                    <p className="text-xs text-gray-400">{formatDateTime(p.timestamp)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* After photos */}
          {afterPhotos.length > 0 && (
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                After — Completed Work
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {afterPhotos.map((p, i) => (
                  <div key={p.id} className="space-y-1">
                    <div className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
                      {p.blob && <PhotoDisplay blob={p.blob} alt={`After ${i + 1}`} />}
                    </div>
                    <p className="text-xs text-gray-500">{p.prompt}</p>
                    <p className="text-xs text-gray-400">{formatDateTime(p.timestamp)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="p-6 bg-gray-50 text-center">
            <p className="text-xs text-gray-400">
              Generated by JobShield &mdash; {formatDateTime(new Date().toISOString())}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              All photos include original timestamps for verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDuration(start: Date, end: Date) {
  const mins = Math.floor((end.getTime() - start.getTime()) / 60000);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

function PhotoDisplay({ blob, alt }: { blob: Blob; alt: string }) {
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
