const fs = require('fs');
const path = require('path');

function findJsFiles(dir) {
    const results = [];
    if (fs.existsSync(dir) === false) return results;
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
        const full = path.join(dir, item.name);
        if (item.isDirectory()) results.push(...findJsFiles(full));
        else if (item.name.endsWith('.js')) results.push(full);
    }
    return results;
}

const dirs = ['words/vocabs', 'apk/vocabs', 'apk/words/vocabs'];
let totalOk = 0, totalFail = 0;

dirs.forEach(d => {
    const files = findJsFiles(d);
    let ok = 0, fail = 0;
    const failures = [];
    files.forEach(f => {
        try {
            new Function(fs.readFileSync(f, 'utf8'));
            ok++;
        } catch(e) {
            fail++;
            failures.push(path.relative('.', f) + ': ' + e.message.substring(0, 80));
        }
    });
    console.log(`${d}: Total=${files.length} OK=${ok} Failed=${fail}`);
    failures.forEach(f => console.log('  ' + f));
    totalOk += ok;
    totalFail += fail;
});

console.log(`\nGrand total: ${totalOk + totalFail} files, ${totalOk} OK, ${totalFail} failed`);
process.exit(totalFail > 0 ? 1 : 0);
