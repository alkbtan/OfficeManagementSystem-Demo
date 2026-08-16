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
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import WarningIcon from "@mui/icons-material/Warning";
import BuildIcon from "@mui/icons-material/Build";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { ticketService } from "../../services/ticketService";
import type { Ticket } from "../../services/ticketService";

function Maintenance() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, closed: 0 });
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: "", 
    severity: "success" as "success" | "error" 
  });
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "Open" as Ticket["status"],
    priority: "Medium" as Ticket["priority"],
    assignedTo: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [ticketsData, statsData] = await Promise.all([
        ticketService.getAll(),
        ticketService.getStats(),
      ]);
      setTickets(ticketsData);
      setFilteredTickets(ticketsData);
      setStats(statsData);
    } catch (error) {
      console.error("Error loading tickets:", error);
      showSnackbar("Failed to load tickets", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const filtered = tickets.filter(ticket =>
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.assignedTo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.status.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredTickets(filtered);
  }, [searchQuery, tickets]);

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenDialog = (ticket?: Ticket) => {
    if (ticket) {
      setEditingTicket(ticket);
      setFormData({
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        assignedTo: ticket.assignedTo || "",
      });
    } else {
      setEditingTicket(null);
      setFormData({
        title: "",
        description: "",
        status: "Open",
        priority: "Medium",
        assignedTo: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTicket(null);
  };

  const handleSaveTicket = async () => {
    try {
      if (editingTicket) {
        await ticketService.update(editingTicket.id, formData);
        showSnackbar("Ticket updated successfully!", "success");
      } else {
        await ticketService.create(formData);
        showSnackbar("Ticket created successfully!", "success");
      }
      handleCloseDialog();
      loadData();
    } catch (error) {
      console.error("Error saving ticket:", error);
      showSnackbar("Failed to save ticket", "error");
    }
  };

  const handleDeleteTicket = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this ticket?")) {
      try {
        await ticketService.delete(id);
        showSnackbar("Ticket deleted successfully!", "success");
        loadData();
      } catch (error) {
        console.error("Error deleting ticket:", error);
        showSnackbar("Failed to delete ticket", "error");
      }
    }
  };

  const handleRefresh = () => {
    loadData();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open": return "warning";
      case "In Progress": return "info";
      case "Closed": return "success";
      default: return "default";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "error";
      case "Medium": return "warning";
      case "Low": return "info";
      default: return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Open": return <WarningIcon fontSize="small" />;
      case "In Progress": return <BuildIcon fontSize="small" />;
      case "Closed": return <CheckCircleIcon fontSize="small" />;
      default: return null;
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
            Maintenance
          </Typography>
          <Typography color="text.secondary">
            Manage all maintenance tickets
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
            New Ticket
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
                    Total Tickets
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.total}
                  </Typography>
                </Box>
                <ConfirmationNumberIcon sx={{ fontSize: 40, color: "#1976d2", opacity: 0.5 }} />
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
                    Open
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {stats.open}
                  </Typography>
                </Box>
                <WarningIcon sx={{ fontSize: 40, color: "#ed6c02", opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            borderLeft: 4, 
            borderColor: "info.main",
            transition: "0.3s",
            "&:hover": { transform: "scale(1.02)" }
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    In Progress
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="info.main">
                    {stats.inProgress}
                  </Typography>
                </Box>
                <BuildIcon sx={{ fontSize: 40, color: "#0288d1", opacity: 0.5 }} />
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
                    Closed
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {stats.closed}
                  </Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 40, color: "#2e7d32", opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <TextField
            placeholder="Search tickets..."
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
            {filteredTickets.length} tickets found
          </Typography>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                <TableCell>ID</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No tickets found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTickets.map((ticket) => (
                  <TableRow 
                    key={ticket.id}
                    sx={{ "&:hover": { bgcolor: "#fafafa" } }}
                  >
                    <TableCell>#{ticket.id}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {ticket.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {ticket.description.substring(0, 50)}...
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={ticket.priority}
                        color={getPriorityColor(ticket.priority)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(ticket.status)}
                        label={ticket.status}
                        color={getStatusColor(ticket.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{ticket.assignedTo || "Unassigned"}</TableCell>
                    <TableCell>
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenDialog(ticket)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteTicket(ticket.id)}
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
          {editingTicket ? "Edit Ticket" : "Create New Ticket"}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
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
              label="Status"
              fullWidth
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Ticket["status"] })}
            >
              <MenuItem value="Open">Open</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Closed">Closed</MenuItem>
            </TextField>
            <TextField
              select
              label="Priority"
              fullWidth
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as Ticket["priority"] })}
            >
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="High">High</MenuItem>
            </TextField>
            <TextField
              label="Assigned To"
              fullWidth
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveTicket}>
            {editingTicket ? "Update" : "Create"}
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

export default Maintenance;