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
import ComputerIcon from "@mui/icons-material/Computer";
import { assetService } from "../../services/assetService";
import type { Asset } from "../../services/assetService";

function Assets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // ✅ FIXED: Asset Types as requested
  const assetTypes = [
    "Desk",
    "Chair",
    "Locker",
    "Table",
    "Shelf",
    "Meeting Table",
    "Coffee Machine",
    "Water Filter",
    "Other Furniture"
  ];

  // ✅ FIXED: Floors as dropdown list
  const floors = ["7th", "15th", "17th", "18th", "19th"];

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    model: "",
    serialNumber: "",
    status: "Available",
    assignedTo: "",
    location: "",
  });

  const statuses = ["Available", "In Use", "Maintenance", "Retired", "Broken"];

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await assetService.getAll();
      setAssets(data);
    } catch (error) {
      console.error("Error loading assets:", error);
      showSnackbar("Failed to load assets", "error");
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

  const handleOpenDialog = (asset?: Asset) => {
    if (asset) {
      setEditingAsset(asset);
      setFormData({
        name: asset.name || "",
        type: asset.type || "",
        model: asset.model || "",
        serialNumber: asset.serialNumber || "",
        status: asset.status || "Available",
        assignedTo: asset.assignedTo || "",
        location: asset.location || "",
      });
    } else {
      setEditingAsset(null);
      setFormData({
        name: "",
        type: "",
        model: "",
        serialNumber: "",
        status: "Available",
        assignedTo: "",
        location: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAsset(null);
  };

  const handleSaveAsset = async () => {
    if (!formData.name.trim()) {
      showSnackbar("Name is required", "error");
      return;
    }
    if (!formData.type) {
      showSnackbar("Type is required", "error");
      return;
    }
    if (!formData.location) {
      showSnackbar("Location is required", "error");
      return;
    }

    try {
      const dataToSend = {
        name: formData.name,
        type: formData.type,
        model: formData.model || "",
        serialNumber: formData.serialNumber || "",
        status: formData.status,
        assignedTo: formData.assignedTo || "",
        location: formData.location,
      };

      if (editingAsset) {
        await assetService.update(editingAsset.id, dataToSend);
        showSnackbar("Asset updated successfully!", "success");
      } else {
        await assetService.create(dataToSend);
        showSnackbar("Asset created successfully!", "success");
      }
      handleCloseDialog();
      loadData();
    } catch (error: any) {
      console.error("Error saving asset:", error);
      console.error("Response:", error?.response?.data);
      const errorMessage = error?.response?.data?.message || "Failed to save asset";
      showSnackbar(errorMessage, "error");
    }
  };

  const handleDeleteAsset = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this asset?")) {
      try {
        await assetService.delete(id);
        showSnackbar("Asset deleted successfully!", "success");
        loadData();
      } catch (error) {
        console.error("Error deleting asset:", error);
        showSnackbar("Failed to delete asset", "error");
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available": return "success";
      case "In Use": return "primary";
      case "Maintenance": return "warning";
      case "Retired": return "default";
      case "Broken": return "error";
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
            💻 Assets
          </Typography>
          <Typography sx={{ color: "text.secondary" }}>
            {assets.length} assets
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadData}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            New Asset
          </Button>
        </Box>
      </Box>

      {/* Assets Grid */}
      <Grid container spacing={2}>
        {assets.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <Typography sx={{ color: "text.secondary" }}>No assets found</Typography>
            </Paper>
          </Grid>
        ) : (
          assets.map((asset) => (
            <Grid item xs={12} sm={6} md={4} key={asset.id}>
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
                        {asset.name}
                      </Typography>
                      <Chip
                        label={asset.type}
                        size="small"
                        variant="outlined"
                        sx={{ mt: 0.5 }}
                      />
                      <Chip
                        label={asset.status}
                        size="small"
                        color={getStatusColor(asset.status) as any}
                        sx={{ mt: 0.5, ml: 0.5 }}
                      />
                    </Box>
                    <Box>
                      <IconButton size="small" color="primary" onClick={() => handleOpenDialog(asset)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteAsset(asset.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    {asset.model && (
                      <Typography variant="body2">
                        📟 Model: <strong>{asset.model}</strong>
                      </Typography>
                    )}
                    {asset.serialNumber && (
                      <Typography variant="body2">
                        🔢 Serial: <strong>{asset.serialNumber}</strong>
                      </Typography>
                    )}
                    <Typography variant="body2">
                      📍 Location: <strong>{asset.location}</strong>
                    </Typography>
                    {asset.assignedTo && (
                      <Typography variant="body2">
                        👤 Assigned To: <strong>{asset.assignedTo}</strong>
                      </Typography>
                    )}
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
          {editingAsset ? "✏️ Edit Asset" : "➕ New Asset"}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Name"
              fullWidth
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <TextField
              select
              label="Type"
              fullWidth
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              {assetTypes.map((type) => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </TextField>

            <TextField
              label="Model"
              fullWidth
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            />

            <TextField
              label="Serial Number (Optional)"
              fullWidth
              placeholder="Leave empty if not applicable"
              value={formData.serialNumber}
              onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
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

            <TextField
              select
              label="Location (Floor)"
              fullWidth
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            >
              {floors.map((floor) => (
                <MenuItem key={floor} value={floor}>{floor}</MenuItem>
              ))}
            </TextField>

            <TextField
              label="Assigned To"
              fullWidth
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={handleCloseDialog} variant="outlined" color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveAsset}
            sx={{ bgcolor: "#1a237e" }}
          >
            {editingAsset ? "Update" : "Create"}
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

export default Assets;