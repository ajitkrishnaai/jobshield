'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { getJob, saveJob, savePhoto, getPhotosForJob, generateId } from '@/lib/storage';
import type { Job, JobPhoto } from '@/lib/types';
import { PHOTO_PROMPTS, TRADE_LABELS } from '@/lib/types';
import CameraCapture from '@/components/CameraCapture';

export default function AfterPhotosPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [photos, setPhotos] = useState<JobPhoto[]>([]);
  const [currentPromptIdx, setCurrentPromptIdx] = useState(0);
  const [lastThumbnail, setLastThumbnail] = useState<string | null>(null);

  useEffect(() => {
    const j = getJob(jobId);
    if (!j) {
      router.replace('/app');
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading from localStorage/IndexedDB
    setJob(j);
    getPhotosForJob(jobId, 'after').then((p) => {
      setPhotos(p);
      setCurrentPromptIdx(p.length);
    });
  }, [jobId, router]);

  const prompts = useMemo(() => (job ? PHOTO_PROMPTS[job.trade].after : []), [job]);

  const handleCapture = useCallback(
    async (blob: Blob) => {
      if (!job) return;
      const photo: JobPhoto = {
        id: generateId(),
        jobId: job.id,
        phase: 'after',
        prompt: prompts[currentPromptIdx],
        timestamp: new Date().toISOString(),
        blob,
      };
      await savePhoto(photo);
      const url = URL.createObjectURL(blob);
      setLastThumbnail(url);
      setPhotos((prev) => [...prev, photo]);

      if (currentPromptIdx + 1 >= prompts.length) {
        saveJob({ ...job, status: 'complete', completedAt: new Date().toISOString() });
        setTimeout(() => router.push(`/app/job/${job.id}/complete`), 800);
      } else {
        setTimeout(() => {
          setCurrentPromptIdx((i) => i + 1);
          setLastThumbnail(null);
        }, 600);
      }
    },
    [job, currentPromptIdx, prompts, router]
  );

  if (!job) return null;

  const progress = prompts.length > 0 ? ((currentPromptIdx) / prompts.length) * 100 : 0;
  const isDone = currentPromptIdx >= prompts.length;

  return (
    <div className="flex-1 flex flex-col bg-navy-dark">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-green-400 text-xs font-semibold uppercase tracking-wide">After Photos</p>
            <p className="text-white text-sm">{TRADE_LABELS[job.trade]} {job.customerName ? `— ${job.customerName}` : ''}</p>
          </div>
          <span className="text-white/60 text-sm font-medium">
            {Math.min(currentPromptIdx + 1, prompts.length)} / {prompts.length}
          </span>
        </div>
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-400 rounded-full transition-all duration-500"
            style={{ width: `${isDone ? 100 : progress}%` }}
          />
        </div>
      </div>

      {/* Camera */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-4">
        {lastThumbnail ? (
          <div className="w-full max-w-sm aspect-[3/4] rounded-2xl overflow-hidden relative">
            {/* eslint-disable-next-line @next/next/no-img-element -- blob URL */}
            <img src={lastThumbnail} alt="Captured" className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-green-500/90 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>
          </div>
        ) : !isDone ? (
          <CameraCapture
            prompt={prompts[currentPromptIdx]}
            onCapture={handleCapture}
          />
        ) : null}
      </div>

      {/* Photo thumbnails */}
      {photos.length > 0 && (
        <div className="px-4 pb-4">
          <div className="flex gap-2 overflow-x-auto">
            {photos.map((p, i) => (
              <div key={p.id} className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border-2 border-white/20">
                {p.blob && <PhotoThumb blob={p.blob} alt={`After ${i + 1}`} />}
              </div>
            ))}
          </div>
        </div>
      )}

      {!isDone && !lastThumbnail && (
        <div className="px-4 pb-6 text-center">
          <button
            onClick={() => {
              saveJob({ ...job, status: 'complete', completedAt: new Date().toISOString() });
              router.push(`/app/job/${job.id}/complete`);
            }}
            className="text-white/40 hover:text-white/60 text-sm underline transition-colors"
          >
            Skip remaining &amp; complete
          </button>
        </div>
      )}
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
