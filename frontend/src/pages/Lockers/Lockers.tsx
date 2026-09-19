import { useEffect, useState } from "react";
import {
  Box, Typography, Grid, Card, CardContent, Paper, Button, IconButton,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Snackbar, Alert, Chip, Switch, FormControlLabel,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useTranslation } from "react-i18next";
import { useUserPermissions } from "../../hooks/useUserPermissions";
import { lockerService } from "../../services/lockerService";
import type { Locker } from "../../services/lockerService";

function Lockers() {
  const { t } = useTranslation();
  const { canDelete, canEdit } = useUserPermissions();
  const [lockers, setLockers] = useState<Locker[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingLocker, setEditingLocker] = useState<Locker | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false, message: "", severity: "success" as "success" | "error",
  });

  const floors = ["7th", "15th", "17th", "18th", "19th"];
  const statuses = ["Available", "Occupied", "Maintenance", "Reserved"];
  const lockTypes = ["Key", "Combination", "Electronic", "Biometric"];

  const [formData, setFormData] = useState({
    number: "", location: "", status: "Available", lockType: "Key",
    assignedTo: "", assignedToName: "", biometricEnabled: false,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await lockerService.getAll();
      setLockers(data);
    } catch (error) {
      console.error("Error loading lockers:", error);
      showSnackbar(t("common.error"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenDialog = (locker?: Locker) => {
    if (locker) {
      setEditingLocker(locker);
      setFormData({
        number: locker.number, location: locker.location || "",
        status: locker.status || "Available", lockType: locker.lockType || "Key",
        assignedTo: locker.assignedTo || "", assignedToName: locker.assignedToName || "",
        biometricEnabled: locker.biometricEnabled || false,
      });
    } else {
      setEditingLocker(null);
      setFormData({ number: "", location: "", status: "Available", lockType: "Key", assignedTo: "", assignedToName: "", biometricEnabled: false });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingLocker(null);
  };

  const handleSaveLocker = async () => {
    if (!formData.number.trim()) { showSnackbar(t("lockers.lockerNumber") + " " + t("common.required"), "error"); return; }
    if (!formData.location) { showSnackbar(t("common.location") + " " + t("common.required"), "error"); return; }

    try {
      const dataToSend = {
        ...formData,
        assignedToName: formData.assignedToName || formData.assignedTo || "",
      };

      if (editingLocker) {
        await lockerService.update(editingLocker.id, dataToSend);
        showSnackbar(t("common.success"), "success");
      } else {
        await lockerService.create(dataToSend);
        showSnackbar(t("common.success"), "success");
      }
      handleCloseDialog();
      loadData();
    } catch (error: any) {
      console.error("Error saving locker:", error);
      const errorMessage = error?.response?.data?.message || t("common.error");
      showSnackbar(errorMessage, "error");
    }
  };

  const handleDeleteLocker = async (id: number) => {
    if (window.confirm(t("common.confirmDelete"))) {
      try {
        await lockerService.delete(id);
        showSnackbar(t("common.success"), "success");
        loadData();
      } catch (error: any) {
        console.error("Error deleting locker:", error);
        const errorMessage = error?.response?.data?.message || t("common.error");
        showSnackbar(errorMessage, "error");
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available": return "success";
      case "Occupied": return "primary";
      case "Maintenance": return "warning";
      case "Reserved": return "info";
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
            🗄️ {t("lockers.title")}
          </Typography>
          <Typography sx={{ color: "text.secondary" }}>
            {lockers.length} {t("lockers.subtitle")}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadData}>{t("common.refresh")}</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>{t("lockers.addLocker")}</Button>
        </Box>
      </Box>

      <Grid container spacing={2}>
        {lockers.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <Typography sx={{ color: "text.secondary" }}>{t("common.noItems")}</Typography>
            </Paper>
          </Grid>
        ) : (
          lockers.map((locker) => (
            <Grid item xs={12} sm={6} md={4} key={locker.id}>
              <Card sx={{ borderRadius: 2, transition: "transform 0.2s", "&:hover": { transform: "translateY(-4px)" } }}>
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: "bold" }}>#{locker.number}</Typography>
                      <Chip label={locker.status} size="small" color={getStatusColor(locker.status) as any} sx={{ mt: 0.5 }} />
                      <Chip label={locker.lockType} size="small" variant="outlined" sx={{ mt: 0.5, ml: 0.5 }} />
                      {locker.biometricEnabled && (
                        <Chip label="🔐 Biometric" size="small" color="secondary" sx={{ mt: 0.5, ml: 0.5 }} />
                      )}
                    </Box>
                    <Box>
                      {canEdit(locker.createdBy) && (
                        <IconButton size="small" color="primary" onClick={() => handleOpenDialog(locker)}>
                          <EditIcon />
                        </IconButton>
                      )}
                      {canDelete(locker.createdBy) && (
                        <IconButton size="small" color="error" onClick={() => handleDeleteLocker(locker.id)}>
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2">📍 {t("common.location")}: <strong>{locker.location}</strong></Typography>
                    {(locker.assignedToName || locker.assignedTo) && (
                      <Typography variant="body2">👤 {t("lockers.employeeName")}: <strong>{locker.assignedToName || locker.assignedTo}</strong></Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: "#1a237e", color: "white" }}>
          {editingLocker ? `✏️ ${t("lockers.editLocker")}` : `➕ ${t("lockers.addLocker")}`}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField label={t("lockers.lockerNumber")} fullWidth required value={formData.number} onChange={(e) => setFormData({ ...formData, number: e.target.value })} />
            <TextField select label={t("employees.locationFloor")} fullWidth required value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })}>
              {floors.map((floor) => (<MenuItem key={floor} value={floor}>{floor}</MenuItem>))}
            </TextField>
            <TextField select label={t("common.status")} fullWidth value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
              {statuses.map((status) => (<MenuItem key={status} value={status}>{status}</MenuItem>))}
            </TextField>
            <TextField select label={t("lockers.lockType")} fullWidth value={formData.lockType} onChange={(e) => setFormData({ ...formData, lockType: e.target.value })}>
              {lockTypes.map((type) => (<MenuItem key={type} value={type}>{type}</MenuItem>))}
            </TextField>
            <TextField label={t("lockers.employeeName")} fullWidth placeholder={t("lockers.employeeNamePlaceholder")} value={formData.assignedToName || formData.assignedTo} onChange={(e) => setFormData({ ...formData, assignedToName: e.target.value, assignedTo: e.target.value })} />
            <FormControlLabel
              control={<Switch checked={formData.biometricEnabled} onChange={(e) => setFormData({ ...formData, biometricEnabled: e.target.checked })} />}
              label={t("lockers.biometricEnabled")}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={handleCloseDialog} variant="outlined" color="inherit">{t("common.cancel")}</Button>
          <Button variant="contained" onClick={handleSaveLocker} sx={{ bgcolor: "#1a237e" }}>
            {editingLocker ? t("common.update") : t("common.create")}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}

export default Lockers;