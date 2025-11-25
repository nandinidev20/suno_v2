import Membership from './pages/Membership.jsx';
import React from 'react';
import { useLocation } from 'react-router-dom';
import LoadingSpinner from './components/LoadingSpinner';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useAdminAuth } from './contexts/AdminAuthContext';
import Home from './pages/Home';
import Generate from './pages/Generate';
import Library from './pages/Library';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import FixedPlayer from './components/FixedPlayer';
import Terms from './pages/Terms.jsx';
import Tutorial from './pages/Tutorial.jsx';
import MeetMyguymars from './pages/MeetMyguymars.jsx';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import ManageMusic from './pages/admin/ManageMusic';
import AdminProfile from './pages/admin/AdminProfile';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  // Show loading or wait for authentication check to complete
  if (loading) {
    return <div className="d-flex justify-content-center align-items-center" style={{height: '100vh'}}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Admin Protected Route Component
const AdminProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAdminAuth();
  return isAuthenticated ? children : <Navigate to="/admin/login" />;
};

function App() {
  const { loading: userLoading } = useAuth();
  const { loading: adminLoading } = useAdminAuth();
  const location = useLocation();
  const [routeLoading, setRouteLoading] = React.useState(false);
  const [adminCssLoaded, setAdminCssLoaded] = React.useState(false);
  const [fixedPlayerState] = React.useState({ track: null, isPlaying: false, currentTime: 0, duration: 0, volume: 1, isMuted: false });

  React.useEffect(() => {
    setRouteLoading(true);
    const timeout = setTimeout(() => setRouteLoading(false), 500); // Simulate loading for 500ms
    return () => clearTimeout(timeout);
  }, [location.pathname]);

  React.useEffect(() => {
    const isAdminRoute = location.pathname.startsWith('/admin');
    // if (isAdminRoute && !adminCssLoaded) {
    //   import('./index.css')
    //     .then(() => setAdminCssLoaded(true))
    //     .catch((err) => console.error('Failed to load admin stylesheet', err));
    // }
  }, [location.pathname, adminCssLoaded]);

  if (userLoading || adminLoading || routeLoading) {
    return (
      <div style={{height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#111'}}>
        <LoadingSpinner size="xl" text="Loading..." />
      </div>
    );
  }

  return (
    <div className="">
      <Routes>
        
        {/* Admin Routes - No Navbar or FixedPlayer */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminProtectedRoute>
              <AdminUsers />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/music"
          element={
            <AdminProtectedRoute>
              <ManageMusic />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/profile"
          element={
            <AdminProtectedRoute>
              <AdminProfile />
            </AdminProtectedRoute>
          }
        />

        {/* Public & User Routes - With Navbar and FixedPlayer */}
        <Route path="/" element={<Home />} />
        <Route
          path="/generate"
          element={
            <ProtectedRoute>
              <Generate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/membership"
          element={
            <ProtectedRoute>
              <Membership />
            </ProtectedRoute>
          }
        />
        <Route
          path="/library"
          element={
            <ProtectedRoute>
              <Library />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/tutorials" element={<Tutorial />} />
        <Route path="/meet-myguymars" element={<MeetMyguymars />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Fixed bottom player (visual shell) - Only for user routes */}
      <FixedPlayer
        track={fixedPlayerState.track}
        isPlaying={fixedPlayerState.isPlaying}
        currentTime={fixedPlayerState.currentTime}
        duration={fixedPlayerState.duration}
        volume={fixedPlayerState.volume}
        isMuted={fixedPlayerState.isMuted}
        onTogglePlay={() => {}}
        onSeek={() => {}}
        onToggleMute={() => {}}
        onVolumeChange={() => {}}
        onLike={() => {}}
        onDownload={() => {}}
        isLiked={false}
      />
    </div>
  );
}

export default App;