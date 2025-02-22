"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const API_URL = "https://aoncodev.work.gd";

const TasksPage = () => {
  // Tasks, employees and loading state
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state for creating a new task
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // New task form state
  const [newTask, setNewTask] = useState({
    description: "",
    task_date: "",
    employee_id: "",
  });

  // State for filtering tasks by date (default: today)
  const [filterDate, setFilterDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  // New state for filtering by employee (default: All employees)
  const [filterEmployee, setFilterEmployee] = useState("");

  // Fetch employees only once
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Whenever the filter date or employee filter changes, fetch tasks filtered by those parameters.
  useEffect(() => {
    fetchFilteredTasks();
  }, [filterDate, filterEmployee]);

  // Fetch tasks filtered by date and optionally employee_id using the /tasks/filter endpoint.
  const fetchFilteredTasks = async () => {
    try {
      setLoading(true);
      let url = `${API_URL}/tasks/filter?task_date=${filterDate}`;
      if (filterEmployee) {
        url += `&employee_id=${filterEmployee}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }
      const data = await response.json();
      setTasks(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast.error("Error fetching tasks.");
      setLoading(false);
    }
  };

  // Fetch employees to populate the dropdown
  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${API_URL}/employees/`);
      if (!response.ok) {
        throw new Error("Failed to fetch employees");
      }
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error(error);
      toast.error("Error fetching employees.");
    }
  };

  // Create a new task using the form data
  const handleCreateTask = async () => {
    try {
      const response = await fetch(`${API_URL}/tasks/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTask),
      });
      if (!response.ok) {
        throw new Error("Failed to create task");
      }
      const createdTask = await response.json();
      setTasks((prevTasks) => [...prevTasks, createdTask]);
      setNewTask({ description: "", task_date: "", employee_id: "" });
      setIsTaskModalOpen(false);
      toast.success("Task created successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Error creating task.");
    }
  };

  // Delete a task by its ID
  const handleDeleteTask = async (taskId) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete task");
      }
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
      toast.success("Task deleted successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Error deleting task.");
    }
  };

  // Toggle task status by sending a PUT request to the toggle endpoint
  const handleToggleTask = async (taskId) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}/toggle`, {
        method: "PUT",
      });
      if (!response.ok) {
        throw new Error("Failed to toggle task status");
      }
      const updatedTask = await response.json();
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === taskId ? updatedTask : task))
      );
      toast.success("Task status updated.");
    } catch (error) {
      console.error(error);
      toast.error("Error toggling task status.");
    }
  };

  if (loading) {
    return <div>Loading tasks...</div>;
  }

  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold mb-4 sm:mb-0">Task Management</h1>
        <div className="flex items-center space-x-4">
          {/* Date picker for filtering tasks */}
          <div className="flex items-center space-x-2">
            <label htmlFor="filterDate" className="font-medium">
              Filter by Date:
            </label>
            <Input
              id="filterDate"
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-40 p-2 border rounded bg-white dark:bg-black text-black dark:text-white"
            />
          </div>
          {/* Dropdown for filtering by employee */}
          <div className="flex items-center space-x-2">
            <label htmlFor="filterEmployee" className="font-medium">
              Filter by Employee:
            </label>
            <select
              id="filterEmployee"
              value={filterEmployee}
              onChange={(e) => setFilterEmployee(e.target.value)}
              className="w-40 p-2 border rounded bg-white dark:bg-black text-black dark:text-white appearance-none"
            >
              <option value="">All Employees</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>
          </div>
          {/* Modal Trigger for creating a new task */}
          <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
            <DialogTrigger asChild>
              <Button>Create New Task</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col space-y-4">
                <Input
                  placeholder="Task Description"
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                />
                <Input
                  type="date"
                  placeholder="Task Date"
                  value={newTask.task_date}
                  onChange={(e) =>
                    setNewTask({ ...newTask, task_date: e.target.value })
                  }
                />
                {/* Employee Dropdown for new task */}
                <select
                  value={newTask.employee_id}
                  onChange={(e) =>
                    setNewTask({ ...newTask, employee_id: e.target.value })
                  }
                  className="p-2 border rounded bg-white dark:bg-black text-black dark:text-white appearance-none"
                >
                  <option value="">Select Employee</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name}
                    </option>
                  ))}
                </select>
                <Button onClick={handleCreateTask}>Create Task</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tasks Table */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Tasks List</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Task Date</TableHead>
              <TableHead>Completed At</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks && tasks.length > 0 ? (
              tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>{task.description}</TableCell>
                  <TableCell>
                    {employees.find(
                      (emp) => emp.id.toString() === task.employee_id.toString()
                    )?.name || "N/A"}
                  </TableCell>
                  <TableCell>{task.task_date}</TableCell>
                  <TableCell>
                    {task.completed_at
                      ? new Date(task.completed_at).toLocaleString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={task.status}
                      onChange={() => handleToggleTask(task.id)}
                      className="w-6 h-6 cursor-pointer accent-green-500"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
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

export default TasksPage;
