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
import { ticketService } from "../../services/ticketService";
import type { Ticket } from "../../services/ticketService";

function Maintenance() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "Open",
    priority: "Medium",
    assignedTo: "",
    jiraTicket: "",
    link: "",
    amount: 0,
    date: "",
    floor: "",
    company: "",
  });

  const statuses = ["Open", "In Progress", "Resolved", "Closed"];
  const priorities = ["Low", "Medium", "High", "Critical"];
  const floors = ["7th", "15th", "17th", "18th", "19th"];

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await ticketService.getAll();
      setTickets(data);
    } catch (error) {
      console.error("Error loading tickets:", error);
      showSnackbar("Failed to load maintenance tickets", "error");
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

  const handleOpenDialog = (ticket?: Ticket) => {
    if (ticket) {
      setEditingTicket(ticket);
      setFormData({
        title: ticket.title,
        description: ticket.description || "",
        status: ticket.status || "Open",
        priority: ticket.priority || "Medium",
        assignedTo: ticket.assignedTo || "",
        jiraTicket: ticket.jiraTicket || "",
        link: ticket.link || "",
        amount: ticket.amount || 0,
        date: ticket.date ? ticket.date.split("T")[0] : "",
        floor: ticket.floor || "",
        company: ticket.company || "",
      });
    } else {
      setEditingTicket(null);
      setFormData({
        title: "",
        description: "",
        status: "Open",
        priority: "Medium",
        assignedTo: "",
        jiraTicket: "",
        link: "",
        amount: 0,
        date: "",
        floor: "",
        company: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTicket(null);
  };

  // ✅ FIXED: handleSaveTicket without sending id in body
  const handleSaveTicket = async () => {
    if (!formData.title.trim()) {
      showSnackbar("Title is required", "error");
      return;
    }

    try {
      const dataToSend = {
        title: formData.title,
        description: formData.description || "",
        status: formData.status,
        priority: formData.priority,
        assignedTo: formData.assignedTo || "",
        jiraTicket: formData.jiraTicket || "",
        link: formData.link || "",
        amount: Number(formData.amount) || 0,
        date: formData.date ? new Date(formData.date).toISOString() : null,
        floor: formData.floor || "",
        company: formData.company || "",
      };

      if (editingTicket) {
        await ticketService.update(editingTicket.id, dataToSend);
        showSnackbar("Maintenance ticket updated successfully!", "success");
      } else {
        await ticketService.create(dataToSend);
        showSnackbar("Maintenance ticket created successfully!", "success");
      }
      handleCloseDialog();
      loadData();
    } catch (error: any) {
      console.error("Error saving ticket:", error);
      console.error("Response:", error?.response?.data);
      const errorMessage = error?.response?.data?.message || "Failed to save ticket";
      showSnackbar(errorMessage, "error");
    }
  };

  const handleDeleteTicket = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this maintenance ticket?")) {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Closed": return "success";
      case "Resolved": return "info";
      case "In Progress": return "warning";
      default: return "error";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical": return "error";
      case "High": return "warning";
      case "Medium": return "info";
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
            🔧 Maintenance
          </Typography>
          <Typography sx={{ color: "text.secondary" }}>
            {tickets.length} tickets
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadData}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            New Ticket
          </Button>
        </Box>
      </Box>

      {/* Tickets Grid */}
      <Grid container spacing={2}>
        {tickets.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <Typography sx={{ color: "text.secondary" }}>No maintenance tickets found</Typography>
            </Paper>
          </Grid>
        ) : (
          tickets.map((ticket) => (
            <Grid item xs={12} md={6} lg={4} key={ticket.id}>
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
                        {ticket.title}
                      </Typography>
                      <Chip
                        label={ticket.status}
                        size="small"
                        color={getStatusColor(ticket.status) as any}
                        sx={{ mt: 0.5 }}
                      />
                      <Chip
                        label={ticket.priority}
                        size="small"
                        color={getPriorityColor(ticket.priority) as any}
                        sx={{ mt: 0.5, ml: 0.5 }}
                      />
                    </Box>
                    <Box>
                      <IconButton size="small" color="primary" onClick={() => handleOpenDialog(ticket)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteTicket(ticket.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
                    {ticket.description}
                  </Typography>

                  <Box sx={{ mt: 2 }}>
                    {ticket.jiraTicket && (
                      <Typography variant="body2">
                        🎫 Jira: <strong>{ticket.jiraTicket}</strong>
                      </Typography>
                    )}
                    {ticket.link && (
                      <Typography variant="body2">
                        🔗 Link: <a href={ticket.link} target="_blank" rel="noopener noreferrer">{ticket.link}</a>
                      </Typography>
                    )}
                    {ticket.amount > 0 && (
                      <Typography variant="body2">
                        💰 Amount: <strong>R$ {ticket.amount.toFixed(2)}</strong>
                      </Typography>
                    )}
                    {ticket.date && (
                      <Typography variant="body2">
                        📅 Date: <strong>{new Date(ticket.date).toLocaleDateString()}</strong>
                      </Typography>
                    )}
                    {ticket.floor && (
                      <Typography variant="body2">
                        🏢 Floor: <strong>{ticket.floor}</strong>
                      </Typography>
                    )}
                    {ticket.company && (
                      <Typography variant="body2">
                        🏭 Company: <strong>{ticket.company}</strong>
                      </Typography>
                    )}
                    {ticket.assignedTo && (
                      <Typography variant="body2">
                        👤 Assigned To: <strong>{ticket.assignedTo}</strong>
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
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: "#1a237e", color: "white" }}>
          {editingTicket ? "✏️ Edit Ticket" : "➕ New Maintenance Ticket"}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
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
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

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
              label="Assigned To"
              fullWidth
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Jira Ticket"
                  fullWidth
                  placeholder="e.g. PROJ-123"
                  value={formData.jiraTicket}
                  onChange={(e) => setFormData({ ...formData, jiraTicket: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Link"
                  fullWidth
                  placeholder="https://..."
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Amount (R$)"
                  type="number"
                  fullWidth
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Date"
                  type="date"
                  fullWidth
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Floor"
                  fullWidth
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                >
                  {floors.map((floor) => (
                    <MenuItem key={floor} value={floor}>{floor}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Company"
                  fullWidth
                  placeholder="e.g. ARTECOOL, Sonda, etc."
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={handleCloseDialog} variant="outlined" color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveTicket}
            sx={{ bgcolor: "#1a237e" }}
          >
            {editingTicket ? "Update" : "Create"}
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

export default Maintenance;