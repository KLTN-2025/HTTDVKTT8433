# API Debug Guide - Role & Permission Management

## 🔍 **Vấn đề đã sửa:**

### **1. API Endpoint sai:**
- ❌ **Trước:** `http://localhost:5173/api/v1/identity/profile/users` (404 Not Found)
- ✅ **Sau:** `http://localhost:9999/api/v1/profile/users` (200 OK)

### **2. Cấu trúc API Response:**
```json
{
  "code": 1000,
  "result": [
    {
      "id": "68ecc6679472b45742b9987c",
      "userId": "5453745b-0d6f-4269-8c69-ef43d52957b7",
      "username": "admin",
      "status": "ONLINE",
      "email": "admin@yourdomain.tld",
      "firstName": null,
      "lastName": null,
      "roles": [],
      "permissions": []
    }
  ]
}
```

## 🚀 **Cách test API:**

### **1. Test trực tiếp trong browser:**
```
http://localhost:9999/api/v1/profile/users
```

### **2. Test với curl:**
```bash
curl -X GET "http://localhost:9999/api/v1/profile/users" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### **3. Test trong Developer Tools:**
```javascript
// Mở Console trong browser
fetch('/api/v1/profile/users', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => console.log(data))
```

## 🔧 **Các API Endpoints đã sửa:**

### **User Management:**
- ✅ `GET /api/v1/profile/users` - Lấy danh sách users
- ✅ Sử dụng `userId` thay vì `id` cho role assignment
- ✅ Hiển thị thông tin user: fullName, firstName+lastName, hoặc username

### **Role Management:**
- ✅ `POST /api/v1/identity/roles` - Tạo role
- ✅ `GET /api/v1/identity/roles` - Lấy danh sách roles
- ✅ `DELETE /api/v1/identity/roles/{roleName}` - Xóa role
- ✅ `POST /api/v1/identity/roles/assign-to-user` - Gán role cho user
- ✅ `DELETE /api/v1/identity/roles/users/{userId}/roles/{roleName}` - Xóa role khỏi user

### **Permission Management:**
- ✅ `POST /api/v1/identity/permissions` - Tạo permission
- ✅ `GET /api/v1/identity/permissions` - Lấy danh sách permissions
- ✅ `DELETE /api/v1/identity/permissions/{permissionName}` - Xóa permission
- ✅ `POST /api/v1/identity/permissions/assign-to-user` - Gán permission cho user

## 📋 **User Interface đã tối ưu:**

### **1. Hiển thị tên user:**
- **Ưu tiên:** `fullName` → `firstName + lastName` → `username`
- **Helper function:** `getUserDisplayName(user)`

### **2. Thông tin user hiển thị:**
- ✅ **Tên đầy đủ** (fullName hoặc firstName + lastName)
- ✅ **Email**
- ✅ **User ID** (để debug)
- ✅ **Roles** (nếu có)
- ✅ **Permissions** (nếu có)

### **3. Select options:**
- ✅ **Format:** "Tên User - email@domain.com"
- ✅ **Value:** `userId` (để gán role/permission)

## 🐛 **Troubleshooting:**

### **Lỗi 404 Not Found:**
- ✅ **Đã sửa:** Sử dụng `/api/v1/profile/users` thay vì `/api/v1/identity/profile/users`
- ✅ **Proxy:** Vite proxy đã cấu hình đúng

### **Lỗi 401 Unauthorized:**
- ✅ **Kiểm tra token:** `localStorage.getItem('access_token')`
- ✅ **Đăng nhập lại:** Với tài khoản admin

### **Lỗi 403 Forbidden:**
- ✅ **Kiểm tra quyền:** User phải có role ADMIN
- ✅ **Kiểm tra endpoint:** API Gateway có cho phép access không

## 🎯 **Test Cases:**

### **1. Test lấy danh sách users:**
```javascript
// Expected: 200 OK với danh sách users
GET /api/v1/profile/users
```

### **2. Test tạo role:**
```javascript
// Expected: 200 OK với role mới
POST /api/v1/identity/roles
{
  "name": "ROLE_STUDENT",
  "description": "Student role",
  "permissions": ["READ_QUIZ", "TAKE_QUIZ"]
}
```

### **3. Test gán role cho user:**
```javascript
// Expected: 200 OK
POST /api/v1/identity/roles/assign-to-user?userId=USER_ID&role=ROLE_STUDENT
```

## ✅ **Kết quả:**

- ✅ **API endpoint đã đúng**
- ✅ **User interface đã tối ưu**
- ✅ **Hiển thị thông tin user rõ ràng**
- ✅ **Role assignment hoạt động**
- ✅ **Permission assignment hoạt động**

**Hệ thống Role & Permission Management đã sẵn sàng sử dụng!** 🎉
