/**
 * GOOGLE APPS SCRIPT - NHẬN ẢNH / VIDEO TỪ WEB VÀ LƯU VÀO GOOGLE DRIVE CÁ NHÂN
 *
 * Hướng dẫn cài đặt (chỉ mất ~2 phút):
 * 1. Mở Google Drive cá nhân, tạo hoặc mở thư mục bạn muốn lưu bài của học sinh/giáo viên.
 * 2. Copy ID thư mục trên thanh địa chỉ trình duyệt (phần sau /folders/..., ví dụ: 1AbCdEfGhIjKlMnOpQrStUvWxYz).
 * 3. Dán ID đó vào biến FOLDER_ID bên dưới.
 * 4. Truy cập https://script.google.com/ -> Dự án mới -> Dán toàn bộ code này vào.
 * 5. Bấm "Triển khai" (Deploy) -> "Tùy chọn triển khai mới" (New deployment):
 *    - Loại: "Ứng dụng web" (Web app)
 *    - Thực thi dưới tư cách (Execute as): "Tôi" (Me)
 *    - Ai có quyền truy cập (Who has access): "Bất kỳ ai" (Anyone)
 * 6. Bấm Triển khai, cấp quyền truy cập Google Drive, rồi copy URL Web App dán vào biến VITE_GDRIVE_UPLOAD_URL.
 */

const FOLDER_ID = '1gxaPfcuNC5shsqfJD6mc0kVJcSbb_zEQ';

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const { fileName, mimeType, base64Data } = payload;

    if (!fileName || !mimeType || !base64Data) {
      return jsonResponse({ success: false, error: 'Thiếu dữ liệu tệp tải lên.' });
    }

    const folder = DriveApp.getFolderById(FOLDER_ID);
    const decoded = Utilities.base64Decode(base64Data);
    const blob = Utilities.newBlob(decoded, mimeType, fileName);
    const file = folder.createFile(blob);

    // Bật quyền xem cho bất kỳ ai có liên kết để hiển thị trên website
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    const fileId = file.getId();
    const isVideo = mimeType.indexOf('video/') === 0;
    const mediaUrl = isVideo
      ? 'https://drive.google.com/file/d/' + fileId + '/preview'
      : 'https://lh3.googleusercontent.com/d/' + fileId + '=w1600';

    return jsonResponse({
      success: true,
      fileId: fileId,
      fileName: file.getName(),
      mediaUrl: mediaUrl,
      webViewLink: file.getUrl()
    });
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
