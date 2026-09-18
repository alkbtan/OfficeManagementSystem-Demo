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
import { acService } from "../../services/acService";
import type { AirConditioner } from "../../services/acService";

function ACs() {
  const { t } = useTranslation();
  const [units, setUnits] = useState<AirConditioner[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUnit, setEditingUnit] = useState<AirConditioner | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false, message: "", severity: "success" as "success" | "error",
  });

  const floors = ["7th", "15th", "17th", "18th", "19th"];
  const statuses = ["Operational", "Under Maintenance", "Needs Repair", "Out of Service"];

  const [formData, setFormData] = useState({
    name: "", location: "", brand: "", model: "", capacity: 0,
    installationDate: "", status: "Operational", lastMaintenance: "",
    totalMaintenanceCost: 0, maintenanceCount: 0,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await acService.getAll();
      setUnits(data);
    } catch (error) {
      console.error("Error loading AC units:", error);
      showSnackbar(t("common.error"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenDialog = (unit?: AirConditioner) => {
    if (unit) {
      setEditingUnit(unit);
      setFormData({
        name: unit.name || "", location: unit.location || "",
        brand: unit.brand || "", model: unit.model || "",
        capacity: unit.capacity || 0,
        installationDate: unit.installationDate ? unit.installationDate.split("T")[0] : "",
        status: unit.status || "Operational",
        lastMaintenance: unit.lastMaintenance ? unit.lastMaintenance.split("T")[0] : "",
        totalMaintenanceCost: unit.totalMaintenanceCost || 0,
        maintenanceCount: unit.maintenanceCount || 0,
      });
    } else {
      setEditingUnit(null);
      setFormData({ name: "", location: "", brand: "", model: "", capacity: 0, installationDate: "", status: "Operational", lastMaintenance: "", totalMaintenanceCost: 0, maintenanceCount: 0 });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUnit(null);
  };

  const handleSaveUnit = async () => {
    if (!formData.name.trim()) { showSnackbar(t("common.name") + " " + t("common.required"), "error"); return; }
    if (!formData.location) { showSnackbar(t("common.location") + " " + t("common.required"), "error"); return; }
    if (!formData.brand.trim()) { showSnackbar(t("ac.brand") + " " + t("common.required"), "error"); return; }

    try {
      const dataToSend = {
        name: formData.name, location: formData.location,
        brand: formData.brand, model: formData.model || "",
        capacity: Number(formData.capacity) || 0,
        status: formData.status || "Operational",
        installationDate: formData.installationDate ? new Date(formData.installationDate).toISOString() : null,
        lastMaintenance: formData.lastMaintenance ? new Date(formData.lastMaintenance).toISOString() : null,
        totalMaintenanceCost: Number(formData.totalMaintenanceCost) || 0,
        maintenanceCount: Number(formData.maintenanceCount) || 0,
      };

      if (editingUnit) {
        await acService.update(editingUnit.id, dataToSend);
        showSnackbar(t("common.success"), "success");
      } else {
        await acService.create(dataToSend);
        showSnackbar(t("common.success"), "success");
      }
      handleCloseDialog();
      loadData();
    } catch (error: any) {
      console.error("Error saving AC unit:", error);
      const errorMessage = error?.response?.data?.message || t("common.error");
      showSnackbar(errorMessage, "error");
    }
  };

  const handleDeleteUnit = async (id: number) => {
    if (window.confirm(t("common.confirmDelete"))) {
      try {
        await acService.delete(id);
        showSnackbar(t("common.success"), "success");
        loadData();
      } catch (error) {
        console.error("Error deleting AC unit:", error);
        showSnackbar(t("common.error"), "error");
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Operational": return "success";
      case "Under Maintenance": return "warning";
      case "Needs Repair": return "error";
      case "Out of Service": return "default";
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
            ❄️ {t("ac.title")}
          </Typography>
          <Typography sx={{ color: "text.secondary" }}>
            {units.length} {t("ac.subtitle")}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadData}>{t("common.refresh")}</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>{t("ac.addAC")}</Button>
        </Box>
      </Box>

      <Grid container spacing={2}>
        {units.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <Typography sx={{ color: "text.secondary" }}>{t("common.noItems")}</Typography>
            </Paper>
          </Grid>
        ) : (
          units.map((unit) => (
            <Grid item xs={12} sm={6} md={4} key={unit.id}>
              <Card sx={{ borderRadius: 2, transition: "transform 0.2s", "&:hover": { transform: "translateY(-4px)" } }}>
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: "bold" }}>{unit.name}</Typography>
                      <Chip label={unit.status} size="small" color={getStatusColor(unit.status) as any} sx={{ mt: 0.5 }} />
                    </Box>
                    <Box>
                      <IconButton size="small" color="primary" onClick={() => handleOpenDialog(unit)}><EditIcon /></IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteUnit(unit.id)}><DeleteIcon /></IconButton>
                    </Box>
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2">📍 {t("common.location")}: <strong>{unit.location}</strong></Typography>
                    <Typography variant="body2">🏷️ {t("ac.brand")}: <strong>{unit.brand}</strong> {unit.model ? `(${unit.model})` : ""}</Typography>
                    <Typography variant="body2">🔥 {t("ac.capacity")}: <strong>{unit.capacity} BTU</strong></Typography>
                    {unit.totalMaintenanceCost > 0 && (
                      <Typography variant="body2">💰 {t("ac.maintenanceCost")}: <strong>R$ {unit.totalMaintenanceCost.toFixed(2)}</strong></Typography>
                    )}
                    {unit.maintenanceCount > 0 && (
                      <Typography variant="body2">🔧 {t("ac.maintenanceCount")}: <strong>{unit.maintenanceCount}</strong></Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: "#1a237e", color: "white" }}>
          {editingUnit ? `✏️ ${t("ac.editAC")}` : `➕ ${t("ac.addAC")}`}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField label={t("common.name")} fullWidth required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            <TextField select label={t("employees.locationFloor")} fullWidth required value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })}>
              {floors.map((floor) => (<MenuItem key={floor} value={floor}>{floor}</MenuItem>))}
            </TextField>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField label={t("ac.brand")} fullWidth required value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label={t("ac.model")} fullWidth value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField label={t("ac.capacity")} type="number" fullWidth required value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField select label={t("common.status")} fullWidth value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                  {statuses.map((status) => (<MenuItem key={status} value={status}>{status}</MenuItem>))}
                </TextField>
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField label={t("ac.installationDate")} type="date" fullWidth value={formData.installationDate} onChange={(e) => setFormData({ ...formData, installationDate: e.target.value })} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label={t("ac.lastMaintenance")} type="date" fullWidth value={formData.lastMaintenance} onChange={(e) => setFormData({ ...formData, lastMaintenance: e.target.value })} InputLabelProps={{ shrink: true }} />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField label={t("ac.maintenanceCost")} type="number" fullWidth value={formData.totalMaintenanceCost} onChange={(e) => setFormData({ ...formData, totalMaintenanceCost: Number(e.target.value) })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label={t("ac.maintenanceCount")} type="number" fullWidth value={formData.maintenanceCount} onChange={(e) => setFormData({ ...formData, maintenanceCount: Number(e.target.value) })} />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={handleCloseDialog} variant="outlined" color="inherit">{t("common.cancel")}</Button>
          <Button variant="contained" onClick={handleSaveUnit} sx={{ bgcolor: "#1a237e" }}>
            {editingUnit ? t("common.update") : t("common.create")}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}

export default ACs;