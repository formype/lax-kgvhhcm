const https = require('https');

const checkUrl = (url) => {
  https.get(url, (res) => {
    console.log(url + ' : ' + res.statusCode);
  }).on('error', (e) => {
    console.error(e);
  });
};

checkUrl('https://upload.wikimedia.org/wikipedia/commons/4/40/Ho_Chi_Minh_writing_will.jpg');
checkUrl('https://upload.wikimedia.org/wikipedia/commons/2/23/Ho_Chi_Minh_working_at_Bac_Bo_Phu_1946.jpg');
checkUrl('https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Ho_Chi_Minh_1946.jpg/800px-Ho_Chi_Minh_1946.jpg');
checkUrl('https://baochinhphu.vn/knd/FileUpload/Images/bac_ho_lam_viec.jpg');
checkUrl('https://tulieuvankien.dangcongsan.vn/Uploads/2018/8/30/bac-ho-lam-viec.jpg');
checkUrl('https://tulieuvankien.dangcongsan.vn/Uploads/2016/4/22/10_Bac_Ho.jpg');
