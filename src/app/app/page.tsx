'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getJobs } from '@/lib/storage';
import type { Job } from '@/lib/types';
import { TRADE_LABELS, TRADE_ICONS } from '@/lib/types';

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function statusLabel(status: Job['status']) {
  switch (status) {
    case 'before': return 'Taking before photos';
    case 'in-progress': return 'Work in progress';
    case 'after': return 'Taking after photos';
    case 'complete': return 'Complete';
  }
}

function statusColor(status: Job['status']) {
  switch (status) {
    case 'before': return 'bg-blue-100 text-blue-700';
    case 'in-progress': return 'bg-yellow-100 text-yellow-700';
    case 'after': return 'bg-purple-100 text-purple-700';
    case 'complete': return 'bg-green-100 text-green-700';
  }
}

function jobLink(job: Job) {
  switch (job.status) {
    case 'before': return `/app/job/${job.id}/before`;
    case 'in-progress': return `/app/job/${job.id}/progress`;
    case 'after': return `/app/job/${job.id}/after`;
    case 'complete': return `/app/job/${job.id}/complete`;
  }
}

export default function AppHome() {
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading from localStorage
    setJobs(getJobs());
  }, []);

  return (
    <div className="flex-1 flex flex-col p-4 max-w-lg mx-auto w-full">
      <Link
        href="/app/new"
        className="bg-orange hover:bg-orange-dark text-white font-bold text-lg py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-lg shadow-orange/20 mb-8"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        New Job
      </Link>

      {jobs.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-navy mb-1">No jobs yet</h2>
          <p className="text-gray-500 text-sm">Tap &quot;New Job&quot; to start documenting</p>
        </div>
      ) : (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Recent Jobs</h2>
          <div className="space-y-3">
            {jobs.map((job) => (
              <Link
                key={job.id}
                href={jobLink(job)}
                className="block bg-white rounded-xl p-4 border border-gray-200 hover:border-orange/30 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{TRADE_ICONS[job.trade]}</span>
                      <span className="font-semibold text-navy">{TRADE_LABELS[job.trade]}</span>
                    </div>
                    {job.customerName && (
                      <p className="text-sm text-gray-600 truncate">{job.customerName}</p>
                    )}
                    {job.address && (
                      <p className="text-xs text-gray-400 truncate">{job.address}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{formatDate(job.createdAt)}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${statusColor(job.status)}`}>
                    {statusLabel(job.status)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
