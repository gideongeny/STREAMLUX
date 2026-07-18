const fs = require('fs');
const json = JSON.parse(fs.readFileSync('./dist/live_channels.json', 'utf8'));
const tsContent = `export interface TVChannel {
  id: string;
  name: string;
  type: 'iframe' | 'hls';
  url: string;
  category: 'News' | 'Entertainment' | 'Sports' | 'Kids' | 'Lifestyle' | 'Music';
  logo?: string;
  isExternal?: boolean;
}

export const ALL_TV_CHANNELS: TVChannel[] = ${JSON.stringify(json, null, 2)};`;

fs.writeFileSync('./src/utils/tvChannelMap.ts', tsContent);
console.log('Updated tvChannelMap.ts with JSON array');
