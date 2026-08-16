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
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import {
  getAllProcurementRequests,
  createProcurementRequest,
  updateProcurementRequest,
  deleteProcurementRequest,
  approveProcurementRequest,
  getProcurementStats,
  type ProcurementRequest,
} from "../../services/procurementService";

function Procurement() {
  // State management
  const [requests, setRequests] = useState<ProcurementRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<ProcurementRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRequest, setEditingRequest] = useState<ProcurementRequest | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalAmount: 0,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // Form state
  const [formData, setFormData] = useState({
    department: "",
    requester: "",
    vendor: "",
    items: "",
    totalAmount: 0,
    priority: "Medium" as ProcurementRequest["priority"],
    status: "Pending" as ProcurementRequest["status"],
  });

  // Options
  const departments = ["IT", "HR", "Finance", "Marketing", "Operations", "Sales", "Maintenance", "Office"];
  const priorities = [
    { value: "Low", label: "🟢 Low" },
    { value: "Medium", label: "🟡 Medium" },
    { value: "High", label: "🔴 High" },
  ];
  const statuses = [
    { value: "Pending", label: "Pending" },
    { value: "Approved", label: "Approved" },
    { value: "Rejected", label: "Rejected" },
    { value: "In Progress", label: "In Progress" },
  ];

  // Load data
  const loadData = async () => {
    try {
      setLoading(true);
      const [requestsData, statsData] = await Promise.all([
        getAllProcurementRequests(),
        getProcurementStats(),
      ]);
      setRequests(requestsData);
      setFilteredRequests(requestsData);
      setStats(statsData);
    } catch (error) {
      console.error("Error loading procurement:", error);
      showSnackbar("Failed to load procurement requests", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter requests
  useEffect(() => {
    const filtered = requests.filter(
      (req) =>
        req.requestNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.requester.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.vendor.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredRequests(filtered);
  }, [searchQuery, requests]);

  // Show snackbar
  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  // Open dialog for create/edit
  const handleOpenDialog = (request?: ProcurementRequest) => {
    if (request) {
      setEditingRequest(request);
      setFormData({
        department: request.department,
        requester: request.requester,
        vendor: request.vendor,
        items: request.items,
        totalAmount: request.totalAmount,
        priority: request.priority,
        status: request.status,
      });
    } else {
      setEditingRequest(null);
      setFormData({
        department: "",
        requester: "",
        vendor: "",
        items: "",
        totalAmount: 0,
        priority: "Medium",
        status: "Pending",
      });
    }
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingRequest(null);
  };

  // Save request (create or update)
  const handleSaveRequest = async () => {
    // Validate fields
    if (!formData.department) {
      showSnackbar("Please select a department", "error");
      return;
    }
    if (!formData.requester.trim()) {
      showSnackbar("Please enter requester name", "error");
      return;
    }
    if (!formData.vendor.trim()) {
      showSnackbar("Please enter vendor name", "error");
      return;
    }
    if (!formData.items.trim()) {
      showSnackbar("Please enter items", "error");
      return;
    }
    if (formData.totalAmount <= 0) {
      showSnackbar("Total amount must be greater than 0", "error");
      return;
    }

    setSubmitting(true);
    try {
      if (editingRequest) {
        // ✅ For update, send only the data without id in body
        const { id, ...updateData } = {
          ...formData,
          id: editingRequest.id
        };
        await updateProcurementRequest(editingRequest.id, updateData);
        showSnackbar("Request updated successfully!", "success");
      } else {
        // ✅ For create, send the form data
        await createProcurementRequest(formData);
        showSnackbar("Request created successfully!", "success");
      }
      handleCloseDialog();
      loadData();
    } catch (error: any) {
      console.error("Error saving request:", error);
      const errorMessage = error.response?.data?.message ||
        error.response?.data?.title ||
        "Failed to save request";
      showSnackbar(errorMessage, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete request
  const handleDeleteRequest = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this request?")) {
      try {
        await deleteProcurementRequest(id);
        showSnackbar("Request deleted successfully!", "success");
        loadData();
      } catch (error) {
        console.error("Error deleting request:", error);
        showSnackbar("Failed to delete request", "error");
      }
    }
  };

  // Approve request
  const handleApprove = async (id: number) => {
    try {
      await approveProcurementRequest(id, "Admin");
      showSnackbar("Request approved successfully!", "success");
      loadData();
    } catch (error) {
      console.error("Error approving request:", error);
      showSnackbar("Failed to approve request", "error");
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved": return "success";
      case "Pending": return "warning";
      case "Rejected": return "error";
      case "In Progress": return "info";
      default: return "default";
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "error";
      case "Medium": return "warning";
      case "Low": return "info";
      default: return "default";
    }
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
            🛒 Procurement
          </Typography>
          <Typography sx={{ color: "text.secondary" }}>
            {stats.total} purchase requests
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadData}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            New Request
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: "#f5f5f5", borderRadius: 2 }}>
            <CardContent>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>Total Requests</Typography>
              <Typography variant="h4" sx={{ fontWeight: "bold" }}>{stats.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: 4, borderColor: "warning.main", borderRadius: 2 }}>
            <CardContent>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>Pending</Typography>
              <Typography variant="h4" sx={{ fontWeight: "bold", color: "warning.main" }}>
                {stats.pending}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: 4, borderColor: "success.main", borderRadius: 2 }}>
            <CardContent>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>Approved</Typography>
              <Typography variant="h4" sx={{ fontWeight: "bold", color: "success.main" }}>
                {stats.approved}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: 4, borderColor: "error.main", borderRadius: 2 }}>
            <CardContent>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>Rejected</Typography>
              <Typography variant="h4" sx={{ fontWeight: "bold", color: "error.main" }}>
                {stats.rejected}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search & Table */}
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        {/* Search */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <TextField
            placeholder="Search requests..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ width: 300 }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
            }}
          />
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {filteredRequests.length} requests
          </Typography>
        </Box>

        {/* Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                <TableCell>Request #</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Requester</TableCell>
                <TableCell>Vendor</TableCell>
                <TableCell>Items</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No procurement requests found
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map((req) => (
                  <TableRow key={req.id} sx={{ "&:hover": { bgcolor: "#fafafa" } }}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                        {req.requestNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>{req.department}</TableCell>
                    <TableCell>{req.requester}</TableCell>
                    <TableCell>{req.vendor}</TableCell>
                    <TableCell>
                      <Chip
                        label={req.items}
                        size="small"
                        variant="outlined"
                        sx={{ maxWidth: 120 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: "bold", color: "#1976d2" }}>
                        R$ {req.totalAmount.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={req.priority}
                        size="small"
                        color={getPriorityColor(req.priority) as any}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={req.status}
                        size="small"
                        color={getStatusColor(req.status) as any}
                      />
                    </TableCell>
                    <TableCell align="center">
                      {req.status === "Pending" && (
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleApprove(req.id)}
                          title="Approve"
                        >
                          <CheckCircleIcon />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenDialog(req)}
                        title="Edit"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteRequest(req.id)}
                        title="Delete"
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

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: "#1a237e", color: "white" }}>
          {editingRequest ? "✏️ Edit Purchase Request" : "➕ New Purchase Request"}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                select
                label="Department *"
                fullWidth
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              >
                {departments.map((dept) => (
                  <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Requester Name *"
                fullWidth
                required
                placeholder="e.g. Mohammad Alshaar"
                value={formData.requester}
                onChange={(e) => setFormData({ ...formData, requester: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Vendor *"
                fullWidth
                required
                placeholder="e.g. ABC Company"
                value={formData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Items (comma separated) *"
                fullWidth
                required
                placeholder="e.g. Coffee, Paper, Soap"
                value={formData.items}
                onChange={(e) => setFormData({ ...formData, items: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Total Amount (R$) *"
                type="number"
                fullWidth
                required
                placeholder="0.00"
                value={formData.totalAmount}
                onChange={(e) => setFormData({ ...formData, totalAmount: Number(e.target.value) })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Priority *"
                fullWidth
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as ProcurementRequest["priority"] })}
              >
                {priorities.map((p) => (
                  <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            {/* Only show status field when editing */}
            {editingRequest && (
              <Grid item xs={12}>
                <TextField
                  select
                  label="Status"
                  fullWidth
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ProcurementRequest["status"] })}
                >
                  {statuses.map((s) => (
                    <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={handleCloseDialog} variant="outlined" color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveRequest}
            disabled={submitting}
            sx={{ bgcolor: "#1a237e" }}
          >
            {submitting ? <CircularProgress size={24} /> : editingRequest ? "Update" : "Create"}
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

export default Procurement;