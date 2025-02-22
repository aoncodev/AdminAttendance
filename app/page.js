"use client";
import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import TimesheetTable from "./components/TimesSheetTable";
import EmployeesTable from "./components/EmployeesTable";
import TasksPage from "./components/TaskPage"; // Import your tasks management component
import { FaMoon, FaSun } from "react-icons/fa";
import { useRouter } from "next/navigation"; // Use useRouter for redirection
import { useAuth } from "../context/auth";

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [darkMode, setDarkMode] = useState(false); // State for dark mode
  const [loading, setLoading] = useState(true); // Loading state
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Check authentication state and redirect if necessary
  useEffect(() => {
    if (isAuthenticated) {
      setLoading(false); // Stop loading if authenticated
    } else {
      const timer = setTimeout(() => {
        router.push("/login"); // Redirect to login after 3 seconds
      }, 3000);

      return () => clearTimeout(timer); // Clean up the timer on component unmount
    }
  }, [isAuthenticated, router]);

  // Read dark mode preference from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, []);

  // Toggle dark mode and save to localStorage
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);

    // Update body class
    if (newDarkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }

    // Save to localStorage
    localStorage.setItem("darkMode", newDarkMode);
  };

  // Show a loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

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
          onClick={toggleDarkMode} // Use toggleDarkMode function
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
        ) : activeTab === "employees" ? (
          <div className="space-y-6">
            <EmployeesTable />
          </div>
        ) : activeTab === "tasks" ? (
          <div className="space-y-6">
            <TasksPage />
          </div>
        ) : null}
      </div>
    </div>
  );
}
