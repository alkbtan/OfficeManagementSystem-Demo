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
  LinearProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import WarningIcon from "@mui/icons-material/Warning";
import { acService } from "../../services/acService";
import type { AirConditioner, ACIssue } from "../../services/acService";

function ACs() {
  const [acs, setAcs] = useState<AirConditioner[]>([]);
  const [filteredAcs, setFilteredAcs] = useState<AirConditioner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAC, setEditingAC] = useState<AirConditioner | null>(null);
  const [selectedAC, setSelectedAC] = useState<AirConditioner | null>(null);
  const [openIssueDialog, setOpenIssueDialog] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    operational: 0,
    underMaintenance: 0,
    faulty: 0,
    totalMaintenanceCost: 0,
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    brand: "",
    model: "",
    capacity: 0,
    installationDate: "",
    status: "Operational" as AirConditioner["status"],
  });

  const [issueData, setIssueData] = useState({
    issueType: "Cooling" as ACIssue["issueType"],
    description: "",
    cost: 0,
  });

  const loadData = async () => {
    try {
      setLoading(true);

      const [acsData, statsData] = await Promise.all([
        acService.getAll(),
        acService.getStats(),
      ]);

      setAcs(acsData);
      setFilteredAcs(acsData);
      setStats(statsData);
    } catch (error) {
      console.error("Error loading ACs:", error);
      showSnackbar("Failed to load ACs", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const filtered = acs.filter(
      (ac) =>
        ac.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ac.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ac.brand.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setFilteredAcs(filtered);
  }, [searchQuery, acs]);

  const showSnackbar = (
    message: string,
    severity: "success" | "error"
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenDialog = (ac?: AirConditioner) => {
    if (ac) {
      setEditingAC(ac);

      setFormData({
        name: ac.name,
        location: ac.location,
        brand: ac.brand,
        model: ac.model,
        capacity: ac.capacity,
        installationDate: ac.installationDate.split("T")[0],
        status: ac.status,
      });
    } else {
      setEditingAC(null);

      setFormData({
        name: "",
        location: "",
        brand: "",
        model: "",
        capacity: 0,
        installationDate: "",
        status: "Operational",
      });
    }

    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAC(null);
  };

  const handleSaveAC = async () => {
    try {
      const dataToSend = {
        ...formData,
        installationDate: formData.installationDate
          ? new Date(formData.installationDate).toISOString()
          : new Date().toISOString(),
      };

      if (editingAC) {
        await acService.update(editingAC.id, dataToSend);
        showSnackbar("AC updated successfully!", "success");
      } else {
        await acService.create(dataToSend);
        showSnackbar("AC created successfully!", "success");
      }

      handleCloseDialog();
      loadData();
    } catch (error: any) {
      console.error("Error saving AC:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.title ||
        "Failed to save AC";

      showSnackbar(errorMessage, "error");
    }
  };

  const handleDeleteAC = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this AC?")) {
      try {
        await acService.delete(id);
        showSnackbar("AC deleted successfully!", "success");
        loadData();
      } catch (error) {
        console.error("Error deleting AC:", error);
        showSnackbar("Failed to delete AC", "error");
      }
    }
  };

  const handleOpenIssueDialog = (ac: AirConditioner) => {
    setSelectedAC(ac);

    setIssueData({
      issueType: "Cooling",
      description: "",
      cost: 0,
    });

    setOpenIssueDialog(true);
  };

  const handleSaveIssue = async () => {
    if (!selectedAC) return;

    try {
      await acService.addIssue(selectedAC.id, {
        ...issueData,
        acId: selectedAC.id,
        reportedDate: new Date().toISOString(),
        status: "Open",
      });

      showSnackbar("Issue reported successfully!", "success");
      setOpenIssueDialog(false);
      loadData();
    } catch (error) {
      console.error("Error reporting issue:", error);
      showSnackbar("Failed to report issue", "error");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Operational":
        return "success";
      case "Under Maintenance":
        return "warning";
      case "Faulty":
        return "error";
      default:
        return "default";
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
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: "bold", color: "#1a237e" }}
          >
            ❄️ AC Management
          </Typography>

          <Typography sx={{ color: "text.secondary" }}>
            {stats.total} units
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadData}
          >
            Refresh
          </Button>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add AC
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: "#f5f5f5" }}>
            <CardContent>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary" }}
              >
                Total ACs
              </Typography>

              <Typography
                variant="h4"
                sx={{ fontWeight: "bold" }}
              >
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: 4, borderColor: "success.main" }}>
            <CardContent>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary" }}
              >
                Operational
              </Typography>

              <Typography
                variant="h4"
                sx={{
                  fontWeight: "bold",
                  color: "success.main",
                }}
              >
                {stats.operational}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: 4, borderColor: "warning.main" }}>
            <CardContent>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary" }}
              >
                Under Maintenance
              </Typography>

              <Typography
                variant="h4"
                sx={{
                  fontWeight: "bold",
                  color: "warning.main",
                }}
              >
                {stats.underMaintenance}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: 4, borderColor: "error.main" }}>
            <CardContent>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary" }}
              >
                Faulty
              </Typography>

              <Typography
                variant="h4"
                sx={{
                  fontWeight: "bold",
                  color: "error.main",
                }}
              >
                {stats.faulty}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <TextField
            placeholder="Search ACs..."
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

          <Typography
            variant="body2"
            sx={{ color: "text.secondary" }}
          >
            {filteredAcs.length} units
          </Typography>
        </Box>

        <Grid container spacing={2}>
          {filteredAcs.length === 0 ? (
            <Grid item xs={12}>
              <Typography
                align="center"
                sx={{ py: 4, color: "text.secondary" }}
              >
                No ACs found
              </Typography>
            </Grid>
          ) : (
            filteredAcs.map((ac) => (
              <Grid item xs={12} md={6} lg={4} key={ac.id}>
                <Card
                  sx={{
                    borderRadius: 2,
                    transition: "transform 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                    },
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: "bold" }}
                        >
                          {ac.name}
                        </Typography>

                        <Typography
                          variant="body2"
                          sx={{ color: "text.secondary" }}
                        >
                          {ac.location}
                        </Typography>
                      </Box>

                      <Chip
                        label={ac.status}
                        size="small"
                        color={getStatusColor(ac.status) as any}
                      />
                    </Box>

                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        Brand: <strong>{ac.brand}</strong>
                      </Typography>

                      <Typography variant="body2">
                        Capacity: <strong>{ac.capacity} BTU</strong>
                      </Typography>

                      <Typography variant="body2">
                        Warranty:{" "}
                        <strong>
                          {new Date(
                            ac.installationDate
                          ).toLocaleDateString()}
                        </strong>
                      </Typography>

                      <Typography variant="body2">
                        Cost:{" "}
                        <strong>
                          R$ {ac.totalMaintenanceCost.toFixed(2)}
                        </strong>
                      </Typography>

                      <Typography variant="body2">
                        Repairs: <strong>{ac.maintenanceCount}</strong>
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        mt: 2,
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 1,
                      }}
                    >
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenDialog(ac)}
                      >
                        <EditIcon />
                      </IconButton>

                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteAC(ac.id)}
                      >
                        <DeleteIcon />
                      </IconButton>

                      <IconButton
                        size="small"
                        color="warning"
                        onClick={() => handleOpenIssueDialog(ac)}
                      >
                        <WarningIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Paper>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingAC ? "Edit AC" : "Add AC Unit"}
        </DialogTitle>

        <DialogContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              mt: 1,
            }}
          >
            <TextField
              label="AC Name"
              fullWidth
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value,
                })
              }
            />

            <TextField
              label="Location"
              fullWidth
              required
              value={formData.location}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  location: e.target.value,
                })
              }
            />

            <TextField
              select
              label="Status"
              fullWidth
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as AirConditioner["status"],
                })
              }
            >
              <MenuItem value="Operational">Operational</MenuItem>
              <MenuItem value="Under Maintenance">
                Under Maintenance
              </MenuItem>
              <MenuItem value="Faulty">Faulty</MenuItem>
            </TextField>

            <TextField
              label="Brand"
              fullWidth
              required
              value={formData.brand}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  brand: e.target.value,
                })
              }
            />

            <TextField
              label="Model"
              fullWidth
              value={formData.model}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  model: e.target.value,
                })
              }
            />

            <TextField
              label="Capacity (BTU)"
              type="number"
              fullWidth
              required
              value={formData.capacity}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  capacity: Number(e.target.value),
                })
              }
            />

            <TextField
              label="Installation Date"
              type="date"
              fullWidth
              required
              value={formData.installationDate}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  installationDate: e.target.value,
                })
              }
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>

          <Button
            variant="contained"
            onClick={handleSaveAC}
          >
            {editingAC ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openIssueDialog}
        onClose={() => setOpenIssueDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Report Issue for {selectedAC?.name}
        </DialogTitle>

        <DialogContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              mt: 1,
            }}
          >
            <TextField
              select
              label="Issue Type"
              fullWidth
              value={issueData.issueType}
              onChange={(e) =>
                setIssueData({
                  ...issueData,
                  issueType:
                    e.target.value as ACIssue["issueType"],
                })
              }
            >
              <MenuItem value="Cooling">Cooling</MenuItem>
              <MenuItem value="Noise">Noise</MenuItem>
              <MenuItem value="Water Leak">
                Water Leak
              </MenuItem>
              <MenuItem value="Electrical">
                Electrical
              </MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </TextField>

            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={issueData.description}
              onChange={(e) =>
                setIssueData({
                  ...issueData,
                  description: e.target.value,
                })
              }
            />

            <TextField
              label="Estimated Cost ($)"
              type="number"
              fullWidth
              value={issueData.cost}
              onChange={(e) =>
                setIssueData({
                  ...issueData,
                  cost: Number(e.target.value),
                })
              }
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setOpenIssueDialog(false)}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSaveIssue}
          >
            Report Issue
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() =>
          setSnackbar({
            ...snackbar,
            open: false,
          })
        }
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() =>
            setSnackbar({
              ...snackbar,
              open: false,
            })
          }
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ACs;