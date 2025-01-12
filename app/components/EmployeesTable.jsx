import { useState, useEffect } from "react";
import Link from "next/link";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function EmployeesTable() {
  const [employees, setEmployees] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [newEmployee, setNewEmployee] = useState({
    name: "",

    role: "employee",
    hourly_wage: "",
  });

  const [currentEdit, setCurrentEdit] = useState({
    id: null,
    name: "",
    qr_id: "",
    hourly_wage: "",
  });

  // Fetch employees from the backend
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

  const handleCreateEmployee = async () => {
    try {
      const newEmployeeData = {
        name: newEmployee.name,
        role: newEmployee.role,
        hourly_wage: newEmployee.hourly_wage,
      };

      const response = await fetch("https://aoncodev.work.gd/employee", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newEmployeeData),
      });

      if (!response.ok) {
        throw new Error("Failed to create employee");
      }

      const createdEmployee = await response.json();

      setEmployees((prevEmployees) => [
        ...prevEmployees,
        {
          ...createdEmployee,
          created_at: new Date().toISOString(),
        },
      ]);

      setIsCreateModalOpen(false);
      setNewEmployee({ name: "", role: "employee", hourly_wage: "" });
    } catch (error) {
      console.error("Error creating employee:", error);
    }
  };

  const handleEditEmployee = async () => {
    try {
      const updatedEmployeeData = {
        name: currentEdit.name,
        hourly_wage: currentEdit.hourly_wage,
      };

      // Send the update request to the backend
      const response = await fetch(
        `https://aoncodev.work.gd/employee/${currentEdit.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedEmployeeData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update employee");
      }

      const updatedEmployee = await response.json();

      // Update the employee in the local state
      setEmployees((prevEmployees) =>
        prevEmployees.map((employee) =>
          employee.id === updatedEmployee.id
            ? { ...employee, ...updatedEmployee }
            : employee
        )
      );

      // Close the modal and reset the form
      setIsEditModalOpen(false);
      setCurrentEdit({ id: null, name: "", hourly_wage: "" });
    } catch (error) {
      console.error("Error editing employee:", error);
    }
  };

  const handleDeleteEmployee = async (id) => {
    try {
      const response = await fetch(`https://aoncodev.work.gd/employee/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(
          `Failed to delete employee. Status: ${response.status}`
        );
      }

      fetchEmployees();
    } catch (error) {
      console.error("Error deleting employee:", error);
      alert("Failed to delete employee. Please try again.");
    }
  };

  return (
    <div className="mx-auto">
      <div className="bg-card rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="text-lg font-semibold">Employee Records</div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            Create New Employee
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-muted">
              <tr>
                <th className="text-center px-4 py-2">ID</th>
                <th className="text-center px-4 py-2">Name</th>
                <th className="text-center px-4 py-2">Role</th>
                <th className="text-center px-4 py-2">QR Code</th>
                <th className="text-center px-4 py-2">Hourly Wage</th>
                <th className="text-center px-4 py-2">Created At</th>
                <th className="text-center px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id} className="border-b">
                  <td className="text-center px-4 py-2">
                    <Link
                      href={`/employee/${employee.id}`}
                      className="text-blue-500"
                    >
                      {employee.id}
                    </Link>
                  </td>
                  <td className="text-center px-4 py-2">{employee.name}</td>
                  <td className="text-center px-4 py-2">{employee.role}</td>
                  <td className="text-center px-4 py-2">{employee.qr_id}</td>
                  <td className="text-center px-4 py-2">
                    {employee.hourly_wage.toLocaleString()} KRW
                  </td>
                  <td className="text-center px-4 py-2">
                    {employee.created_at}
                  </td>
                  <td className="text-center px-4 py-2 space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCurrentEdit({
                          id: employee.id,
                          name: employee.name,
                          hourly_wage: employee.hourly_wage,
                        });
                        setIsEditModalOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteEmployee(employee.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Employee</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newEmployee.name}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, name: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <select
                value={newEmployee.role}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, role: e.target.value })
                }
                className="w-full p-2 border rounded"
              >
                <option value="admin">Admin</option>
                <option value="employee">Employee</option>
              </select>
            </div>
            <div>
              <Label htmlFor="hourly_wage">Hourly Wage</Label>
              <Input
                id="hourly_wage"
                type="number"
                value={newEmployee.hourly_wage}
                onChange={(e) =>
                  setNewEmployee({
                    ...newEmployee,
                    hourly_wage: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateEmployee}>Create</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={currentEdit.name}
                onChange={(e) =>
                  setCurrentEdit({ ...currentEdit, name: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="edit-hourly_wage">Hourly Wage</Label>
              <Input
                id="edit-hourly_wage"
                type="number"
                value={currentEdit.hourly_wage}
                onChange={(e) =>
                  setCurrentEdit({
                    ...currentEdit,
                    hourly_wage: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditEmployee}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
