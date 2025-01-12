"use client";
import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import TimesheetTable from "./components/TimesSheetTable";
import EmployeesTable from "./components/EmployeesTable";
import { FaMoon, FaSun } from "react-icons/fa"; // Or use lucid-react-icons
import { redirect } from "next/navigation";
import { useAuth } from "../context/auth";

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard");

  // Check localStorage for the saved theme preference on load
  const [darkMode, setDarkMode] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      redirect("/login"); // Redirect if not authenticated
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  useEffect(() => {
    // Read dark mode preference from localStorage
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, []);

  // Toggle the theme and save it in localStorage
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (newDarkMode) {
      document.body.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.body.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  };

  return (
    <div
      className={`flex h-screen ${
        darkMode ? "bg-dark-background" : "bg-light-background"
      } transition-colors`}
    >
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-14 relative">
        {/* Dark Mode Toggle Button */}
        <button
          onClick={toggleDarkMode}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-300 dark:bg-gray-700"
        >
          {darkMode ? (
            <FaSun className="text-yellow-500" />
          ) : (
            <FaMoon className="text-gray-600" />
          )}
        </button>

        {activeTab === "dashboard" ? (
          <div className="space-y-6">
            <TimesheetTable />
          </div>
        ) : (
          <div className="space-y-6">
            <EmployeesTable />
          </div>
        )}
      </div>
    </div>
  );
}
