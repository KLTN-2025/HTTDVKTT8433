# Role & Permission Management Guide

## 🎯 **Tổng quan**
Hệ thống quản lý role và permission đã được triển khai đầy đủ trong Admin Dashboard với các tính năng:

### 📋 **Tính năng chính:**
1. **Role Management** - Quản lý vai trò
2. **Permission Management** - Quản lý quyền hạn  
3. **User Management** - Quản lý người dùng
4. **Role & Permission Assignment** - Gán quyền cho người dùng

## 🚀 **Cách sử dụng**

### **1. Truy cập Admin Dashboard**
```
http://localhost:5173/admin
```

### **2. Đăng nhập với tài khoản Admin**
- Username: `admin`
- Password: `admin123`

### **3. Chọn "Role & Permission Management"**
- Click vào button "Role & Permission Management" trong sidebar
- Hoặc click vào "Role Test" để test API

## 📊 **Các Tab chính**

### **Tab 1: Roles**
- **Tạo Role mới:**
  - Nhập tên role (VD: `ROLE_STUDENT`)
  - Nhập mô tả
  - Chọn permissions cho role
  - Click "Create Role"

- **Xem danh sách Roles:**
  - Hiển thị tất cả roles trong hệ thống
  - Xem permissions của từng role
  - Xóa role (nếu cần)

### **Tab 2: Permissions**
- **Tạo Permission mới:**
  - Nhập tên permission (VD: `READ_QUIZ`)
  - Nhập mô tả
  - Click "Create Permission"

- **Xem danh sách Permissions:**
  - Hiển thị tất cả permissions
  - Xóa permission (nếu cần)

### **Tab 3: Users**
- **Xem danh sách Users:**
  - Hiển thị tất cả users trong hệ thống
  - Xem roles và permissions của từng user
  - Thông tin chi tiết: tên, email, trạng thái

### **Tab 4: Assign Roles & Permissions**
- **Gán Role cho User:**
  - Chọn user từ dropdown
  - Chọn role từ dropdown
  - Click "Assign Role"

- **Gán Permission cho User:**
  - Chọn user từ dropdown
  - Chọn permission từ dropdown
  - Click "Assign Permission"

- **Xóa Role khỏi User:**
  - Xem danh sách users với roles hiện tại
  - Click "×" bên cạnh role để xóa

## 🔧 **API Endpoints**

### **Role Management:**
```
POST   /api/v1/identity/roles                    # Tạo role
GET    /api/v1/identity/roles                    # Lấy danh sách roles
DELETE /api/v1/identity/roles/{roleName}         # Xóa role
POST   /api/v1/identity/roles/assign-to-user    # Gán role cho user
DELETE /api/v1/identity/roles/users/{userId}/roles/{roleName}  # Xóa role khỏi user
```

### **Permission Management:**
```
POST   /api/v1/identity/permissions                    # Tạo permission
GET    /api/v1/identity/permissions                    # Lấy danh sách permissions
DELETE /api/v1/identity/permissions/{permissionName}   # Xóa permission
POST   /api/v1/identity/permissions/assign-to-user     # Gán permission cho user
```

### **User Management:**
```
GET    /api/v1/identity/users                    # Lấy danh sách users
```

## 🎯 **Ví dụ sử dụng**

### **Tạo hệ thống phân quyền cơ bản:**

1. **Tạo Permissions:**
   ```
   READ_QUIZ - Đọc quiz
   TAKE_QUIZ - Làm quiz
   CREATE_QUIZ - Tạo quiz
   EDIT_QUIZ - Sửa quiz
   MANAGE_USERS - Quản lý users
   ```

2. **Tạo Roles:**
   ```
   ROLE_STUDENT:
     - READ_QUIZ
     - TAKE_QUIZ
   
   ROLE_TEACHER:
     - READ_QUIZ
     - TAKE_QUIZ
     - CREATE_QUIZ
     - EDIT_QUIZ
   
   ROLE_ADMIN:
     - Tất cả permissions
   ```

3. **Gán Roles cho Users:**
   - Chọn user → Chọn role → Assign

### **Test API trực tiếp:**

1. **Tạo Role:**
   ```bash
   curl -X POST http://localhost:9999/api/v1/identity/roles \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "ROLE_STUDENT",
       "description": "Student role",
       "permissions": ["READ_QUIZ", "TAKE_QUIZ"]
     }'
   ```

2. **Gán Role cho User:**
   ```bash
   curl -X POST "http://localhost:9999/api/v1/identity/roles/assign-to-user?userId=USER_ID&role=ROLE_STUDENT" \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

3. **Xóa Role khỏi User:**
   ```bash
   curl -X DELETE "http://localhost:9999/api/v1/identity/roles/users/USER_ID/roles/ROLE_STUDENT" \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

## 🐛 **Troubleshooting**

### **Lỗi thường gặp:**

1. **"Unauthorized" (401):**
   - Kiểm tra token trong localStorage
   - Đăng nhập lại với tài khoản admin

2. **"User not found":**
   - Kiểm tra userId có đúng không
   - User phải tồn tại trong hệ thống

3. **"Role not found":**
   - Tạo role trước khi gán
   - Kiểm tra tên role có đúng không

4. **"Permission not found":**
   - Tạo permission trước khi gán
   - Kiểm tra tên permission có đúng không

### **Debug Steps:**

1. **Kiểm tra Network Tab:**
   - Mở Developer Tools
   - Xem Network tab
   - Kiểm tra request/response

2. **Kiểm tra Console:**
   - Xem lỗi JavaScript
   - Kiểm tra API calls

3. **Kiểm tra Backend Logs:**
   - Xem logs của identity-service
   - Kiểm tra database

## 📝 **Notes**

- **API Gateway:** Tất cả requests đi qua `http://localhost:9999/api/v1/`
- **Authentication:** Cần Bearer token trong header
- **Database:** Roles và permissions được lưu trong database
- **Real-time:** Thay đổi được áp dụng ngay lập tức

## 🎉 **Kết luận**

Hệ thống role và permission đã được triển khai đầy đủ với:
- ✅ Frontend UI hoàn chỉnh
- ✅ Backend API đầy đủ
- ✅ Database integration
- ✅ Error handling
- ✅ User-friendly interface

Bạn có thể sử dụng ngay để quản lý phân quyền trong hệ thống!