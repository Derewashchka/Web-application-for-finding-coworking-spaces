import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import HomePage from './pages/HomePage'
import CatalogPage from './pages/CatalogPage'
import CoworkingDetailPage from './pages/CoworkingDetailPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import AdminPage from './pages/admin/AdminPage'
import AddCoworkingPage from './pages/owner/AddCoworkingPage'
import EditCoworkingPage from './pages/owner/EditCoworkingPage'
import StatsPage     from './pages/owner/StatsPage'
import FavoritesPage from './pages/FavoritesPage'
import AuditPage from './pages/admin/AuditPage'
import CompareBar from './components/compare/CompareBar'
import ComparePage from './pages/ComparePage'
import OrganizationPage from './pages/OrganizationPage'

function PrivateRoute({ children, roles }: {
  children: React.ReactNode
  roles?: string[]
}) {
  const { user, isAuthenticated } = useAuthStore()
  if (!isAuthenticated()) return <Navigate to="/login"/>
  if (roles && user?.role && !roles.includes(user.role))
    return <Navigate to="/"/>
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar/>
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage/>}/>
            <Route path="/catalog" element={<CatalogPage/>}/>
            <Route path="/coworkings/:id" element={<CoworkingDetailPage/>}/>
            <Route path="/login" element={<LoginPage/>}/>
            <Route path="/register" element={<RegisterPage/>}/>
            <Route path="/profile" element={
              <PrivateRoute><ProfilePage/></PrivateRoute>
            }/>
            <Route path="/admin" element={
              <PrivateRoute roles={['admin']}><AdminPage/></PrivateRoute>
            }/>
            <Route path="/add-coworking" element={
              <PrivateRoute roles={['owner', 'admin']}>
                <AddCoworkingPage/>
              </PrivateRoute>
            }/>
            <Route path="/edit-coworking/:id" element={
              <PrivateRoute roles={['owner', 'admin']}>
                <EditCoworkingPage/>
              </PrivateRoute>
            }/>
            <Route path="/stats" element={
              <PrivateRoute roles={['owner']}>
                <StatsPage/>
              </PrivateRoute>
            }/>
            <Route path="/favorites" element={<FavoritesPage/>}/>
            <Route path="/compare" element={<ComparePage/>}/>
            <Route path="/audit" element={
              <PrivateRoute roles={['admin']}>
                <AuditPage/>
              </PrivateRoute>
            }/>
            <Route path="/organizations/:id" element={<OrganizationPage/>}/>
          </Routes>
        </div>
        <Footer/>
      </div>

      <CompareBar/>

      <Toaster position="bottom-right"
        toastOptions={{
          style: {
            fontSize: '13px',
            borderRadius: '10px',
            border: '1px solid #f3f4f6',
          }
        }}
      />
    </BrowserRouter>
  )
}