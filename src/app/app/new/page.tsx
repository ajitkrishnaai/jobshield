'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveJob, generateId } from '@/lib/storage';
import type { TradeType } from '@/lib/types';
import { TRADE_LABELS, TRADE_ICONS } from '@/lib/types';

const TRADES: TradeType[] = ['roofing', 'plumbing', 'hvac', 'general'];

export default function NewJobPage() {
  const router = useRouter();
  const [trade, setTrade] = useState<TradeType | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState('');

  function handleStart() {
    if (!trade) return;
    const id = generateId();
    saveJob({
      id,
      trade,
      customerName: customerName.trim(),
      address: address.trim(),
      createdAt: new Date().toISOString(),
      status: 'before',
    });
    router.push(`/app/job/${id}/before`);
  }

  return (
    <div className="flex-1 flex flex-col p-4 max-w-lg mx-auto w-full">
      <h1 className="text-2xl font-extrabold text-navy mb-6">New Job</h1>

      {/* Trade selection */}
      <label className="text-sm font-semibold text-gray-700 mb-3 block">Select trade</label>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {TRADES.map((t) => (
          <button
            key={t}
            onClick={() => setTrade(t)}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
              trade === t
                ? 'border-orange bg-orange/5 shadow-sm'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <span className="text-2xl">{TRADE_ICONS[t]}</span>
            <span className="font-semibold text-navy">{TRADE_LABELS[t]}</span>
          </button>
        ))}
      </div>

      {/* Customer info */}
      <label className="text-sm font-semibold text-gray-700 mb-2 block">
        Customer name <span className="text-gray-400 font-normal">(optional)</span>
      </label>
      <input
        type="text"
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
        placeholder="e.g. John Smith"
        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange mb-4"
      />

      <label className="text-sm font-semibold text-gray-700 mb-2 block">
        Address <span className="text-gray-400 font-normal">(optional)</span>
      </label>
      <input
        type="text"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="e.g. 123 Main St"
        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange mb-8"
      />

      {/* Start button */}
      <button
        onClick={handleStart}
        disabled={!trade}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
          trade
            ? 'bg-orange hover:bg-orange-dark text-white shadow-lg shadow-orange/20'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        Start Documenting
      </button>
    </div>
  );
}
