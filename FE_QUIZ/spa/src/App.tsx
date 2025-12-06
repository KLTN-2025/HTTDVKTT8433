import { Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './pages/AdminDashboard'
import QuizHome from './pages/QuizHome'
import GoogleCallback from './pages/GoogleCallback'
import ApiTest from './pages/ApiTest'
import PublicQuizHome from './components/PublicQuizHome'
import TeacherDashboard from './pages/TeacherDashboard'
import TeacherQuizzes from './pages/TeacherQuizzes'
import TeacherCreateQuiz from './pages/TeacherCreateQuiz'
import TeacherQuizEditor from './pages/TeacherQuizEditor'
import TeacherAnalytics from './pages/TeacherAnalytics'
import TeacherSubjects from './pages/TeacherSubjects'
import TeacherQuizTaking from './pages/TeacherQuizTaking'
import TeacherReviewQuizzes from './pages/TeacherReviewQuizzes'
import ReviewQuizzes from './pages/ReviewQuizzes'
import QuizHistory from './pages/QuizHistory'
import QuizSubmissionDetail from './pages/QuizSubmissionDetail'
import UserDebugPage from './pages/UserDebugPage'
import SubjectsPage from './pages/SubjectsPage'
import StudentDashboard from './pages/StudentDashboard'
import StudentQuizTaking from './pages/StudentQuizTaking'
import StudentCreateQuiz from './pages/StudentCreateQuiz'
import StudentQuizManagement from './pages/StudentQuizManagement'
import StudentQuizEditor from './pages/StudentQuizEditor'
import StudentQuizHistory from './pages/StudentQuizHistory'
import StudentStatistics from './pages/StudentStatistics'
import StudentSubjects from './pages/StudentSubjects'
import StudentReviewQuizzes from './pages/StudentReviewQuizzes'
import { AITest } from './components/AITest'

export default function App() {
  return (
    <div className="app-wrap">
      <div className="bg-blob primary w-[520px] h-[520px] -top-24 -left-24"></div>
      <div className="bg-blob secondary w-[520px] h-[520px] -bottom-24 -right-24"></div>
      <Routes>
        <Route path="/" element={<PublicQuizHome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/quiz" element={<QuizHome />} />
        <Route path="/quiz/subjects" element={<SubjectsPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher/quizzes" element={<TeacherQuizzes />} />
        <Route path="/teacher/create-quiz" element={<TeacherCreateQuiz />} />
        <Route path="/teacher/quiz/:id/edit" element={<TeacherQuizEditor />} />
        <Route path="/teacher/analytics" element={<TeacherAnalytics />} />
        <Route path="/teacher/subjects" element={<TeacherSubjects />} />
        <Route path="/teacher/quiz-taking" element={<TeacherQuizTaking />} />
        <Route path="/teacher/review-quizzes" element={<TeacherReviewQuizzes />} />
        <Route path="/review-quizzes" element={<ReviewQuizzes />} />
        <Route path="/student/quiz-taking" element={<StudentQuizTaking />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/create-quiz" element={<StudentCreateQuiz />} />
        <Route path="/student/quiz-management" element={<StudentQuizManagement />} />
        <Route path="/student/quiz/:id/edit" element={<StudentQuizEditor />} />
        <Route path="/student/quiz-history" element={<StudentQuizHistory />} />
        <Route path="/student/review-quizzes" element={<StudentReviewQuizzes />} />
        <Route path="/student/results" element={<StudentStatistics />} />
        <Route path="/student/subjects" element={<StudentSubjects />} />
        <Route path="/student/settings" element={<QuizHome />} />
        <Route path="/quiz-history" element={<QuizHistory />} />
        <Route path="/quiz-submission/:submissionId" element={<QuizSubmissionDetail />} />
        <Route path="/debug" element={<UserDebugPage />} />
        <Route path="/api-test" element={<ApiTest />} />
        <Route path="/ai-test" element={<AITest />} />
        <Route path="/google-callback" element={<GoogleCallback />} />
        <Route path="*" element={<PublicQuizHome />} />
      </Routes>
    </div>
  )
}
