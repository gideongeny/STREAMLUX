const fs = require('fs');
const glob = require('glob'); // npm install glob might be needed, I'll use raw path read instead

function traverseDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(traverseDir(file));
        } else { 
            if (file.endsWith('.tsx') && !file.includes('Home.tsx')) results.push(file);
        }
    });
    return results;
}

const files = traverseDir('./src/pages');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // 1. Remove SidebarMini
    content = content.replace(/\{!isMobile && <SidebarMini[^>]*>\}/g, '');
    content = content.replace(/<SidebarMini[^>]*\/>/g, '');
    content = content.replace(/import SidebarMini from ['"].*?SidebarMini['"];?/g, '');

    // 2. Add md:ml-[260px] to the flex-grow wrapper after Sidebar
    const sidebarRegex = /<Sidebar[^>]*>[\s\S]*?(<div[^>]*className=["'][^"']*flex-grow[^"']*["'][^>]*>)/g;
    
    content = content.replace(sidebarRegex, (match, divTag) => {
        if (!divTag.includes('md:ml-[260px]')) {
            const newDiv = divTag.replace('className="', 'className="md:ml-[260px] ');
            return match.replace(divTag, newDiv);
        }
        return match;
    });

    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log('Fixed', file);
    }
});
