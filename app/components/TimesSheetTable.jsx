import { useState, useEffect } from "react";
import { DatePickerDemo } from "@/components/DatePickerDemo";
import axios from "axios";
import { format } from "date-fns";

// Convert decimal hours to HH:MM format
function decimalToTime(decimal) {
  const hours = Math.floor(decimal);
  const minutes = Math.round((decimal - hours) * 60);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}`;
}

// Format date to YYYY-MM-DD
function formatDateForAPI(date) {
  return format(new Date(date), "yyyy-MM-dd");
}

// Format datetime to Korean format with date
function formatKoreanDateTime(dateTimeStr) {
  if (!dateTimeStr) return "N/A";

  const date = new Date(dateTimeStr);
  // Add 9 hours for Korean time (UTC+9)
  const koreanDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);

  return koreanDate.toLocaleString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default function TimesheetTable() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().setHours(0, 0, 0, 0)
  );
  const [timesheet, setTimesheet] = useState([]);

  useEffect(() => {
    if (selectedDate) {
      fetchTimesheetData(selectedDate);
    }
  }, [selectedDate]);

  const fetchTimesheetData = async (date) => {
    try {
      const formattedDate = formatDateForAPI(date);
      const response = await axios.get(
        "https://aoncodev.work.gd/employees/status/",
        {
          params: { date: formattedDate },
        }
      );

      const data = response.data.employees;

      // Filter out employees with no attendance
      const filteredData = data.filter((employee) => employee.attendance);

      const formattedData = filteredData.map((employee) => {
        const totalWage = employee.total_hours_excluding_breaks
          ? (
              employee.total_hours_excluding_breaks * employee.employee.wage
            ).toFixed(0)
          : 0;

        return {
          name: employee.employee.name,
          role: employee.employee.role,
          clockIn: formatKoreanDateTime(employee.attendance.clock_in),
          clockOut: employee.attendance.clock_out
            ? formatKoreanDateTime(employee.attendance.clock_out)
            : "N/A",
          breaks: employee.breaks.map(
            (br) => `${br.break_type} - ${br.total_break_time}`
          ),
          totalBreak: decimalToTime(employee.total_break_time),
          totalHours: decimalToTime(employee.total_hours_excluding_breaks),
          totalWage:
            employee.employee.wage * employee.total_hours_excluding_breaks,
        };
      });

      setTimesheet(formattedData);
    } catch (error) {
      console.error("Error fetching timesheet data:", error);
    }
  };

  const handleRefresh = () => {
    fetchTimesheetData(selectedDate);
  };

  return (
    <div className="mx-auto">
      <div className="bg-card rounded-lg shadow p-6">
        <div className="flex items-center space-x-4 mb-6">
          <DatePickerDemo onDateChange={setSelectedDate} />
          <button
            onClick={handleRefresh}
            className="bg-primary text-white px-4 py-2 rounded-lg shadow transition hover:bg-secondary"
          >
            Refresh
          </button>
        </div>
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
              </tr>
            </thead>
            <tbody>
              {timesheet.length > 0 ? (
                timesheet.map((entry, index) => (
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
                    <td className="text-center px-4 py-2">
                      {entry.totalBreak}
                    </td>
                    <td className="text-center px-4 py-2">
                      {entry.totalHours}
                    </td>
                    <td className="text-center px-4 py-2">
                      {entry.totalWage} ₩
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center px-4 py-2">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
