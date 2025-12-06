import React from 'react'
import { useAuth } from '@/hooks/useAuth'
import { RoleGuard } from '@/components/RoleGuard'
import { TeacherNavigation } from '@/components/TeacherNavigation'
import { StudentNavigation } from '@/components/StudentNavigation'
import ReviewQuizList from '@/components/ReviewQuizList'

export default function ReviewQuizzes() {
  const { user } = useAuth()

  return (
    <RoleGuard allowedRoles={['ROLE_STUDENT', 'ROLE_TEACHER', 'ROLE_ADMIN']}>
      <div className="min-h-screen bg-gray-50">
        {user?.roles?.includes('ROLE_TEACHER') || user?.roles?.includes('ROLE_ADMIN') ? (
          <TeacherNavigation />
        ) : (
          <StudentNavigation />
        )}
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ReviewQuizList />
        </div>
      </div>
    </RoleGuard>
  )
}
