const axios = require('axios');

async function testGateway() {
    const baseUrl = 'https://us-central1-streamlux-67a84.cloudfunctions.net/gateway';
    
    console.log('--- Testing Gateway Health ---');
    try {
        const res = await axios.get(`${baseUrl}/health`);
        console.log('Health Success:', res.data);
    } catch (err) {
        console.log('Health Failed:', err.response?.status, err.response?.data || err.message);
    }

    console.log('\n--- Testing TMDB Proxy (Trending) ---');
    try {
        const res = await axios.get(`${baseUrl}/tmdb`, {
            params: { endpoint: '/trending/movie/day' }
        });
        console.log('TMDB Success! Found movies:', res.data.results?.length);
    } catch (err) {
        console.log('TMDB Failed:', err.response?.status, err.response?.data || err.message);
    }
}

testGateway();
