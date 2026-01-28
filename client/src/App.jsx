// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Auth from "./pages/Auth.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import GroupsPage from "./pages/GroupsPage.jsx";
import InvitesPage from "./pages/InvitesPage.jsx";
import FriendsPage from "./pages/FriendsPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import EditProfile from "./pages/EditProfile.jsx";
import LiveMap from "./pages/LiveMap.jsx";
import { Toaster } from "react-hot-toast";
import CreateGroup from "./pages/CreateGroup.jsx";
import InviteFriend from "./pages/InviteFriend.jsx";
import AppLayout from "./AppLayout/applayout.jsx";
import { NotificationProvider } from "./contexts/NotificationContext.jsx";

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
          <Route
            path="create-group"
            element={
              <ProtectedRoute>
                <CreateGroup />
              </ProtectedRoute>
            }
          />
          <Route
            path="groups"
            element={
              <ProtectedRoute>
                <GroupsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="invites"
            element={
              <ProtectedRoute>
                <InvitesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="friends"
            element={
              <ProtectedRoute>
                <FriendsPage />
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
            path="live-map"
            element={
              <ProtectedRoute>
                <LiveMap />
              </ProtectedRoute>
            }
          />
          <Route
            path="invite-friend"
            element={
              <ProtectedRoute>
                <InviteFriend />
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
  );
}
