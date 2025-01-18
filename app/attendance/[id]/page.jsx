"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "react-toastify";
import { useParams, useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const API_URL = "https://aoncodev.work.gd";

function formatDateTimeForInput(kstTimeStr) {
  if (!kstTimeStr) return "";
  const kstDate = new Date(kstTimeStr); // Assume input is already in KST
  const year = kstDate.getFullYear();
  const month = String(kstDate.getMonth() + 1).padStart(2, "0");
  const date = String(kstDate.getDate()).padStart(2, "0");
  const hours = String(kstDate.getHours()).padStart(2, "0");
  const minutes = String(kstDate.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${date}T${hours}:${minutes}`;
}

// Format KST datetime string for user-friendly display
function formatDateTimeForDisplay(kstTimeStr) {
  if (!kstTimeStr) return "-";
  const kstDate = new Date(kstTimeStr); // Assume input is already in KST
  const hours = String(kstDate.getHours()).padStart(2, "0");
  const minutes = String(kstDate.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function decimalToTime(decimal) {
  const hours = Math.floor(decimal);
  const minutes = Math.floor((decimal - hours) * 60);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}`;
}

const AttendanceDetailPage = () => {
  const { id } = useParams();
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editClockInOut, setEditClockInOut] = useState(null);
  const [editClockInOutValue, setEditClockInOutValue] = useState("");
  const router = useRouter();

  const [newBreak, setNewBreak] = useState({
    break_type: "",
    break_start: "",
    break_end: "",
  });

  useEffect(() => {
    if (id) {
      fetchAttendanceDetails();
    }
  }, [id]);

  const fetchAttendanceDetails = async () => {
    try {
      const response = await fetch(`${API_URL}/get/attendance/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch attendance details.");
      }
      const data = await response.json();
      setAttendance(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast.error("Error fetching attendance details.");
      setLoading(false);
    }
  };

  const handleEditStart = (breakId, field, currentValue) => {
    setEditingField({ breakId, field });
    setEditValue(formatDateTimeForInput(currentValue));
  };

  const handleSave = async (breakId) => {
    try {
      // Prepare the payload
      const payload = {
        attendance_id: attendance.id, // Current attendance ID
        break_id: breakId, // Break ID being edited
        [editingField.field]: editValue, // Either break_start or break_end
      };

      // Determine the API endpoint based on the field being edited
      const apiUrl =
        editingField.field === "break_start"
          ? `${API_URL}/edit/break/start`
          : `${API_URL}/edit/break/end`;

      // Make the API call
      const response = await fetch(apiUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to update the break time.");
      }

      const data = await response.json();

      // Update the state with the new break time and total hours
      const updatedBreaks = attendance.break_logs.map((log) =>
        log.id === breakId
          ? {
              ...log,
              [editingField.field]: data.break_log[editingField.field],
            }
          : log
      );

      setAttendance({
        ...attendance,
        break_logs: updatedBreaks,
        total_hours_excluding_breaks: data.total_hours, // Update total hours
      });

      toast.success("Break updated successfully.");
      fetchAttendanceDetails();
    } catch (error) {
      console.error(error);
      toast.error("Error updating break time.");
    } finally {
      // Clear editing state
      setEditingField(null);
      setEditValue("");
    }
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditValue("");
  };

  const handleDelete = async (breakId) => {
    try {
      // Call the backend API to delete the break
      const response = await fetch(`${API_URL}/delete/break/${breakId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete the break.");
      }

      fetchAttendanceDetails();
      // Show success message
      toast.success("Break deleted successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Error deleting the break.");
    }
  };

  const handleCreateNewBreak = async () => {
    try {
      // Construct the new break log object
      const newBreakLog = {
        attendance_id: attendance.id, // Current attendance ID
        break_type: newBreak.break_type,
        break_start: newBreak.break_start,
        break_end: newBreak.break_end,
      };

      console.log(newBreakLog);

      const response = await fetch(`${API_URL}/create/break`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newBreakLog),
      });

      if (!response.ok) {
        throw new Error("Failed to create a new break.");
      }

      const data = await response.json();

      // Update the state with the new break
      fetchAttendanceDetails();

      // Reset the new break form
      setNewBreak({ break_type: "", break_start: "", break_end: "" });

      toast.success("New break created successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Error creating a new break.");
    }
  };

  const handleEditClock = (field, currentValue) => {
    setEditClockInOut({ field, currentValue });
    setEditClockInOutValue(formatDateTimeForInput(currentValue));
  };

  const handleSaveClock = async () => {
    try {
      const payload = {
        attendance_id: attendance.id,
        [editClockInOut?.field]: editClockInOutValue,
      };

      const apiUrl = `${API_URL}/attendance/edit/${editClockInOut?.field}`;

      const response = await fetch(apiUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to update clock time.");
      }

      toast.success(
        `${
          editClockInOutValue === "clock_in" ? "Clock In" : "Clock Out"
        } updated successfully.`
      );
      fetchAttendanceDetails();
    } catch (error) {
      console.error(error);
      toast.error("Error updating clock time.");
    } finally {
      setEditClockInOut(null);
      setEditClockInOutValue("");
    }
  };

  const handleCancelClock = () => {
    setEditClockInOut(null);
    setEditClockInOutValue("");
  };

  const handleDeleteClockOut = async () => {
    try {
      const response = await fetch(
        `${API_URL}/attendance/delete/${attendance.id}/clock_out`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete clock-out time.");
      }

      toast.success("Clock Out deleted successfully.");
      fetchAttendanceDetails();
    } catch (error) {
      console.error(error);
      toast.error("Error deleting clock-out time.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!attendance) {
    return <div>Error: Attendance not found.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto py-6">
      <h1 className="text-2xl font-semibold mb-4">Attendance Details</h1>
      <Button
        variant="outline"
        onClick={() => router.back()} // Navigate back to the previous page
        className="mb-6"
      >
        Back
      </Button>

      {/* Attendance Information */}
      <div className="mb-6 bg-muted p-4 rounded-lg">
        <div>
          <strong>Date:</strong>{" "}
          {new Date(attendance.clock_in).toLocaleDateString("en-US")}
        </div>
        <div>
          <strong>Employee Name:</strong> {attendance.employee_name}
        </div>
        <div>
          <strong>Clock In:</strong>{" "}
          {editClockInOut?.field === "clock_in" ? (
            <div className="flex items-center space-x-2">
              <Input
                type="datetime-local"
                value={editClockInOutValue}
                onChange={(e) => setEditClockInOutValue(e.target.value)}
              />
              <Button onClick={handleSaveClock}>Save</Button>
              <Button variant="outline" onClick={handleCancelClock}>
                Cancel
              </Button>
            </div>
          ) : (
            <span className="flex items-center space-x-2">
              <span>{formatDateTimeForDisplay(attendance.clock_in)}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditClock("clock_in", attendance.clock_in)}
              >
                Edit
              </Button>
            </span>
          )}
        </div>
        <div>
          <strong>Clock Out:</strong>{" "}
          {editClockInOut?.field === "clock_out" ? (
            <div className="flex items-center space-x-2">
              <Input
                type="datetime-local"
                value={editClockInOutValue}
                onChange={(e) => setEditClockInOutValue(e.target.value)}
              />
              <Button onClick={handleSaveClock}>Save</Button>
              <Button variant="outline" onClick={handleCancelClock}>
                Cancel
              </Button>
            </div>
          ) : (
            <span className="flex items-center space-x-2">
              <span>{formatDateTimeForDisplay(attendance.clock_out)}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleEditClock("clock_out", attendance.clock_out)
                }
              >
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteClockOut}
              >
                Delete
              </Button>
            </span>
          )}
        </div>
        <div>
          <strong>Total Breaks:</strong>{" "}
          {decimalToTime(attendance.total_break_time)}
        </div>
        <div>
          <strong>Total Hours (Excluding Breaks):</strong>{" "}
          {decimalToTime(attendance.total_hours_excluding_breaks)}
        </div>
        <div>
          <strong>Total Wage:</strong> ₩{attendance.total_wage.toFixed(0)}
        </div>
      </div>

      {/* Break Logs Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Break Logs</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              Create New Break
            </Button>
          </DialogTrigger>
          <DialogContent aria-describedby="create-new-break-description">
            <DialogHeader>
              <DialogTitle>Create New Break</DialogTitle>
              <p
                id="create-new-break-description"
                className="text-sm text-muted-foreground"
              >
                Fill in the details below to add a new break to the attendance
                record.
              </p>
            </DialogHeader>
            <div className="flex flex-col space-y-4">
              <Select
                value={newBreak.break_type}
                onValueChange={(value) =>
                  setNewBreak({ ...newBreak, break_type: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Break Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="eating">Eating</SelectItem>
                  <SelectItem value="restroom">Restroom</SelectItem>
                  <SelectItem value="praying">Praying</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="datetime-local"
                placeholder="Break Start"
                value={newBreak.break_start}
                onChange={(e) =>
                  setNewBreak({ ...newBreak, break_start: e.target.value })
                }
              />
              <Input
                type="datetime-local"
                placeholder="Break End"
                value={newBreak.break_end}
                onChange={(e) =>
                  setNewBreak({ ...newBreak, break_end: e.target.value })
                }
              />
              <Button
                onClick={() => {
                  handleCreateNewBreak();
                  setIsDialogOpen(false); // Close the dialog after creating the break
                }}
              >
                Create
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Break Logs Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Break Type</TableHead>
            <TableHead>Break Start</TableHead>
            <TableHead>Break End</TableHead>
            <TableHead>Total Break Time (hrs)</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {attendance.break_logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>{log.break_type}</TableCell>
              <TableCell>
                {editingField?.breakId === log.id &&
                editingField?.field === "break_start" ? (
                  <div className="flex items-center space-x-2">
                    <Input
                      type="datetime-local"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                    />
                    <Button onClick={() => handleSave(log.id)}>Save</Button>
                    <Button variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>{formatDateTimeForDisplay(log.break_start)}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleEditStart(log.id, "break_start", log.break_start)
                      }
                    >
                      Edit
                    </Button>
                  </div>
                )}
              </TableCell>
              <TableCell>
                {editingField?.breakId === log.id &&
                editingField?.field === "break_end" ? (
                  <div className="flex items-center space-x-2">
                    <Input
                      type="datetime-local"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                    />
                    <Button onClick={() => handleSave(log.id)}>Save</Button>
                    <Button variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>{formatDateTimeForDisplay(log.break_end)}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleEditStart(log.id, "break_end", log.break_end)
                      }
                    >
                      Edit
                    </Button>
                  </div>
                )}
              </TableCell>
              <TableCell>
                {decimalToTime(log.total_break_time) || "N/A"}
              </TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(log.id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AttendanceDetailPage;
