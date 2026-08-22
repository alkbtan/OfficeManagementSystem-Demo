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
import EventIcon from "@mui/icons-material/Event";
import { eventService } from "../../services/eventService";
import type { Event } from "../../services/eventService";

function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const [openTypeDialog, setOpenTypeDialog] = useState(false);
  const [newType, setNewType] = useState("");

  // Event types with ability to add new
  const [eventTypes, setEventTypes] = useState<string[]>([
    "General",
    "Team Building",
    "Birthday",
    "Anniversary",
    "Welcome",
  ]);

  const statuses = ["Upcoming", "Ongoing", "Completed", "Cancelled"];

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventDate: "",
    time: "",
    location: "",
    type: "",
    status: "Upcoming" as Event["status"],
    preparation: "",
    equipment: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await eventService.getAll();
      setEvents(data);
    } catch (error) {
      console.error("Error loading events:", error);
      showSnackbar("Failed to load events", "error");
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

  const handleOpenDialog = (event?: Event) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title,
        description: event.description || "",
        eventDate: event.eventDate ? event.eventDate.split("T")[0] : "",
        time: event.time || "",
        location: event.location || "",
        type: event.type || "",
        status: event.status || "Upcoming",
        preparation: event.preparation || "",
        equipment: event.equipment || "",
      });
    } else {
      setEditingEvent(null);
      setFormData({
        title: "",
        description: "",
        eventDate: "",
        time: "",
        location: "",
        type: "",
        status: "Upcoming",
        preparation: "",
        equipment: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingEvent(null);
  };

  const handleAddType = () => {
    if (newType.trim()) {
      setEventTypes([...eventTypes, newType.trim()]);
      setFormData({ ...formData, type: newType.trim() });
      setNewType("");
      setOpenTypeDialog(false);
      showSnackbar(`Type "${newType.trim()}" added successfully!`, "success");
    }
  };

  // ✅ FIXED: handleSaveEvent with proper error handling
  const handleSaveEvent = async () => {
    // Validate required fields
    if (!formData.title.trim()) {
      showSnackbar("Title is required", "error");
      return;
    }
    if (!formData.eventDate) {
      showSnackbar("Date is required", "error");
      return;
    }
    if (!formData.time) {
      showSnackbar("Time is required", "error");
      return;
    }
    if (!formData.location.trim()) {
      showSnackbar("Location is required", "error");
      return;
    }
    if (!formData.type) {
      showSnackbar("Type is required", "error");
      return;
    }

    try {
      // Convert date to proper UTC format
      const dateObj = new Date(formData.eventDate);
      const dateToSend = dateObj.toISOString();

      // ✅ Don't send id in the body
      const dataToSend = {
        title: formData.title,
        description: formData.description || "",
        eventDate: dateToSend,
        time: formData.time,
        location: formData.location,
        type: formData.type,
        status: formData.status || "Upcoming",
        preparation: formData.preparation || "",
        equipment: formData.equipment || "",
      };

      if (editingEvent) {
        await eventService.update(editingEvent.id, dataToSend);
        showSnackbar("Event updated successfully!", "success");
      } else {
        await eventService.create(dataToSend);
        showSnackbar("Event created successfully!", "success");
      }
      handleCloseDialog();
      loadData();
    } catch (error: any) {
      console.error("Error saving event:", error);
      console.error("Response data:", error?.response?.data);
      const errorMessage = error?.response?.data?.message || "Failed to save event";
      showSnackbar(errorMessage, "error");
    }
  };

  const handleDeleteEvent = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await eventService.delete(id);
        showSnackbar("Event deleted successfully!", "success");
        loadData();
      } catch (error) {
        console.error("Error deleting event:", error);
        showSnackbar("Failed to delete event", "error");
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Upcoming": return "info";
      case "Ongoing": return "warning";
      case "Completed": return "success";
      case "Cancelled": return "error";
      default: return "default";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Team Building": return "primary";
      case "Birthday": return "secondary";
      case "Anniversary": return "success";
      case "Welcome": return "info";
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
            🎉 Events
          </Typography>
          <Typography sx={{ color: "text.secondary" }}>
            {events.length} events
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadData}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            New Event
          </Button>
        </Box>
      </Box>

      {/* Events Grid */}
      <Grid container spacing={2}>
        {events.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <Typography sx={{ color: "text.secondary" }}>No events found</Typography>
            </Paper>
          </Grid>
        ) : (
          events.map((event) => (
            <Grid item xs={12} md={6} lg={4} key={event.id}>
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
                        {event.title}
                      </Typography>
                      <Chip
                        label={event.type}
                        size="small"
                        color={getTypeColor(event.type) as any}
                        sx={{ mt: 0.5 }}
                      />
                      <Chip
                        label={event.status}
                        size="small"
                        color={getStatusColor(event.status) as any}
                        sx={{ mt: 0.5, ml: 0.5 }}
                      />
                    </Box>
                    <Box>
                      <IconButton size="small" color="primary" onClick={() => handleOpenDialog(event)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteEvent(event.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
                    {event.description}
                  </Typography>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      📍 {event.location}
                    </Typography>
                    <Typography variant="body2">
                      📅 {new Date(event.eventDate).toLocaleDateString()} at {event.time}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      🔧 Preparation: <strong>{event.preparation || "N/A"}</strong>
                    </Typography>
                    <Typography variant="body2">
                      🏷️ Equipment: <strong>{event.equipment || "N/A"}</strong>
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
          {editingEvent ? "✏️ Edit Event" : "➕ New Event"}
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
                  label="Date"
                  type="date"
                  fullWidth
                  required
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Time"
                  type="time"
                  fullWidth
                  required
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            <TextField
              label="Location"
              fullWidth
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />

            <TextField
              select
              label="Type"
              fullWidth
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              {eventTypes.map((type) => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
              <MenuItem
                value="add-new"
                onClick={() => setOpenTypeDialog(true)}
                sx={{ color: "primary.main", fontWeight: "bold" }}
              >
                <AddIcon fontSize="small" /> Add New Type
              </MenuItem>
            </TextField>

            <TextField
              select
              label="Status"
              fullWidth
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Event["status"] })}
            >
              {statuses.map((status) => (
                <MenuItem key={status} value={status}>{status}</MenuItem>
              ))}
            </TextField>

            <TextField
              label="Preparation"
              fullWidth
              multiline
              rows={2}
              placeholder="e.g. Book venue, arrange catering, prepare materials"
              value={formData.preparation}
              onChange={(e) => setFormData({ ...formData, preparation: e.target.value })}
            />

            <TextField
              label="Equipment"
              fullWidth
              multiline
              rows={2}
              placeholder="e.g. Projector, speakers, tables, chairs"
              value={formData.equipment}
              onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={handleCloseDialog} variant="outlined" color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveEvent}
            sx={{ bgcolor: "#1a237e" }}
          >
            {editingEvent ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Type Dialog */}
      <Dialog open={openTypeDialog} onClose={() => setOpenTypeDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add New Event Type</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Type Name"
            fullWidth
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleAddType();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTypeDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddType}>
            Add
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

export default Events;