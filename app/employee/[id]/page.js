"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const API_URL = "https://aoncodev.work.gd";

// Format datetime strings received from the backend (already in KST)
function formatKoreanDateTime(dateTimeStr) {
  if (!dateTimeStr) return "N/A";
  const date = new Date(dateTimeStr);
  return date.toLocaleString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

// Convert decimal hours to HH:mm format
function decimalToTime(decimal) {
  const hours = Math.floor(decimal);
  const minutes = Math.round((decimal - hours) * 60);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}`;
}

export default function EmployeeDetails() {
  const [timesheet, setTimesheet] = useState(null); // Initially null to differentiate between "loading" and "empty"
  const [loading, setLoading] = useState(true);
  const [monthFilter, setMonthFilter] = useState("all"); // Default to "All"
  const [currentPage, setCurrentPage] = useState(1); // Current page
  const [totalPages, setTotalPages] = useState(1); // Total number of pages
  const router = useRouter();
  const { id } = useParams(); // Get the employee ID from the URL

  const recordsPerPage = 10; // Number of records per page

  useEffect(() => {
    if (id) {
      fetchAttendance();
    }
  }, [id, monthFilter, currentPage]);

  async function fetchAttendance() {
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/attendance/${id}?month=${monthFilter}&page=${currentPage}&per_page=${recordsPerPage}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch attendance data.");
      }

      const data = await response.json();
      setTimesheet(data.attendance_records || []); // Ensure timesheet is always an array
      setTotalPages(data.total_pages || 1); // Default totalPages to 1
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      toast.error("Error fetching attendance data.");
      setTimesheet([]); // Fallback to empty array
    } finally {
      setLoading(false);
    }
  }

  const handleMonthChange = (value) => {
    setMonthFilter(value); // Update month filter
    setCurrentPage(1); // Reset to the first page
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!timesheet || timesheet.length === 0) {
    return (
      <div className="mx-auto max-w-7xl py-6">
        <h1 className="text-2xl font-semibold mb-4">Employee Attendance</h1>
        <Button
          variant="outline"
          onClick={() => router.push("/")}
          className="mb-6"
        >
          Back to Employee List
        </Button>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium">Filter by Month:</span>
            <Select value={monthFilter} onValueChange={handleMonthChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {[...Array(12)].map((_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    {new Date(0, i).toLocaleString("default", {
                      month: "long",
                    })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>No attendance records found.</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl py-6">
      <h1 className="text-2xl font-semibold mb-4">Employee Attendance</h1>
      <Button
        variant="outline"
        onClick={() => router.push("/")}
        className="mb-6"
      >
        Back to Employee List
      </Button>

      {/* Month Filter */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">Filter by Month:</span>
          <Select value={monthFilter} onValueChange={handleMonthChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {[...Array(12)].map((_, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>
                  {new Date(0, i).toLocaleString("default", { month: "long" })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left px-4 py-2">Date</th>
              <th className="text-left px-4 py-2">Employee</th>
              <th className="text-left px-4 py-2">Clock In</th>
              <th className="text-left px-4 py-2">Clock Out</th>
              <th className="text-left px-4 py-2">Breaks</th>
              <th className="text-left px-4 py-2">Total Breaks</th>
              <th className="text-left px-4 py-2">Total Hours</th>
              <th className="text-left px-4 py-2">Total Hours - Breaks</th>
              <th className="text-left px-4 py-2">Total Wage</th>
              <th className="text-left px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {timesheet.map((entry) => (
              <tr key={entry.id} className="border-b">
                <td className="px-4 py-2">
                  {new Date(entry.clock_in).toLocaleDateString("ko-KR")}
                </td>
                <td className="px-4 py-2">{entry.employee_name}</td>
                <td className="px-4 py-2">
                  {formatKoreanDateTime(entry.clock_in)}
                </td>
                <td className="px-4 py-2">
                  {formatKoreanDateTime(entry.clock_out)}
                </td>
                <td className="px-4 py-2">
                  {entry.break_logs.length > 0 ? (
                    // Sort break_logs by break_start before rendering
                    [...entry.break_logs]
                      .sort(
                        (a, b) =>
                          new Date(a.break_start) - new Date(b.break_start)
                      )
                      .map((breakItem, index) => (
                        <div key={index}>
                          <span className="block text-sm">
                            {breakItem.break_type} (
                            {formatKoreanDateTime(breakItem.break_start)} -{" "}
                            {formatKoreanDateTime(breakItem.break_end)})
                          </span>
                        </div>
                      ))
                  ) : (
                    <span>No breaks</span>
                  )}
                </td>
                <td className="px-4 py-2">
                  {decimalToTime(entry.total_break_hours)}
                </td>
                <td className="px-4 py-2">
                  {decimalToTime(entry.total_hours)}
                </td>
                <td className="px-4 py-2">
                  {decimalToTime(entry.total_hours_excluding_breaks)}
                </td>
                <td className="px-4 py-2">₩{entry.total_wage.toFixed(0)}</td>
                <td className="px-4 py-2">
                  <Link
                    href={`/attendance/${entry.id}`}
                    className="text-blue-500 inline-block px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                  >
                    Go
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <Button
          variant="outline"
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          Previous
        </Button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
