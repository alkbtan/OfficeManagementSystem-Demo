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
  Avatar,
  Divider,
  LinearProgress,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import CancelIcon from "@mui/icons-material/Cancel";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import BusinessIcon from "@mui/icons-material/Business";
import PersonIcon from "@mui/icons-material/Person";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { procurementService } from "../../services/procurementService";
import type { ProcurementRequest } from "../../services/procurementService";

function Procurement() {
  const [requests, setRequests] = useState<ProcurementRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRequest, setEditingRequest] = useState<ProcurementRequest | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // ✅ Department names as requested
  const departments = [
    "QA",
    "Office",
    "HR",
    "IT",
    "Diretoria",
    "Secretary",
    "Other"
  ];

  const [formData, setFormData] = useState({
    requestNumber: "",
    department: "",
    requester: "",
    vendor: "",
    items: "",
    totalAmount: 0,
    status: "Pending",
    priority: "Medium",
    requestDate: "",
    approvedBy: "",
  });

  const statuses = ["Pending", "Approved", "Rejected", "Completed"];
  const priorities = ["Low", "Medium", "High", "Critical"];

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await procurementService.getAll();
      setRequests(data);
    } catch (error) {
      console.error("Error loading procurement requests:", error);
      showSnackbar("Failed to load procurement requests", "error");
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

  const handleOpenDialog = (request?: ProcurementRequest) => {
    if (request) {
      setEditingRequest(request);
      setFormData({
        requestNumber: request.requestNumber || "",
        department: request.department || "",
        requester: request.requester || "",
        vendor: request.vendor || "",
        items: request.items || "",
        totalAmount: request.totalAmount || 0,
        status: request.status || "Pending",
        priority: request.priority || "Medium",
        requestDate: request.requestDate ? request.requestDate.split("T")[0] : "",
        approvedBy: request.approvedBy || "",
      });
    } else {
      setEditingRequest(null);
      setFormData({
        requestNumber: `PR-${String(new Date().getFullYear()).slice(-2)}-${String(requests.length + 1).padStart(3, '0')}`,
        department: "",
        requester: "",
        vendor: "",
        items: "",
        totalAmount: 0,
        status: "Pending",
        priority: "Medium",
        requestDate: new Date().toISOString().split("T")[0],
        approvedBy: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingRequest(null);
  };

  const handleSaveRequest = async () => {
    if (!formData.requestNumber.trim()) {
      showSnackbar("Request Number is required", "error");
      return;
    }
    if (!formData.department) {
      showSnackbar("Department is required", "error");
      return;
    }
    if (!formData.requester.trim()) {
      showSnackbar("Requester is required", "error");
      return;
    }
    if (!formData.vendor.trim()) {
      showSnackbar("Vendor is required", "error");
      return;
    }

    try {
      const dataToSend = {
        requestNumber: formData.requestNumber,
        department: formData.department,
        requester: formData.requester,
        vendor: formData.vendor,
        items: formData.items || "",
        totalAmount: Number(formData.totalAmount) || 0,
        status: formData.status,
        priority: formData.priority,
        requestDate: formData.requestDate ? new Date(formData.requestDate).toISOString() : null,
        approvedBy: formData.approvedBy || "",
      };

      if (editingRequest) {
        await procurementService.update(editingRequest.id, dataToSend);
        showSnackbar("Procurement request updated successfully!", "success");
      } else {
        await procurementService.create(dataToSend);
        showSnackbar("Procurement request created successfully!", "success");
      }
      handleCloseDialog();
      loadData();
    } catch (error: any) {
      console.error("Error saving procurement request:", error);
      console.error("Response:", error?.response?.data);
      const errorMessage = error?.response?.data?.message || "Failed to save procurement request";
      showSnackbar(errorMessage, "error");
    }
  };

  const handleDeleteRequest = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this procurement request?")) {
      try {
        await procurementService.delete(id);
        showSnackbar("Procurement request deleted successfully!", "success");
        loadData();
      } catch (error) {
        console.error("Error deleting procurement request:", error);
        showSnackbar("Failed to delete procurement request", "error");
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved": return <CheckCircleIcon sx={{ fontSize: 20 }} />;
      case "Completed": return <CheckCircleIcon sx={{ fontSize: 20 }} />;
      case "Rejected": return <CancelIcon sx={{ fontSize: 20 }} />;
      default: return <PendingIcon sx={{ fontSize: 20 }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved": return "#4caf50";
      case "Completed": return "#2196f3";
      case "Rejected": return "#f44336";
      default: return "#ff9800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical": return "#d32f2f";
      case "High": return "#f44336";
      case "Medium": return "#ff9800";
      default: return "#9e9e9e";
    }
  };

  const getTotalAmount = () => {
    return requests.reduce((sum, req) => sum + req.totalAmount, 0);
  };

  const getStatusCount = (status: string) => {
    return requests.filter(req => req.status === status).length;
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: "#f5f7fa", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#1a237e" }}>
            🛒 Procurement Management
          </Typography>
          <Typography sx={{ color: "#666", mt: 0.5 }}>
            Manage purchase requests and procurement activities
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadData}
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              bgcolor: "#1a237e",
              "&:hover": { bgcolor: "#0d1445" },
            }}
          >
            New Request
          </Button>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="body2" sx={{ color: "#666", fontWeight: 500 }}>
                    Total Requests
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: "#1a237e", mt: 0.5 }}>
                    {requests.length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "#e8eaf6", width: 48, height: 48 }}>
                  <ShoppingCartIcon sx={{ color: "#1a237e" }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="body2" sx={{ color: "#666", fontWeight: 500 }}>
                    Pending
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: "#ff9800", mt: 0.5 }}>
                    {getStatusCount("Pending")}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "#fff3e0", width: 48, height: 48 }}>
                  <PendingIcon sx={{ color: "#ff9800" }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="body2" sx={{ color: "#666", fontWeight: 500 }}>
                    Approved
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: "#4caf50", mt: 0.5 }}>
                    {getStatusCount("Approved")}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "#e8f5e9", width: 48, height: 48 }}>
                  <CheckCircleIcon sx={{ color: "#4caf50" }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="body2" sx={{ color: "#666", fontWeight: 500 }}>
                    Total Amount
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: "#1a237e", mt: 0.5 }}>
                    R$ {getTotalAmount().toFixed(2)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "#e8eaf6", width: 48, height: 48 }}>
                  <AttachMoneyIcon sx={{ color: "#1a237e" }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Table View */}
      <Paper sx={{ borderRadius: 3, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        {requests.length === 0 ? (
          <Box sx={{ p: 6, textAlign: "center" }}>
            <ShoppingCartIcon sx={{ fontSize: 64, color: "#ccc", mb: 2 }} />
            <Typography variant="h6" sx={{ color: "#666" }}>
              No procurement requests found
            </Typography>
            <Typography variant="body2" sx={{ color: "#999", mt: 1 }}>
              Click the "New Request" button to create your first procurement request.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: "#f5f7fa" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: "#1a237e" }}>Request #</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#1a237e" }}>Department</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#1a237e" }}>Requester</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#1a237e" }}>Vendor</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#1a237e" }}>Items</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#1a237e" }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#1a237e" }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#1a237e" }}>Priority</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#1a237e" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.map((req) => (
                  <TableRow key={req.id} sx={{ "&:hover": { bgcolor: "#f8f9ff" } }}>
                    <TableCell>
                      <Typography sx={{ fontWeight: 600, color: "#1a237e" }}>
                        {req.requestNumber}
                      </Typography>
                      {req.requestDate && (
                        <Typography variant="caption" sx={{ color: "#999", display: "block" }}>
                          {new Date(req.requestDate).toLocaleDateString()}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={req.department}
                        size="small"
                        sx={{
                          bgcolor: "#e8eaf6",
                          color: "#1a237e",
                          fontWeight: 500,
                          borderRadius: 2,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <PersonIcon sx={{ fontSize: 16, color: "#999" }} />
                        <Typography variant="body2">{req.requester}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <BusinessIcon sx={{ fontSize: 16, color: "#999" }} />
                        <Typography variant="body2">{req.vendor}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={req.items}>
                        <Typography
                          variant="body2"
                          sx={{
                            maxWidth: 120,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {req.items}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 600, color: "#1a237e" }}>
                        R$ {req.totalAmount.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(req.status)}
                        label={req.status}
                        size="small"
                        sx={{
                          bgcolor: `${getStatusColor(req.status)}15`,
                          color: getStatusColor(req.status),
                          fontWeight: 500,
                          borderRadius: 2,
                          "& .MuiChip-icon": { color: getStatusColor(req.status) },
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={req.priority}
                        size="small"
                        sx={{
                          bgcolor: `${getPriorityColor(req.priority)}15`,
                          color: getPriorityColor(req.priority),
                          fontWeight: 500,
                          borderRadius: 2,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(req)}
                          sx={{
                            color: "#1a237e",
                            bgcolor: "#e8eaf6",
                            "&:hover": { bgcolor: "#c5cae9" },
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteRequest(req.id)}
                          sx={{
                            color: "#f44336",
                            bgcolor: "#ffebee",
                            "&:hover": { bgcolor: "#ffcdd2" },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: "#1a237e", color: "white" }}>
          {editingRequest ? "✏️ Edit Procurement Request" : "➕ New Procurement Request"}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Request Number"
                  fullWidth
                  required
                  placeholder="e.g. PR-2026-001"
                  value={formData.requestNumber}
                  onChange={(e) => setFormData({ ...formData, requestNumber: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
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
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Requester"
                  fullWidth
                  required
                  value={formData.requester}
                  onChange={(e) => setFormData({ ...formData, requester: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Vendor"
                  fullWidth
                  required
                  value={formData.vendor}
                  onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                />
              </Grid>
            </Grid>

            <TextField
              label="Items Description"
              fullWidth
              multiline
              rows={2}
              placeholder="Describe the items to be procured..."
              value={formData.items}
              onChange={(e) => setFormData({ ...formData, items: e.target.value })}
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Total Amount (R$)"
                  type="number"
                  fullWidth
                  value={formData.totalAmount}
                  onChange={(e) => setFormData({ ...formData, totalAmount: Number(e.target.value) })}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1, color: "#999" }}>R$</Typography>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Request Date"
                  type="date"
                  fullWidth
                  value={formData.requestDate}
                  onChange={(e) => setFormData({ ...formData, requestDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
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
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Priority"
                  fullWidth
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  {priorities.map((priority) => (
                    <MenuItem key={priority} value={priority}>{priority}</MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            <TextField
              label="Approved By"
              fullWidth
              placeholder="Name of the approver"
              value={formData.approvedBy}
              onChange={(e) => setFormData({ ...formData, approvedBy: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={handleCloseDialog} variant="outlined" color="inherit" sx={{ borderRadius: 2, textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveRequest}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              bgcolor: "#1a237e",
              "&:hover": { bgcolor: "#0d1445" },
            }}
          >
            {editingRequest ? "Update Request" : "Create Request"}
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
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Procurement;