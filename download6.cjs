const https = require('https');
const fs = require('fs');

const options = {
  hostname: 'tulieuvankien.dangcongsan.vn',
  port: 443,
  path: '/Uploads/2016/4/22/10_Bac_Ho.jpg',
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
  }
};

const file = fs.createWriteStream("public/ho-chi-minh-lam-viec.jpg");

https.request(options, (res) => {
  res.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log("Size:", fs.statSync("public/ho-chi-minh-lam-viec.jpg").size);
  });
}).end();
