import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
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
  InputAdornment,
  Switch,
  FormControlLabel,
  LinearProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import { lockerService } from "../../services/lockerService";
import type { Locker } from "../../services/lockerService";

function Lockers() {
  const [lockers, setLockers] = useState<Locker[]>([]);
  const [filteredLockers, setFilteredLockers] = useState<Locker[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingLocker, setEditingLocker] = useState<Locker | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    occupied: 0,
    maintenance: 0,
    reserved: 0,
    neededLockers: 0,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const [formData, setFormData] = useState({
    number: "",
    location: "",
    status: "Available" as Locker["status"],
    lockType: "Key" as Locker["lockType"],
    assignedTo: "",
    biometricEnabled: false,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [lockersData, statsData] = await Promise.all([
        lockerService.getAll(),
        lockerService.getStats(),
      ]);
      setLockers(lockersData);
      setFilteredLockers(lockersData);
      setStats(statsData);
    } catch (error) {
      console.error("Error loading lockers:", error);
      showSnackbar("Failed to load lockers", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const filtered = lockers.filter(
      (locker) =>
        locker.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        locker.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (locker.assignedToName?.toLowerCase() || "").includes(searchQuery.toLowerCase())
    );
    setFilteredLockers(filtered);
  }, [searchQuery, lockers]);

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenDialog = (locker?: Locker) => {
    if (locker) {
      setEditingLocker(locker);
      setFormData({
        number: locker.number,
        location: locker.location,
        status: locker.status,
        lockType: locker.lockType,
        assignedTo: locker.assignedTo?.toString() || "",
        biometricEnabled: locker.biometricEnabled,
      });
    } else {
      setEditingLocker(null);
      setFormData({
        number: "",
        location: "",
        status: "Available",
        lockType: "Key",
        assignedTo: "",
        biometricEnabled: false,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingLocker(null);
  };

  const handleSaveLocker = async () => {
    try {
      const dataToSend = {
        ...formData,
        assignedTo: formData.assignedTo ? parseInt(formData.assignedTo) : null,
      };

      if (editingLocker) {
        await lockerService.update(editingLocker.id, dataToSend);
        showSnackbar("Locker updated successfully!", "success");
      } else {
        await lockerService.create(dataToSend);
        showSnackbar("Locker created successfully!", "success");
      }
      handleCloseDialog();
      loadData();
    } catch (error: any) {
      console.error("Error saving locker:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.title ||
        "Failed to save locker";
      showSnackbar(errorMessage, "error");
    }
  };

  const handleDeleteLocker = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this locker?")) {
      try {
        await lockerService.delete(id);
        showSnackbar("Locker deleted successfully!", "success");
        loadData();
      } catch (error) {
        console.error("Error deleting locker:", error);
        showSnackbar("Failed to delete locker", "error");
      }
    }
  };

  const handleToggleBiometric = async (lockerId: number) => {
    try {
      await lockerService.toggleBiometric(lockerId);
      showSnackbar("Biometric toggled successfully!", "success");
      loadData();
    } catch (error) {
      console.error("Error toggling biometric:", error);
      showSnackbar("Failed to toggle biometric", "error");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available": return "success";
      case "Occupied": return "primary";
      case "Maintenance": return "warning";
      case "Reserved": return "info";
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
            🗄️ Lockers
          </Typography>
          <Typography sx={{ color: "text.secondary" }}>
            {stats.occupiedLockers || 0}/{stats.total} lockers
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadData}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            Add Locker
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: "#f5f5f5" }}>
            <CardContent>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>Total Lockers</Typography>
              <Typography variant="h4" sx={{ fontWeight: "bold" }}>{stats.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: 4, borderColor: "success.main" }}>
            <CardContent>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>Available</Typography>
              <Typography variant="h4" sx={{ fontWeight: "bold", color: "success.main" }}>
                {stats.available}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: 4, borderColor: "error.main" }}>
            <CardContent>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>Needed Lockers</Typography>
              <Typography variant="h4" sx={{ fontWeight: "bold", color: "error.main" }}>
                {stats.neededLockers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: 4, borderColor: "info.main" }}>
            <CardContent>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>Biometric Enabled</Typography>
              <Typography variant="h4" sx={{ fontWeight: "bold", color: "info.main" }}>
                {lockers.filter((l) => l.biometricEnabled).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <TextField
            placeholder="Search lockers..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ width: 300 }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
            }}
          />
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {filteredLockers.length} lockers
          </Typography>
        </Box>

        <Grid container spacing={2}>
          {filteredLockers.length === 0 ? (
            <Grid item xs={12}>
              <Typography align="center" sx={{ py: 4, color: "text.secondary" }}>
                No lockers found
              </Typography>
            </Grid>
          ) : (
            filteredLockers.map((locker) => (
              <Grid item xs={12} md={6} lg={4} key={locker.id}>
                <Card sx={{ 
                  borderRadius: 2,
                  transition: "transform 0.2s",
                  "&:hover": { transform: "translateY(-4px)" }
                }}>
                  <CardContent>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                          {locker.number}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                          {locker.location}
                        </Typography>
                      </Box>
                      <Chip
                        label={locker.status}
                        size="small"
                        color={getStatusColor(locker.status) as any}
                      />
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        Assigned To: <strong>{locker.assignedToName || "Unassigned"}</strong>
                      </Typography>
                      <Typography variant="body2">
                        Lock Type: <strong>{locker.lockType}</strong>
                      </Typography>
                      <Typography variant="body2">
                        Biometric: <strong>{locker.biometricEnabled ? "✅ Active" : "❌ Inactive"}</strong>
                      </Typography>
                    </Box>
                    <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 1 }}>
                      <IconButton size="small" color="primary" onClick={() => handleOpenDialog(locker)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteLocker(locker.id)}>
                        <DeleteIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="info" 
                        onClick={() => handleToggleBiometric(locker.id)}
                        title="Toggle Biometric"
                      >
                        <FingerprintIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingLocker ? "Edit Locker" : "Add Locker"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Locker Number"
              fullWidth
              required
              value={formData.number}
              onChange={(e) => setFormData({ ...formData, number: e.target.value })}
            />
            <TextField
              label="Location"
              fullWidth
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
            <TextField
              select
              label="Status"
              fullWidth
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Locker["status"] })}
            >
              <MenuItem value="Available">Available</MenuItem>
              <MenuItem value="Occupied">Occupied</MenuItem>
              <MenuItem value="Maintenance">Maintenance</MenuItem>
              <MenuItem value="Reserved">Reserved</MenuItem>
            </TextField>
            <TextField
              select
              label="Lock Type"
              fullWidth
              value={formData.lockType}
              onChange={(e) => setFormData({ ...formData, lockType: e.target.value as Locker["lockType"] })}
            >
              <MenuItem value="Key">Key</MenuItem>
              <MenuItem value="Combination">Combination</MenuItem>
              <MenuItem value="Biometric">Biometric</MenuItem>
            </TextField>
            <TextField
              label="Assigned To (Employee ID)"
              type="number"
              fullWidth
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.biometricEnabled}
                  onChange={(e) =>
                    setFormData({ ...formData, biometricEnabled: e.target.checked })
                  }
                  color="primary"
                />
              }
              label="Enable Biometric"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveLocker}>
            {editingLocker ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
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

export default Lockers;