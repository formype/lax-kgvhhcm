const fs = require('fs');
const html = fs.readFileSync(process.argv[2], 'utf8');

const regex = /<p[^>]*>(.*?)<\/p>/gs;
let match;
let count = 0;
while ((match = regex.exec(html)) !== null && count < 60) {
  let text = match[1].replace(/<[^>]+>/g, '').trim();
  if (text.length > 50) {
    console.log(`[P${count}] ${text}\n`);
    count++;
  }
}
