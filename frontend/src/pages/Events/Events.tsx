import { useEffect, useState } from "react";
import {
  Box, Typography, Grid, Card, CardContent, Paper, Button, IconButton,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Snackbar, Alert, Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useTranslation } from "react-i18next";
import { useUserPermissions } from "../../hooks/useUserPermissions";
import { eventService } from "../../services/eventService";
import type { Event } from "../../services/eventService";

function Events() {
  const { t } = useTranslation();
  const { canDelete, canEdit } = useUserPermissions();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false, message: "", severity: "success" as "success" | "error",
  });
  const [openTypeDialog, setOpenTypeDialog] = useState(false);
  const [newType, setNewType] = useState("");

  const [eventTypes, setEventTypes] = useState<string[]>(["General", "Team Building", "Birthday", "Anniversary", "Welcome"]);
  const statuses = ["Upcoming", "Ongoing", "Completed", "Cancelled"];

  const [formData, setFormData] = useState({
    title: "", description: "", eventDate: "", time: "", location: "",
    type: "", status: "Upcoming" as Event["status"], preparation: "", equipment: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await eventService.getAll();
      setEvents(data);
    } catch (error) {
      console.error("Error loading events:", error);
      showSnackbar(t("common.error"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenDialog = (event?: Event) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title, description: event.description || "",
        eventDate: event.eventDate ? event.eventDate.split("T")[0] : "",
        time: event.time || "", location: event.location || "",
        type: event.type || "", status: event.status || "Upcoming",
        preparation: event.preparation || "", equipment: event.equipment || "",
      });
    } else {
      setEditingEvent(null);
      setFormData({ title: "", description: "", eventDate: "", time: "", location: "", type: "", status: "Upcoming", preparation: "", equipment: "" });
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
      showSnackbar(t("common.success"), "success");
    }
  };

  const handleSaveEvent = async () => {
    if (!formData.title.trim()) { showSnackbar(t("events.eventTitle") + " " + t("common.required"), "error"); return; }
    if (!formData.eventDate) { showSnackbar(t("events.date") + " " + t("common.required"), "error"); return; }
    if (!formData.time) { showSnackbar(t("events.time") + " " + t("common.required"), "error"); return; }
    if (!formData.location.trim()) { showSnackbar(t("events.location") + " " + t("common.required"), "error"); return; }
    if (!formData.type) { showSnackbar(t("events.type") + " " + t("common.required"), "error"); return; }

    try {
      const dateToSend = new Date(formData.eventDate).toISOString();

      const dataToSend = {
        title: formData.title, description: formData.description || "",
        eventDate: dateToSend, time: formData.time,
        location: formData.location, type: formData.type,
        status: formData.status || "Upcoming",
        preparation: formData.preparation || "", equipment: formData.equipment || "",
      };

      if (editingEvent) {
        await eventService.update(editingEvent.id, dataToSend);
        showSnackbar(t("common.success"), "success");
      } else {
        await eventService.create(dataToSend as any);
        showSnackbar(t("common.success"), "success");
      }
      handleCloseDialog();
      loadData();
    } catch (error: any) {
      console.error("Error saving event:", error);
      const errorMessage = error?.response?.data?.message || t("common.error");
      showSnackbar(errorMessage, "error");
    }
  };

  const handleDeleteEvent = async (id: number) => {
    if (window.confirm(t("common.confirmDelete"))) {
      try {
        await eventService.delete(id);
        showSnackbar(t("common.success"), "success");
        loadData();
      } catch (error: any) {
        console.error("Error deleting event:", error);
        const errorMessage = error?.response?.data?.message || t("common.error");
        showSnackbar(errorMessage, "error");
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
            🎉 {t("events.title")}
          </Typography>
          <Typography sx={{ color: "text.secondary" }}>
            {events.length} {t("events.subtitle")}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadData}>{t("common.refresh")}</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>{t("events.newEvent")}</Button>
        </Box>
      </Box>

      <Grid container spacing={2}>
        {events.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <Typography sx={{ color: "text.secondary" }}>{t("common.noItems")}</Typography>
            </Paper>
          </Grid>
        ) : (
          events.map((event) => (
            <Grid item xs={12} md={6} lg={4} key={event.id}>
              <Card sx={{ borderRadius: 2, transition: "transform 0.2s", "&:hover": { transform: "translateY(-4px)" } }}>
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: "bold" }}>{event.title}</Typography>
                      <Chip label={event.type} size="small" color={getTypeColor(event.type) as any} sx={{ mt: 0.5 }} />
                      <Chip label={event.status} size="small" color={getStatusColor(event.status) as any} sx={{ mt: 0.5, ml: 0.5 }} />
                    </Box>
                    <Box>
                      {canEdit(event.createdBy) && (
                        <IconButton size="small" color="primary" onClick={() => handleOpenDialog(event)}>
                          <EditIcon />
                        </IconButton>
                      )}
                      {canDelete(event.createdBy) && (
                        <IconButton size="small" color="error" onClick={() => handleDeleteEvent(event.id)}>
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>
                  </Box>

                  <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>{event.description}</Typography>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2">📍 {event.location}</Typography>
                    <Typography variant="body2">📅 {new Date(event.eventDate).toLocaleDateString()} {t("events.time")} {event.time}</Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>🔧 {t("events.preparation")}: <strong>{event.preparation || "N/A"}</strong></Typography>
                    <Typography variant="body2">🏷️ {t("events.equipment")}: <strong>{event.equipment || "N/A"}</strong></Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: "#1a237e", color: "white" }}>
          {editingEvent ? `✏️ ${t("events.editEvent")}` : `➕ ${t("events.newEvent")}`}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField label={t("events.eventTitle")} fullWidth required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
            <TextField label={t("events.preparation")} fullWidth multiline rows={2} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField label={t("events.date")} type="date" fullWidth required value={formData.eventDate} onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label={t("events.time")} type="time" fullWidth required value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} InputLabelProps={{ shrink: true }} />
              </Grid>
            </Grid>
            <TextField label={t("events.location")} fullWidth required value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
            <TextField select label={t("events.type")} fullWidth required value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
              {eventTypes.map((type) => (<MenuItem key={type} value={type}>{type}</MenuItem>))}
              <MenuItem value="add-new" onClick={() => setOpenTypeDialog(true)} sx={{ color: "primary.main", fontWeight: "bold" }}>
                <AddIcon fontSize="small" /> {t("events.addNewType")}
              </MenuItem>
            </TextField>
            <TextField select label={t("common.status")} fullWidth value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as Event["status"] })}>
              {statuses.map((status) => (<MenuItem key={status} value={status}>{status}</MenuItem>))}
            </TextField>
            <TextField label={t("events.preparation")} fullWidth multiline rows={2} placeholder={t("events.preparationPlaceholder")} value={formData.preparation} onChange={(e) => setFormData({ ...formData, preparation: e.target.value })} />
            <TextField label={t("events.equipment")} fullWidth multiline rows={2} placeholder={t("events.equipmentPlaceholder")} value={formData.equipment} onChange={(e) => setFormData({ ...formData, equipment: e.target.value })} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={handleCloseDialog} variant="outlined" color="inherit">{t("common.cancel")}</Button>
          <Button variant="contained" onClick={handleSaveEvent} sx={{ bgcolor: "#1a237e" }}>
            {editingEvent ? t("common.update") : t("common.create")}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openTypeDialog} onClose={() => setOpenTypeDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{t("events.addNewType")}</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label={t("common.type")} fullWidth value={newType} onChange={(e) => setNewType(e.target.value)} onKeyPress={(e) => { if (e.key === "Enter") handleAddType(); }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTypeDialog(false)}>{t("common.cancel")}</Button>
          <Button variant="contained" onClick={handleAddType}>{t("common.add")}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}

export default Events;