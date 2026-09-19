import { useEffect, useState } from "react";
import {
  Box, Typography, Grid, Card, CardContent, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Button, IconButton,
  Tooltip, CircularProgress, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, Snackbar, Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useTranslation } from "react-i18next";
import { useUserPermissions } from "../../hooks/useUserPermissions";
import { budgetService } from "../../services/budgetService";
import type { Budget as BudgetModel, BudgetSummary } from "../../services/budgetService";

function BudgetPage() {
  const { t } = useTranslation();
  const { canDelete, canEdit } = useUserPermissions();
  const [budgets, setBudgets] = useState<BudgetModel[]>([]);
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetModel | null>(null);

  const [formData, setFormData] = useState({
    category: "Maintenance", planned: 0, spent: 0,
    year: new Date().getFullYear(), month: new Date().getMonth() + 1,
  });

  const [snackbar, setSnackbar] = useState({
    open: false, message: "", severity: "success" as "success" | "error",
  });

  const categories = ["Maintenance", "Procurement", "Utilities", "Events", "Projects", "Cleaning Supplies", "IT Equipment"];

  const loadData = async () => {
    try {
      setLoading(true);
      const [budgetsData, summaryData] = await Promise.all([budgetService.getAll(), budgetService.getSummary()]);
      setBudgets(budgetsData);
      setSummary(summaryData);
    } catch (error) {
      console.error("Error loading budget data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleOpenDialog = (budget?: BudgetModel) => {
    if (budget) {
      setEditingBudget(budget);
      setFormData({ category: budget.category, planned: budget.planned, spent: budget.spent, year: budget.year, month: budget.month });
    } else {
      setEditingBudget(null);
      setFormData({ category: "Maintenance", planned: 0, spent: 0, year: new Date().getFullYear(), month: new Date().getMonth() + 1 });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingBudget(null);
  };

  const handleSave = async () => {
    try {
      if (editingBudget) {
        await budgetService.update(editingBudget.id, formData);
        setSnackbar({ open: true, message: t("common.success"), severity: "success" });
      } else {
        await budgetService.create(formData);
        setSnackbar({ open: true, message: t("common.success"), severity: "success" });
      }
      handleCloseDialog();
      loadData();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || t("common.error");
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm(t("common.confirmDelete"))) {
      try {
        await budgetService.delete(id);
        setSnackbar({ open: true, message: t("common.success"), severity: "success" });
        loadData();
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || t("common.error");
        setSnackbar({ open: true, message: errorMessage, severity: "error" });
      }
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
            💰 {t("budget.title")}
          </Typography>
          <Typography sx={{ color: "text.secondary" }}>{t("budget.subtitle")}</Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadData}>{t("common.refresh")}</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>{t("budget.addBudget")}</Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: "#e3f2fd" }}>
            <CardContent>
              <Typography variant="body2">{t("budget.planned")}</Typography>
              <Typography variant="h4" fontWeight="bold">R$ {summary?.planned?.toFixed(2) || "0.00"}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: "#fff3e0" }}>
            <CardContent>
              <Typography variant="body2">{t("budget.spent")}</Typography>
              <Typography variant="h4" fontWeight="bold">R$ {summary?.spent?.toFixed(2) || "0.00"}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: "#e8f5e9" }}>
            <CardContent>
              <Typography variant="body2">{t("budget.remaining")}</Typography>
              <Typography variant="h4" fontWeight="bold">R$ {summary?.remaining?.toFixed(2) || "0.00"}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: "#f5f5f5" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>{t("budget.category")}</TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold" }}>{t("budget.planned")}</TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold" }}>{t("budget.spent")}</TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold" }}>{t("budget.remaining")}</TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold" }}>{t("common.actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {budgets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">{t("budget.noItems")}</TableCell>
              </TableRow>
            ) : (
              budgets.map((b) => (
                <TableRow key={b.id} hover>
                  <TableCell sx={{ fontWeight: "medium" }}>{b.category}</TableCell>
                  <TableCell align="right">R$ {b.planned?.toFixed(2)}</TableCell>
                  <TableCell align="right">R$ {b.spent?.toFixed(2)}</TableCell>
                  <TableCell align="right" sx={{ color: b.planned - b.spent < 0 ? "error.main" : "success.main", fontWeight: "bold" }}>
                    R$ {(b.planned - b.spent).toFixed(2)}
                  </TableCell>
                  <TableCell align="center">
                    {canEdit(b.createdBy) && (
                      <Tooltip title={t("common.edit")}>
                        <IconButton size="small" color="primary" onClick={() => handleOpenDialog(b)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {canDelete(b.createdBy) && (
                      <Tooltip title={t("common.delete")}>
                        <IconButton size="small" color="error" onClick={() => handleDelete(b.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: "#1a237e", color: "white" }}>
          {editingBudget ? t("budget.editBudget") : t("budget.addBudget")}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField select fullWidth margin="dense" label={t("budget.category")} value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
            {categories.map((cat) => (<MenuItem key={cat} value={cat}>{cat}</MenuItem>))}
          </TextField>
          <TextField fullWidth margin="dense" label={t("budget.planned")} type="number" value={formData.planned} onChange={(e) => setFormData({ ...formData, planned: Number(e.target.value) })} />
          <TextField fullWidth margin="dense" label={t("budget.spent")} type="number" value={formData.spent} onChange={(e) => setFormData({ ...formData, spent: Number(e.target.value) })} />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog}>{t("common.cancel")}</Button>
          <Button variant="contained" onClick={handleSave} sx={{ bgcolor: "#1a237e" }}>
            {editingBudget ? t("common.update") : t("common.save")}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}

export default BudgetPage;