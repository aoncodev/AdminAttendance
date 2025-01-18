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

function formatDateTimeForDisplay(utcTimeStr) {
  if (!utcTimeStr) return "-";
  const utcDate = new Date(utcTimeStr);
  const kstOffset = 9 * 60; // KST is UTC+9
  const kstDate = new Date(utcDate.getTime() + kstOffset * 60 * 1000);
  const hours = String(kstDate.getHours()).padStart(2, "0");
  const minutes = String(kstDate.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

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
                <SelectItem value="1">January</SelectItem>
                <SelectItem value="2">February</SelectItem>
                <SelectItem value="3">March</SelectItem>
                <SelectItem value="4">April</SelectItem>
                <SelectItem value="5">May</SelectItem>
                <SelectItem value="6">June</SelectItem>
                <SelectItem value="7">July</SelectItem>
                <SelectItem value="8">August</SelectItem>
                <SelectItem value="9">September</SelectItem>
                <SelectItem value="10">October</SelectItem>
                <SelectItem value="11">November</SelectItem>
                <SelectItem value="12">December</SelectItem>
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
              <SelectItem value="1">January</SelectItem>
              <SelectItem value="2">February</SelectItem>
              <SelectItem value="3">March</SelectItem>
              <SelectItem value="4">April</SelectItem>
              <SelectItem value="5">May</SelectItem>
              <SelectItem value="6">June</SelectItem>
              <SelectItem value="7">July</SelectItem>
              <SelectItem value="8">August</SelectItem>
              <SelectItem value="9">September</SelectItem>
              <SelectItem value="10">October</SelectItem>
              <SelectItem value="11">November</SelectItem>
              <SelectItem value="12">December</SelectItem>
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
                  {new Date(entry.clock_in).toLocaleDateString("en-US")}
                </td>
                <td className="px-4 py-2">{entry.employee_name}</td>
                <td className="px-4 py-2">
                  <span>{formatDateTimeForDisplay(entry.clock_in)}</span>
                </td>
                <td className="px-4 py-2">
                  <span>{formatDateTimeForDisplay(entry.clock_out)}</span>
                </td>
                <td className="px-4 py-2">
                  {entry.break_logs.length > 0 ? (
                    entry.break_logs.map((breakItem, index) => (
                      <div key={index}>
                        <span className="block text-sm">
                          {breakItem.break_type} (
                          {formatDateTimeForDisplay(breakItem.break_start)} -{" "}
                          {formatDateTimeForDisplay(breakItem.break_end)})
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
