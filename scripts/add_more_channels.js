// scripts/add_more_channels.js
// Generates additional TV channels and merges into tvChannels.json
const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '../src/data/tvChannels.json');
const existing = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const existingIds = new Set(existing.map(c => c.id));

// Base URL template for cdnlivetv
const u = (name, country = 'us') =>
  `https://cdnlivetv.tv/api/v1/channels/player/?name=${encodeURIComponent(name)}&code=${country}&user=cdnlivetv&plan=free`;

const newChannels = [
  // ===== UK =====
  { id: 'bbc-one', name: 'BBC One', type: 'iframe', url: u('BBC One','gb'), category: 'Entertainment', country: 'United Kingdom', countryCode: 'GB' },
  { id: 'bbc-two', name: 'BBC Two', type: 'iframe', url: u('BBC Two','gb'), category: 'Entertainment', country: 'United Kingdom', countryCode: 'GB' },
  { id: 'bbc-three', name: 'BBC Three', type: 'iframe', url: u('BBC Three','gb'), category: 'Entertainment', country: 'United Kingdom', countryCode: 'GB' },
  { id: 'bbc-four', name: 'BBC Four', type: 'iframe', url: u('BBC Four','gb'), category: 'Documentary', country: 'United Kingdom', countryCode: 'GB' },
  { id: 'bbc-news', name: 'BBC News', type: 'iframe', url: u('BBC News','gb'), category: 'News', country: 'United Kingdom', countryCode: 'GB' },
  { id: 'bbc-world-news', name: 'BBC World News', type: 'iframe', url: u('BBC World News','gb'), category: 'News', country: 'United Kingdom', countryCode: 'GB' },
  { id: 'itv', name: 'ITV', type: 'iframe', url: u('ITV','gb'), category: 'Entertainment', country: 'United Kingdom', countryCode: 'GB' },
  { id: 'itv2', name: 'ITV2', type: 'iframe', url: u('ITV2','gb'), category: 'Entertainment', country: 'United Kingdom', countryCode: 'GB' },
  { id: 'channel-4', name: 'Channel 4', type: 'iframe', url: u('Channel 4','gb'), category: 'Entertainment', country: 'United Kingdom', countryCode: 'GB' },
  { id: 'channel-5', name: 'Channel 5', type: 'iframe', url: u('Channel 5','gb'), category: 'Entertainment', country: 'United Kingdom', countryCode: 'GB' },
  { id: 'sky-news', name: 'Sky News', type: 'iframe', url: u('Sky News','gb'), category: 'News', country: 'United Kingdom', countryCode: 'GB' },
  { id: 'sky-sports-1', name: 'Sky Sports 1', type: 'iframe', url: u('Sky Sports 1','gb'), category: 'Sports', country: 'United Kingdom', countryCode: 'GB' },
  { id: 'sky-sports-2', name: 'Sky Sports 2', type: 'iframe', url: u('Sky Sports 2','gb'), category: 'Sports', country: 'United Kingdom', countryCode: 'GB' },
  { id: 'bt-sport', name: 'BT Sport', type: 'iframe', url: u('BT Sport','gb'), category: 'Sports', country: 'United Kingdom', countryCode: 'GB' },
  { id: 'eurosport-uk', name: 'Eurosport UK', type: 'iframe', url: u('Eurosport UK','gb'), category: 'Sports', country: 'United Kingdom', countryCode: 'GB' },
  { id: 'dave', name: 'Dave', type: 'iframe', url: u('Dave','gb'), category: 'Entertainment', country: 'United Kingdom', countryCode: 'GB' },
  { id: 'e4', name: 'E4', type: 'iframe', url: u('E4','gb'), category: 'Entertainment', country: 'United Kingdom', countryCode: 'GB' },
  { id: 'more4', name: 'More4', type: 'iframe', url: u('More4','gb'), category: 'Entertainment', country: 'United Kingdom', countryCode: 'GB' },
  { id: 'film4-uk', name: 'Film4', type: 'iframe', url: u('Film4','gb'), category: 'Movies', country: 'United Kingdom', countryCode: 'GB' },
  { id: 'mtv-uk', name: 'MTV UK', type: 'iframe', url: u('MTV UK','gb'), category: 'Music', country: 'United Kingdom', countryCode: 'GB' },
  
  // ===== Germany =====
  { id: 'das-erste', name: 'Das Erste', type: 'iframe', url: u('Das Erste','de'), category: 'Entertainment', country: 'Germany', countryCode: 'DE' },
  { id: 'zdf', name: 'ZDF', type: 'iframe', url: u('ZDF','de'), category: 'Entertainment', country: 'Germany', countryCode: 'DE' },
  { id: 'rtl-de', name: 'RTL', type: 'iframe', url: u('RTL','de'), category: 'Entertainment', country: 'Germany', countryCode: 'DE' },
  { id: 'sat1', name: 'Sat.1', type: 'iframe', url: u('Sat.1','de'), category: 'Entertainment', country: 'Germany', countryCode: 'DE' },
  { id: 'pro7', name: 'ProSieben', type: 'iframe', url: u('ProSieben','de'), category: 'Entertainment', country: 'Germany', countryCode: 'DE' },
  { id: 'vox-de', name: 'VOX', type: 'iframe', url: u('VOX','de'), category: 'Entertainment', country: 'Germany', countryCode: 'DE' },
  { id: 'n24', name: 'N24', type: 'iframe', url: u('N24','de'), category: 'News', country: 'Germany', countryCode: 'DE' },
  { id: 'zdf-neo', name: 'ZDFneo', type: 'iframe', url: u('ZDFneo','de'), category: 'Entertainment', country: 'Germany', countryCode: 'DE' },
  { id: 'sport1-de', name: 'Sport1', type: 'iframe', url: u('Sport1','de'), category: 'Sports', country: 'Germany', countryCode: 'DE' },
  { id: 'eurosport-de', name: 'Eurosport DE', type: 'iframe', url: u('Eurosport DE','de'), category: 'Sports', country: 'Germany', countryCode: 'DE' },

  // ===== France =====
  { id: 'tf1', name: 'TF1', type: 'iframe', url: u('TF1','fr'), category: 'Entertainment', country: 'France', countryCode: 'FR' },
  { id: 'france-2', name: 'France 2', type: 'iframe', url: u('France 2','fr'), category: 'Entertainment', country: 'France', countryCode: 'FR' },
  { id: 'france-3', name: 'France 3', type: 'iframe', url: u('France 3','fr'), category: 'Entertainment', country: 'France', countryCode: 'FR' },
  { id: 'france-4', name: 'France 4', type: 'iframe', url: u('France 4','fr'), category: 'Entertainment', country: 'France', countryCode: 'FR' },
  { id: 'france-5', name: 'France 5', type: 'iframe', url: u('France 5','fr'), category: 'Documentary', country: 'France', countryCode: 'FR' },
  { id: 'france-24', name: 'France 24', type: 'iframe', url: u('France 24','fr'), category: 'News', country: 'France', countryCode: 'FR' },
  { id: 'bfmtv', name: 'BFM TV', type: 'iframe', url: u('BFM TV','fr'), category: 'News', country: 'France', countryCode: 'FR' },
  { id: 'lci', name: 'LCI', type: 'iframe', url: u('LCI','fr'), category: 'News', country: 'France', countryCode: 'FR' },
  { id: 'm6', name: 'M6', type: 'iframe', url: u('M6','fr'), category: 'Entertainment', country: 'France', countryCode: 'FR' },
  { id: 'tmc', name: 'TMC', type: 'iframe', url: u('TMC','fr'), category: 'Entertainment', country: 'France', countryCode: 'FR' },
  { id: 'eurosport-fr', name: 'Eurosport FR', type: 'iframe', url: u('Eurosport FR','fr'), category: 'Sports', country: 'France', countryCode: 'FR' },

  // ===== India =====
  { id: 'star-plus', name: 'Star Plus', type: 'iframe', url: u('Star Plus','in'), category: 'Entertainment', country: 'India', countryCode: 'IN' },
  { id: 'colors-tv', name: 'Colors TV', type: 'iframe', url: u('Colors TV','in'), category: 'Entertainment', country: 'India', countryCode: 'IN' },
  { id: 'zee-tv', name: 'Zee TV', type: 'iframe', url: u('Zee TV','in'), category: 'Entertainment', country: 'India', countryCode: 'IN' },
  { id: 'sony-liv', name: 'Sony LIV', type: 'iframe', url: u('Sony LIV','in'), category: 'Entertainment', country: 'India', countryCode: 'IN' },
  { id: 'star-sports-1', name: 'Star Sports 1', type: 'iframe', url: u('Star Sports 1','in'), category: 'Sports', country: 'India', countryCode: 'IN' },
  { id: 'star-sports-2', name: 'Star Sports 2', type: 'iframe', url: u('Star Sports 2','in'), category: 'Sports', country: 'India', countryCode: 'IN' },
  { id: 'aaj-tak', name: 'Aaj Tak', type: 'iframe', url: u('Aaj Tak','in'), category: 'News', country: 'India', countryCode: 'IN' },
  { id: 'ndtv', name: 'NDTV', type: 'iframe', url: u('NDTV','in'), category: 'News', country: 'India', countryCode: 'IN' },
  { id: 'india-tv', name: 'India TV', type: 'iframe', url: u('India TV','in'), category: 'News', country: 'India', countryCode: 'IN' },
  { id: 'zee-news', name: 'Zee News', type: 'iframe', url: u('Zee News','in'), category: 'News', country: 'India', countryCode: 'IN' },
  { id: 'nick-india', name: 'Nickelodeon India', type: 'iframe', url: u('Nickelodeon India','in'), category: 'Kids', country: 'India', countryCode: 'IN' },
  { id: 'pogo', name: 'Pogo', type: 'iframe', url: u('Pogo','in'), category: 'Kids', country: 'India', countryCode: 'IN' },
  { id: 'set-max', name: 'SET MAX', type: 'iframe', url: u('SET MAX','in'), category: 'Entertainment', country: 'India', countryCode: 'IN' },
  { id: 'star-world', name: 'Star World', type: 'iframe', url: u('Star World','in'), category: 'Entertainment', country: 'India', countryCode: 'IN' },
  { id: 'mtv-in', name: 'MTV India', type: 'iframe', url: u('MTV India','in'), category: 'Music', country: 'India', countryCode: 'IN' },

  // ===== Brazil =====
  { id: 'globo', name: 'TV Globo', type: 'iframe', url: u('TV Globo','br'), category: 'Entertainment', country: 'Brazil', countryCode: 'BR' },
  { id: 'globonews', name: 'GloboNews', type: 'iframe', url: u('GloboNews','br'), category: 'News', country: 'Brazil', countryCode: 'BR' },
  { id: 'sbt', name: 'SBT', type: 'iframe', url: u('SBT','br'), category: 'Entertainment', country: 'Brazil', countryCode: 'BR' },
  { id: 'record-br', name: 'Record TV', type: 'iframe', url: u('Record TV','br'), category: 'Entertainment', country: 'Brazil', countryCode: 'BR' },
  { id: 'band-br', name: 'Band', type: 'iframe', url: u('Band','br'), category: 'Entertainment', country: 'Brazil', countryCode: 'BR' },
  { id: 'sportv-br', name: 'SporTV', type: 'iframe', url: u('SporTV','br'), category: 'Sports', country: 'Brazil', countryCode: 'BR' },
  { id: 'cnn-br', name: 'CNN Brasil', type: 'iframe', url: u('CNN Brasil','br'), category: 'News', country: 'Brazil', countryCode: 'BR' },
  { id: 'mtv-br', name: 'MTV Brasil', type: 'iframe', url: u('MTV Brasil','br'), category: 'Music', country: 'Brazil', countryCode: 'BR' },

  // ===== Canada =====
  { id: 'cbc', name: 'CBC', type: 'iframe', url: u('CBC','ca'), category: 'News', country: 'Canada', countryCode: 'CA' },
  { id: 'ctv', name: 'CTV', type: 'iframe', url: u('CTV','ca'), category: 'Entertainment', country: 'Canada', countryCode: 'CA' },
  { id: 'global-ca', name: 'Global TV', type: 'iframe', url: u('Global TV','ca'), category: 'Entertainment', country: 'Canada', countryCode: 'CA' },
  { id: 'cp24', name: 'CP24', type: 'iframe', url: u('CP24','ca'), category: 'News', country: 'Canada', countryCode: 'CA' },
  { id: 'sportsnet', name: 'Sportsnet', type: 'iframe', url: u('Sportsnet','ca'), category: 'Sports', country: 'Canada', countryCode: 'CA' },
  { id: 'tsn-ca', name: 'TSN', type: 'iframe', url: u('TSN','ca'), category: 'Sports', country: 'Canada', countryCode: 'CA' },

  // ===== Australia =====
  { id: 'abc-au', name: 'ABC Australia', type: 'iframe', url: u('ABC Australia','au'), category: 'Entertainment', country: 'Australia', countryCode: 'AU' },
  { id: 'nine-au', name: 'Channel 9', type: 'iframe', url: u('Channel 9 Australia','au'), category: 'Entertainment', country: 'Australia', countryCode: 'AU' },
  { id: 'ten-au', name: 'Channel 10', type: 'iframe', url: u('Channel 10','au'), category: 'Entertainment', country: 'Australia', countryCode: 'AU' },
  { id: '7news-au', name: '7News', type: 'iframe', url: u('7News','au'), category: 'News', country: 'Australia', countryCode: 'AU' },
  { id: 'sky-news-au', name: 'Sky News Australia', type: 'iframe', url: u('Sky News Australia','au'), category: 'News', country: 'Australia', countryCode: 'AU' },
  { id: 'fox-sports-au', name: 'Fox Sports AU', type: 'iframe', url: u('Fox Sports Australia','au'), category: 'Sports', country: 'Australia', countryCode: 'AU' },

  // ===== Japan =====
  { id: 'nhk-world', name: 'NHK World', type: 'iframe', url: u('NHK World','jp'), category: 'News', country: 'Japan', countryCode: 'JP' },
  { id: 'nhk-e', name: 'NHK Educational', type: 'iframe', url: u('NHK Educational','jp'), category: 'Education', country: 'Japan', countryCode: 'JP' },
  { id: 'tv-tokyo', name: 'TV Tokyo', type: 'iframe', url: u('TV Tokyo','jp'), category: 'Entertainment', country: 'Japan', countryCode: 'JP' },
  { id: 'fuji-tv', name: 'Fuji TV', type: 'iframe', url: u('Fuji TV','jp'), category: 'Entertainment', country: 'Japan', countryCode: 'JP' },
  { id: 'j-sports', name: 'J Sports', type: 'iframe', url: u('J Sports','jp'), category: 'Sports', country: 'Japan', countryCode: 'JP' },

  // ===== South Korea =====
  { id: 'kbs-world', name: 'KBS World', type: 'iframe', url: u('KBS World','kr'), category: 'Entertainment', country: 'South Korea', countryCode: 'KR' },
  { id: 'arirang', name: 'Arirang TV', type: 'iframe', url: u('Arirang TV','kr'), category: 'News', country: 'South Korea', countryCode: 'KR' },
  { id: 'mbc-kr', name: 'MBC Korea', type: 'iframe', url: u('MBC Korea','kr'), category: 'Entertainment', country: 'South Korea', countryCode: 'KR' },
  { id: 'sbs-kr', name: 'SBS Korea', type: 'iframe', url: u('SBS Korea','kr'), category: 'Entertainment', country: 'South Korea', countryCode: 'KR' },

  // ===== Nigeria / Africa =====
  { id: 'channels-tv', name: 'Channels TV', type: 'iframe', url: u('Channels TV','ng'), category: 'News', country: 'Nigeria', countryCode: 'NG' },
  { id: 'arise-tv', name: 'Arise News', type: 'iframe', url: u('Arise News','ng'), category: 'News', country: 'Nigeria', countryCode: 'NG' },
  { id: 'africamagic', name: 'Africa Magic', type: 'iframe', url: u('Africa Magic','ng'), category: 'Entertainment', country: 'Nigeria', countryCode: 'NG' },
  { id: 'dstv-ng', name: 'SuperSport', type: 'iframe', url: u('SuperSport','ng'), category: 'Sports', country: 'Nigeria', countryCode: 'NG' },
  { id: 'aljazeera', name: 'Al Jazeera English', type: 'iframe', url: u('Al Jazeera English','qa'), category: 'News', country: 'Qatar', countryCode: 'QA' },
  { id: 'saudi-tv', name: 'Saudi TV', type: 'iframe', url: u('Saudi TV','sa'), category: 'Entertainment', country: 'Saudi Arabia', countryCode: 'SA' },
  { id: 'mbc-ar', name: 'MBC Arabic', type: 'iframe', url: u('MBC Arabic','sa'), category: 'Entertainment', country: 'Saudi Arabia', countryCode: 'SA' },
  { id: 'mbc-masr', name: 'MBC Masr', type: 'iframe', url: u('MBC Masr','eg'), category: 'Entertainment', country: 'Egypt', countryCode: 'EG' },
  { id: 'nile-news', name: 'Nile News', type: 'iframe', url: u('Nile News','eg'), category: 'News', country: 'Egypt', countryCode: 'EG' },
  { id: 'dmc-eg', name: 'DMC Egypt', type: 'iframe', url: u('DMC','eg'), category: 'Entertainment', country: 'Egypt', countryCode: 'EG' },
  { id: 'kenya-tv', name: 'KBC Kenya', type: 'iframe', url: u('KBC','ke'), category: 'News', country: 'Kenya', countryCode: 'KE' },
  { id: 'citizen-ke', name: 'Citizen TV', type: 'iframe', url: u('Citizen TV','ke'), category: 'Entertainment', country: 'Kenya', countryCode: 'KE' },
  { id: 'ntv-ke', name: 'NTV Kenya', type: 'iframe', url: u('NTV Kenya','ke'), category: 'News', country: 'Kenya', countryCode: 'KE' },
  { id: 'sabc-za', name: 'SABC News', type: 'iframe', url: u('SABC News','za'), category: 'News', country: 'South Africa', countryCode: 'ZA' },
  { id: 'enca-za', name: 'eNCA', type: 'iframe', url: u('eNCA','za'), category: 'News', country: 'South Africa', countryCode: 'ZA' },
  { id: 'supersport-za', name: 'SuperSport SA', type: 'iframe', url: u('SuperSport SA','za'), category: 'Sports', country: 'South Africa', countryCode: 'ZA' },

  // ===== Spain =====
  { id: 'tve-es', name: 'TVE', type: 'iframe', url: u('TVE','es'), category: 'Entertainment', country: 'Spain', countryCode: 'ES' },
  { id: 'antena3', name: 'Antena 3', type: 'iframe', url: u('Antena 3','es'), category: 'Entertainment', country: 'Spain', countryCode: 'ES' },
  { id: 'cuatro', name: 'Cuatro', type: 'iframe', url: u('Cuatro','es'), category: 'Entertainment', country: 'Spain', countryCode: 'ES' },
  { id: 'la-sexta', name: 'La Sexta', type: 'iframe', url: u('La Sexta','es'), category: 'Entertainment', country: 'Spain', countryCode: 'ES' },
  { id: 'telecinco', name: 'Telecinco', type: 'iframe', url: u('Telecinco','es'), category: 'Entertainment', country: 'Spain', countryCode: 'ES' },
  { id: 'gol-es', name: 'Gol', type: 'iframe', url: u('Gol','es'), category: 'Sports', country: 'Spain', countryCode: 'ES' },
  { id: 'real-madrid-tv', name: 'Real Madrid TV', type: 'iframe', url: u('Real Madrid TV','es'), category: 'Sports', country: 'Spain', countryCode: 'ES' },

  // ===== Italy =====
  { id: 'rai-1', name: 'Rai 1', type: 'iframe', url: u('Rai 1','it'), category: 'Entertainment', country: 'Italy', countryCode: 'IT' },
  { id: 'rai-2', name: 'Rai 2', type: 'iframe', url: u('Rai 2','it'), category: 'Entertainment', country: 'Italy', countryCode: 'IT' },
  { id: 'rai-3', name: 'Rai 3', type: 'iframe', url: u('Rai 3','it'), category: 'Entertainment', country: 'Italy', countryCode: 'IT' },
  { id: 'rai-news', name: 'Rai News', type: 'iframe', url: u('Rai News 24','it'), category: 'News', country: 'Italy', countryCode: 'IT' },
  { id: 'mediaset-5', name: 'Canale 5', type: 'iframe', url: u('Canale 5','it'), category: 'Entertainment', country: 'Italy', countryCode: 'IT' },
  { id: 'la7', name: 'La7', type: 'iframe', url: u('La7','it'), category: 'Entertainment', country: 'Italy', countryCode: 'IT' },
  { id: 'sky-sport-it', name: 'Sky Sport Italy', type: 'iframe', url: u('Sky Sport Italy','it'), category: 'Sports', country: 'Italy', countryCode: 'IT' },

  // ===== Netherlands =====
  { id: 'nos-nl', name: 'NOS', type: 'iframe', url: u('NOS','nl'), category: 'News', country: 'Netherlands', countryCode: 'NL' },
  { id: 'rtl4', name: 'RTL 4', type: 'iframe', url: u('RTL 4','nl'), category: 'Entertainment', country: 'Netherlands', countryCode: 'NL' },
  { id: 'npo1', name: 'NPO 1', type: 'iframe', url: u('NPO 1','nl'), category: 'Entertainment', country: 'Netherlands', countryCode: 'NL' },

  // ===== Turkey =====
  { id: 'trt-world', name: 'TRT World', type: 'iframe', url: u('TRT World','tr'), category: 'News', country: 'Turkey', countryCode: 'TR' },
  { id: 'cnn-turk', name: 'CNN Turk', type: 'iframe', url: u('CNN Turk','tr'), category: 'News', country: 'Turkey', countryCode: 'TR' },
  { id: 'atv-tr', name: 'ATV Turkey', type: 'iframe', url: u('ATV Turkey','tr'), category: 'Entertainment', country: 'Turkey', countryCode: 'TR' },
  { id: 'show-tv', name: 'Show TV', type: 'iframe', url: u('Show TV','tr'), category: 'Entertainment', country: 'Turkey', countryCode: 'TR' },
  { id: 'bein-sports-tr', name: 'BeIN Sports Turkey', type: 'iframe', url: u('BeIN Sports Turkey','tr'), category: 'Sports', country: 'Turkey', countryCode: 'TR' },

  // ===== Russia =====
  { id: 'russia-today', name: 'RT', type: 'iframe', url: u('RT','ru'), category: 'News', country: 'Russia', countryCode: 'RU' },
  { id: 'russia-1', name: 'Russia 1', type: 'iframe', url: u('Russia 1','ru'), category: 'Entertainment', country: 'Russia', countryCode: 'RU' },
  { id: 'sport-ru', name: 'Match TV', type: 'iframe', url: u('Match TV','ru'), category: 'Sports', country: 'Russia', countryCode: 'RU' },

  // ===== China =====
  { id: 'cgtn', name: 'CGTN', type: 'iframe', url: u('CGTN','cn'), category: 'News', country: 'China', countryCode: 'CN' },
  { id: 'cctv4', name: 'CCTV4', type: 'iframe', url: u('CCTV4','cn'), category: 'Entertainment', country: 'China', countryCode: 'CN' },
  { id: 'phoenix-cn', name: 'Phoenix TV', type: 'iframe', url: u('Phoenix TV','cn'), category: 'Entertainment', country: 'China', countryCode: 'CN' },

  // ===== Mexico / Latin America =====
  { id: 'televisa', name: 'Televisa', type: 'iframe', url: u('Televisa','mx'), category: 'Entertainment', country: 'Mexico', countryCode: 'MX' },
  { id: 'tv-azteca', name: 'TV Azteca', type: 'iframe', url: u('TV Azteca','mx'), category: 'Entertainment', country: 'Mexico', countryCode: 'MX' },
  { id: 'canal-once', name: 'Canal Once', type: 'iframe', url: u('Canal Once','mx'), category: 'Education', country: 'Mexico', countryCode: 'MX' },
  { id: 'cnn-en-espanol', name: 'CNN en Español', type: 'iframe', url: u('CNN en Espanol','mx'), category: 'News', country: 'Mexico', countryCode: 'MX' },
  { id: 'univision', name: 'Univision', type: 'iframe', url: u('Univision','us'), category: 'Entertainment', country: 'United States', countryCode: 'US' },
  { id: 'telemundo', name: 'Telemundo', type: 'iframe', url: u('Telemundo','us'), category: 'Entertainment', country: 'United States', countryCode: 'US' },

  // ===== More US Channels =====
  { id: 'pbs', name: 'PBS', type: 'iframe', url: u('PBS','us'), category: 'Documentary', country: 'United States', countryCode: 'US' },
  { id: 'cbs-news', name: 'CBS News', type: 'iframe', url: u('CBS News','us'), category: 'News', country: 'United States', countryCode: 'US' },
  { id: 'nbc-news-now', name: 'NBC News Now', type: 'iframe', url: u('NBC News Now','us'), category: 'News', country: 'United States', countryCode: 'US' },
  { id: 'abc-news', name: 'ABC News Live', type: 'iframe', url: u('ABC News Live','us'), category: 'News', country: 'United States', countryCode: 'US' },
  { id: 'bloomberg-us', name: 'Bloomberg TV', type: 'iframe', url: u('Bloomberg TV','us'), category: 'News', country: 'United States', countryCode: 'US' },
  { id: 'c-span', name: 'C-SPAN', type: 'iframe', url: u('C-SPAN','us'), category: 'News', country: 'United States', countryCode: 'US' },
  { id: 'msnbc', name: 'MSNBC', type: 'iframe', url: u('MSNBC','us'), category: 'News', country: 'United States', countryCode: 'US' },
  { id: 'fox-news', name: 'Fox News', type: 'iframe', url: u('Fox News','us'), category: 'News', country: 'United States', countryCode: 'US' },
  { id: 'newsmax', name: 'Newsmax', type: 'iframe', url: u('Newsmax','us'), category: 'News', country: 'United States', countryCode: 'US' },
  { id: 'espn2', name: 'ESPN2', type: 'iframe', url: u('ESPN2','us'), category: 'Sports', country: 'United States', countryCode: 'US' },
  { id: 'golf-channel', name: 'Golf Channel', type: 'iframe', url: u('Golf Channel','us'), category: 'Sports', country: 'United States', countryCode: 'US' },
  { id: 'the-tennis-channel', name: 'Tennis Channel', type: 'iframe', url: u('Tennis Channel','us'), category: 'Sports', country: 'United States', countryCode: 'US' },
  { id: 'tbn-us', name: 'TBN', type: 'iframe', url: u('TBN','us'), category: 'Religious', country: 'United States', countryCode: 'US' },
  { id: 'discovery-us', name: 'Discovery Channel', type: 'iframe', url: u('Discovery Channel','us'), category: 'Documentary', country: 'United States', countryCode: 'US' },
  { id: 'nat-geo', name: 'National Geographic', type: 'iframe', url: u('National Geographic','us'), category: 'Documentary', country: 'United States', countryCode: 'US' },
  { id: 'history-us', name: 'History Channel', type: 'iframe', url: u('History Channel','us'), category: 'Documentary', country: 'United States', countryCode: 'US' },
  { id: 'animal-planet', name: 'Animal Planet', type: 'iframe', url: u('Animal Planet','us'), category: 'Documentary', country: 'United States', countryCode: 'US' },
  { id: 'travel-channel', name: 'Travel Channel', type: 'iframe', url: u('Travel Channel','us'), category: 'Travel', country: 'United States', countryCode: 'US' },
  { id: 'food-network', name: 'Food Network', type: 'iframe', url: u('Food Network','us'), category: 'Lifestyle', country: 'United States', countryCode: 'US' },
  { id: 'hgtv', name: 'HGTV', type: 'iframe', url: u('HGTV','us'), category: 'Lifestyle', country: 'United States', countryCode: 'US' },
  { id: 'bravo', name: 'Bravo', type: 'iframe', url: u('Bravo','us'), category: 'Lifestyle', country: 'United States', countryCode: 'US' },
  { id: 'lifetime-us', name: 'Lifetime', type: 'iframe', url: u('Lifetime','us'), category: 'Entertainment', country: 'United States', countryCode: 'US' },
  { id: 'hallmark', name: 'Hallmark Channel', type: 'iframe', url: u('Hallmark Channel','us'), category: 'Entertainment', country: 'United States', countryCode: 'US' },
  { id: 'tnt-us', name: 'TNT', type: 'iframe', url: u('TNT','us'), category: 'Entertainment', country: 'United States', countryCode: 'US' },
  { id: 'tbs-us', name: 'TBS', type: 'iframe', url: u('TBS','us'), category: 'Entertainment', country: 'United States', countryCode: 'US' },
  { id: 'fx-us', name: 'FX', type: 'iframe', url: u('FX','us'), category: 'Entertainment', country: 'United States', countryCode: 'US' },
  { id: 'comedy-central', name: 'Comedy Central', type: 'iframe', url: u('Comedy Central','us'), category: 'Entertainment', country: 'United States', countryCode: 'US' },
  { id: 'syfy', name: 'Syfy', type: 'iframe', url: u('Syfy','us'), category: 'Entertainment', country: 'United States', countryCode: 'US' },
  { id: 'amc-us', name: 'AMC', type: 'iframe', url: u('AMC','us'), category: 'Movies', country: 'United States', countryCode: 'US' },
  { id: 'tcm', name: 'TCM', type: 'iframe', url: u('Turner Classic Movies','us'), category: 'Movies', country: 'United States', countryCode: 'US' },
  { id: 'ifc-us', name: 'IFC', type: 'iframe', url: u('IFC','us'), category: 'Movies', country: 'United States', countryCode: 'US' },
  { id: 'starz-us', name: 'Starz', type: 'iframe', url: u('Starz','us'), category: 'Movies', country: 'United States', countryCode: 'US' },
  { id: 'showtime', name: 'Showtime', type: 'iframe', url: u('Showtime','us'), category: 'Movies', country: 'United States', countryCode: 'US' },
  { id: 'cartoon-network', name: 'Cartoon Network', type: 'iframe', url: u('Cartoon Network','us'), category: 'Kids', country: 'United States', countryCode: 'US' },
  { id: 'boomerang-us', name: 'Boomerang', type: 'iframe', url: u('Boomerang','us'), category: 'Kids', country: 'United States', countryCode: 'US' },
  { id: 'disney-xd', name: 'Disney XD', type: 'iframe', url: u('Disney XD','us'), category: 'Kids', country: 'United States', countryCode: 'US' },
  { id: 'disney-jr', name: 'Disney Junior', type: 'iframe', url: u('Disney Junior','us'), category: 'Kids', country: 'United States', countryCode: 'US' },
  { id: 'bbc-america', name: 'BBC America', type: 'iframe', url: u('BBC America','us'), category: 'Entertainment', country: 'United States', countryCode: 'US' },
  { id: 'vh1', name: 'VH1', type: 'iframe', url: u('VH1','us'), category: 'Music', country: 'United States', countryCode: 'US' },
  { id: 'bet', name: 'BET', type: 'iframe', url: u('BET','us'), category: 'Entertainment', country: 'United States', countryCode: 'US' },
  { id: 'freeform', name: 'Freeform', type: 'iframe', url: u('Freeform','us'), category: 'Entertainment', country: 'United States', countryCode: 'US' },
  { id: 'usa-network', name: 'USA Network', type: 'iframe', url: u('USA Network','us'), category: 'Entertainment', country: 'United States', countryCode: 'US' },
  { id: 'oxygen', name: 'Oxygen', type: 'iframe', url: u('Oxygen','us'), category: 'Entertainment', country: 'United States', countryCode: 'US' },
  { id: 'e-entertainment', name: 'E!', type: 'iframe', url: u('E!','us'), category: 'Entertainment', country: 'United States', countryCode: 'US' },
  { id: 'reelz', name: 'Reelz', type: 'iframe', url: u('Reelz','us'), category: 'Movies', country: 'United States', countryCode: 'US' },
  { id: 'crime-investigation', name: 'Crime + Investigation', type: 'iframe', url: u('Crime Investigation','us'), category: 'Documentary', country: 'United States', countryCode: 'US' },
  { id: 'id-discovery', name: 'Investigation Discovery', type: 'iframe', url: u('Investigation Discovery','us'), category: 'Documentary', country: 'United States', countryCode: 'US' },
  { id: 'science-channel', name: 'Science Channel', type: 'iframe', url: u('Science Channel','us'), category: 'Science', country: 'United States', countryCode: 'US' },
  { id: 'military-channel', name: 'Military Channel', type: 'iframe', url: u('Military Channel','us'), category: 'Documentary', country: 'United States', countryCode: 'US' },
  { id: 'american-heroes', name: 'American Heroes Channel', type: 'iframe', url: u('American Heroes Channel','us'), category: 'Documentary', country: 'United States', countryCode: 'US' },
  { id: 'bbc-earth', name: 'BBC Earth', type: 'iframe', url: u('BBC Earth','gb'), category: 'Documentary', country: 'United Kingdom', countryCode: 'GB' },
  { id: 'nat-geo-wild', name: 'Nat Geo Wild', type: 'iframe', url: u('Nat Geo Wild','us'), category: 'Documentary', country: 'United States', countryCode: 'US' },
  { id: 'weather-channel', name: 'The Weather Channel', type: 'iframe', url: u('The Weather Channel','us'), category: 'News', country: 'United States', countryCode: 'US' },
  { id: 'cnbc-us', name: 'CNBC', type: 'iframe', url: u('CNBC','us'), category: 'News', country: 'United States', countryCode: 'US' },
  { id: 'ewtn', name: 'EWTN', type: 'iframe', url: u('EWTN','us'), category: 'Religious', country: 'United States', countryCode: 'US' },
  { id: 'daystar', name: 'Daystar TV', type: 'iframe', url: u('Daystar','us'), category: 'Religious', country: 'United States', countryCode: 'US' },
  { id: '3abn', name: '3ABN', type: 'iframe', url: u('3ABN','us'), category: 'Religious', country: 'United States', countryCode: 'US' },
  { id: 'al-arabiya', name: 'Al Arabiya', type: 'iframe', url: u('Al Arabiya','ae'), category: 'News', country: 'UAE', countryCode: 'AE' },
  { id: 'dw-arabic', name: 'DW Arabic', type: 'iframe', url: u('DW Arabic','de'), category: 'News', country: 'Germany', countryCode: 'DE' },
  { id: 'dw-english', name: 'DW English', type: 'iframe', url: u('DW English','de'), category: 'News', country: 'Germany', countryCode: 'DE' },
  { id: 'dw-german', name: 'DW German', type: 'iframe', url: u('DW German','de'), category: 'News', country: 'Germany', countryCode: 'DE' },
  { id: 'euronews-en', name: 'Euronews', type: 'iframe', url: u('Euronews','fr'), category: 'News', country: 'France', countryCode: 'FR' },
  { id: 'nasa-tv', name: 'NASA TV', type: 'iframe', url: u('NASA TV','us'), category: 'Science', country: 'United States', countryCode: 'US' },
  { id: 'bein-sports-1', name: 'beIN Sports 1', type: 'iframe', url: u('beIN Sports 1','qa'), category: 'Sports', country: 'Qatar', countryCode: 'QA' },
  { id: 'bein-sports-2', name: 'beIN Sports 2', type: 'iframe', url: u('beIN Sports 2','qa'), category: 'Sports', country: 'Qatar', countryCode: 'QA' },
  { id: 'abu-dhabi-sports', name: 'Abu Dhabi Sports', type: 'iframe', url: u('Abu Dhabi Sports','ae'), category: 'Sports', country: 'UAE', countryCode: 'AE' },
  { id: 'espn-africa', name: 'ESPN Africa', type: 'iframe', url: u('ESPN Africa','ng'), category: 'Sports', country: 'Nigeria', countryCode: 'NG' },
];

// Filter out dupes
const filtered = newChannels.filter(c => !existingIds.has(c.id));
const merged = [...existing, ...filtered];

console.log(`Existing: ${existing.length}, New unique: ${filtered.length}, Total: ${merged.length}`);
fs.writeFileSync(jsonPath, JSON.stringify(merged, null, 2));
console.log('Done!');
