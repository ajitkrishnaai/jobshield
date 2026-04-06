'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getJob, saveJob } from '@/lib/storage';
import type { Job } from '@/lib/types';
import { TRADE_LABELS, TRADE_ICONS } from '@/lib/types';

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function ProgressPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const j = getJob(jobId);
    if (!j) {
      router.replace('/app');
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading from localStorage
    setJob(j);

    if (j.startedAt) {
      const start = new Date(j.startedAt).getTime();
      const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000));
      tick();
      const interval = setInterval(tick, 1000);
      return () => clearInterval(interval);
    }
  }, [jobId, router]);

  function handleReady() {
    if (!job) return;
    saveJob({ ...job, status: 'after' });
    router.push(`/app/job/${job.id}/after`);
  }

  if (!job) return null;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-full bg-orange/10 flex items-center justify-center mb-6">
        <span className="text-4xl">{TRADE_ICONS[job.trade]}</span>
      </div>

      <h1 className="text-2xl font-extrabold text-navy mb-2">Work in Progress</h1>
      <p className="text-gray-500 mb-1">{TRADE_LABELS[job.trade]}</p>
      {job.customerName && <p className="text-gray-400 text-sm">{job.customerName}</p>}

      {/* Timer */}
      <div className="my-8">
        <div className="text-5xl font-mono font-bold text-navy tabular-nums">
          {formatTime(elapsed)}
        </div>
        <p className="text-gray-400 text-sm mt-2">Time on job</p>
      </div>

      <button
        onClick={handleReady}
        className="w-full max-w-sm bg-orange hover:bg-orange-dark text-white font-bold text-lg py-4 rounded-xl transition-colors shadow-lg shadow-orange/20"
      >
        Ready to document completion
      </button>

      <button
        onClick={() => router.push('/app')}
        className="mt-4 text-gray-400 hover:text-gray-600 text-sm transition-colors"
      >
        Save &amp; come back later
      </button>
    </div>
  );
}
