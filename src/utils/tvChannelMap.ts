import rawChannels from '../data/tvChannels.json';
import kenyanChannels from '../data/kenyanLiveTV.json';
import { KENYA_CHANNEL_ORDER } from './youtubeLiveTV';

export interface TVChannel {
  id: string;
  name: string;
  type: 'iframe' | 'hls' | 'youtube';
  url: string;
  youtubeId?: string;
  category: 'News' | 'Entertainment' | 'Sports' | 'Kids' | 'Lifestyle' | 'Music' | 'Movies' | 'Documentary' | 'Science' | 'Religious' | 'Education' | 'Shopping' | 'Travel';
  country?: string;
  countryCode?: string;
  logo?: string;
  isExternal?: boolean;
  sortOrder?: number;
}

const typedChannels: TVChannel[] = rawChannels as TVChannel[];
const typedKenyan: TVChannel[] = (kenyanChannels as TVChannel[]).sort(
  (a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99)
);

/** Kenyan YouTube live streams first (sorted), then global IPTV catalog */
export const KENYA_TV_CHANNELS: TVChannel[] = typedKenyan;
export const ALL_TV_CHANNELS: TVChannel[] = [...typedKenyan, ...typedChannels];

export function sortChannelsKenyaFirst(channels: TVChannel[]): TVChannel[] {
  const orderMap = new Map(KENYA_CHANNEL_ORDER.map((id, i) => [id, i]));
  return [...channels].sort((a, b) => {
    const aKenya = a.countryCode === 'KE' || orderMap.has(a.id as typeof KENYA_CHANNEL_ORDER[number]);
    const bKenya = b.countryCode === 'KE' || orderMap.has(b.id as typeof KENYA_CHANNEL_ORDER[number]);
    if (aKenya && !bKenya) return -1;
    if (!aKenya && bKenya) return 1;
    const ao = orderMap.get(a.id as typeof KENYA_CHANNEL_ORDER[number]) ?? 999;
    const bo = orderMap.get(b.id as typeof KENYA_CHANNEL_ORDER[number]) ?? 999;
    if (ao !== bo) return ao - bo;
    if (a.type === 'youtube' && b.type !== 'youtube') return -1;
    if (b.type === 'youtube' && a.type !== 'youtube') return 1;
    return a.name.localeCompare(b.name);
  });
}