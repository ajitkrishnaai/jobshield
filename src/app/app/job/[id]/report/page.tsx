'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
// reportRef kept for potential future use
import { getJob, getPhotosForJob, blobToDataUrl } from '@/lib/storage';
import type { Job } from '@/lib/types';
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
  const reportRef = useRef<HTMLDivElement>(null); // kept for potential print view

  interface PhotoWithDataUrl {
    id: string;
    prompt: string;
    timestamp: string;
    dataUrl: string;
  }

  const [job, setJob] = useState<Job | null>(null);
  const [beforePhotos, setBeforePhotos] = useState<PhotoWithDataUrl[]>([]);
  const [afterPhotos, setAfterPhotos] = useState<PhotoWithDataUrl[]>([]);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const j = getJob(jobId);
    if (!j) {
      router.replace('/app');
      return;
    }
    setJob(j);

    async function loadPhotos() {
      const [bPhotos, aPhotos] = await Promise.all([
        getPhotosForJob(jobId, 'before'),
        getPhotosForJob(jobId, 'after'),
      ]);

      const convert = async (photos: typeof bPhotos): Promise<PhotoWithDataUrl[]> => {
        const results: PhotoWithDataUrl[] = [];
        for (const p of photos) {
          if (p.blob) {
            const dataUrl = await blobToDataUrl(p.blob);
            results.push({ id: p.id, prompt: p.prompt, timestamp: p.timestamp, dataUrl });
          }
        }
        return results;
      };

      setBeforePhotos(await convert(bPhotos));
      setAfterPhotos(await convert(aPhotos));
    }

    loadPhotos();
  }, [jobId, router]);

  async function handleDownloadPDF() {
    if (!job) return;
    setGenerating(true);

    try {
      const { jsPDF } = await import('jspdf');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 14;
      const contentW = pageW - margin * 2;
      let y = 0;

      // Header bar
      pdf.setFillColor(15, 27, 45); // navy
      pdf.rect(0, 0, pageW, 38, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('JobShield', margin, 16);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Job Completion Report', pageW - margin, 16, { align: 'right' });
      pdf.setFontSize(13);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${TRADE_LABELS[job.trade]} — Completion Report`, margin, 28);
      if (job.customerName) {
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Customer: ${job.customerName}`, margin, 35);
      }
      y = 48;

      // Job details section
      pdf.setTextColor(80, 80, 80);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text('JOB DETAILS', margin, y);
      y += 5;
      pdf.setDrawColor(220, 220, 220);
      pdf.line(margin, y, pageW - margin, y);
      y += 5;

      const details: [string, string][] = [
        ['Trade', TRADE_LABELS[job.trade]],
        ...(job.address ? [['Address', job.address] as [string, string]] : []),
        ['Date', formatDate(job.createdAt)],
        ...(job.startedAt ? [['Work Started', formatDateTime(job.startedAt)] as [string, string]] : []),
        ...(job.completedAt ? [['Completed', formatDateTime(job.completedAt)] as [string, string]] : []),
        ...(job.startedAt && job.completedAt
          ? [['Duration', formatDuration(new Date(job.startedAt), new Date(job.completedAt))] as [string, string]]
          : []),
      ];

      const colW = contentW / 2;
      details.forEach(([label, value], i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = margin + col * colW;
        const rowY = y + row * 12;
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(150, 150, 150);
        pdf.text(label, x, rowY);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(15, 27, 45);
        pdf.text(value, x, rowY + 5);
      });
      y += Math.ceil(details.length / 2) * 12 + 8;

      // Helper to add a photo section
      async function addPhotoSection(photos: typeof beforePhotos, title: string) {
        if (photos.length === 0) return;

        if (y > pageH - 60) { pdf.addPage(); y = margin; }

        pdf.setTextColor(80, 80, 80);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.text(title, margin, y);
        y += 5;
        pdf.setDrawColor(220, 220, 220);
        pdf.line(margin, y, pageW - margin, y);
        y += 5;

        const photoW = (contentW - 6) / 2;
        const photoH = photoW * 0.75; // 4:3

        for (let i = 0; i < photos.length; i++) {
          const col = i % 2;
          const x = margin + col * (photoW + 6);

          if (col === 0 && i > 0) y += photoH + 14;
          if (y + photoH > pageH - margin) { pdf.addPage(); y = margin; }

          try {
            pdf.addImage(photos[i].dataUrl, 'JPEG', x, y, photoW, photoH);
          } catch {
            pdf.setFillColor(240, 240, 240);
            pdf.rect(x, y, photoW, photoH, 'F');
            pdf.setFontSize(8);
            pdf.setTextColor(150, 150, 150);
            pdf.text('Photo unavailable', x + photoW / 2, y + photoH / 2, { align: 'center' });
          }

          pdf.setFontSize(7);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(80, 80, 80);
          pdf.text(photos[i].prompt, x, y + photoH + 4, { maxWidth: photoW });
          pdf.setTextColor(150, 150, 150);
          pdf.text(formatDateTime(photos[i].timestamp), x, y + photoH + 9, { maxWidth: photoW });
        }
        y += photoH + 16;
      }

      await addPhotoSection(beforePhotos, 'BEFORE — SITE CONDITION');
      await addPhotoSection(afterPhotos, 'AFTER — COMPLETED WORK');

      // Footer
      if (y > pageH - 20) { pdf.addPage(); y = pageH - 16; }
      pdf.setDrawColor(220, 220, 220);
      pdf.line(margin, pageH - 14, pageW - margin, pageH - 14);
      pdf.setFontSize(7);
      pdf.setTextColor(150, 150, 150);
      pdf.setFont('helvetica', 'normal');
      pdf.text(
        `Generated by JobShield · ${formatDateTime(new Date().toISOString())} · All photos include original timestamps for verification.`,
        pageW / 2,
        pageH - 8,
        { align: 'center' }
      );

      const filename = `JobShield-Report-${job.trade}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert(`PDF generation failed: ${err instanceof Error ? err.message : String(err)}`);
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
        <div className="bg-white max-w-2xl mx-auto rounded-xl shadow-sm overflow-hidden">
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
                      {/* eslint-disable-next-line @next/next/no-img-element -- data URL for PDF capture */}
                      <img src={p.dataUrl} alt={`Before ${i + 1}`} className="w-full h-full object-cover" />
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
                      {/* eslint-disable-next-line @next/next/no-img-element -- data URL for PDF capture */}
                      <img src={p.dataUrl} alt={`After ${i + 1}`} className="w-full h-full object-cover" />
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

