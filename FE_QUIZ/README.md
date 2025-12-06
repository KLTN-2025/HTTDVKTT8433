# FE_QUIZ

Giao diện đăng nhập và đăng ký tối giản cho hệ thống Quiz, kết nối trực tiếp với Identity Service.

Cách chạy (khuyến nghị để tránh CORS):
- Identity Service đang bật CORS cho nguồn http://localhost:5173.
- Vì vậy bạn nên chạy FE trên cổng 5173 (VD dùng Vite hoặc bất kỳ static server nào cấu hình port 5173).

Gợi ý chạy nhanh với Vite (nếu có Node.js):
1. cd vào thư mục FE_QUIZ
2. Cài plugin dev static đơn giản (tuỳ chọn), hoặc dùng một HTTP server bất kỳ chạy ở port 5173.
   - Ví dụ: npx vite --port 5173 --open index.html
3. Mở http://localhost:5173 để sử dụng.

Nếu không dùng Vite, có thể dùng bất kỳ server tĩnh nào chạy ở http://localhost:5173.

Cấu hình endpoint:
- Sửa file js/config.js nếu cần thay đổi BASE_URL_IDENTITY.
- Mặc định đang gọi trực tiếp Identity Service: http://localhost:9195

Luồng chức năng:
- Đăng nhập: gọi POST /auth/token với body { username, password, otp }.
  - API trả về dạng ApiResponse với result là AuthenticationResponse { token, expiryTime }.
  - FE sẽ lưu token vào localStorage.
- Đăng ký: gọi POST /users/registration với body UserCreationRequest.
  - Các trường bắt buộc: username (>=4), password (>=6), email, mssv (>=6), dateOfBirth (định dạng dd/MM/yyyy), cùng các trường tuỳ chọn khác.

Lưu ý:
- Nếu muốn gọi qua API Gateway, cần cấu hình CORS cho Gateway. Hiện tại FE gọi trực tiếp Identity Service để tận dụng CORS đã bật sẵn.
