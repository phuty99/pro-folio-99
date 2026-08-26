import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/Navbar'
import PrivateRoute from './components/PrivateRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import PublicProfile from './pages/PublicProfile'
import VerifyEmail from './pages/VerifyEmail'
import BlogManage from './pages/BlogManage'
import BlogEditor from './pages/BlogEditor'
import PublicBlogList from './pages/PublicBlogList'
import PublicBlogPost from './pages/PublicBlogPost'

function RootRedirect() {
  const { isAuthenticated } = useAuth()
  return <Navigate to={isAuthenticated ? '/profile' : '/login'} replace />
}

function App() {
  return (
    <BrowserRouter basename="/pro-folio-99">
      <ThemeProvider>
        <AuthProvider>
          <div className="min-h-screen bg-canvas">
            <Navbar />
            <Routes>
              <Route path="/" element={<RootRedirect />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/blog"
                element={
                  <PrivateRoute>
                    <BlogManage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/blog/new"
                element={
                  <PrivateRoute>
                    <BlogEditor />
                  </PrivateRoute>
                }
              />
              <Route
                path="/blog/:postId/edit"
                element={
                  <PrivateRoute>
                    <BlogEditor />
                  </PrivateRoute>
                }
              />
              <Route path="/u/:profileId" element={<PublicProfile />} />
              <Route path="/u/:profileId/blog" element={<PublicBlogList />} />
              <Route path="/u/:profileId/blog/:slug" element={<PublicBlogPost />} />
            </Routes>
          </div>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
