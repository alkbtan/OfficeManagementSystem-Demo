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
import SportsIcon from "@mui/icons-material/Sports";
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
    type: "",
    teams: "",
    status: "Active" as Sport["status"],
  });

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
        name: sport.name,
        type: sport.type,
        teams: sport.teams,
        status: sport.status,
      });
    } else {
      setEditingSport(null);
      setFormData({
        name: "",
        type: "",
        teams: "",
        status: "Active",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingSport(null);
  };

  const handleSaveSport = async () => {
    try {
      if (editingSport) {
        await sportService.update(editingSport.id, formData);
        showSnackbar("Sport updated successfully!", "success");
      } else {
        await sportService.create(formData);
        showSnackbar("Sport created successfully!", "success");
      }
      handleCloseDialog();
      loadData();
    } catch (error) {
      console.error("Error saving sport:", error);
      showSnackbar("Failed to save sport", "error");
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
      case "Active": return "success";
      case "Completed": return "info";
      case "Upcoming": return "warning";
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
            ⚽ Sports
          </Typography>
          <Typography sx={{ color: "text.secondary" }}>
            Internal tournaments
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadData}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            New Sport
          </Button>
        </Box>
      </Box>

      <Grid container spacing={2}>
        {sports.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <Typography sx={{ color: "text.secondary" }}>No sports found</Typography>
            </Paper>
          </Grid>
        ) : (
          sports.map((sport) => (
            <Grid item xs={12} md={6} lg={4} key={sport.id}>
              <Card sx={{
                borderRadius: 2,
                transition: "transform 0.2s",
                "&:hover": { transform: "translateY(-4px)" }
              }}>
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                        {sport.name}
                      </Typography>
                      <Chip
                        label={sport.type}
                        size="small"
                        variant="outlined"
                        sx={{ mt: 0.5 }}
                      />
                      <Chip
                        label={sport.status}
                        size="small"
                        color={getStatusColor(sport.status) as any}
                        sx={{ mt: 0.5, ml: 0.5 }}
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
                      Teams: <strong>{sport.teams}</strong>
                    </Typography>
                    <Typography variant="body2">
                      Next Match: <strong>{sport.nextMatch ? new Date(sport.nextMatch).toLocaleDateString() : "—"}</strong>
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingSport ? "Edit Sport" : "New Sport"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Sport Name"
              fullWidth
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              label="Type"
              fullWidth
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              placeholder="Futsal, Table Tennis, Chess, Basketball"
            />
            <TextField
              label="Teams"
              fullWidth
              required
              value={formData.teams}
              onChange={(e) => setFormData({ ...formData, teams: e.target.value })}
              placeholder="8 teams"
            />
            <TextField
              select
              label="Status"
              fullWidth
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Sport["status"] })}
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Upcoming">Upcoming</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveSport}>
            {editingSport ? "Update" : "Create"}
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

export default Sports;