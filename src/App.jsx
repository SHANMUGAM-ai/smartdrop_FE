import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home       from './pages/Home';
import Book       from './pages/Book';
import Track      from './pages/Track';
import Partner    from './pages/Partner';
import Support    from './pages/Support';
import History    from './pages/History';
import Login      from './pages/Login';
import Admin      from './pages/Admin';
import AdminLogin from './pages/AdminLogin';
import Payment    from './pages/Payment';

// Pages where we hide the normal Navbar (admin portal has its own dark layout)
const HIDE_NAV = ['/admin-login'];

export default function App() {
  const { pathname } = useLocation();
  const hideNav = HIDE_NAV.includes(pathname);

  return (
    <>
      {!hideNav && <Navbar />}

      {/* Main content — top padding handled per-page via marginTop: var(--nav) */}
      <Routes>
        <Route path="/"            element={<Home />} />
        <Route path="/book"        element={<ProtectedRoute><Book /></ProtectedRoute>} />
        <Route path="/track"       element={<ProtectedRoute><Track /></ProtectedRoute>} />
        <Route path="/track/:id"   element={<ProtectedRoute><Track /></ProtectedRoute>} />
        <Route path="/partner"     element={<ProtectedRoute><Partner /></ProtectedRoute>} />
        <Route path="/support"     element={<ProtectedRoute><Support /></ProtectedRoute>} />
        <Route path="/history"     element={<ProtectedRoute><History /></ProtectedRoute>} />
        <Route path="/login"       element={<Login />} />
        <Route path="/payment/:orderId" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
        <Route path="/admin"       element={<Admin />} />
        <Route path="/admin-dashboard" element={<Admin />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        {/* 404 fallback */}
        <Route path="*" element={
          <div style={{ marginTop: 'var(--nav)', textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>📭</div>
            <h2 style={{ fontFamily: "'Outfit',sans-serif", marginBottom: 10 }}>Page not found</h2>
            <a href="/" style={{ color: 'var(--o)', fontWeight: 700 }}>← Back to Home</a>
          </div>
        } />
      </Routes>
    </>
  );
}
