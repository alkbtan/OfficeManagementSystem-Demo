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
import FolderIcon from "@mui/icons-material/Folder";
import { documentService } from "../../services/documentService";
import type { Document } from "../../services/documentService";

function Documents() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    category: "",
    description: "",
    fileSize: 0,
    filePath: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await documentService.getAll();
      setDocuments(data);
    } catch (error) {
      console.error("Error loading documents:", error);
      showSnackbar("Failed to load documents", "error");
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

  const handleOpenDialog = (doc?: Document) => {
    if (doc) {
      setEditingDocument(doc);
      setFormData({
        name: doc.name,
        type: doc.type,
        category: doc.category,
        description: doc.description,
        fileSize: doc.fileSize,
        filePath: doc.filePath,
      });
    } else {
      setEditingDocument(null);
      setFormData({
        name: "",
        type: "",
        category: "",
        description: "",
        fileSize: 0,
        filePath: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingDocument(null);
  };

  const handleSaveDocument = async () => {
    try {
      if (editingDocument) {
        await documentService.update(editingDocument.id, formData);
        showSnackbar("Document updated successfully!", "success");
      } else {
        await documentService.create(formData);
        showSnackbar("Document created successfully!", "success");
      }
      handleCloseDialog();
      loadData();
    } catch (error) {
      console.error("Error saving document:", error);
      showSnackbar("Failed to save document", "error");
    }
  };

  const handleDeleteDocument = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      try {
        await documentService.delete(id);
        showSnackbar("Document deleted successfully!", "success");
        loadData();
      } catch (error) {
        console.error("Error deleting document:", error);
        showSnackbar("Failed to delete document", "error");
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
            📁 Documents
          </Typography>
          <Typography sx={{ color: "text.secondary" }}>
            {documents.length} documents
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadData}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            New Document
          </Button>
        </Box>
      </Box>

      <Grid container spacing={2}>
        {documents.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <Typography sx={{ color: "text.secondary" }}>No documents found</Typography>
            </Paper>
          </Grid>
        ) : (
          documents.map((doc) => (
            <Grid item xs={12} md={6} lg={4} key={doc.id}>
              <Card sx={{
                borderRadius: 2,
                transition: "transform 0.2s",
                "&:hover": { transform: "translateY(-4px)" }
              }}>
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                        {doc.name}
                      </Typography>
                      <Chip
                        label={doc.type}
                        size="small"
                        variant="outlined"
                        sx={{ mt: 0.5 }}
                      />
                      <Chip
                        label={doc.category}
                        size="small"
                        color="primary"
                        sx={{ mt: 0.5, ml: 0.5 }}
                      />
                    </Box>
                    <Box>
                      <IconButton size="small" color="primary" onClick={() => handleOpenDialog(doc)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteDocument(doc.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
                    {doc.description}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      📄 {formatFileSize(doc.fileSize)}
                    </Typography>
                    <Typography variant="body2">
                      📅 {new Date(doc.uploadDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingDocument ? "Edit Document" : "New Document"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Document Name"
              fullWidth
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              label="Type"
              fullWidth
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              placeholder="Invoice, Contract, Report, Plan"
            />
            <TextField
              label="Category"
              fullWidth
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
              label="File Size (KB)"
              type="number"
              fullWidth
              value={formData.fileSize}
              onChange={(e) => setFormData({ ...formData, fileSize: Number(e.target.value) })}
            />
            <TextField
              label="File Path"
              fullWidth
              value={formData.filePath}
              onChange={(e) => setFormData({ ...formData, filePath: e.target.value })}
              placeholder="/documents/file.pdf"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveDocument}>
            {editingDocument ? "Update" : "Create"}
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

export default Documents;