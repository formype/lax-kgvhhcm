const https = require('https');
const fs = require('fs');

const file = fs.createWriteStream("public/ho-chi-minh-lam-viec.jpg");
https.get("https://tulieuvankien.dangcongsan.vn/Uploads/2018/8/30/bac-ho-lam-viec.jpg", function(response) {
  response.pipe(file);
  file.on("finish", () => {
    file.close();
    console.log("Download Completed");
  });
}).on('error', (err) => {
  fs.unlink("public/ho-chi-minh-lam-viec.jpg", () => {});
  console.error("Error: ", err.message);
});
