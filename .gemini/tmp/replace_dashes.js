const fs = require('fs');
const path = require('path');
function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            if (!file.includes('node_modules') && !file.includes('.next') && !file.includes('.git')) {
                results = results.concat(walk(file));
            }
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.json') || file.endsWith('.sql') || file.endsWith('.md')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('.');
let count = 0;
files.forEach(f => {
    try {
        const content = fs.readFileSync(f, 'utf8');
        if (content.includes('—')) {
            fs.writeFileSync(f, content.replace(/—/g, '-'), 'utf8');
            console.log('Updated ' + f);
            count++;
        }
    } catch(e) {}
});
console.log('Total files updated:', count);
