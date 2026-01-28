import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Auth from "./pages/Auth.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import EditProfile from "./pages/EditProfile.jsx";
import { Toaster } from "react-hot-toast";
import ChatbotPage from "./pages/ChatbotPage.jsx";
import CropAnalysisPage from "./pages/CropAnalysisPage.jsx";
import SchemesPage from "./pages/SchemesPage.jsx";
import ExpertHelpPage from "./pages/ExpertHelpPage.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import CommunityPage from "./pages/CommunityPage.jsx";
import RequestCommunity from "./pages/RequestCommunity.jsx";
import AppLayout from "./AppLayout/applayout.jsx";
import { NotificationProvider } from "./contexts/NotificationContext.jsx";
import { LanguageProvider } from "./contexts/LanguageContext.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";

// Protected Route Component
function ProtectedRoute({ children }) {
  const isLoggedIn = !!localStorage.getItem("token");
  return isLoggedIn ? children : <Navigate to="/" replace />;
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  // Listen for storage changes (when token is set/removed)
  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(!!localStorage.getItem("token"));
    };

    // Check on mount
    checkAuth();
    
    // Listen for storage events (works across tabs)
    window.addEventListener("storage", checkAuth);
    
    // Listen for custom auth event (for same-tab updates)
    window.addEventListener("auth-change", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("auth-change", checkAuth);
    };
  }, []);

  return (
    <LanguageProvider>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public Auth Page */}
            <Route path="/" element={<Auth />} />

            {/* Layout wrapper for protected pages */}
            <Route element={<AppLayout />}>
              <Route
                path="dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              
              {/* AgriMitra Features */}
              <Route
                path="communities"
                element={
                  <ProtectedRoute>
                    <CommunityPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="communities/request"
                element={
                  <ProtectedRoute>
                    <RequestCommunity />
                  </ProtectedRoute>
                }
              />
               <Route
                path="admin"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="profile/edit"
                element={
                  <ProtectedRoute>
                    <EditProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="chatbot"
                element={
                  <ProtectedRoute>
                    <ChatbotPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="crop-analysis"
                element={
                  <ProtectedRoute>
                    <CropAnalysisPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="schemes"
                element={
                  <ProtectedRoute>
                    <SchemesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="expert-help"
                element={
                  <ProtectedRoute>
                    <ExpertHelpPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Redirect unknown routes */}
            <Route
              path="*"
              element={<Navigate to={isLoggedIn ? "/dashboard" : "/"} replace />}
            />
          </Routes>

          <Toaster position="top-center" reverseOrder={false} />
        </NotificationProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}


