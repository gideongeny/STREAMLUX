import { ALL_TV_CHANNELS, TVChannel } from './tvChannelMap';

/** Sport channels from the same Live TV catalog used on the Live TV tab */
export const SPORTS_TV_CHANNELS: TVChannel[] = ALL_TV_CHANNELS.filter(
  (ch) => ch.category === 'Sports'
);

export function channelLogoUrl(logo?: string): string | undefined {
  if (!logo) return undefined;
  if (logo.startsWith('http')) return logo;
  return `https://streamlux-67a84.web.app/assets/logos/${logo}.png`;
}

export function channelGradient(name: string): string {
  const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const gradients = [
    'from-blue-950 to-indigo-900',
    'from-red-950 to-orange-900',
    'from-green-950 to-emerald-900',
    'from-purple-950 to-violet-900',
    'from-slate-900 to-blue-950',
    'from-yellow-950 to-amber-900',
  ];
  return gradients[hash % gradients.length];
}
