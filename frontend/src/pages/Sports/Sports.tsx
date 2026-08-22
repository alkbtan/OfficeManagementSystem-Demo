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
import { sportService } from "../../services/sportService";
import type { Sport } from "../../services/sportService";

function Sports() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSport, setEditingSport] = useState<Sport | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const [formData, setFormData] = useState({
    name: "",
    date: "",
    time: "",
    preparation: "",
    equipment: "",
    status: "Pending" as Sport["status"],
  });

  const statuses = ["Pending", "Preparing", "Ready", "Completed"];

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await sportService.getAll();
      setSports(data);
    } catch (error) {
      console.error("Error loading sports:", error);
      showSnackbar("Failed to load sports", "error");
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

  const handleOpenDialog = (sport?: Sport) => {
    if (sport) {
      setEditingSport(sport);
      setFormData({
        name: sport.name || "",
        date: sport.date ? sport.date.split("T")[0] : "",
        time: sport.time || "",
        preparation: sport.preparation || "",
        equipment: sport.equipment || "",
        status: sport.status || "Pending",
      });
    } else {
      setEditingSport(null);
      setFormData({
        name: "",
        date: "",
        time: "",
        preparation: "",
        equipment: "",
        status: "Pending",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingSport(null);
  };

  // ✅ FIXED: handleSaveSport without sending id in body
  const handleSaveSport = async () => {
    // Validate required fields
    if (!formData.name.trim()) {
      showSnackbar("Match Name is required", "error");
      return;
    }
    if (!formData.date) {
      showSnackbar("Date is required", "error");
      return;
    }
    if (!formData.time) {
      showSnackbar("Time is required", "error");
      return;
    }

    try {
      // Convert date to proper UTC format
      const dateObj = new Date(formData.date);
      const dateToSend = dateObj.toISOString();

      // ✅ Don't send id in the body for update
      const dataToSend = {
        name: formData.name,
        date: dateToSend,
        time: formData.time,
        preparation: formData.preparation || "",
        equipment: formData.equipment || "",
        status: formData.status,
      };

      if (editingSport) {
        await sportService.update(editingSport.id, dataToSend);
        showSnackbar("Sport updated successfully!", "success");
      } else {
        await sportService.create(dataToSend);
        showSnackbar("Sport created successfully!", "success");
      }
      handleCloseDialog();
      loadData();
    } catch (error: any) {
      console.error("Error saving sport:", error);
      console.error("Response data:", error?.response?.data);
      const errorMessage = error?.response?.data?.message || "Failed to save sport";
      showSnackbar(errorMessage, "error");
    }
  };

  const handleDeleteSport = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this sport?")) {
      try {
        await sportService.delete(id);
        showSnackbar("Sport deleted successfully!", "success");
        loadData();
      } catch (error) {
        console.error("Error deleting sport:", error);
        showSnackbar("Failed to delete sport", "error");
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ready": return "success";
      case "Preparing": return "warning";
      case "Pending": return "info";
      case "Completed": return "default";
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
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: "bold", color: "#1a237e" }}>
            ⚽ Sports
          </Typography>
          <Typography sx={{ color: "text.secondary" }}>
            {sports.length} matches
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadData}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            New Match
          </Button>
        </Box>
      </Box>

      {/* Sports Grid */}
      <Grid container spacing={2}>
        {sports.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <Typography sx={{ color: "text.secondary" }}>No matches found</Typography>
            </Paper>
          </Grid>
        ) : (
          sports.map((sport) => (
            <Grid item xs={12} md={6} lg={4} key={sport.id}>
              <Card
                sx={{
                  borderRadius: 2,
                  transition: "transform 0.2s",
                  "&:hover": { transform: "translateY(-4px)" },
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                        {sport.name}
                      </Typography>
                      <Chip
                        label={sport.status}
                        size="small"
                        color={getStatusColor(sport.status) as any}
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                    <Box>
                      <IconButton size="small" color="primary" onClick={() => handleOpenDialog(sport)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteSport(sport.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      📅 Date: <strong>{new Date(sport.date).toLocaleDateString()}</strong>
                    </Typography>
                    <Typography variant="body2">
                      ⏰ Time: <strong>{sport.time}</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      🔧 Preparation: <strong>{sport.preparation || "N/A"}</strong>
                    </Typography>
                    <Typography variant="body2">
                      🏷️ Equipment: <strong>{sport.equipment || "N/A"}</strong>
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: "#1a237e", color: "white" }}>
          {editingSport ? "✏️ Edit Match" : "➕ New Match"}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Match Name"
              fullWidth
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <TextField
              label="Date"
              type="date"
              fullWidth
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Time"
              type="time"
              fullWidth
              required
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Preparation"
              fullWidth
              multiline
              rows={2}
              placeholder="e.g. Book field, arrange referees, prepare equipment"
              value={formData.preparation}
              onChange={(e) => setFormData({ ...formData, preparation: e.target.value })}
            />

            <TextField
              label="Equipment"
              fullWidth
              multiline
              rows={2}
              placeholder="e.g. Balls, nets, whistles, bibs"
              value={formData.equipment}
              onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
            />

            <TextField
              select
              label="Status"
              fullWidth
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Sport["status"] })}
            >
              {statuses.map((status) => (
                <MenuItem key={status} value={status}>{status}</MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={handleCloseDialog} variant="outlined" color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveSport}
            sx={{ bgcolor: "#1a237e" }}
          >
            {editingSport ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
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

export default Sports;