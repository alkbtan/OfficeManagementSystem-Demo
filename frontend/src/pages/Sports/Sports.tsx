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
import { sportService } from "../../services/sportService";
import type { Sport } from "../../services/sportService";

function Sports() {
  const { t } = useTranslation();
  const { canDelete, canEdit } = useUserPermissions();
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSport, setEditingSport] = useState<Sport | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false, message: "", severity: "success" as "success" | "error",
  });

  const [formData, setFormData] = useState({
    name: "", date: "", time: "", preparation: "", equipment: "",
    status: "Pending" as Sport["status"],
  });

  const statuses = ["Pending", "Preparing", "Ready", "Completed"];

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await sportService.getAll();
      setSports(data);
    } catch (error) {
      console.error("Error loading sports:", error);
      showSnackbar(t("common.error"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenDialog = (sport?: Sport) => {
    if (sport) {
      setEditingSport(sport);
      setFormData({
        name: sport.name || "",
        date: sport.date ? sport.date.split("T")[0] : "",
        time: sport.time || "", preparation: sport.preparation || "",
        equipment: sport.equipment || "", status: sport.status || "Pending",
      });
    } else {
      setEditingSport(null);
      setFormData({ name: "", date: "", time: "", preparation: "", equipment: "", status: "Pending" });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingSport(null);
  };

  const handleSaveSport = async () => {
    if (!formData.name.trim()) { showSnackbar(t("sports.matchName") + " " + t("common.required"), "error"); return; }
    if (!formData.date) { showSnackbar(t("sports.date") + " " + t("common.required"), "error"); return; }
    if (!formData.time) { showSnackbar(t("sports.time") + " " + t("common.required"), "error"); return; }

    try {
      const dateToSend = new Date(formData.date).toISOString();

      const dataToSend = {
        name: formData.name, date: dateToSend, time: formData.time,
        preparation: formData.preparation || "",
        equipment: formData.equipment || "", status: formData.status,
      };

      if (editingSport) {
        await sportService.update(editingSport.id, dataToSend as any);
        showSnackbar(t("common.success"), "success");
      } else {
        await sportService.create(dataToSend as any);
        showSnackbar(t("common.success"), "success");
      }
      handleCloseDialog();
      loadData();
    } catch (error: any) {
      console.error("Error saving sport:", error);
      const errorMessage = error?.response?.data?.message || t("common.error");
      showSnackbar(errorMessage, "error");
    }
  };

  const handleDeleteSport = async (id: number) => {
    if (window.confirm(t("common.confirmDelete"))) {
      try {
        await sportService.delete(id);
        showSnackbar(t("common.success"), "success");
        loadData();
      } catch (error: any) {
        console.error("Error deleting sport:", error);
        const errorMessage = error?.response?.data?.message || t("common.error");
        showSnackbar(errorMessage, "error");
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ready": return "success";
      case "Preparing": return "warning";
      case "Pending": return "info";
      case "Completed": return "default";
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
            ⚽ {t("sports.title")}
          </Typography>
          <Typography sx={{ color: "text.secondary" }}>
            {sports.length} {t("sports.subtitle")}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadData}>{t("common.refresh")}</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>{t("sports.newMatch")}</Button>
        </Box>
      </Box>

      <Grid container spacing={2}>
        {sports.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <Typography sx={{ color: "text.secondary" }}>{t("common.noItems")}</Typography>
            </Paper>
          </Grid>
        ) : (
          sports.map((sport) => (
            <Grid item xs={12} md={6} lg={4} key={sport.id}>
              <Card sx={{ borderRadius: 2, transition: "transform 0.2s", "&:hover": { transform: "translateY(-4px)" } }}>
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: "bold" }}>{sport.name}</Typography>
                      <Chip label={sport.status} size="small" color={getStatusColor(sport.status) as any} sx={{ mt: 0.5 }} />
                    </Box>
                    <Box>
                      {canEdit(sport.createdBy) && (
                        <IconButton size="small" color="primary" onClick={() => handleOpenDialog(sport)}>
                          <EditIcon />
                        </IconButton>
                      )}
                      {canDelete(sport.createdBy) && (
                        <IconButton size="small" color="error" onClick={() => handleDeleteSport(sport.id)}>
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2">📅 {t("sports.date")}: <strong>{new Date(sport.date).toLocaleDateString()}</strong></Typography>
                    <Typography variant="body2">⏰ {t("sports.time")}: <strong>{sport.time}</strong></Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>🔧 {t("sports.preparation")}: <strong>{sport.preparation || "N/A"}</strong></Typography>
                    <Typography variant="body2">🏷️ {t("sports.equipment")}: <strong>{sport.equipment || "N/A"}</strong></Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: "#1a237e", color: "white" }}>
          {editingSport ? `✏️ ${t("sports.editMatch")}` : `➕ ${t("sports.newMatch")}`}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField label={t("sports.matchName")} fullWidth required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            <TextField label={t("sports.date")} type="date" fullWidth required value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} InputLabelProps={{ shrink: true }} />
            <TextField label={t("sports.time")} type="time" fullWidth required value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} InputLabelProps={{ shrink: true }} />
            <TextField label={t("sports.preparation")} fullWidth multiline rows={2} placeholder={t("sports.preparationPlaceholder")} value={formData.preparation} onChange={(e) => setFormData({ ...formData, preparation: e.target.value })} />
            <TextField label={t("sports.equipment")} fullWidth multiline rows={2} placeholder={t("sports.equipmentPlaceholder")} value={formData.equipment} onChange={(e) => setFormData({ ...formData, equipment: e.target.value })} />
            <TextField select label={t("common.status")} fullWidth value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as Sport["status"] })}>
              {statuses.map((status) => (<MenuItem key={status} value={status}>{status}</MenuItem>))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={handleCloseDialog} variant="outlined" color="inherit">{t("common.cancel")}</Button>
          <Button variant="contained" onClick={handleSaveSport} sx={{ bgcolor: "#1a237e" }}>
            {editingSport ? t("common.update") : t("common.create")}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}

export default Sports;