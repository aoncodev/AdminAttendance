import React, { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "./Sidebar"; // adjust the path as needed

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [activeTab, setActiveTab] = useState("employees");

  const fetchEmployees = async () => {
    try {
      const response = await fetch("https://aoncodev.work.gd/employees");
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <div className="flex">
      {/* Main content */}
      <div className="flex-1 p-4">
        <h1 className="text-2xl font-bold mb-4">Employees</h1>
        <div className="grid grid-cols-3 gap-4">
          {employees.map((employee) => (
            <Link key={employee.id} href={`/report/${employee.id}`}>
              <div className="border p-4 flex flex-col items-center rounded shadow cursor-pointer hover:bg-gray-100">
                {/* Simple avatar: first letter of employee name */}
                <div className="bg-gray-300 rounded-full h-16 w-16 flex items-center justify-center text-xl font-bold mb-2">
                  {employee.name.charAt(0)}
                </div>
                <div className="text-lg font-medium">{employee.name}</div>
                <div className="text-sm text-gray-500">{employee.role}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
