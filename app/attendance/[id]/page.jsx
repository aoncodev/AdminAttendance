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
  const kstDate = new Date(kstTimeStr);
  const year = kstDate.getFullYear();
  const month = String(kstDate.getMonth() + 1).padStart(2, "0");
  const date = String(kstDate.getDate()).padStart(2, "0");
  const hours = String(kstDate.getHours()).padStart(2, "0");
  const minutes = String(kstDate.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${date}T${hours}:${minutes}`;
}

function formatDateTimeForDisplay(kstTimeStr) {
  if (!kstTimeStr) return "-";
  const kstDate = new Date(kstTimeStr);
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

  // New state for creating bonus and penalty records
  const [newPenalty, setNewPenalty] = useState({ description: "", price: "" });
  const [newBonus, setNewBonus] = useState({ description: "", price: "" });
  const [isPenaltyDialogOpen, setIsPenaltyDialogOpen] = useState(false);
  const [isBonusDialogOpen, setIsBonusDialogOpen] = useState(false);

  // Task data
  const [tasks, setTask] = useState([]);

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

  const fetchTasks = async (employeeId, taskDate) => {
    try {
      const response = await fetch(
        `${API_URL}/tasks/filter?employee_id=${employeeId}&task_date=${taskDate}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch tasks.");
      }
      const tasksData = await response.json();
      setTask(tasksData); // Assuming setTask is your state setter for tasks
      console.log(tasksData);
    } catch (error) {
      console.error(error);
      toast.error("Error fetching tasks.");
    }
  };

  const fetchAttendanceDetails = async () => {
    try {
      const response = await fetch(`${API_URL}/get/attendance/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch attendance details.");
      }
      const data = await response.json();
      setAttendance(data);
      console.log(data);
      // Convert clock_in to date-only (YYYY-MM-DD)
      const clockInDate = new Date(data.clock_in).toISOString().split("T")[0];
      fetchTasks(data.employee_id, clockInDate);
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
      const payload = {
        attendance_id: attendance.id,
        break_id: breakId,
        [editingField.field]: editValue,
      };

      const apiUrl =
        editingField.field === "break_start"
          ? `${API_URL}/edit/break/start`
          : `${API_URL}/edit/break/end`;

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
      const updatedBreaks = attendance.break_logs.map((log) =>
        log.id === breakId
          ? { ...log, [editingField.field]: data.break_log[editingField.field] }
          : log
      );

      setAttendance({
        ...attendance,
        break_logs: updatedBreaks,
        total_hours_excluding_breaks: data.total_hours,
      });

      toast.success("Break updated successfully.");
      fetchAttendanceDetails();
    } catch (error) {
      console.error(error);
      toast.error("Error updating break time.");
    } finally {
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
      const response = await fetch(`${API_URL}/delete/break/${breakId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete the break.");
      }

      fetchAttendanceDetails();
      toast.success("Break deleted successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Error deleting the break.");
    }
  };

  const handleCreateNewBreak = async () => {
    try {
      const newBreakLog = {
        attendance_id: attendance.id,
        break_type: newBreak.break_type,
        break_start: newBreak.break_start,
        break_end: newBreak.break_end,
      };

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

      await response.json();
      fetchAttendanceDetails();
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
          editClockInOut.field === "clock_in" ? "Clock In" : "Clock Out"
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

  // Penalty functions
  const handleCreatePenalty = async () => {
    try {
      const payload = {
        attendance_id: attendance.id,
        description: newPenalty.description,
        price: parseFloat(newPenalty.price),
      };

      const response = await fetch(`${API_URL}/penalties`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to create penalty record.");
      await response.json();
      fetchAttendanceDetails();
      setNewPenalty({ description: "", price: "" });
      toast.success("Penalty created successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Error creating penalty.");
    } finally {
      setIsPenaltyDialogOpen(false);
    }
  };

  const handleDeletePenalty = async (penaltyId) => {
    try {
      const response = await fetch(`${API_URL}/penalties/${penaltyId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete penalty record.");
      toast.success("Penalty deleted successfully.");
      fetchAttendanceDetails();
    } catch (error) {
      console.error(error);
      toast.error("Error deleting penalty.");
    }
  };

  // Function to toggle the task status
  const handleToggleTask = async (taskId) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}/toggle`, {
        method: "PUT",
      });
      if (!response.ok) {
        throw new Error("Failed to toggle task status");
      }
      const updatedTask = await response.json();
      // Update the tasks state with the updated task info
      setTask((prevTasks) =>
        prevTasks.map((task) => (task.id === taskId ? updatedTask : task))
      );
    } catch (error) {
      console.error(error);
      toast.error("Error toggling task status.");
    }
  };

  // Bonus functions
  const handleCreateBonus = async () => {
    try {
      const payload = {
        attendance_id: attendance.id,
        description: newBonus.description,
        price: parseFloat(newBonus.price),
      };

      const response = await fetch(`${API_URL}/bonuses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to create bonus record.");
      await response.json();
      fetchAttendanceDetails();
      setNewBonus({ description: "", price: "" });
      toast.success("Bonus created successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Error creating bonus.");
    } finally {
      setIsBonusDialogOpen(false);
    }
  };

  const handleDeleteBonus = async (bonusId) => {
    try {
      const response = await fetch(`${API_URL}/bonuses/${bonusId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete bonus record.");
      toast.success("Bonus deleted successfully.");
      fetchAttendanceDetails();
    } catch (error) {
      console.error(error);
      toast.error("Error deleting bonus.");
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
    <div className="max-w-7xl mx-auto py-6 space-y-9">
      <h1 className="text-2xl font-semibold mb-4">
        Date: {new Date(attendance.clock_in).toLocaleDateString("en-US")}
      </h1>
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        Back
      </Button>

      {/* Attendance Metrics Table */}
      <div className="mb-16 shadow-md rounded-xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee Name</TableHead>
              <TableHead>Clock In</TableHead>
              <TableHead>Clock Out</TableHead>
              <TableHead>Has Clocked Out</TableHead>
              <TableHead>Total Hours</TableHead>
              <TableHead>Total Hours (Excluding Breaks)</TableHead>
              <TableHead>Total Break Time (hrs)</TableHead>
              <TableHead>Total Wage</TableHead>
              <TableHead>Total Penalties</TableHead>
              <TableHead>Total Bonus</TableHead>
              <TableHead>Total Late Price</TableHead>
              <TableHead>Net Pay</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>{attendance.employee_name}</TableCell>
              {/* Clock In Column */}
              <TableCell>
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
                  <div className="flex items-center space-x-2">
                    <span>{formatDateTimeForDisplay(attendance.clock_in)}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleEditClock("clock_in", attendance.clock_in)
                      }
                    >
                      Edit
                    </Button>
                  </div>
                )}
              </TableCell>
              {/* Clock Out Column */}
              <TableCell>
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
                  <div className="flex items-center space-x-2">
                    <span>
                      {attendance.clock_out
                        ? formatDateTimeForDisplay(attendance.clock_out)
                        : "-"}
                    </span>
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
                  </div>
                )}
              </TableCell>
              <TableCell>{attendance.has_clocked_out ? "Yes" : "No"}</TableCell>
              <TableCell>{decimalToTime(attendance.total_hours)}</TableCell>
              <TableCell>
                {decimalToTime(attendance.total_hours_excluding_breaks)}
              </TableCell>
              <TableCell>
                {decimalToTime(attendance.total_break_time)}
              </TableCell>
              <TableCell>₩{attendance.total_wage.toFixed(0)}</TableCell>
              <TableCell>₩{attendance.total_penalties.toFixed(0)}</TableCell>
              <TableCell>₩{attendance.total_bonus.toFixed(0)}</TableCell>
              <TableCell>₩{attendance.total_late_price.toFixed(0)}</TableCell>
              <TableCell>₩{attendance.net_pay.toFixed(0)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Break Logs */}
      <div className="mb-16">
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
                    setIsDialogOpen(false);
                  }}
                >
                  Create
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

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
                          handleEditStart(
                            log.id,
                            "break_start",
                            log.break_start
                          )
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

      {/* Penalty Logs */}
      <div className="mb-16">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Penalty Logs</h2>
          <Dialog
            open={isPenaltyDialogOpen}
            onOpenChange={setIsPenaltyDialogOpen}
          >
            <DialogTrigger asChild>
              <Button onClick={() => setIsPenaltyDialogOpen(true)}>
                Create New Penalty
              </Button>
            </DialogTrigger>
            <DialogContent aria-describedby="create-new-penalty-description">
              <DialogHeader>
                <DialogTitle>Create New Penalty</DialogTitle>
                <p
                  id="create-new-penalty-description"
                  className="text-sm text-muted-foreground"
                >
                  Enter the description and price for the new penalty.
                </p>
              </DialogHeader>
              <div className="flex flex-col space-y-4">
                <Input
                  type="text"
                  placeholder="Description"
                  value={newPenalty.description}
                  onChange={(e) =>
                    setNewPenalty({
                      ...newPenalty,
                      description: e.target.value,
                    })
                  }
                />
                <Input
                  type="number"
                  placeholder="Price"
                  value={newPenalty.price}
                  onChange={(e) =>
                    setNewPenalty({ ...newPenalty, price: e.target.value })
                  }
                />
                <Button onClick={handleCreatePenalty}>Create</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendance.penalty_log && attendance.penalty_log.length > 0 ? (
              attendance.penalty_log.map((penalty) => (
                <TableRow key={penalty.id}>
                  <TableCell>{penalty.id}</TableCell>
                  <TableCell>{penalty.description}</TableCell>
                  <TableCell>₩{penalty.price}</TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeletePenalty(penalty.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No penalty records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Bonus Logs */}
      <div className="mb-16">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Bonus Logs</h2>
          <Dialog open={isBonusDialogOpen} onOpenChange={setIsBonusDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsBonusDialogOpen(true)}>
                Create New Bonus
              </Button>
            </DialogTrigger>
            <DialogContent aria-describedby="create-new-bonus-description">
              <DialogHeader>
                <DialogTitle>Create New Bonus</DialogTitle>
                <p
                  id="create-new-bonus-description"
                  className="text-sm text-muted-foreground"
                >
                  Enter the description and price for the new bonus.
                </p>
              </DialogHeader>
              <div className="flex flex-col space-y-4">
                <Input
                  type="text"
                  placeholder="Description"
                  value={newBonus.description}
                  onChange={(e) =>
                    setNewBonus({ ...newBonus, description: e.target.value })
                  }
                />
                <Input
                  type="number"
                  placeholder="Price"
                  value={newBonus.price}
                  onChange={(e) =>
                    setNewBonus({ ...newBonus, price: e.target.value })
                  }
                />
                <Button onClick={handleCreateBonus}>Create</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendance.bonus_log && attendance.bonus_log.length > 0 ? (
              attendance.bonus_log.map((bonus) => (
                <TableRow key={bonus.id}>
                  <TableCell>{bonus.id}</TableCell>
                  <TableCell>{bonus.description}</TableCell>
                  <TableCell>₩{bonus.price}</TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteBonus(bonus.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No bonus records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Tasks Table */}
      <div className="mt-16 mb-16">
        <h2 className="text-xl font-semibold mb-4">Tasks</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Task Date</TableHead>

              <TableHead>Completed At</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks && tasks.length > 0 ? (
              tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>{task.id}</TableCell>
                  <TableCell>{task.description}</TableCell>
                  <TableCell>{task.task_date}</TableCell>
                  <TableCell>
                    {task.completed_at
                      ? new Date(task.completed_at).toLocaleString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {/* Toggleable checkbox */}
                    <input
                      type="checkbox"
                      checked={task.status}
                      onChange={() => handleToggleTask(task.id)}
                      className="w-6 h-6 cursor-pointer accent-green-500"
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No tasks found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AttendanceDetailPage;
