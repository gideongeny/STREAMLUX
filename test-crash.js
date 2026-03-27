const puppeteer = require('puppeteer');

(async () => {
    try {
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();
        
        console.log('Fetching Home.tsx source...');
        await page.goto('http://localhost:3002', { waitUntil: 'load' });
        
        const source = await page.evaluate(async () => {
            const res = await fetch('/src/pages/Home.tsx');
            return await res.text();
        });
        
        console.log('SOURCE (first 50 lines):');
        console.log(source.split('\n').slice(0, 50).join('\n'));
        console.log('...');
        
        // Find historyItems usages
        const lines = source.split('\n');
        lines.forEach((line, i) => {
            if (line.includes('historyItems')) {
                console.log(`Line ${i + 1}: ${line.trim()}`);
            }
        });
        
        await browser.close();
        console.log('Test complete.');
    } catch (err) {
        console.error('Puppeteer Script Error:', err);
        process.exit(1);
    }
})();
