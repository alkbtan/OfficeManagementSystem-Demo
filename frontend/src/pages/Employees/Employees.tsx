import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Button,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Snackbar,
  Alert,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from "../../services/employeeService";
import type { Employee } from "../../services/employeeService";

function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const departments = ["QA", "Office", "HR", "IT", "Diretoria", "Secretary", "Other"];
  const floors = ["7th", "15th", "17th", "18th", "19th"];

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    department: "",
    status: "Active",
    location: "",
    birthday: "",
  });

  const statuses = ["Active", "Inactive", "On Leave", "Terminated"];

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getEmployees();
      setEmployees(data);
    } catch (error) {
      console.error("Error loading employees:", error);
      showSnackbar("Failed to load employees", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenDialog = (employee?: Employee) => {
    if (employee) {
      setEditingEmployee(employee);
      setFormData({
        firstName: employee.firstName || "",
        lastName: employee.lastName || "",
        email: employee.email || "",
        department: employee.department || "",
        status: employee.status || "Active",
        location: employee.location || "",
        birthday: employee.birthday ? employee.birthday.split("T")[0] : "",
      });
    } else {
      setEditingEmployee(null);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        department: "",
        status: "Active",
        location: "",
        birthday: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingEmployee(null);
  };

  const handleSaveEmployee = async () => {
    if (!formData.firstName.trim()) {
      showSnackbar("First Name is required", "error");
      return;
    }
    if (!formData.lastName.trim()) {
      showSnackbar("Last Name is required", "error");
      return;
    }
    if (!formData.email.trim()) {
      showSnackbar("Email is required", "error");
      return;
    }
    if (!formData.department) {
      showSnackbar("Department is required", "error");
      return;
    }

    try {
      const dataToSend = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        department: formData.department,
        status: formData.status,
        location: formData.location || "",
        birthday: formData.birthday ? new Date(formData.birthday).toISOString() : null,
      };

      if (editingEmployee) {
        await updateEmployee(editingEmployee.id, dataToSend);
        showSnackbar("Employee updated successfully!", "success");
      } else {
        await createEmployee(dataToSend);
        showSnackbar("Employee created successfully!", "success");
      }
      handleCloseDialog();
      loadData();
    } catch (error: any) {
      console.error("Error saving employee:", error);
      const errorMessage = error?.response?.data?.message || "Failed to save employee";
      showSnackbar(errorMessage, "error");
    }
  };

  const handleDeleteEmployee = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        await deleteEmployee(id);
        showSnackbar("Employee deleted successfully!", "success");
        loadData();
      } catch (error) {
        console.error("Error deleting employee:", error);
        showSnackbar("Failed to delete employee", "error");
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "success";
      case "Inactive": return "default";
      case "On Leave": return "warning";
      case "Terminated": return "error";
      default: return "default";
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
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
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadData}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            Add Employee
          </Button>
        </Box>
      </Box>

      <Grid container spacing={2}>
        {employees.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <Typography sx={{ color: "text.secondary" }}>No employees found</Typography>
            </Paper>
          </Grid>
        ) : (
          employees.map((emp) => (
            <Grid item xs={12} sm={6} md={4} key={emp.id}>
              <Card sx={{ borderRadius: 2, transition: "transform 0.2s", "&:hover": { transform: "translateY(-4px)" } }}>
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                        {emp.firstName} {emp.lastName}
                      </Typography>
                      <Chip label={emp.department} size="small" variant="outlined" sx={{ mt: 0.5 }} />
                      <Chip label={emp.status} size="small" color={getStatusColor(emp.status) as any} sx={{ mt: 0.5, ml: 0.5 }} />
                    </Box>
                    <Box>
                      <IconButton size="small" color="primary" onClick={() => handleOpenDialog(emp)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteEmployee(emp.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2">📧 {emp.email}</Typography>
                    {emp.location && (
                      <Typography variant="body2">📍 Location: <strong>{emp.location}</strong></Typography>
                    )}
                    {emp.birthday && (
                      <Typography variant="body2">🎂 Birthday: <strong>{new Date(emp.birthday).toLocaleDateString()}</strong></Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: "#1a237e", color: "white" }}>
          {editingEmployee ? "✏️ Edit Employee" : "➕ Add Employee"}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="First Name"
                  fullWidth
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Last Name"
                  fullWidth
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </Grid>
            </Grid>

            <TextField
              label="Email"
              fullWidth
              required
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />

            <TextField
              select
              label="Department"
              fullWidth
              required
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            >
              {departments.map((dept) => (
                <MenuItem key={dept} value={dept}>{dept}</MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Location (Floor)"
              fullWidth
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            >
              {floors.map((floor) => (
                <MenuItem key={floor} value={floor}>{floor}</MenuItem>
              ))}
            </TextField>

            <TextField
              label="Birthday"
              type="date"
              fullWidth
              value={formData.birthday}
              onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />

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
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={handleCloseDialog} variant="outlined" color="inherit">Cancel</Button>
          <Button variant="contained" onClick={handleSaveEmployee} sx={{ bgcolor: "#1a237e" }}>
            {editingEmployee ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Employees;