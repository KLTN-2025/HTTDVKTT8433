# API Troubleshooting Guide

## Lỗi "Failed to fetch"

Nếu bạn gặp lỗi "Failed to fetch" khi đăng ký hoặc đăng nhập, hãy làm theo các bước sau:

### 1. Kiểm tra Backend Server

Đảm bảo backend server đang chạy trên port 9999:
```bash
# Kiểm tra xem server có đang chạy không
curl http://localhost:9999/api/v1/identity/health
```

### 2. Kiểm tra CORS

Backend cần được cấu hình CORS để cho phép requests từ frontend:
```javascript
// Backend cần có cấu hình CORS như này:
app.use(cors({
  origin: 'http://localhost:5173', // Vite dev server
  credentials: true
}))
```

### 3. Kiểm tra API Endpoints

Đảm bảo các endpoints sau tồn tại:
- `POST /api/v1/identity/users/registration`
- `POST /api/v1/identity/auth/token`

### 4. Sử dụng API Test Tool

Trong trang login, click vào nút "🔧 Test API Connection" để kiểm tra:
- Kết nối đến server
- Health check endpoint
- Registration endpoint
- Login endpoint

### 5. Kiểm tra Console Logs

Mở Developer Tools (F12) và kiểm tra:
- Console tab để xem error messages
- Network tab để xem HTTP requests
- API calls sẽ được log chi tiết

### 6. Cấu hình Environment

Tạo file `.env` trong thư mục `spa/`:
```env
VITE_IDENTITY_BASE_URL=http://localhost:9999/api/v1/identity
```

### 7. Common Issues

#### Port Conflict
```bash
# Nếu port 9999 bị sử dụng, thay đổi trong client.ts
const DEFAULT_BASE = 'http://localhost:YOUR_PORT/api/v1/identity'
```

#### Network Issues
```bash
# Kiểm tra firewall hoặc antivirus
# Tạm thời tắt để test
```

#### Backend Not Running
```bash
# Khởi động backend server
cd backend
npm start
# hoặc
yarn start
```

### 8. Debug Steps

1. **Test Basic Connection**:
   ```javascript
   fetch('http://localhost:9999/api/v1/identity/health')
     .then(res => console.log('OK:', res.status))
     .catch(err => console.error('Error:', err))
   ```

2. **Test Registration**:
   ```javascript
   fetch('http://localhost:9999/api/v1/identity/users/registration', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       username: 'test',
       password: 'test123',
       email: 'test@test.com',
       mssv: '123456'
     })
   })
   ```

3. **Test Login**:
   ```javascript
   fetch('http://localhost:9999/api/v1/identity/auth/token', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       username: 'test',
       password: 'test123',
       otp: 0
     })
   })
   ```

### 9. Common Backend Errors

#### Gender Enum Error
```
Cannot deserialize value of type `com.LinkVerse.identity.entity.Gender` from String "MALE": 
not one of the values accepted for Enum class: [other, female, male]
```

**Giải pháp**: Backend chờ giá trị Gender enum là lowercase:
- ✅ Đúng: `"male"`, `"female"`, `"other"`
- ❌ Sai: `"MALE"`, `"FEMALE"`, `"OTHER"`

#### Port Mismatch
Nếu backend chạy trên port khác 9999, cập nhật trong `src/api/client.ts`:
```typescript
const DEFAULT_BASE = 'http://localhost:YOUR_PORT/api/v1/identity'
```

### 10. Contact Support

Nếu vẫn gặp vấn đề, hãy:
1. Chụp screenshot error message
2. Copy console logs
3. Cung cấp thông tin về backend server (port, framework, etc.)
4. Kiểm tra Gender enum values trong backend
