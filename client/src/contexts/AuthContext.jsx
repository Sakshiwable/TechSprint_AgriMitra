
import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Ensure we have name/email, fallback if token structure is different
        // Assuming token has { id, name, email, role } etc.
        setUser({
           name: decoded.name || decoded.username || "User",
           email: decoded.email || "",
           ...decoded
        });
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("token");
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = (token) => {
    localStorage.setItem("token", token);
    const decoded = jwtDecode(token);
    setUser({
        name: decoded.name || decoded.username || "User",
        email: decoded.email || "",
        ...decoded
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    // Optional: window.location.href = "/login"; or let the component handle navigation
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
