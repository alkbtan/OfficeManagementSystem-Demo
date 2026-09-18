import { useEffect, useState } from "react";
import {
  Box, Typography, Grid, Card, CardContent, Paper, Button, IconButton,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Snackbar, Alert, Chip, InputAdornment,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { useTranslation } from "react-i18next";
import { documentService } from "../../services/documentService";
import type { Document } from "../../services/documentService";

function Documents() {
  const { t } = useTranslation();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false, message: "", severity: "success" as "success" | "error" | "info" | "warning",
  });
  const [openSupplierDialog, setOpenSupplierDialog] = useState(false);
  const [newSupplier, setNewSupplier] = useState("");

  const documentTypes = ["Quotation", "Purchase Request", "Approval"];
  const categories = ["Office Supplies", "Maintenance", "Furniture", "Cleaning", "Events", "Other"];

  const [suppliers, setSuppliers] = useState<string[]>(["Sonda", "Sales", "Mercado Livre", "Kalunga", "ARTECOOL"]);
  const statuses = ["Pending Approval", "Approved", "Rejected", "Paid"];

  const [formData, setFormData] = useState({
    name: "", type: "", category: "", supplier: "", date: "",
    amount: 0, status: "", description: "", fileSize: 0,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await documentService.getAll();
      setDocuments(data);
    } catch (error) {
      console.error("Error loading documents:", error);
      showSnackbar(t("common.error"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const showSnackbar = (message: string, severity: "success" | "error" | "info" | "warning") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenDialog = (doc?: Document) => {
    if (doc) {
      setEditingDocument(doc);
      setFormData({
        name: doc.name, type: doc.type, category: doc.category,
        supplier: doc.supplier, date: doc.date, amount: doc.amount,
        status: doc.status, description: doc.description || "", fileSize: doc.fileSize || 0,
      });
    } else {
      setEditingDocument(null);
      setFormData({ name: "", type: "", category: "", supplier: "", date: "", amount: 0, status: "", description: "", fileSize: 0 });
    }
    setSelectedFile(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingDocument(null);
    setSelectedFile(null);
  };

  const handleSaveDocument = async () => {
    if (!formData.name.trim()) { showSnackbar(t("documents.documentName") + " " + t("common.required"), "error"); return; }
    if (!formData.type) { showSnackbar(t("documents.type") + " " + t("common.required"), "error"); return; }
    if (!formData.category) { showSnackbar(t("documents.category") + " " + t("common.required"), "error"); return; }
    if (!formData.supplier) { showSnackbar(t("documents.supplier") + " " + t("common.required"), "error"); return; }
    if (!formData.date) { showSnackbar(t("documents.date") + " " + t("common.required"), "error"); return; }

    try {
      const payload = new FormData();
      payload.append("Id", String(editingDocument?.id ?? 0));
      payload.append("Name", formData.name);
      payload.append("Type", formData.type);
      payload.append("Category", formData.category);
      payload.append("Supplier", formData.supplier);
      payload.append("Date", formData.date);
      payload.append("Amount", String(formData.amount));
      payload.append("Status", formData.status);
      payload.append("Description", formData.description || "");
      payload.append("FileSize", String(formData.fileSize || 0));

      if (selectedFile) payload.append("file", selectedFile);

      if (editingDocument) {
        await documentService.update(editingDocument.id, payload);
        showSnackbar(t("common.success"), "success");
      } else {
        await documentService.create(payload);
        showSnackbar(t("common.success"), "success");
      }

      await loadData();
      handleCloseDialog();
    } catch (error: any) {
      console.error("Error saving document:", error);
      const errorMessage = typeof error?.response?.data === "string" ? error.response.data : error?.response?.data?.message || error?.message || t("common.error");
      showSnackbar(errorMessage, "error");
    }
  };

  const handleDeleteDocument = async (id: number) => {
    if (window.confirm(t("common.confirmDelete"))) {
      try {
        await documentService.delete(id);
        showSnackbar(t("common.success"), "success");
        loadData();
      } catch (error) {
        console.error("Error deleting document:", error);
        showSnackbar(t("common.error"), "error");
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleAddSupplier = () => {
    if (newSupplier.trim()) {
      setSuppliers([...suppliers, newSupplier.trim()]);
      setFormData({ ...formData, supplier: newSupplier.trim() });
      setNewSupplier("");
      setOpenSupplierDialog(false);
      showSnackbar(t("common.success"), "success");
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
            📁 {t("documents.title")}
          </Typography>
          <Typography sx={{ color: "text.secondary" }}>
            {documents.length} {t("documents.subtitle")}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadData}>{t("common.refresh")}</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>{t("documents.newDocument")}</Button>
        </Box>
      </Box>

      <Grid container spacing={2}>
        {documents.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <Typography sx={{ color: "text.secondary" }}>{t("common.noItems")}</Typography>
            </Paper>
          </Grid>
        ) : (
          documents.map((doc) => (
            <Grid item xs={12} md={6} lg={4} key={doc.id}>
              <Card sx={{ borderRadius: 2, transition: "transform 0.2s", "&:hover": { transform: "translateY(-4px)" } }}>
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: "bold" }}>{doc.name}</Typography>
                      <Chip label={doc.type} size="small" variant="outlined" sx={{ mt: 0.5 }} />
                      <Chip label={doc.category} size="small" color="primary" sx={{ mt: 0.5, ml: 0.5 }} />
                      <Chip
                        label={doc.status}
                        size="small"
                        color={doc.status === "Approved" ? "success" : doc.status === "Pending Approval" ? "warning" : doc.status === "Rejected" ? "error" : "info"}
                        sx={{ mt: 0.5, ml: 0.5 }}
                      />
                    </Box>
                    <Box>
                      <IconButton size="small" color="primary" onClick={() => handleOpenDialog(doc)}><EditIcon /></IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteDocument(doc.id)}><DeleteIcon /></IconButton>
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>{doc.description}</Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2">📄 {formatFileSize(doc.fileSize)} • {doc.supplier}</Typography>
                    <Typography variant="body2">💰 ${doc.amount.toFixed(2)}</Typography>
                    <Typography variant="body2">📅 {new Date(doc.date).toLocaleDateString()}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: "#1a237e", color: "white" }}>
          {editingDocument ? `✏️ ${t("documents.editDocument")}` : `📄 ${t("documents.newDocument")}`}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField label={t("documents.documentName")} fullWidth required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select label={t("documents.type")} fullWidth required value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                {documentTypes.map((type) => (<MenuItem key={type} value={type}>{type}</MenuItem>))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select label={t("documents.category")} fullWidth required value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                {categories.map((cat) => (<MenuItem key={cat} value={cat}>{cat}</MenuItem>))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField select label={t("documents.supplier")} fullWidth required value={formData.supplier} onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}>
                {suppliers.map((sup) => (<MenuItem key={sup} value={sup}>{sup}</MenuItem>))}
                <MenuItem value="add-new" onClick={() => setOpenSupplierDialog(true)} sx={{ color: "primary.main", fontWeight: "bold" }}>
                  <AddIcon fontSize="small" /> {t("documents.addNewSupplier")}
                </MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label={t("documents.date")} type="date" fullWidth required value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label={t("documents.amount")} type="number" fullWidth required value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })} InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} />
            </Grid>
            <Grid item xs={12}>
              <TextField select label={t("common.status")} fullWidth required value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                {statuses.map((status) => (<MenuItem key={status} value={status}>{status}</MenuItem>))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField label={t("documents.description")} fullWidth multiline rows={2} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <Button variant="outlined" component="label" startIcon={<AttachFileIcon />} fullWidth sx={{ py: 1.5 }}>
                {selectedFile ? selectedFile.name : t("documents.uploadFile")}
                <input type="file" hidden accept=".pdf,.doc,.docx,.xls,.xlsx" onChange={(e) => { if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]); }} />
              </Button>
              {selectedFile && (
                <Typography variant="caption" sx={{ color: "success.main", display: "block", mt: 0.5 }}>
                  ✅ {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </Typography>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={handleCloseDialog} variant="outlined" color="inherit">{t("common.cancel")}</Button>
          <Button variant="contained" onClick={handleSaveDocument} sx={{ bgcolor: "#1a237e" }}>
            {editingDocument ? t("common.update") : t("common.create")}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openSupplierDialog} onClose={() => setOpenSupplierDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{t("documents.addNewSupplier")}</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label={t("documents.supplier")} fullWidth value={newSupplier} onChange={(e) => setNewSupplier(e.target.value)} onKeyPress={(e) => { if (e.key === "Enter") handleAddSupplier(); }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSupplierDialog(false)}>{t("common.cancel")}</Button>
          <Button variant="contained" onClick={handleAddSupplier}>{t("common.add")}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}

export default Documents;