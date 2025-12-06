# Backend Fix Summary

## Vấn đề đã sửa
**Lỗi**: `User not found: f43740df-5dc2-4294-b122-1ec3a516f2d6`

**Nguyên nhân**: 
- JWT token chứa `userId` (UUID) trong `authentication.getName()`
- Nhưng code đang tìm user bằng `findByUsername()` thay vì `findById()`
- Google OAuth tạo user với `username = email`, nhưng JWT chứa `userId`

## Các thay đổi đã thực hiện

### 1. UserService.java - Sửa các method:
- ✅ `getMyInfo()`: `findByUsername(name)` → `findById(userId)`
- ✅ `deleteUser()`: `findUserById(userID)` → `findById(userID)`
- ✅ `deleteUserPermanent()`: `findUserById(userID)` → `findById(userID)`

### 2. UserResponse.java - Thêm field:
- ✅ Thêm `String fullName` để map từ database

## Các bước restart

### 1. Stop Identity Service
```bash
# Tìm process
netstat -ano | findstr :9195
# Kill process (thay <PID> bằng process ID thực tế)
taskkill /PID <PID> /F
```

### 2. Rebuild và Start
```bash
cd identity-service
mvn clean compile
mvn spring-boot:run
```

### 3. Test Google Login Flow
1. **Frontend**: `http://localhost:5173/login`
2. **Click "Google Login"** → Redirect đến Google
3. **Google OAuth** → User đăng nhập
4. **Backend redirect** → `/google-callback?token=...`
5. **Frontend** → Lưu token → Redirect đến `/quiz`
6. **QuizHome** → Gọi `/users/my-info` → Hiển thị tên thật

## Kết quả mong đợi

### Backend Logs:
```
✅ Authenticated user ID: f43740df-5dc2-4294-b122-1ec3a516f2d6
✅ User found with ID: f43740df-5dc2-4294-b122-1ec3a516f2d6
```

### Frontend Response:
```json
{
  "result": {
    "id": "f43740df-5dc2-4294-b122-1ec3a516f2d6",
    "fullName": "Ngọc Dương Đặng",
    "email": "ngocduong2592003@gmail.com",
    "username": "ngocduong2592003@gmail.com"
  }
}
```

### Frontend Display:
```
Xin chào, Ngọc Dương Đặng
```

## Debug Commands

### Kiểm tra token:
```javascript
console.log('Token:', localStorage.getItem('access_token'))
```

### Test API trực tiếp:
```bash
curl -H "Authorization: Bearer <token>" http://localhost:9999/api/v1/identity/users/my-info
```

## Nếu vẫn lỗi

1. **Kiểm tra JWT token** - decode tại jwt.io
2. **Kiểm tra database** - user có tồn tại với ID đó không
3. **Kiểm tra logs** - xem authentication context
4. **Clear browser cache** và test lại
