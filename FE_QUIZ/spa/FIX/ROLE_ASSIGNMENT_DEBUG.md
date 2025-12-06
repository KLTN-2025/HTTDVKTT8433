# Role Assignment Debug Guide

## Vấn đề hiện tại
API `http://localhost:9999/api/v1/identity/roles/assign-to-user?userId=329ba3ab-9810-4d5b-a308-b5e6985e68b3&role=ROLE_STUDENT` không hoạt động.

## Các bước debug

### 1. Kiểm tra Backend Status
```bash
# Kiểm tra identity-service có chạy không
curl http://localhost:9195/identity/actuator/health

# Kiểm tra API Gateway có chạy không  
curl http://localhost:9999/actuator/health
```

### 2. Kiểm tra Token
```javascript
// Trong browser console
console.log('Token:', localStorage.getItem('access_token'))

// Decode JWT token
const token = localStorage.getItem('access_token')
const payload = JSON.parse(atob(token.split('.')[1]))
console.log('Token payload:', payload)
```

### 3. Test API trực tiếp
```bash
# Test với curl
curl -X POST "http://localhost:9999/api/v1/identity/roles/assign-to-user?userId=329ba3ab-9810-4d5b-a308-b5e6985e68b3&role=ROLE_STUDENT" \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -H "Content-Type: application/json"
```

### 4. Kiểm tra Database
```sql
-- Kiểm tra user có tồn tại không
SELECT * FROM user WHERE id = '329ba3ab-9810-4d5b-a308-b5e6985e68b3';

-- Kiểm tra role có tồn tại không
SELECT * FROM roles WHERE name = 'ROLE_STUDENT';

-- Kiểm tra user_roles table
SELECT * FROM user_roles WHERE user_id = '329ba3ab-9810-4d5b-a308-b5e6985e68b3';
```

## Các lỗi có thể gặp

### 1. 401 Unauthorized
**Nguyên nhân**: Token không hợp lệ hoặc hết hạn
**Giải pháp**: 
- Kiểm tra token trong localStorage
- Đăng nhập lại để lấy token mới

### 2. 403 Forbidden  
**Nguyên nhân**: User không có quyền ADMIN
**Giải pháp**:
- Đảm bảo user có role ADMIN
- Kiểm tra `@PreAuthorize("hasRole('ROLE_ADMIN')")` trong controller

### 3. 404 Not Found
**Nguyên nhân**: User hoặc Role không tồn tại
**Giải pháp**:
- Kiểm tra user ID trong database
- Tạo role ROLE_STUDENT trước

### 4. 500 Internal Server Error
**Nguyên nhân**: Lỗi backend
**Giải pháp**:
- Kiểm tra backend logs
- Restart identity-service

## Các bước khắc phục

### Bước 1: Tạo Role trước
```javascript
// Sử dụng Role Setup Test trong admin dashboard
// Hoặc gọi API trực tiếp:
fetch('/api/v1/identity/roles', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'ROLE_STUDENT',
    description: 'Student role',
    permissions: []
  })
})
```

### Bước 2: Kiểm tra User ID
```javascript
// Lấy danh sách users
fetch('/api/v1/identity/users', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => console.log('Users:', data))
```

### Bước 3: Test Role Assignment
```javascript
// Test với user ID thực tế
const userId = 'ACTUAL_USER_ID_FROM_DATABASE'
const roleName = 'ROLE_STUDENT'

fetch(`/api/v1/identity/roles/assign-to-user?userId=${userId}&role=${roleName}`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => console.log('Result:', data))
```

## Debug Commands

### Kiểm tra Backend Logs
```bash
# Xem logs của identity-service
tail -f identity-service/logs/application.log

# Hoặc nếu chạy với mvn
mvn spring-boot:run -Dspring-boot.run.arguments="--logging.level.com.LinkVerse.identity=DEBUG"
```

### Kiểm tra Network Tab
1. Mở Developer Tools (F12)
2. Vào tab Network
3. Thực hiện role assignment
4. Xem request/response details

### Test với Postman
```json
POST http://localhost:9999/api/v1/identity/roles/assign-to-user?userId=329ba3ab-9810-4d5b-a308-b5e6985e68b3&role=ROLE_STUDENT
Headers:
  Authorization: Bearer <YOUR_TOKEN>
  Content-Type: application/json
```

## Kết quả mong đợi

### Thành công:
```json
{
  "success": true,
  "message": "Role assigned to user",
  "result": null
}
```

### Lỗi User not found:
```json
{
  "success": false,
  "error": "User not found"
}
```

### Lỗi Role not found:
```json
{
  "success": false,
  "error": "Role not found"
}
```

## Next Steps

1. **Tạo roles và permissions** trước khi test assignment
2. **Kiểm tra user ID** thực tế từ database
3. **Test từng bước** một cách có hệ thống
4. **Kiểm tra logs** để xác định nguyên nhân chính xác
