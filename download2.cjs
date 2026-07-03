const https = require('https');
const fs = require('fs');

const options = {
  hostname: 'upload.wikimedia.org',
  port: 443,
  path: '/wikipedia/commons/2/23/Ho_Chi_Minh_working_at_Bac_Bo_Phu_1946.jpg',
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
};

const file = fs.createWriteStream("public/ho-chi-minh-lam-viec.jpg");

const req = https.request(options, (res) => {
  if (res.statusCode !== 200) {
    console.error(`Failed to download, status code: ${res.statusCode}`);
    res.resume(); // consume response data to free up memory
    return;
  }
  res.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log("Download successful!");
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();
