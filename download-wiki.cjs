const https = require('https');
const fs = require('fs');

const options = {
  hostname: 'upload.wikimedia.org',
  port: 443,
  path: '/wikipedia/commons/thumb/c/cb/Ho_Chi_Minh_1946.jpg/800px-Ho_Chi_Minh_1946.jpg',
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
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
