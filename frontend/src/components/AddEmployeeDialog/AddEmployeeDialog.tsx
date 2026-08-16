import { useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Snackbar,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { addEmployee } from "../../services/employeeService";

interface AddEmployeeDialogProps {
  onEmployeeAdded: () => void;
}

function AddEmployeeDialog({ onEmployeeAdded }: AddEmployeeDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: "", 
    severity: "success" as "success" | "error" 
  });
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    department: "",
    status: "Active",
  });

  const handleOpen = () => setOpen(true);
  
  const handleClose = () => {
    setOpen(false);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      department: "",
      status: "Active",
    });
  };

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.department) {
      setSnackbar({ 
        open: true, 
        message: "Please fill in all required fields", 
        severity: "error" 
      });
      return;
    }

    try {
      setLoading(true);
      await addEmployee(formData);
      setSnackbar({ 
        open: true, 
        message: "Employee added successfully!", 
        severity: "success" 
      });
      onEmployeeAdded();
      handleClose();
    } catch (error) {
      console.error("Error adding employee:", error);
      setSnackbar({ 
        open: true, 
        message: "Failed to add employee", 
        severity: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  const departments = ["IT", "HR", "Finance", "Marketing", "Operations", "Sales"];

  return (
    <>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleOpen}
      >
        Add Employee
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Employee</DialogTitle>
        <DialogContent>
          <TextField
            label="First Name"
            fullWidth
            required
            margin="normal"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          />
          <TextField
            label="Last Name"
            fullWidth
            required
            margin="normal"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          />
          <TextField
            label="Email"
            type="email"
            fullWidth
            required
            margin="normal"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <TextField
            select
            label="Department"
            fullWidth
            required
            margin="normal"
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
            margin="normal"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          >
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

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
    </>
  );
}

export default AddEmployeeDialog;