const https = require('https');
const fs = require('fs');

const filename = 'Ho Chi Minh writing will.jpg';
const url = `https://en.wikipedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(filename)}&prop=imageinfo&iiprop=url&format=json`;

https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const parsed = JSON.parse(data);
    const pages = parsed.query.pages;
    const pageId = Object.keys(pages)[0];
    if (pageId === '-1') {
      console.error(`File ${filename} not found`);
      return;
    }
    const imageUrl = pages[pageId].imageinfo[0].url;
    console.log('Downloading from:', imageUrl);
    
    const file = fs.createWriteStream("public/ho-chi-minh-lam-viec.jpg");
    https.get(imageUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res2) => {
      res2.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log("Download successful! Image size:", fs.statSync("public/ho-chi-minh-lam-viec.jpg").size);
      });
    });
  });
});
