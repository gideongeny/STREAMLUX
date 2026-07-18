export function buildVidVaultUrl(
  mediaType: 'movie' | 'tv',
  tmdbId: string | number,
  season?: number,
  episode?: number
): string {
  const id = String(tmdbId).trim();
  if (mediaType === 'tv' && season != null && episode != null) {
    return `https://vidvault.ru/tv/${id}/${season}/${episode}`;
  }
  if (mediaType === 'tv') {
    return `https://vidvault.ru/tv/${id}`;
  }
  return `https://vidvault.ru/movie/${id}`;
}
