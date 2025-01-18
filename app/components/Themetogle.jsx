import { useTheme } from "../components/ThemeProvider";

export default function ThemeToggle() {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <button
      onClick={toggleDarkMode}
      className="px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded"
    >
      {darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
    </button>
  );
}
