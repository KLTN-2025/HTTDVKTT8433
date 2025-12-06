FE_QUIZ React SPA

Ứng dụng SPA (React + Vite + TailwindCSS) cho đăng nhập/đăng ký, kết nối Identity Service.

Yêu cầu:
- Node.js >= 18

Cấu hình:
- Tạo file .env ở thư mục này (tham khảo .env.example)
- Biến môi trường:
  - VITE_IDENTITY_BASE_URL (mặc định http://localhost:9195)

Chạy dev (cổng 5173):
1. cd FE_QUIZ/spa
2. npm install
3. npm run dev
4. Mở http://localhost:5173

Triển khai nhanh:
- npm run build -> tạo dist/
- npm run preview (chạy thử build ở cổng 5173)

Ghi chú backend:
- Identity Service đã mở CORS cho http://localhost:5173 (CoopConfig).
- API được gọi trực tiếp đến Identity Service (hoặc bạn có thể dùng API Gateway nếu bật CORS tương ứng).

Luồng API:
- POST /auth/token { username, password, otp? } -> ApiResponse { code, message, result: { token, expiryTime } }
- POST /users/registration { username, password, email, mssv, ... } -> ApiResponse { code, message, result }

Tham khảo theme:
- Đã tận dụng màu sắc cơ bản giống theme (primary #4f46e5) và card shadow.
