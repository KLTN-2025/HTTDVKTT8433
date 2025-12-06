# Teacher UI System Guide

Hệ thống giao diện dành cho Teacher dựa trên phân tích backend quiz-service và các quyền của ROLE_TEACHER.

## 🔍 **Teacher Permissions từ Backend Analysis**

### **Quiz Management:**
- ✅ Tạo quiz (`POST /quizzes`)
- ✅ Xem tất cả quiz (chỉ quiz của mình)
- ✅ Cập nhật quiz metadata (`PATCH /quizzes/{id}`)
- ✅ Fork quiz (`POST /quizzes/{id}/fork`)
- ✅ Publish/Unpublish quiz (`POST /quizzes/{id}/publish`, `POST /quizzes/{id}/unpublish`)

### **Question & Answer Management:**
- ✅ Tạo câu hỏi (`POST /quizzes/questions`)
- ✅ Cập nhật câu hỏi (`PATCH /quizzes/questions`, `PATCH /quizzes/questions/{qid}`)
- ✅ Xóa câu hỏi (`DELETE /quizzes/questions/{qid}`)
- ✅ Tạo đáp án (`POST /quizzes/answers`, `POST /quizzes/questions/{qid}/answers`)
- ✅ Cập nhật đáp án (`PATCH /quizzes/answers`, `PATCH /quizzes/answers/{aid}`)
- ✅ Xóa đáp án (`DELETE /quizzes/answers/{aid}`)

### **Analytics & Statistics:**
- ✅ Xem thống kê quiz (`GET /statistics`)
- ✅ Phân tích hiệu suất học sinh

## 📁 **Files đã tạo:**

### **Pages:**
1. **`src/pages/TeacherDashboard.tsx`** - Dashboard chính với overview và quick actions
2. **`src/pages/TeacherQuizManagement.tsx`** - Quản lý danh sách quiz (CRUD)
3. **`src/pages/TeacherCreateQuiz.tsx`** - Tạo quiz mới
4. **`src/pages/TeacherQuizEditor.tsx`** - Editor để chỉnh sửa quiz và câu hỏi
5. **`src/pages/TeacherAnalytics.tsx`** - Dashboard phân tích và thống kê

### **Components:**
6. **`src/components/TeacherNavigation.tsx`** - Navigation dành riêng cho teacher
7. **`src/components/RoleGuard.tsx`** - Bảo vệ UI elements dựa trên role
8. **`src/components/ProtectedRoute.tsx`** - Bảo vệ routes

### **API Client:**
9. **`src/api/teacherClient.ts`** - API client functions cho tất cả teacher endpoints

### **Examples:**
10. **`src/examples/TeacherAppExample.tsx`** - Example về cách tích hợp trong App

## 🚀 **Tính năng chính:**

### **1. Teacher Dashboard**
- 📊 Overview statistics (total quizzes, students, submissions, avg score)
- 📚 Recent quizzes với status indicators
- ⚡ Quick actions (create quiz, import, analytics, manage students)
- 🕒 Recent activity feed

### **2. Quiz Management**
- 📝 CRUD operations cho quizzes
- 🔍 Search và filter (by subject, status, title)
- 📊 Status management (Draft, Published, Archived)
- 🔄 Lifecycle actions (publish, unpublish, fork, archive, delete)

### **3. Quiz Editor**
- ✏️ Visual quiz editor với drag & drop
- ❓ Question management (create, edit, delete questions)
- ✅ Answer management (multiple choice, true/false, essay)
- 👁️ Live preview
- ⚙️ Quiz settings (duration, time limit, expiration)

### **4. Analytics Dashboard**
- 📈 Overall statistics
- 📊 Quiz performance metrics
- 👥 Student performance tracking
- 🎯 Question-level analytics
- 📋 Top performers và struggling students
- 📅 Time-based filtering

### **5. Role-Based Security**
- 🔒 Teacher-only access với role guards
- 🛡️ Protected routes
- 👤 User profile integration
- 🔐 Permission-based UI rendering

## 💡 **Cách sử dụng:**

### **1. Import và sử dụng trong App**
```tsx
import { TeacherAppExample } from '@/examples/TeacherAppExample'

function App() {
  return <TeacherAppExample />
}
```

### **2. Sử dụng individual components**
```tsx
import TeacherDashboard from '@/pages/TeacherDashboard'
import { TeacherNavigation } from '@/components/TeacherNavigation'
import { useAuth } from '@/hooks/useAuth'

function MyApp() {
  const { user } = useAuth()
  
  return (
    <div>
      <TeacherNavigation user={user} />
      <TeacherDashboard />
    </div>
  )
}
```

### **3. Sử dụng API client**
```tsx
import { 
  createQuiz, 
  getAllQuizzes, 
  publishQuiz,
  getQuizAnalytics 
} from '@/api/teacherClient'

// Create a new quiz
const newQuiz = await createQuiz({
  title: 'JavaScript Fundamentals',
  subjectId: 'sub-1',
  durationMinutes: 30,
  hasNoTimeLimit: false
})

// Get all teacher's quizzes
const quizzes = await getAllQuizzes()

// Publish a quiz
await publishQuiz(quizId)

// Get analytics
const analytics = await getQuizAnalytics(quizId)
```

### **4. Sử dụng Role Guards**
```tsx
import { RoleGuard, TeacherOnly } from '@/components/RoleGuard'

// Protect UI elements
<TeacherOnly user={user}>
  <CreateQuizButton />
</TeacherOnly>

// Custom role guard
<RoleGuard 
  user={user} 
  requireRoles={['ROLE_TEACHER', 'ROLE_ADMIN']}
  fallback={<div>Access denied</div>}
>
  <TeacherContent />
</RoleGuard>
```

## 🔧 **API Integration:**

### **Backend Endpoints được support:**
- `POST /quizzes` - Create quiz
- `GET /quizzes` - Get all quizzes (teacher's only)
- `PATCH /quizzes/{id}` - Update quiz
- `DELETE /quizzes/{id}` - Delete quiz
- `POST /quizzes/{id}/publish` - Publish quiz
- `POST /quizzes/{id}/unpublish` - Unpublish quiz
- `POST /quizzes/{id}/fork` - Fork quiz
- `POST /quizzes/{id}/archive` - Archive quiz
- `POST /quizzes/questions` - Create question
- `PATCH /quizzes/questions` - Update question
- `DELETE /quizzes/questions/{qid}` - Delete question
- `POST /quizzes/answers` - Create answer
- `PATCH /quizzes/answers` - Update answer
- `DELETE /quizzes/answers/{aid}` - Delete answer
- `GET /statistics` - Get analytics
- `GET /quizzes/subjects` - Get subjects

### **Environment Variables:**
```env
REACT_APP_API_BASE_URL=http://localhost:9999/api/v1
```

## 📱 **Responsive Design:**

- 📱 Mobile-first approach
- 💻 Desktop optimization
- 🎨 Modern UI với Tailwind CSS
- 🌈 Color-coded status indicators
- 📊 Interactive charts và graphs
- 🎯 Intuitive navigation

## 🎨 **UI Features:**

### **Status Indicators:**
- 🟢 Published (Green)
- 🟡 Draft (Yellow)  
- ⚫ Archived (Gray)

### **Difficulty Levels:**
- 🟢 Easy (Green)
- 🟡 Medium (Yellow)
- 🔴 Hard (Red)

### **Question Types:**
- 🔘 Multiple Choice
- ✅ True/False
- 📝 Essay

## 🔐 **Security Features:**

- ✅ Role-based access control
- 🔒 Protected routes
- 👤 User authentication
- 🛡️ Permission-based UI
- 🚫 Unauthorized access prevention

## 📈 **Analytics Features:**

- 📊 Overall performance metrics
- 📈 Quiz-specific analytics
- 👥 Student performance tracking
- 🎯 Question-level insights
- 📅 Time-based filtering
- 🏆 Top performers identification
- ⚠️ Struggling students alerts

## 🚀 **Getting Started:**

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
```env
REACT_APP_API_BASE_URL=http://localhost:9999/api/v1
```

3. **Import và sử dụng:**
```tsx
import { TeacherAppExample } from '@/examples/TeacherAppExample'

function App() {
  return <TeacherAppExample />
}
```

4. **Customize theo nhu cầu:**
- Modify components trong `src/pages/`
- Update API endpoints trong `src/api/teacherClient.ts`
- Customize styling với Tailwind CSS

## 🎯 **Best Practices:**

1. **Luôn kiểm tra user role trước khi render**
2. **Sử dụng loading states cho API calls**
3. **Handle errors gracefully**
4. **Implement proper validation**
5. **Use TypeScript cho type safety**
6. **Follow responsive design principles**
7. **Test với different user roles**

Hệ thống Teacher UI này cung cấp một giao diện hoàn chỉnh và professional cho teachers để quản lý quizzes, theo dõi student performance, và sử dụng analytics để cải thiện chất lượng giảng dạy! 🎓✨
