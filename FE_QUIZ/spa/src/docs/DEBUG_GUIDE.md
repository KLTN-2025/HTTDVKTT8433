# Debug Guide - Teacher Role Access

Hướng dẫn debug và fix vấn đề teacher role không hiển thị giao diện.

## 🔍 **Vấn đề hiện tại:**

User có role `ROLE_TEACHER` nhưng chưa thấy giao diện teacher, chỉ thấy trang `/quiz`.

## 🛠️ **Các bước debug:**

### **1. Kiểm tra User Data**
```tsx
// Thêm vào component hiện tại để debug
import { useAuth } from '@/hooks/useAuth'

function YourComponent() {
  const { user, loading, error } = useAuth()
  
  console.log('User data:', user)
  console.log('Loading:', loading)
  console.log('Error:', error)
  
  // Rest of your component
}
```

### **2. Sử dụng Debug Page**
Tạo route đến debug page để kiểm tra:

```tsx
// Trong App.tsx hoặc router config
import UserDebugPage from '@/pages/UserDebugPage'

<Route path="/debug" element={<UserDebugPage />} />
```

Truy cập: `http://localhost:5173/debug`

### **3. Kiểm tra API Response Structure**
API response hiện tại:
```json
{
  "code": 1000,
  "result": {
    "roles": [
      {
        "name": "ROLE_TEACHER",
        "description": "TEACHER", 
        "permissions": ["TEACHER"]
      }
    ]
  }
}
```

### **4. Transform API Response**
Sử dụng `transformApiUserProfile` function:

```tsx
import { transformApiUserProfile } from '@/utils/apiTransform'

// Transform API response
const transformedUser = transformApiUserProfile(apiResponse)
console.log('Transformed user:', transformedUser)
```

### **5. Kiểm tra Role Functions**
```tsx
import { isTeacher, getPrimaryRole } from '@/utils/apiTransform'

// Check if user is teacher
console.log('Is teacher:', isTeacher(user))
console.log('Primary role:', getPrimaryRole(user))
```

## 🔧 **Các file đã tạo để debug:**

### **1. Debug Components:**
- `src/components/UserDebugInfo.tsx` - Hiển thị thông tin user
- `src/components/ApiTestComponent.tsx` - Test API transformation
- `src/components/RoleBasedNavigationBar.tsx` - Navigation dựa trên role
- `src/components/TeacherAccessPrompt.tsx` - Prompt cho teacher access

### **2. Debug Pages:**
- `src/pages/UserDebugPage.tsx` - Trang debug chính
- `src/examples/DebugAppExample.tsx` - App example với debug routes

### **3. Utility Functions:**
- `src/utils/apiTransform.ts` - Transform API response
- `src/hooks/useAuth.ts` - Updated với transformation

## 🚀 **Cách sử dụng:**

### **Option 1: Sử dụng Debug Page**
1. Thêm route debug vào App:
```tsx
import UserDebugPage from '@/pages/UserDebugPage'

<Route path="/debug" element={<UserDebugPage />} />
```

2. Truy cập: `http://localhost:5173/debug`

### **Option 2: Sử dụng Debug App Example**
```tsx
import { DebugAppExample } from '@/examples/DebugAppExample'

function App() {
  return <DebugAppExample />
}
```

### **Option 3: Thêm vào component hiện tại**
```tsx
import { UserDebugInfo } from '@/components/UserDebugInfo'

function YourCurrentComponent() {
  return (
    <div>
      {/* Your existing content */}
      <UserDebugInfo />
    </div>
  )
}
```

## 🔍 **Debug Steps:**

### **Step 1: Kiểm tra User Data**
- Mở browser console
- Kiểm tra user object structure
- Verify roles array

### **Step 2: Test API Transformation**
- Sử dụng `ApiTestComponent`
- Kiểm tra transformation result
- Verify role extraction

### **Step 3: Check Role Functions**
- Test `isTeacher(user)` function
- Check `getPrimaryRole(user)`
- Verify role-based navigation

### **Step 4: Fix Issues**
- Update API response structure nếu cần
- Fix transformation logic
- Update role checking functions

## 🎯 **Expected Results:**

Sau khi debug thành công, bạn sẽ thấy:

1. **User Debug Info** hiển thị:
   - ✅ Is Teacher: Yes
   - ✅ Primary Role: ROLE_TEACHER
   - ✅ Roles: ROLE_TEACHER, ROLE_USER

2. **Navigation Bar** hiển thị:
   - Teacher Dashboard
   - My Quizzes
   - Create Quiz
   - Analytics

3. **Teacher Access Prompt** hiển thị:
   - Welcome message
   - Quick action buttons
   - Role information

## 🚨 **Common Issues & Solutions:**

### **Issue 1: Roles not extracted**
**Solution:** Check `transformApiUserProfile` function

### **Issue 2: isTeacher returns false**
**Solution:** Verify role array structure

### **Issue 3: Navigation not showing**
**Solution:** Check `getRoleBasedNavItems` function

### **Issue 4: API response structure different**
**Solution:** Update transformation function

## 📝 **Quick Fix Commands:**

```bash
# Check if files exist
ls src/components/UserDebugInfo.tsx
ls src/utils/apiTransform.ts
ls src/pages/UserDebugPage.tsx

# Test transformation
node -e "
const { transformApiUserProfile } = require('./src/utils/apiTransform.ts');
const mockData = { roles: [{ name: 'ROLE_TEACHER' }] };
console.log(transformApiUserProfile(mockData));
"
```

## 🎉 **Success Indicators:**

Khi debug thành công, bạn sẽ thấy:
- ✅ User data loaded correctly
- ✅ Roles extracted properly  
- ✅ isTeacher() returns true
- ✅ Navigation shows teacher options
- ✅ Teacher dashboard accessible

Hãy sử dụng debug page để kiểm tra và fix các vấn đề! 🔧✨
