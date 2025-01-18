"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check localStorage for saved theme preference
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);

    // Apply the saved theme
    if (savedDarkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    // Toggle dark mode
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);

    // Update class on `body`
    if (newDarkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }

    // Save preference to localStorage
    localStorage.setItem("darkMode", newDarkMode);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
