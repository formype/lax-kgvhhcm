const https = require('https');

https.get('https://html.duckduckgo.com/html/?q=bac+ho+lam+viec+site:hochiminh.vn+filetype:jpg', {
  headers: { 'User-Agent': 'Mozilla/5.0' }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    const matches = body.match(/src="(https:\/\/[^"]+\.jpg)"/g);
    if (matches) {
      console.log(matches.map(m => m.substring(5, m.length - 1)));
    } else {
      console.log("No images found");
    }
  });
});
