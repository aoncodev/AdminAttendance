"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addDays } from "date-fns";
import { Button } from "@/components/ui/button";

// Dummy data for employee and attendance
const dummyEmployeeData = {
  id: 2,
  name: "Ahidjon",
  role: "admin",
  department: "NHOdlNVEMEYfLo6wl01a",
  salary: "100,000.00",
  date: "2025-01-06 18:50:42",
};

export default function EmployeeDetails() {
  const [date, setDate] = useState({
    from: new Date(),
    to: addDays(new Date(), 7),
  });
  const [isDarkMode, setDarkMode] = useState(false);
  const [timesheet, setTimesheet] = useState([
    {
      name: "John Doe",
      role: "Developer",
      clockIn: "09:00",
      clockOut: "17:00",
      breaks: ["Lunch - 00:45", "Coffee - 00:15"],
      totalBreak: "01:00",
      totalHours: "07:00",
      totalWage: "$175.00",
    },
  ]);
  const [editMode, setEditMode] = useState(false);
  const [editedEntry, setEditedEntry] = useState(null);

  const router = useRouter();

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, []);

  const handleBackToEmployeeList = () => {
    router.push("/"); // Navigate back to the employee list
  };

  const handleEditClick = (index) => {
    setEditedEntry(timesheet[index]);
    setEditMode(true);
  };

  const handleDeleteClick = (index) => {
    const updatedTimesheet = timesheet.filter((_, i) => i !== index);
    setTimesheet(updatedTimesheet);
  };

  const handleSaveChanges = () => {
    const updatedTimesheet = [...timesheet];
    updatedTimesheet[
      timesheet.findIndex((entry) => entry.name === editedEntry.name)
    ] = editedEntry;
    setTimesheet(updatedTimesheet);
    setEditMode(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedEntry({ ...editedEntry, [name]: value });
  };

  return (
    <div
      className={`mx-auto max-w-7xl py-6 ${
        isDarkMode ? "bg-dark-background" : "bg-light-background"
      } transition-colors`}
    >
      <h1 className="text-2xl font-semibold mb-4">
        Employee Details: {dummyEmployeeData.name}
      </h1>

      {/* Back Button */}
      <Button
        variant="outline"
        onClick={handleBackToEmployeeList}
        className="mb-6"
      >
        Back to Employee List
      </Button>

      {/* Employee details */}
      <div className="bg-card p-6 rounded-lg shadow-md mb-6">
        <div>
          <h2 className="text-lg font-semibold">Employee Info</h2>
          <p>
            <strong>Name:</strong> {dummyEmployeeData.name}
          </p>
          <p>
            <strong>Role:</strong> {dummyEmployeeData.role}
          </p>
          <p>
            <strong>Department:</strong> {dummyEmployeeData.department}
          </p>
          <p>
            <strong>Salary:</strong> {dummyEmployeeData.salary}
          </p>
          <p>
            <strong>Date Joined:</strong> {dummyEmployeeData.date}
          </p>
        </div>
      </div>

      {/* Attendance records */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-center px-4 py-2">Employee</th>
              <th className="text-center px-4 py-2">Role</th>
              <th className="text-center px-4 py-2">Clock In</th>
              <th className="text-center px-4 py-2">Clock Out</th>
              <th className="text-center px-4 py-2">Breaks</th>
              <th className="text-center px-4 py-2">Total Break</th>
              <th className="text-center px-4 py-2">Total Hours</th>
              <th className="text-center px-4 py-2">Total Wage</th>
              <th className="text-center px-4 py-2">Edit</th>
              <th className="text-center px-4 py-2">Delete</th>
            </tr>
          </thead>
          <tbody>
            {timesheet.map((entry, index) => (
              <tr key={index} className="border-b">
                <td className="text-center px-4 py-2">{entry.name}</td>
                <td className="text-center px-4 py-2">{entry.role}</td>
                <td className="text-center px-4 py-2">{entry.clockIn}</td>
                <td className="text-center px-4 py-2">{entry.clockOut}</td>
                <td className="text-center px-4 py-2">
                  {entry.breaks.map((breakItem, idx) => (
                    <div key={idx}>{breakItem}</div>
                  ))}
                </td>
                <td className="text-center px-4 py-2">{entry.totalBreak}</td>
                <td className="text-center px-4 py-2">{entry.totalHours}</td>
                <td className="text-center px-4 py-2">{entry.totalWage}</td>
                <td className="text-center px-4 py-2">
                  <Button onClick={() => handleEditClick(index)}>Edit</Button>
                </td>
                <td className="text-center px-4 py-2">
                  <Button
                    variant="outline"
                    onClick={() => handleDeleteClick(index)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Popup */}
      {editMode && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-card p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Edit Timesheet</h2>
            <div>
              <label>Clock In:</label>
              <div className="flex items-center space-x-2 mb-4">
                <input
                  type="time"
                  name="clockIn"
                  value={editedEntry.clockIn || ""}
                  onChange={handleChange}
                  className="w-full p-2 rounded"
                />
                <Button
                  variant="outline"
                  onClick={() =>
                    setEditedEntry((prev) => ({ ...prev, clockIn: null }))
                  }
                >
                  Clear
                </Button>
              </div>
            </div>
            <div>
              <label>Clock Out:</label>
              <div className="flex items-center space-x-2 mb-4">
                <input
                  type="time"
                  name="clockOut"
                  value={editedEntry.clockOut || ""}
                  onChange={handleChange}
                  className="w-full p-2 rounded"
                />
                <Button
                  variant="outline"
                  onClick={() =>
                    setEditedEntry((prev) => ({ ...prev, clockOut: null }))
                  }
                >
                  Clear
                </Button>
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={() => setEditMode(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveChanges}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DatePickerWithRange({ onDateRangeChange }) {
  const [date, setDate] = useState({
    from: new Date(),
    to: addDays(new Date(), 7),
  });

  const handleDateChange = (selectedDate) => {
    setDate(selectedDate);
    onDateRangeChange(selectedDate);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className="w-[300px] justify-start text-left font-normal"
        >
          <CalendarIcon />
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, "LLL dd, y")} -{" "}
                {format(date.to, "LLL dd, y")}
              </>
            ) : (
              format(date.from, "LLL dd, y")
            )
          ) : (
            <span>Pick a date</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          initialFocus
          mode="range"
          selected={date}
          onSelect={handleDateChange}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}
