export type TradeType = 'roofing' | 'plumbing' | 'hvac' | 'general';

export interface Job {
  id: string;
  trade: TradeType;
  customerName: string;
  address: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  status: 'before' | 'in-progress' | 'after' | 'complete';
}

export interface JobPhoto {
  id: string;
  jobId: string;
  phase: 'before' | 'after';
  prompt: string;
  timestamp: string;
  blob?: Blob;
}

export const TRADE_LABELS: Record<TradeType, string> = {
  roofing: 'Roofing',
  plumbing: 'Plumbing',
  hvac: 'HVAC',
  general: 'General',
};

export const TRADE_ICONS: Record<TradeType, string> = {
  roofing: '🏠',
  plumbing: '🔧',
  hvac: '❄️',
  general: '🔨',
};

export const PHOTO_PROMPTS: Record<TradeType, { before: string[]; after: string[] }> = {
  roofing: {
    before: [
      'Overview of roof area',
      'Close-up of existing shingles or damage',
      'Gutters and drainage',
      'Problem areas to address',
    ],
    after: [
      'Overview of completed roof',
      'Close-up of new shingles',
      'Ridge line',
      'Gutters cleared',
      'Clean job site',
    ],
  },
  plumbing: {
    before: [
      'Work area before',
      'Existing pipe or fixture condition',
      'Under-sink or access panel',
      'Water shutoff location',
    ],
    after: [
      'Completed work area',
      'New fixture or pipe installed',
      'Under-sink tidy',
      'No leaks verified',
    ],
  },
  hvac: {
    before: [
      'Unit before service',
      'Filter condition',
      'Thermostat setting',
      'Visible issues',
    ],
    after: [
      'Unit after service',
      'New filter installed',
      'System running',
      'Clean work area',
    ],
  },
  general: {
    before: [
      'Work area before',
      'Existing condition close-up',
      'Materials and scope',
    ],
    after: [
      'Completed work',
      'Detail shot',
      'Clean site',
    ],
  },
};
