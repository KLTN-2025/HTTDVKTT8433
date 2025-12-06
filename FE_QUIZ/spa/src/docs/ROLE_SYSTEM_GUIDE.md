# Role-Based UI System Guide

Hệ thống role-based UI cho phép bạn kiểm soát giao diện và chức năng dựa trên role của user.

## Cấu trúc Role System

### Roles
- `ROLE_USER`: User cơ bản
- `ROLE_STUDENT`: Học sinh
- `ROLE_TEACHER`: Giáo viên  
- `ROLE_ADMIN`: Quản trị viên

### Permissions
- `USER`: Quyền cơ bản
- `STUDENT`: Quyền học sinh
- `TEACHER`: Quyền giáo viên
- `ADMIN`: Quyền quản trị

## Cách sử dụng

### 1. Sử dụng RoleGuard Component

```tsx
import { RoleGuard, AdminOnly, TeacherOnly, StudentOnly } from '@/components/RoleGuard'

// Chỉ hiển thị cho Admin
<AdminOnly user={user}>
  <AdminPanel />
</AdminOnly>

// Chỉ hiển thị cho Teacher hoặc Admin
<TeacherOnly user={user}>
  <CreateQuizButton />
</TeacherOnly>

// Sử dụng RoleGuard với nhiều điều kiện
<RoleGuard 
  user={user} 
  requireRoles={['ROLE_TEACHER', 'ROLE_ADMIN']}
  fallback={<div>Bạn không có quyền truy cập</div>}
>
  <TeacherContent />
</RoleGuard>
```

### 2. Sử dụng ProtectedRoute

```tsx
import { ProtectedRoute, AdminRoute, TeacherRoute } from '@/components/ProtectedRoute'

// Bảo vệ route cho Admin
<AdminRoute user={user}>
  <AdminUsersPage />
</AdminRoute>

// Bảo vệ route cho Teacher
<TeacherRoute user={user}>
  <CreateQuizPage />
</TeacherRoute>

// Sử dụng ProtectedRoute với điều kiện tùy chỉnh
<ProtectedRoute 
  user={user} 
  requireRoles={['ROLE_TEACHER', 'ROLE_ADMIN']}
  redirectTo="/unauthorized"
>
  <TeacherContent />
</ProtectedRoute>
```

### 3. Sử dụng Utility Functions

```tsx
import { 
  hasRole, 
  hasAnyRole, 
  isAdmin, 
  isTeacher, 
  canCreateContent,
  getUserDisplayName 
} from '@/utils/roleUtils'

// Kiểm tra role
if (isAdmin(user)) {
  // Hiển thị admin features
}

if (canCreateContent(user)) {
  // Hiển thị create content button
}

// Lấy tên hiển thị
const displayName = getUserDisplayName(user)
```

### 4. Sử dụng useAuth Hook

```tsx
import { useAuth } from '@/hooks/useAuth'

function MyComponent() {
  const { user, loading, isAuthenticated, navigationItems } = useAuth()
  
  if (loading) return <div>Loading...</div>
  if (!isAuthenticated) return <div>Please login</div>
  
  return (
    <div>
      <h1>Welcome {user?.firstName}!</h1>
      {/* Render based on user role */}
    </div>
  )
}
```

### 5. Sử dụng RoleBasedNavigation

```tsx
import { RoleBasedNavigation } from '@/components/RoleBasedNavigation'

function App() {
  const { user } = useAuth()
  
  return (
    <div>
      <RoleBasedNavigation user={user} />
      {/* Rest of your app */}
    </div>
  )
}
```

### 6. Sử dụng UserProfileCard

```tsx
import { UserProfileCard } from '@/components/UserProfileCard'

function ProfilePage() {
  const { user } = useAuth()
  
  return (
    <div>
      <UserProfileCard 
        user={user} 
        showRoles={true}
        showPermissions={false}
      />
    </div>
  )
}
```

## API Integration

### Lấy thông tin user từ API

```tsx
// Trong useAuth hook hoặc component
const fetchUserProfile = async () => {
  try {
    const response = await fetch('/api/v1/profile/users/my-profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    const data = await response.json()
    
    if (data.code === 1000 && data.result) {
      // Cập nhật user state
      setUser(data.result)
    }
  } catch (error) {
    console.error('Error fetching user profile:', error)
  }
}
```

### Cấu trúc API Response

```json
{
  "code": 1000,
  "result": {
    "id": "68ecce6253414248f4f10473",
    "userId": "af458dcf-d843-49a7-bcbf-c33e97d2479c",
    "username": "ngocduong3",
    "status": "ONLINE",
    "email": "ngocduong3@yopmail.com",
    "firstName": "duong",
    "lastName": "Loi",
    "roles": ["ROLE_TEACHER", "ROLE_USER"],
    "permissions": ["TEACHER"],
    // ... other fields
  }
}
```

## Best Practices

### 1. Luôn kiểm tra user trước khi render
```tsx
if (!user) return <div>Loading...</div>
```

### 2. Sử dụng fallback cho RoleGuard
```tsx
<RoleGuard user={user} requireRole="ROLE_ADMIN" fallback={<div>Access denied</div>}>
  <AdminContent />
</RoleGuard>
```

### 3. Sử dụng navigation items từ useAuth
```tsx
const { navigationItems } = useAuth()
// navigationItems sẽ tự động filter theo role của user
```

### 4. Kiểm tra multiple roles
```tsx
// Thay vì kiểm tra từng role riêng lẻ
if (user.roles.includes('ROLE_TEACHER') || user.roles.includes('ROLE_ADMIN')) {
  // Show teacher content
}

// Sử dụng utility function
if (hasAnyRole(user, ['ROLE_TEACHER', 'ROLE_ADMIN'])) {
  // Show teacher content
}
```

## Example Usage trong App

```tsx
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { RoleBasedNavigation } from '@/components/RoleBasedNavigation'
import { ProtectedRoute, AdminRoute, TeacherRoute } from '@/components/ProtectedRoute'
import { RoleGuard } from '@/components/RoleGuard'

function App() {
  const { user, loading, isAuthenticated } = useAuth()
  
  if (loading) return <div>Loading...</div>
  
  return (
    <Router>
      <div>
        {isAuthenticated && <RoleBasedNavigation user={user} />}
        
        <Routes>
          <Route path="/dashboard" element={
            <ProtectedRoute user={user}>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <AdminRoute user={user}>
              <AdminPanel />
            </AdminRoute>
          } />
          
          <Route path="/create-quiz" element={
            <TeacherRoute user={user}>
              <CreateQuiz />
            </TeacherRoute>
          } />
        </Routes>
      </div>
    </Router>
  )
}
```

Hệ thống này cho phép bạn dễ dàng kiểm soát UI và chức năng dựa trên role của user một cách linh hoạt và bảo mật.
