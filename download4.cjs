const https = require('https');
const fs = require('fs');

const getImageUrl = (filename, callback) => {
  const url = `https://en.wikipedia.org/w/api.php?action=query&titles=File:${filename}&prop=imageinfo&iiprop=url&format=json`;
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
      callback(imageUrl);
    });
  });
};

getImageUrl('Ho_Chi_Minh_1946.jpg', (url) => {
  console.log('Found URL:', url);
  const file = fs.createWriteStream("public/ho-chi-minh-lam-viec.jpg");
  https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
    res.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log("Download successful!");
    });
  });
});
