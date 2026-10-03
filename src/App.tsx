import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.tsx';
import Layout from './components/Layout.tsx';
import Home from './pages/Home.tsx';
import Doctors from './pages/Doctors.tsx';
import DoctorProfile from './pages/DoctorProfile.tsx';
import Login from './pages/Login.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Admin from './pages/Admin.tsx';
import AdminAppointments from './pages/AdminAppointments.tsx';
import Contact from './pages/Contact.tsx';
import About from './pages/About.tsx';
import Privacy from './pages/Privacy.tsx';
import HelpCenter from './pages/HelpCenter.tsx';
import ForgotPassword from './pages/ForgotPassword.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import ScrollToTop from './components/ScrollToTop.tsx';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/doctors/:id" element={<DoctorProfile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/help" element={<HelpCenter />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/appointments" element={<AdminAppointments />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
