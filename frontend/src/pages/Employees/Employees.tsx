import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  CircularProgress,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PeopleIcon from "@mui/icons-material/People";
import BusinessIcon from "@mui/icons-material/Business";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BlockIcon from "@mui/icons-material/Block";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";
import * as XLSX from "xlsx";
import { getEmployees, addEmployee, updateEmployee, deleteEmployee } from "../../services/employeeService";
import type { Employee } from "../../services/employeeService";

function Employees() {
  // State management
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: "", 
    severity: "success" as "success" | "error" 
  });

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    department: "",
    status: "Active",
  });

  // Load employees from API
  const loadEmployees = async () => {
    try {
      const data = await getEmployees();
      setEmployees(data);
      setFilteredEmployees(data);
    } catch (error) {
      console.error("Error loading employees:", error);
      showSnackbar("Failed to load employees", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  // Filter employees based on search, department, and status
  useEffect(() => {
    let result = employees;

    // Search filter
    if (search) {
      result = result.filter((employee) =>
        `${employee.firstName} ${employee.lastName} ${employee.email} ${employee.department}`
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    // Department filter
    if (selectedDepartment) {
      result = result.filter((employee) => employee.department === selectedDepartment);
    }

    // Status filter
    if (selectedStatus) {
      result = result.filter((employee) => employee.status === selectedStatus);
    }

    setFilteredEmployees(result);
  }, [search, selectedDepartment, selectedStatus, employees]);

  // Show snackbar notification
  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  // Department and status options
  const departments = ["IT", "HR", "Finance", "Marketing", "Operations", "Sales"];
  const statuses = ["Active", "Inactive"];

  // Export to Excel
  const exportToExcel = () => {
    const data = employees.map((emp) => ({
      "First Name": emp.firstName,
      "Last Name": emp.lastName,
      "Email": emp.email,
      "Department": emp.department,
      "Status": emp.status,
      "Created": new Date(emp.createdAt).toLocaleDateString(),
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employees");
    XLSX.writeFile(wb, `Employees_${new Date().toISOString().split("T")[0]}.xlsx`);
    showSnackbar("Employees exported successfully!", "success");
  };

  // Add Employee
  const handleAddEmployee = async () => {
    try {
      await addEmployee(formData);
      showSnackbar("Employee added successfully!", "success");
      setOpenAddDialog(false);
      setFormData({ firstName: "", lastName: "", email: "", department: "", status: "Active" });
      loadEmployees();
    } catch (error: any) {
      console.error("Error adding employee:", error);
      const errorMessage = error.response?.data?.message || "Failed to add employee";
      showSnackbar(errorMessage, "error");
    }
  };

  // Edit Employee
  const handleEditEmployee = async () => {
    if (!selectedEmployee) return;
    try {
      const updateData = {
        id: selectedEmployee.id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        department: formData.department,
        status: formData.status,
      };
      await updateEmployee(selectedEmployee.id, updateData);
      showSnackbar("Employee updated successfully!", "success");
      setOpenEditDialog(false);
      setSelectedEmployee(null);
      loadEmployees();
    } catch (error: any) {
      console.error("Error updating employee:", error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.title || 
                          "Failed to update employee";
      showSnackbar(errorMessage, "error");
    }
  };

  // Delete Employee
  const handleDeleteEmployee = async () => {
    if (!selectedEmployee) return;
    try {
      await deleteEmployee(selectedEmployee.id);
      showSnackbar("Employee deleted successfully!", "success");
      setOpenDeleteDialog(false);
      setSelectedEmployee(null);
      loadEmployees();
    } catch (error: any) {
      console.error("Error deleting employee:", error);
      const errorMessage = error.response?.data?.message || "Failed to delete employee";
      showSnackbar(errorMessage, "error");
    }
  };

  // Open edit dialog
  const openEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormData({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      department: employee.department,
      status: employee.status,
    });
    setOpenEditDialog(true);
  };

  // Open delete dialog
  const openDelete = (employee: Employee) => {
    setSelectedEmployee(employee);
    setOpenDeleteDialog(true);
  };

  // Statistics
  const stats = {
    total: employees.length,
    active: employees.filter((e) => e.status === "Active").length,
    inactive: employees.filter((e) => e.status !== "Active").length,
    departments: new Set(employees.map((e) => e.department)).size,
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: "bold", color: "#1a237e" }}>
            👥 Employees
          </Typography>
          <Typography sx={{ color: "text.secondary" }}>
            {employees.length} employees
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={exportToExcel}>
            Export
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenAddDialog(true)}>
            Add Employee
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PeopleIcon color="primary" />
                <Typography variant="body2">Total Employees</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <BusinessIcon color="secondary" />
                <Typography variant="body2">Departments</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                {stats.departments}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: 4, borderColor: "success.main" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CheckCircleIcon color="success" />
                <Typography variant="body2">Active</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: "bold", color: "success.main" }}>
                {stats.active}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: 4, borderColor: "error.main" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <BlockIcon color="error" />
                <Typography variant="body2">Inactive</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: "bold", color: "error.main" }}>
                {stats.inactive}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters & Table */}
      <Paper sx={{ p: 2 }}>
        {/* Filters */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
          <TextField
            placeholder="Search employees..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: 250 }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
            }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Department</InputLabel>
            <Select
              value={selectedDepartment}
              label="Department"
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept} value={dept}>{dept}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={selectedStatus}
              label="Status"
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {statuses.map((status) => (
                <MenuItem key={status} value={status}>{status}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="body2" sx={{ color: "text.secondary", alignSelf: "center", ml: "auto" }}>
            {filteredEmployees.length} employees found
          </Typography>
        </Box>

        {/* Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">No employees found</TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((emp, index) => (
                  <TableRow key={emp.id}>
                    <TableCell>EMP-{String(index + 1).padStart(3, "0")}</TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 500 }}>
                        {emp.firstName} {emp.lastName}
                      </Typography>
                    </TableCell>
                    <TableCell>{emp.email}</TableCell>
                    <TableCell>{emp.department}</TableCell>
                    <TableCell>
                      <Chip
                        label={emp.status}
                        size="small"
                        color={emp.status === "Active" ? "success" : "error"}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" color="info" title="View">
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton size="small" color="primary" title="Edit" onClick={() => openEdit(emp)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error" title="Delete" onClick={() => openDelete(emp)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Employee</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField 
              label="First Name" 
              fullWidth 
              value={formData.firstName} 
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} 
            />
            <TextField 
              label="Last Name" 
              fullWidth 
              value={formData.lastName} 
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} 
            />
            <TextField 
              label="Email" 
              type="email" 
              fullWidth 
              value={formData.email} 
              onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
            />
            <TextField 
              select 
              label="Department" 
              fullWidth 
              value={formData.department} 
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            >
              {departments.map((dept) => (
                <MenuItem key={dept} value={dept}>{dept}</MenuItem>
              ))}
            </TextField>
            <TextField 
              select 
              label="Status" 
              fullWidth 
              value={formData.status} 
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              {statuses.map((status) => (
                <MenuItem key={status} value={status}>{status}</MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddEmployee}>Add</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Employee</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField 
              label="First Name" 
              fullWidth 
              value={formData.firstName} 
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} 
            />
            <TextField 
              label="Last Name" 
              fullWidth 
              value={formData.lastName} 
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} 
            />
            <TextField 
              label="Email" 
              type="email" 
              fullWidth 
              value={formData.email} 
              onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
            />
            <TextField 
              select 
              label="Department" 
              fullWidth 
              value={formData.department} 
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            >
              {departments.map((dept) => (
                <MenuItem key={dept} value={dept}>{dept}</MenuItem>
              ))}
            </TextField>
            <TextField 
              select 
              label="Status" 
              fullWidth 
              value={formData.status} 
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              {statuses.map((status) => (
                <MenuItem key={status} value={status}>{status}</MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleEditEmployee}>Update</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete Employee</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{selectedEmployee?.firstName} {selectedEmployee?.lastName}</strong>?
            <br />
            <span style={{ color: "#f44336", fontSize: "0.9rem" }}>This action cannot be undone.</span>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteEmployee}>Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={3000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })} 
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Employees;