import { Users, LayoutDashboard, ClipboardList } from "lucide-react";

export default function Sidebar({ activeTab, onTabChange }) {
  return (
    <div className="w-64 border-r bg-card p-4">
      <div className="text-2xl font-bold mb-8">Admin Panel</div>
      <nav className="space-y-2">
        <button
          onClick={() => onTabChange("dashboard")}
          className={`flex items-center space-x-2 w-full p-2 rounded ${
            activeTab === "dashboard"
              ? "bg-primary text-primary-foreground"
              : "hover:bg-accent"
          }`}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span>Dashboard</span>
        </button>
        <button
          onClick={() => onTabChange("employees")}
          className={`flex items-center space-x-2 w-full p-2 rounded ${
            activeTab === "employees"
              ? "bg-primary text-primary-foreground"
              : "hover:bg-accent"
          }`}
        >
          <Users className="h-5 w-5" />
          <span>Employees</span>
        </button>
        <button
          onClick={() => onTabChange("tasks")}
          className={`flex items-center space-x-2 w-full p-2 rounded ${
            activeTab === "tasks"
              ? "bg-primary text-primary-foreground"
              : "hover:bg-accent"
          }`}
        >
          <ClipboardList className="h-5 w-5" />
          <span>Tasks</span>
        </button>
        <button
          onClick={() => onTabChange("report")}
          className={`flex items-center space-x-2 w-full p-2 rounded ${
            activeTab === "report"
              ? "bg-primary text-primary-foreground"
              : "hover:bg-accent"
          }`}
        >
          <Users className="h-5 w-5" />
          <span>Employee Report</span>
        </button>
      </nav>
    </div>
  );
}
