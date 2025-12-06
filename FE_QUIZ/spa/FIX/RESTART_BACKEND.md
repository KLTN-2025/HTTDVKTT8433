# Restart Backend Service

## Vấn đề
Đã thêm field `fullName` vào `UserResponse.java` nhưng cần restart backend để áp dụng thay đổi.

## Các bước thực hiện

### 1. Stop Identity Service
```bash
# Tìm process đang chạy identity-service
netstat -ano | findstr :9195

# Kill process (thay PID bằng process ID thực tế)
taskkill /PID <PID> /F
```

### 2. Rebuild và Start Identity Service
```bash
cd identity-service
mvn clean compile
mvn spring-boot:run
```

### 3. Kiểm tra
- Identity service chạy trên port 9195
- API Gateway chạy trên port 9999
- Frontend chạy trên port 5173

## Kết quả mong đợi
Sau khi restart, API `/users/my-info` sẽ trả về:
```json
{
  "result": {
    "id": "...",
    "username": "...",
    "firstName": null,
    "lastName": null,
    "fullName": "Ngọc Dương Đặng",
    "email": "ngocduong2592003@gmail.com",
    ...
  }
}
```

## Test
1. Đăng nhập Google
2. Kiểm tra console logs trong QuizHome
3. Xem tên hiển thị: "Xin chào, Ngọc Dương Đặng"
