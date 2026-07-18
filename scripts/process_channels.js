const fs = require('fs');
const path = require('path');
const https = require('https');

const M3U_URL = 'https://iptv-org.github.io/iptv/languages/eng.m3u';
const COUNTRIES_API = 'https://iptv-org.github.io/api/countries.json';
const OUTPUT_FILE = path.join(__dirname, '../src/data/tvChannels.json');

// Category mapping logic based on IPTV-org group-titles
const getCategory = (groupTitle, channelName) => {
    const title = (groupTitle || '').toLowerCase();
    const name = (channelName || '').toLowerCase();

    if (title.includes('news') || name.includes('news') || name.includes('cnn') || name.includes('bbc') || name.includes('al jazeera')) return 'News';
    if (title.includes('sport') || name.includes('sport') || name.includes('espn') || name.includes('dazn') || name.includes('bein')) return 'Sports';
    if (title.includes('movie') || title.includes('cinema') || title.includes('film') || name.includes('movie') || name.includes('cinema')) return 'Movies';
    if (title.includes('kid') || title.includes('animation') || name.includes('kid') || name.includes('cartoon') || name.includes('disney') || name.includes('nickelodeon')) return 'Kids';
    if (title.includes('music') || name.includes('music') || name.includes('vevo') || name.includes('mtv') || name.includes('viva')) return 'Music';
    if (title.includes('documentary') || title.includes('history') || title.includes('nature') || name.includes('docu') || name.includes('discovery') || name.includes('nat geo')) return 'Documentary';
    if (title.includes('science') || title.includes('tech') || name.includes('science') || name.includes('technology')) return 'Science';
    if (name.includes('religion') || name.includes('church') || name.includes('christian') || name.includes('islam') || title.includes('religious')) return 'Religious';
    if (title.includes('education') || title.includes('learn') || name.includes('edu')) return 'Education';
    if (title.includes('shop') || name.includes('qvc') || name.includes('hsn')) return 'Shopping';
    if (title.includes('travel') || name.includes('travel') || name.includes('tourism')) return 'Travel';
    if (title.includes('lifestyle') || title.includes('cook') || name.includes('lifestyle') || name.includes('fashion')) return 'Lifestyle';
    
    return 'Entertainment'; // Default
};

const fetchData = (url) => {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
};

const parseM3U = (data, countryMap) => {
    const lines = data.split('\n');
    const channels = [];
    let currentChannel = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('#EXTINF:')) {
            const idMatch = line.match(/tvg-id="([^"]*)"/);
            const logoMatch = line.match(/tvg-logo="([^"]*)"/);
            const groupMatch = line.match(/group-title="([^"]*)"/);
            const nameMatch = line.match(/,(.*)$/);

            const name = nameMatch ? nameMatch[1].trim() : 'Unknown Channel';
            const tvgId = idMatch ? idMatch[1] : '';
            
            // Extract country code from tvg-id (e.g. "CNN.us" -> "us")
            let countryCode = '';
            if (tvgId.includes('.')) {
                const parts = tvgId.split('.');
                const potentialCode = parts[parts.length -1].split('@')[0].toLowerCase();
                if (potentialCode.length === 2) {
                    countryCode = potentialCode;
                }
            }

            const countryName = countryMap[countryCode] || 'Global';

            currentChannel = {
                id: tvgId || name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                name: name,
                type: 'hls',
                url: '',
                category: getCategory(groupMatch ? groupMatch[1] : '', name),
                country: countryName,
                countryCode: countryCode.toUpperCase(),
                logo: logoMatch ? logoMatch[1] : '',
                isExternal: false
            };
        } else if (line.startsWith('http') && currentChannel) {
            currentChannel.url = line;
            if (currentChannel.url.includes('.m3u8')) {
                channels.push(currentChannel);
            }
            currentChannel = null;
        }
    }
    return channels;
};

const run = async () => {
    console.log('Fetching Country Metadata...');
    const countryData = JSON.parse(await fetchData(COUNTRIES_API));
    const countryMap = {};
    countryData.forEach(c => {
        countryMap[c.code.toLowerCase()] = c.name;
    });

    console.log('Fetching M3U source...');
    const m3uContent = await fetchData(M3U_URL);
    
    console.log('Parsing channels with country metadata...');
    const newChannels = parseM3U(m3uContent, countryMap);

    // Read existing premium channels
    console.log('Reading existing database...');
    const existingContent = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
    
    // Ensure existing channels have country info if missing
    existingContent.forEach(c => {
        if (!c.country) {
            // Most existing ones are US/UK based on prior knowledge
            if (c.url.includes('code=us')) {
                c.country = 'United States';
                c.countryCode = 'US';
            } else {
                c.country = 'Global';
                c.countryCode = 'WW';
            }
        }
    });

    const existingIds = new Set(existingContent.map(c => c.id));
    const existingUrls = new Set(existingContent.map(c => c.url));

    const filteredNew = newChannels.filter(c => 
        !existingIds.has(c.id) && 
        !existingUrls.has(c.url) &&
        c.logo !== ''
    );

    const totalToKeep = 2000 - existingContent.length;
    const limitedNew = filteredNew.slice(0, totalToKeep);

    const finalChannels = [...existingContent, ...limitedNew];

    console.log(`Successfully merged. Total channels: ${finalChannels.length}`);
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalChannels, null, 2));
    console.log('Update complete.');
};

run().catch(console.error);
