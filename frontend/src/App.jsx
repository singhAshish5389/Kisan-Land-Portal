import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { LoadingSpinner } from './components/SkeletonLoader';

// Lazy loaded page components for performance & code splitting
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const FamilyMembers = lazy(() => import('./pages/FamilyMembers'));
const MemberPlots = lazy(() => import('./pages/MemberPlots'));
const AllPlots = lazy(() => import('./pages/AllPlots'));
const Profile = lazy(() => import('./pages/Profile'));

// Static info pages from single bundle
const AboutUs = lazy(() => import('./pages/StaticPages').then(m => ({ default: m.AboutUs })));
const PrivacyPolicy = lazy(() => import('./pages/StaticPages').then(m => ({ default: m.PrivacyPolicy })));
const TermsConditions = lazy(() => import('./pages/StaticPages').then(m => ({ default: m.TermsConditions })));
const ContactUs = lazy(() => import('./pages/StaticPages').then(m => ({ default: m.ContactUs })));
const HelpCenter = lazy(() => import('./pages/StaticPages').then(m => ({ default: m.HelpCenter })));
const GovServices = lazy(() => import('./pages/GovServices'));


// Route protection wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-customBg p-4">
        <LoadingSpinner message="Checking connection..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Route protection for guest users (already logged in redirect to dashboard)
const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-customBg p-4">
        <LoadingSpinner message="Restoring session..." />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-customBg text-customText">
        <Navbar />
        
        {/* Main content with lazy loading suspense fallback */}
        <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Suspense fallback={
            <div className="py-20 flex justify-center items-center">
              <LoadingSpinner message="Please wait, loading screen..." />
            </div>
          }>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              
              {/* Guest Only Routes */}
              <Route path="/login" element={
                <GuestRoute>
                  <Login />
                </GuestRoute>
              } />
              <Route path="/register" element={
                <GuestRoute>
                  <Register />
                </GuestRoute>
              } />

              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/family" element={
                <ProtectedRoute>
                  <FamilyMembers />
                </ProtectedRoute>
              } />
              <Route path="/family/:id/plots" element={
                <ProtectedRoute>
                  <MemberPlots />
                </ProtectedRoute>
              } />
              <Route path="/plots" element={
                <ProtectedRoute>
                  <AllPlots />
                </ProtectedRoute>
              } />
              <Route path="/services" element={
                <ProtectedRoute>
                  <GovServices />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={

                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />

              {/* Static Pages */}
              <Route path="/about" element={<AboutUs />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsConditions />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/help" element={<HelpCenter />} />

              {/* Catch-all Redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
