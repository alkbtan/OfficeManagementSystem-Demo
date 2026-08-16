import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  InputAdornment,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import CancelIcon from "@mui/icons-material/Cancel";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";

interface Request {
  id: number;
  type: "Procurement" | "Maintenance" | "Furniture" | "Lockers" | "Other";
  title: string;
  description: string;
  status: "Pending" | "Approved" | "Rejected";
  requestedBy: string;
  date: string;
  priority: "Low" | "Medium" | "High";
}

// Mock data
const mockRequests: Request[] = [
  {
    id: 1,
    type: "Procurement",
    title: "New Laptops for IT Team",
    description: "Need 5 new laptops for the IT department",
    status: "Pending",
    requestedBy: "Mohammad Alshaar",
    date: "2026-07-11",
    priority: "High",
  },
  {
    id: 2,
    type: "Maintenance",
    title: "AC Repair - Meeting Room",
    description: "The AC in meeting room is not working",
    status: "Approved",
    requestedBy: "Ahmed Ali",
    date: "2026-07-10",
    priority: "Medium",
  },
  {
    id: 3,
    type: "Furniture",
    title: "New Office Chairs",
    description: "Need 10 ergonomic chairs for the office",
    status: "Pending",
    requestedBy: "Sara Hassan",
    date: "2026-07-09",
    priority: "Low",
  },
  {
    id: 4,
    type: "Lockers",
    title: "Locker Allocation",
    description: "New lockers needed for employees",
    status: "Rejected",
    requestedBy: "Khalid Omar",
    date: "2026-07-08",
    priority: "Medium",
  },
  {
    id: 5,
    type: "Other",
    title: "Office Plants",
    description: "Plants for office decoration",
    status: "Pending",
    requestedBy: "Nadia Sami",
    date: "2026-07-07",
    priority: "Low",
  },
];

function Requests() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  const [formData, setFormData] = useState({
    type: "Procurement" as Request["type"],
    title: "",
    description: "",
    priority: "Medium" as Request["priority"],
  });

  // Load data
  useEffect(() => {
    setTimeout(() => {
      setRequests(mockRequests);
      setFilteredRequests(mockRequests);
      setLoading(false);
    }, 500);
  }, []);

  // Filter requests based on search
  useEffect(() => {
    const filtered = requests.filter(
      (req) =>
        req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.requestedBy.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredRequests(filtered);
  }, [searchQuery, requests]);

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "Pending").length,
    approved: requests.filter((r) => r.status === "Approved").length,
    rejected: requests.filter((r) => r.status === "Rejected").length,
  };

  const handleAddRequest = () => {
    setLoading(true);
    setTimeout(() => {
      const newRequest: Request = {
        id: requests.length + 1,
        ...formData,
        status: "Pending",
        requestedBy: "Current User",
        date: new Date().toISOString().split("T")[0],
      };
      setRequests([newRequest, ...requests]);
      setFilteredRequests([newRequest, ...requests]);
      setOpenDialog(false);
      setLoading(false);
      setFormData({ type: "Procurement", title: "", description: "", priority: "Medium" });
      setSnackbar({
        open: true,
        message: "Request submitted successfully!",
        severity: "success",
      });
    }, 500);
  };

  const handleUpdateStatus = (id: number, status: Request["status"]) => {
    const updatedRequests = requests.map((req) =>
      req.id === id ? { ...req, status } : req
    );
    setRequests(updatedRequests);
    setFilteredRequests(updatedRequests);
    setSnackbar({
      open: true,
      message: `Request ${status} successfully!`,
      severity: "success",
    });
  };

  const handleDeleteRequest = (id: number) => {
    if (window.confirm("Are you sure you want to delete this request?")) {
      const updatedRequests = requests.filter((req) => req.id !== id);
      setRequests(updatedRequests);
      setFilteredRequests(updatedRequests);
      setSnackbar({
        open: true,
        message: "Request deleted successfully!",
        severity: "success",
      });
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setRequests(mockRequests);
      setFilteredRequests(mockRequests);
      setLoading(false);
      setSnackbar({
        open: true,
        message: "Requests refreshed!",
        severity: "info",
      });
    }, 500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "success";
      case "Pending":
        return "warning";
      case "Rejected":
        return "error";
      default:
        return "default";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "error";
      case "Medium":
        return "warning";
      case "Low":
        return "info";
      default:
        return "default";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Procurement":
        return "🛒";
      case "Maintenance":
        return "🔧";
      case "Furniture":
        return "🪑";
      case "Lockers":
        return "🔒";
      default:
        return "📋";
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
            Office Requests
          </Typography>
          <Typography color="text.secondary">Manage all office requests</Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleRefresh}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
            New Request
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Total Requests
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: 4, borderColor: "warning.main" }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Pending
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="warning.main">
                {stats.pending}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: 4, borderColor: "success.main" }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Approved
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {stats.approved}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: 4, borderColor: "error.main" }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Rejected
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="error.main">
                {stats.rejected}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Requests Table */}
      <Paper sx={{ p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <TextField
            placeholder="Search requests..."
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
            {filteredRequests.length} requests found
          </Typography>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                <TableCell>ID</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Requested By</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No requests found
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map((req) => (
                  <TableRow key={req.id} sx={{ "&:hover": { bgcolor: "#fafafa" } }}>
                    <TableCell>#{req.id}</TableCell>
                    <TableCell>
                      <Chip
                        label={`${getTypeIcon(req.type)} ${req.type}`}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {req.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {req.description}
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
                    <TableCell>{req.requestedBy}</TableCell>
                    <TableCell>{new Date(req.date).toLocaleDateString()}</TableCell>
                    <TableCell align="center">
                      {req.status === "Pending" && (
                        <>
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleUpdateStatus(req.id, "Approved")}
                            title="Approve"
                          >
                            <CheckCircleIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleUpdateStatus(req.id, "Rejected")}
                            title="Reject"
                          >
                            <CancelIcon fontSize="small" />
                          </IconButton>
                        </>
                      )}
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteRequest(req.id)}
                        title="Delete"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add Request Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Request</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              select
              label="Type"
              fullWidth
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as Request["type"] })
              }
            >
              <MenuItem value="Procurement">Procurement</MenuItem>
              <MenuItem value="Maintenance">Maintenance</MenuItem>
              <MenuItem value="Furniture">Furniture</MenuItem>
              <MenuItem value="Lockers">Lockers</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </TextField>
            <TextField
              label="Title"
              fullWidth
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <TextField
              select
              label="Priority"
              fullWidth
              value={formData.priority}
              onChange={(e) =>
                setFormData({ ...formData, priority: e.target.value as Request["priority"] })
              }
            >
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="High">High</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddRequest} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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

export default Requests;