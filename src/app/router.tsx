import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useAuth } from '@/shared/auth/useAuth'
import { AppShell } from '@/shared/layout/AppShell'
import { RoleGuard } from '@/shared/auth/RoleGuard'
import { LoginAcademicoPage } from '@/features/auth/LoginAcademicoPage'
import { RegisterStudentPage } from '@/features/secretaria/RegisterStudentPage'
import { StudentsListPage } from '@/features/secretaria/StudentsListPage'
import { StudentDetailPage } from '@/features/secretaria/StudentDetailPage'

function RootGate() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <LoginAcademicoPage />
  }

  return (
    <RoleGuard allow={['Secretaria', 'Direccion']}>
      <AppShell />
    </RoleGuard>
  )
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootGate />,
    children: [
      { index: true, element: <RegisterStudentPage /> },
      { path: 'estudiantes', element: <StudentsListPage /> },
      { path: 'estudiantes/:studentId', element: <StudentDetailPage /> },
    ],
  },
  {
    path: '/login',
    element: <Navigate to="/" replace />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
