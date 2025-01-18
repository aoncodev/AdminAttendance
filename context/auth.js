"use client";

import { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null); // Store user info if needed

  useEffect(() => {
    // Check for token in localStorage during initialization
    const token = localStorage.getItem("token");
    if (token) {
      validateToken(token); // Validate token with backend
    }
  }, []);

  const validateToken = async (token) => {
    try {
      const response = await fetch("https://aoncodev.work.gd/validate-token", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(true); // Set authenticated state to true
        setUser(data.user); // Set user info if returned
      } else {
        logout(); // Clear invalid token
      }
    } catch (error) {
      console.error("Token validation failed:", error);
      logout();
    }
  };

  const login = (data) => {
    localStorage.setItem("token", data.token); // Store token in localStorage
    setIsAuthenticated(true); // Set authenticated state to true
    setUser(data.user); // Save user info if provided
  };

  const logout = () => {
    localStorage.removeItem("token"); // Remove token from localStorage
    setIsAuthenticated(false); // Reset authenticated state
    setUser(null); // Clear user info
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
