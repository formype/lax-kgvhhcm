/**
 * GOOGLE APPS SCRIPT - NHẬN / XÓA ẢNH & VIDEO TRÊN GOOGLE DRIVE CÁ NHÂN
 *
 * Hướng dẫn cài đặt / cập nhật:
 * 1. Mở Google Drive cá nhân, tạo hoặc mở thư mục bạn muốn lưu bài của học sinh/giáo viên.
 * 2. Copy ID thư mục trên thanh địa chỉ trình duyệt (phần sau /folders/...).
 * 3. Dán ID đó vào biến FOLDER_ID bên dưới.
 * 4. Truy cập https://script.google.com/ -> dán toàn bộ code này vào.
 * 5. Bấm "Triển khai" (Deploy) -> "Quản lý các bản triển khai" (Manage deployments)
 *    -> Biểu tượng cây bút (Edit) -> Phiên bản: "Phiên bản mới" (New version) -> "Triển khai"
 *    (Cách này giữ nguyên URL Web App cũ, không cần sửa .env hay Vercel).
 */

const FOLDER_ID = '1gxaPfcuNC5shsqfJD6mc0kVJcSbb_zEQ';

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);

    // Xóa tệp trên Google Drive khi Admin xóa bài trong trang quản trị
    if (payload.action === 'delete') {
      if (!payload.fileId) {
        return jsonResponse({ success: false, error: 'Thiếu fileId để xóa.' });
      }
      const targetFile = DriveApp.getFileById(payload.fileId);
      try {
        targetFile.setTrashed(true);
      } catch (trashErr) {
        DriveApp.getFolderById(FOLDER_ID).removeFile(targetFile);
      }
      return jsonResponse({ success: true, deletedId: payload.fileId });
    }

    // Tải tệp mới lên Google Drive
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
