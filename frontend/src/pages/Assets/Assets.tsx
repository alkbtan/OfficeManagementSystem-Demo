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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import ComputerIcon from "@mui/icons-material/Computer";
import PrintIcon from "@mui/icons-material/Print";
import MonitorIcon from "@mui/icons-material/Monitor";
import StorageIcon from "@mui/icons-material/Storage";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import { assetService } from "../../services/assetService";
import type { Asset } from "../../services/assetService";

function Assets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [stats, setStats] = useState({ total: 0, available: 0, inUse: 0, maintenance: 0 });
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: "", 
    severity: "success" as "success" | "error" 
  });
  
  const [formData, setFormData] = useState({
    name: "",
    type: "Computer" as Asset["type"],
    model: "",
    serialNumber: "",
    status: "Available" as Asset["status"],
    assignedTo: "",
    purchaseDate: "",
    warrantyExpiry: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [assetsData, statsData] = await Promise.all([
        assetService.getAll(),
        assetService.getStats(),
      ]);
      setAssets(assetsData);
      setFilteredAssets(assetsData);
      setStats(statsData);
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

  useEffect(() => {
    const filtered = assets.filter(asset =>
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.assignedTo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredAssets(filtered);
  }, [searchQuery, assets]);

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenDialog = (asset?: Asset) => {
    if (asset) {
      setEditingAsset(asset);
      setFormData({
        name: asset.name,
        type: asset.type,
        model: asset.model,
        serialNumber: asset.serialNumber,
        status: asset.status,
        assignedTo: asset.assignedTo || "",
        purchaseDate: asset.purchaseDate.split("T")[0],
        warrantyExpiry: asset.warrantyExpiry ? asset.warrantyExpiry.split("T")[0] : "",
      });
    } else {
      setEditingAsset(null);
      setFormData({
        name: "",
        type: "Computer",
        model: "",
        serialNumber: "",
        status: "Available",
        assignedTo: "",
        purchaseDate: "",
        warrantyExpiry: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAsset(null);
  };

  const handleSaveAsset = async () => {
    try {
      const dataToSend = {
        ...formData,
        purchaseDate: formData.purchaseDate ? new Date(formData.purchaseDate).toISOString() : new Date().toISOString(),
        warrantyExpiry: formData.warrantyExpiry ? new Date(formData.warrantyExpiry).toISOString() : null,
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
      const errorMessage = error.response?.data?.message || error.response?.data?.title || "Failed to save asset";
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

  const handleRefresh = () => {
    loadData();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available": return "success";
      case "In Use": return "primary";
      case "Maintenance": return "warning";
      case "Retired": return "error";
      default: return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Available": return <CheckCircleIcon fontSize="small" />;
      case "In Use": return <ComputerIcon fontSize="small" />;
      case "Maintenance": return <HourglassEmptyIcon fontSize="small" />;
      case "Retired": return <ErrorIcon fontSize="small" />;
      default: return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Computer": return <ComputerIcon />;
      case "Printer": return <PrintIcon />;
      case "Monitor": return <MonitorIcon />;
      case "Server": return <StorageIcon />;
      default: return <StorageIcon />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Assets
          </Typography>
          <Typography color="text.secondary">
            Manage all company assets
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            New Asset
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            bgcolor: "#f5f5f5",
            transition: "0.3s",
            "&:hover": { transform: "scale(1.02)" }
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Assets
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.total}
                  </Typography>
                </Box>
                <StorageIcon sx={{ fontSize: 40, color: "#1976d2", opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            borderLeft: 4, 
            borderColor: "success.main",
            transition: "0.3s",
            "&:hover": { transform: "scale(1.02)" }
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Available
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {stats.available}
                  </Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 40, color: "#2e7d32", opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            borderLeft: 4, 
            borderColor: "primary.main",
            transition: "0.3s",
            "&:hover": { transform: "scale(1.02)" }
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    In Use
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="primary.main">
                    {stats.inUse}
                  </Typography>
                </Box>
                <ComputerIcon sx={{ fontSize: 40, color: "#1976d2", opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            borderLeft: 4, 
            borderColor: "warning.main",
            transition: "0.3s",
            "&:hover": { transform: "scale(1.02)" }
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Maintenance
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {stats.maintenance}
                  </Typography>
                </Box>
                <HourglassEmptyIcon sx={{ fontSize: 40, color: "#ed6c02", opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <TextField
            placeholder="Search assets..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ width: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Typography variant="body2" color="text.secondary">
            {filteredAssets.length} assets found
          </Typography>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                <TableCell>ID</TableCell>
                <TableCell>Asset Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Model</TableCell>
                <TableCell>Serial #</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Purchase Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAssets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No assets found
                  </TableCell>
                </TableRow>
              ) : (
                filteredAssets.map((asset) => (
                  <TableRow 
                    key={asset.id}
                    sx={{ "&:hover": { bgcolor: "#fafafa" } }}
                  >
                    <TableCell>#{asset.id}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {asset.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getTypeIcon(asset.type)}
                        label={asset.type}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{asset.model}</TableCell>
                    <TableCell>
                      <Typography variant="caption" fontFamily="monospace">
                        {asset.serialNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(asset.status)}
                        label={asset.status}
                        color={getStatusColor(asset.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{asset.assignedTo || "Unassigned"}</TableCell>
                    <TableCell>
                      {new Date(asset.purchaseDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenDialog(asset)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteAsset(asset.id)}
                      >
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

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingAsset ? "Edit Asset" : "Create New Asset"}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Asset Name"
              fullWidth
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              select
              label="Type"
              fullWidth
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as Asset["type"] })}
            >
              <MenuItem value="Computer">Computer</MenuItem>
              <MenuItem value="Printer">Printer</MenuItem>
              <MenuItem value="Monitor">Monitor</MenuItem>
              <MenuItem value="Server">Server</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </TextField>
            <TextField
              label="Model"
              fullWidth
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            />
            <TextField
              label="Serial Number"
              fullWidth
              value={formData.serialNumber}
              onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
            />
            <TextField
              select
              label="Status"
              fullWidth
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Asset["status"] })}
            >
              <MenuItem value="Available">Available</MenuItem>
              <MenuItem value="In Use">In Use</MenuItem>
              <MenuItem value="Maintenance">Maintenance</MenuItem>
              <MenuItem value="Retired">Retired</MenuItem>
            </TextField>
            <TextField
              label="Assigned To"
              fullWidth
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
            />
            <TextField
              label="Purchase Date"
              type="date"
              fullWidth
              required
              value={formData.purchaseDate}
              onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Warranty Expiry"
              type="date"
              fullWidth
              value={formData.warrantyExpiry}
              onChange={(e) => setFormData({ ...formData, warrantyExpiry: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveAsset}>
            {editingAsset ? "Update" : "Create"}
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
    </Box>
  );
}

export default Assets;