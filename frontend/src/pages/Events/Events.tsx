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

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventDate: "",
    location: "",
    type: "General" as Event["type"],
    status: "Upcoming" as Event["status"],
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
        description: event.description,
        eventDate: event.eventDate.split("T")[0],
        location: event.location,
        type: event.type,
        status: event.status,
      });
    } else {
      setEditingEvent(null);
      setFormData({
        title: "",
        description: "",
        eventDate: "",
        location: "",
        type: "General",
        status: "Upcoming",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingEvent(null);
  };

  const handleSaveEvent = async () => {
    try {
      const dataToSend = {
        ...formData,
        eventDate: new Date(formData.eventDate).toISOString(),
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
    } catch (error) {
      console.error("Error saving event:", error);
      showSnackbar("Failed to save event", "error");
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
              <Card sx={{
                borderRadius: 2,
                transition: "transform 0.2s",
                "&:hover": { transform: "translateY(-4px)" }
              }}>
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
                      📅 {new Date(event.eventDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingEvent ? "Edit Event" : "New Event"}</DialogTitle>
        <DialogContent>
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
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <TextField
              label="Event Date"
              type="date"
              fullWidth
              required
              value={formData.eventDate}
              onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
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
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as Event["type"] })}
            >
              <MenuItem value="General">General</MenuItem>
              <MenuItem value="Team Building">Team Building</MenuItem>
              <MenuItem value="Birthday">Birthday</MenuItem>
              <MenuItem value="Anniversary">Anniversary</MenuItem>
              <MenuItem value="Welcome">Welcome</MenuItem>
            </TextField>
            <TextField
              select
              label="Status"
              fullWidth
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Event["status"] })}
            >
              <MenuItem value="Upcoming">Upcoming</MenuItem>
              <MenuItem value="Ongoing">Ongoing</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveEvent}>
            {editingEvent ? "Update" : "Create"}
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

export default Events;