import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Auth from "./pages/Auth.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import EditProfile from "./pages/EditProfile.jsx";
import { Toaster } from "react-hot-toast";
import ChatbotPage from "./pages/ChatbotPage.jsx";
import CropAnalysisPage from "./pages/CropAnalysisPage.jsx";

import GovSchemesPage from "./pages/GovSchemesPage.jsx";
import SchemeDetailPage from "./pages/SchemeDetailPage.jsx";
import ExpertHelpPage from "./pages/ExpertHelpPage.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import CommunityPage from "./pages/CommunityPage.jsx";
import RequestCommunity from "./pages/RequestCommunity.jsx";
import MarketPricesPage from "./pages/MarketPricesPage.jsx";
import MarketplacePage from "./pages/MarketplacePage.jsx";
import CreateListingPage from "./pages/CreateListingPage.jsx";
import ClimateChangePage from "./pages/ClimateChangePage.jsx";
import AppLayout from "./AppLayout/applayout.jsx";
import { NotificationProvider } from "./contexts/NotificationContext.jsx";
import { LanguageProvider } from "./contexts/LanguageContext.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";

import { useAuth } from "./contexts/AuthContext.jsx";

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null; // Or a spinner
  return user ? children : <Navigate to="/" replace />;
}

// Redirect Handler
function RedirectHandler() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return <Navigate to={user ? "/dashboard" : "/"} replace />;
}

// Admin Route Component
function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  
  // If not logged in, go to login
  if (!user) return <Navigate to="/" replace />;
  
  // If logged in but not admin, go to dashboard
  if (user.role !== "admin") return <Navigate to="/dashboard" replace />;
  
  return children;
}

export default function App() {
  // We don't need local auth state tracking here anymore 
  // because ProtectedRoute/AdminRoute use useAuth() directly.
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
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
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
                path="expert-help"
                element={
                  <ProtectedRoute>
                    <ExpertHelpPage />
                  </ProtectedRoute>
                }
              />
              
              {/* Market Intelligence & Direct Market Access */}
              <Route
                path="market-prices"
                element={
                  <ProtectedRoute>
                    <MarketPricesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="marketplace"
                element={
                  <ProtectedRoute>
                    <MarketplacePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="create-listing"
                element={
                  <ProtectedRoute>
                    <CreateListingPage />
                  </ProtectedRoute>
                }
              />
              
              {/* Government Schemes */}
              <Route
                path="gov-schemes"
                element={
                  <ProtectedRoute>
                    <GovSchemesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="gov-schemes/:id"
                element={
                  <ProtectedRoute>
                    <SchemeDetailPage />
                  </ProtectedRoute>
                }
              />
              
              {/* Climate & Weather */}
              <Route
                path="climate-change"
                element={
                  <ProtectedRoute>
                    <ClimateChangePage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Redirect unknown routes */}
            <Route
              path="*"
              element={<RedirectHandler />}
            />
          </Routes>

          <Toaster position="top-right" reverseOrder={false} />
        </NotificationProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}


