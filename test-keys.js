const axios = require('axios');

const API_KEYS = [
    "AIzaSyAU0j_L3w2nsH7_5qc56cPfBBBVlmqdikc",
    "AIzaSyAQOFn1SVkbrQDJn7VeRMs5vAV1mYErImM",
    "AIzaSyDbTHAbBxPWdvKWjbWG_xcd8-09t3w-CCI",
    "AIzaSyAsdilIMvU76E8XbMc0bl8b0lEnNnUw4jY",
    "AIzaSyBo8OwaCOTQsppnpaJV_nU9ollTlbI0chM",
    "AIzaSyBIV8LYYwPg5CWXn6W0aL5Z6P8-c_AATrY"
];

async function testKey(key) {
    try {
        const url = `https://www.googleapis.com/youtube/v3/videos?key=${key}&part=snippet&chart=mostPopular&maxResults=1`;
        const resp = await axios.get(url, { headers: { 'Referer': 'https://streamlux-67a84.web.app/' } });
        console.log(`Key ${key.substring(0, 10)}... : SUCCESS (200)`);
        return true;
    } catch (e) {
        console.log(`Key ${key.substring(0, 10)}... : FAILED (${e.response?.status}) - ${e.response?.data?.error?.message}`);
        return false;
    }
}

async function run() {
    console.log("Testing YouTube Keys with Firebase Referer...");
    for (const key of API_KEYS) {
        await testKey(key);
    }
    
    console.log("\nTesting YouTube Keys without Referer...");
    for (const key of API_KEYS) {
        try {
            const url = `https://www.googleapis.com/youtube/v3/videos?key=${key}&part=snippet&chart=mostPopular&maxResults=1`;
            const resp = await axios.get(url);
            console.log(`Key ${key.substring(0, 10)}... : SUCCESS (200)`);
        } catch (e) {
            console.log(`Key ${key.substring(0, 10)}... : FAILED (${e.response?.status}) - ${e.response?.data?.error?.message}`);
        }
    }
}

run();
