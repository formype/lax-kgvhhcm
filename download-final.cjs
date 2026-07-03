const https = require('https');
const fs = require('fs');

const options = {
  hostname: 'tulieuvankien.dangcongsan.vn',
  port: 443,
  path: '/Uploads/2018/8/30/bac-ho-lam-viec.jpg',
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
  }
};

const file = fs.createWriteStream("public/ho-chi-minh-lam-viec.jpg");

const req = https.request(options, (res) => {
  if (res.statusCode !== 200) {
    console.error(`Failed to download, status code: ${res.statusCode}`);
    res.resume();
    return;
  }
  res.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log("Download successful! Image size:", fs.statSync("public/ho-chi-minh-lam-viec.jpg").size);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();
