import { useEffect, useState } from "react";
import {
  Box, Typography, Grid, Card, CardContent, Paper, Button, IconButton,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Snackbar, Alert, Chip, LinearProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useTranslation } from "react-i18next";
import { inventoryService } from "../../services/inventoryService";
import type { InventoryItem } from "../../services/inventoryService";

function Inventory() {
  const { t } = useTranslation();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false, message: "", severity: "success" as "success" | "error",
  });

  const categories = ["Cleaning Supplies", "Bathroom Supplies", "Office Supplies", "Cleaning Materials", "Event Supplies", "Kitchen Supplies"];

  const [formData, setFormData] = useState({
    name: "", category: "", quantity: 0, minStock: 0,
    unit: "", supplier: "", purchaseDate: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await inventoryService.getAll();
      setItems(data);
    } catch (error) {
      console.error("Error loading inventory:", error);
      showSnackbar(t("common.error"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenDialog = (item?: InventoryItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name || "", category: item.category || "",
        quantity: item.quantity || 0, minStock: item.minStock || 0,
        unit: item.unit || "", supplier: item.supplier || "",
        purchaseDate: item.purchaseDate ? item.purchaseDate.split("T")[0] : "",
      });
    } else {
      setEditingItem(null);
      setFormData({ name: "", category: "", quantity: 0, minStock: 0, unit: "", supplier: "", purchaseDate: "" });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
  };

  const handleSaveItem = async () => {
    if (!formData.name.trim()) { showSnackbar(t("common.name") + " " + t("common.required"), "error"); return; }
    if (!formData.category) { showSnackbar(t("common.category") + " " + t("common.required"), "error"); return; }
    if (formData.quantity < 0) { showSnackbar(t("common.error"), "error"); return; }

    try {
      const quantity = Number(formData.quantity) || 0;
      const minStock = Number(formData.minStock) || 0;

      let calculatedStatus = "In Stock";
      if (quantity <= 0) calculatedStatus = "Out of Stock";
      else if (quantity < minStock) calculatedStatus = "Low Stock";

      const dataToSend = {
        name: formData.name, category: formData.category,
        quantity, minStock, unit: formData.unit || "",
        supplier: formData.supplier || "",
        purchaseDate: formData.purchaseDate ? new Date(formData.purchaseDate).toISOString() : null,
        status: calculatedStatus,
      };

      if (editingItem) {
        await inventoryService.update(editingItem.id, dataToSend);
        showSnackbar(t("common.success"), "success");
      } else {
        await inventoryService.create(dataToSend);
        showSnackbar(t("common.success"), "success");
      }
      handleCloseDialog();
      loadData();
    } catch (error: any) {
      console.error("Error saving inventory item:", error);
      const errorMessage = error?.response?.data?.message || t("common.error");
      showSnackbar(errorMessage, "error");
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (window.confirm(t("common.confirmDelete"))) {
      try {
        await inventoryService.delete(id);
        showSnackbar(t("common.success"), "success");
        loadData();
      } catch (error) {
        console.error("Error deleting inventory item:", error);
        showSnackbar(t("common.error"), "error");
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Stock": return "success";
      case "Low Stock": return "warning";
      case "Out of Stock": return "error";
      default: return "default";
    }
  };

  const getStockPercentage = (item: InventoryItem) => {
    const max = item.minStock * 3 || item.quantity + 10;
    return Math.min((item.quantity / max) * 100, 100);
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
            📦 {t("inventory.title")}
          </Typography>
          <Typography sx={{ color: "text.secondary" }}>
            {items.length} {t("inventory.subtitle")}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadData}>{t("common.refresh")}</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>{t("inventory.addItem")}</Button>
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>{t("inventory.totalItems")}</Typography>
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>{items.length}</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>{t("inventory.inStock")}</Typography>
            <Typography variant="h5" sx={{ fontWeight: "bold", color: "success.main" }}>
              {items.filter(i => i.status === "In Stock").length}
            </Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>{t("inventory.lowStock")}</Typography>
            <Typography variant="h5" sx={{ fontWeight: "bold", color: "warning.main" }}>
              {items.filter(i => i.status === "Low Stock").length}
            </Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>{t("inventory.outOfStock")}</Typography>
            <Typography variant="h5" sx={{ fontWeight: "bold", color: "error.main" }}>
              {items.filter(i => i.status === "Out of Stock").length}
            </Typography>
          </CardContent></Card>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {items.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <Typography sx={{ color: "text.secondary" }}>{t("common.noItems")}</Typography>
            </Paper>
          </Grid>
        ) : (
          items.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card sx={{ borderRadius: 2, transition: "transform 0.2s", "&:hover": { transform: "translateY(-4px)" } }}>
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: "bold" }}>{item.name}</Typography>
                      <Chip label={item.category} size="small" variant="outlined" sx={{ mt: 0.5 }} />
                      <Chip label={item.status} size="small" color={getStatusColor(item.status) as any} sx={{ mt: 0.5, ml: 0.5 }} />
                    </Box>
                    <Box>
                      <IconButton size="small" color="primary" onClick={() => handleOpenDialog(item)}><EditIcon /></IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteItem(item.id)}><DeleteIcon /></IconButton>
                    </Box>
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2">📦 {t("inventory.quantity")}: <strong>{item.quantity} {item.unit}</strong></Typography>
                    <Typography variant="body2">📉 {t("inventory.minStock")}: <strong>{item.minStock} {item.unit}</strong></Typography>
                    {item.supplier && <Typography variant="body2">🏭 {t("inventory.supplier")}: <strong>{item.supplier}</strong></Typography>}
                    {item.purchaseDate && <Typography variant="body2">📅 {t("inventory.purchaseDate")}: <strong>{new Date(item.purchaseDate).toLocaleDateString()}</strong></Typography>}
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>{t("inventory.stockLevel")}</Typography>
                      <Typography variant="caption" sx={{ fontWeight: "bold" }}>{Math.round(getStockPercentage(item))}%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={getStockPercentage(item)}
                      sx={{
                        height: 8, borderRadius: 4, backgroundColor: "#e0e0e0",
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 4,
                          backgroundColor: item.status === "In Stock" ? "#4caf50" : item.status === "Low Stock" ? "#ff9800" : "#f44336",
                        },
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: "#1a237e", color: "white" }}>
          {editingItem ? `✏️ ${t("inventory.editItem")}` : `➕ ${t("inventory.addItem")}`}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField label={t("inventory.itemName")} fullWidth required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            <TextField select label={t("common.category")} fullWidth required value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
              {categories.map((cat) => (<MenuItem key={cat} value={cat}>{cat}</MenuItem>))}
            </TextField>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField label={t("inventory.quantity")} type="number" fullWidth required value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label={t("inventory.unit")} fullWidth value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} />
              </Grid>
            </Grid>
            <TextField label={t("inventory.minStock")} type="number" fullWidth required value={formData.minStock} onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })} />
            <TextField label={t("inventory.supplier")} fullWidth value={formData.supplier} onChange={(e) => setFormData({ ...formData, supplier: e.target.value })} />
            <TextField label={t("inventory.purchaseDate")} type="date" fullWidth value={formData.purchaseDate} onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })} InputLabelProps={{ shrink: true }} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={handleCloseDialog} variant="outlined" color="inherit">{t("common.cancel")}</Button>
          <Button variant="contained" onClick={handleSaveItem} sx={{ bgcolor: "#1a237e" }}>
            {editingItem ? t("common.update") : t("common.add")}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}

export default Inventory;