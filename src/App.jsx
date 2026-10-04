import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import AdminLayout from '@/components/layout/AdminLayout'

// Pages
import Login from '@/pages/auth/Login'
import Dashboard from '@/pages/Dashboard'
import HeroBanners from '@/pages/content/HeroBanners'
import Services from '@/pages/content/Services'
import ProjectCategories from '@/pages/content/ProjectCategories'
import Projects from '@/pages/content/Projects'
import TeamMembers from '@/pages/content/TeamMembers'
import Blogs from '@/pages/content/Blogs'
import Users from '@/pages/users/Users'
import Settings from '@/pages/Settings'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/hero-banners" element={<HeroBanners />} />
              <Route path="/services" element={<Services />} />
              <Route path="/project-categories" element={<ProjectCategories />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/team-members" element={<TeamMembers />} />
              <Route path="/blogs" element={<Blogs />} />
              <Route path="/users" element={<Users />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
