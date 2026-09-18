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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useTranslation } from "react-i18next";
import { procurementService } from "../../services/procurementService";
import type { ProcurementRequest } from "../../services/procurementService";

const departments = ["QA", "Office", "HR", "IT", "Diretoria", "Secretary", "Other"];
const floors = ["7th", "15th", "17th", "18th", "19th"];
const projects = ["Blizzard", "Blizz", "Hearth", "BRLEF", "Diretoria", "Valkyrie"];
const classifications = ["One-Time Payment", "Recurring Monthly Expense", "Installment Payment"];
const paymentMethods = ["PIX", "Boleto", "Mercado Livre", "Kalunga", "Account Payment"];
const priorities = ["Critical", "High", "Medium", "Low"];
const statuses = [
  "Collecting Information",
  "Awaiting Approval",
  "Approved",
  "Awaiting Payment",
  "Payment in Progress",
  "Payment Completed",
  "Awaiting Payment Receipt",
  "Awaiting Delivery",
  "Order Completed",
  "Disregard",
];

const defaultFormData = {
  requestNumber: "",
  item: "",
  itemId: "",
  requesterName: "",
  department: "QA",
  floor: "17th",
  project: "Blizzard",
  responsible: "",
  briefDescription: "",
  supplier: "",
  productLink: "",
  unitPrice: 0,
  quantity: 1,
  shippingCost: 0,
  total: 0,
  classification: "One-Time Payment",
  paymentMethod: "PIX",
  priority: "Medium",
  status: "Collecting Information",
  formDate: new Date().toISOString().split("T")[0],
  purchaseDeadline: "",
  approvedBy: "",
  approvalDate: "",
  approvalDocumentPath: "",
  ticketLink: "",
  invoiceNumber: "",
  boletoDueDate: "",
  paymentDate: "",
  boletoFilePath: "",
  paymentReceiptPath: "",
  expectedDeliveryDate: "",
  purchaseDataFilePath: "",
};

function Procurement() {
  const { t } = useTranslation();
  const [requests, setRequests] = useState<ProcurementRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRequest, setEditingRequest] = useState<ProcurementRequest | null>(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await procurementService.getAll();
      setRequests(data);
    } catch (error) {
      setSnackbar({ open: true, message: t("procurement.failedLoad"), severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const unitPrice = parseFloat(formData.unitPrice as any) || 0;
    const quantity = parseFloat(formData.quantity as any) || 0;
    const shipping = parseFloat(formData.shippingCost as any) || 0;
    const total = unitPrice * quantity + shipping;
    setFormData((prev) => ({ ...prev, total }));
  }, [formData.unitPrice, formData.quantity, formData.shippingCost]);

  const handleOpenDialog = (request?: ProcurementRequest) => {
    if (request) {
      setEditingRequest(request);
      setFormData({
        ...request,
        formDate: request.formDate ? request.formDate.split("T")[0] : "",
        purchaseDeadline: request.purchaseDeadline ? request.purchaseDeadline.split("T")[0] : "",
        approvalDate: request.approvalDate ? request.approvalDate.split("T")[0] : "",
        boletoDueDate: request.boletoDueDate ? request.boletoDueDate.split("T")[0] : "",
        paymentDate: request.paymentDate ? request.paymentDate.split("T")[0] : "",
        expectedDeliveryDate: request.expectedDeliveryDate ? request.expectedDeliveryDate.split("T")[0] : "",
      });
    } else {
      setEditingRequest(null);
      const randomSeq = Math.floor(100 + Math.random() * 900);
      setFormData({
        ...defaultFormData,
        requestNumber: `PR-26-${randomSeq}`,
        formDate: new Date().toISOString().split("T")[0],
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingRequest(null);
  };

  const handleSave = async () => {
    if (!formData.item.trim()) {
      setSnackbar({ open: true, message: t("procurement.itemRequired"), severity: "error" });
      return;
    }
    if (!formData.requesterName.trim()) {
      setSnackbar({ open: true, message: t("procurement.requesterRequired"), severity: "error" });
      return;
    }

    try {
      const payload = {
        requestNumber: formData.requestNumber,
        item: formData.item,
        itemId: formData.itemId || "",
        requesterName: formData.requesterName,
        department: formData.department,
        floor: formData.floor,
        project: formData.project,
        responsible: formData.responsible || "",
        briefDescription: formData.briefDescription || "",
        supplier: formData.supplier || "",
        productLink: formData.productLink || "",
        unitPrice: Number(formData.unitPrice) || 0,
        quantity: Number(formData.quantity) || 0,
        shippingCost: Number(formData.shippingCost) || 0,
        total: Number(formData.total) || 0,
        classification: formData.classification,
        paymentMethod: formData.paymentMethod,
        priority: formData.priority,
        status: formData.status,
        formDate: formData.formDate ? new Date(formData.formDate).toISOString() : new Date().toISOString(),
        purchaseDeadline: formData.purchaseDeadline ? new Date(formData.purchaseDeadline).toISOString() : null,
        approvedBy: formData.approvedBy || "",
        approvalDate: formData.approvalDate ? new Date(formData.approvalDate).toISOString() : null,
        approvalDocumentPath: formData.approvalDocumentPath || "",
        ticketLink: formData.ticketLink || "",
        invoiceNumber: formData.invoiceNumber || "",
        boletoDueDate: formData.boletoDueDate ? new Date(formData.boletoDueDate).toISOString() : null,
        paymentDate: formData.paymentDate ? new Date(formData.paymentDate).toISOString() : null,
        boletoFilePath: formData.boletoFilePath || "",
        paymentReceiptPath: formData.paymentReceiptPath || "",
        expectedDeliveryDate: formData.expectedDeliveryDate ? new Date(formData.expectedDeliveryDate).toISOString() : null,
        purchaseDataFilePath: formData.purchaseDataFilePath || "",
      };

      if (editingRequest) {
        await procurementService.update(editingRequest.id, payload);
        setSnackbar({ open: true, message: t("procurement.requestUpdated"), severity: "success" });
      } else {
        await procurementService.create(payload);
        setSnackbar({ open: true, message: t("procurement.requestCreated"), severity: "success" });
      }
      handleCloseDialog();
      loadData();
    } catch (error: any) {
      console.error("Error saving procurement request:", error);
      const errorMessage = error?.response?.data?.message || t("procurement.failedSave");
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm(t("procurement.confirmDelete"))) {
      try {
        await procurementService.delete(id);
        setSnackbar({ open: true, message: t("procurement.requestDeleted"), severity: "success" });
        loadData();
      } catch (error) {
        setSnackbar({ open: true, message: t("procurement.failedDelete"), severity: "error" });
      }
    }
  };

  const totalSpend = requests.reduce((sum, item) => sum + (item.total || 0), 0);

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
            🛒 {t("procurement.title")}
          </Typography>
          <Typography sx={{ color: "text.secondary" }}>
            {t("procurement.subtitle")}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadData}>
            {t("common.refresh")}
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            {t("procurement.newRequest")}
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <Card sx={{ bgcolor: "#ffffff", border: "1px solid #e0e0e0", borderRadius: 2 }}>
            <CardContent>
              <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: "bold" }}>
                {t("procurement.totalRequests")}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: "bold", mt: 1, color: "#1a237e" }}>
                {requests.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card sx={{ bgcolor: "#ffffff", border: "1px solid #e0e0e0", borderRadius: 2 }}>
            <CardContent>
              <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: "bold" }}>
                {t("procurement.totalAmount")}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: "bold", mt: 1, color: "#2e7d32" }}>
                R$ {totalSpend.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ borderRadius: 2, overflow: "hidden", border: "1px solid #e0e0e0" }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: "#f5f5f5" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>{t("procurement.requestNumber")}</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>{t("procurement.item")}</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>{t("procurement.requesterName")}</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>{t("procurement.department")}</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>{t("procurement.floor")}</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>{t("procurement.total")}</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>{t("procurement.status")}</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>{t("procurement.priority")}</TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="center">{t("common.actions")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 3, color: "text.secondary" }}>
                    {t("procurement.noRequests")}
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((req) => (
                  <TableRow key={req.id} hover>
                    <TableCell sx={{ fontWeight: "bold" }}>{req.requestNumber}</TableCell>
                    <TableCell>{req.item}</TableCell>
                    <TableCell>{req.requesterName}</TableCell>
                    <TableCell>{req.department}</TableCell>
                    <TableCell>{req.floor}</TableCell>
                    <TableCell sx={{ fontWeight: "bold", color: "#1a237e" }}>
                      R$ {req.total?.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Chip label={req.status} size="small" color="primary" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={req.priority}
                        size="small"
                        color={
                          req.priority === "Critical"
                            ? "error"
                            : req.priority === "High"
                            ? "warning"
                            : "default"
                        }
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" color="primary" onClick={() => handleOpenDialog(req)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(req.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: "#1a237e", color: "white", fontWeight: "bold" }}>
          {editingRequest ? t("procurement.editRequest") : t("procurement.newRequest")}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}>

            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#1a237e", mb: 1.5 }}>
                {t("procurement.section1")}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField label={t("procurement.requestNumber")} fullWidth disabled value={formData.requestNumber} helperText={t("procurement.requestNumberHelper")} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label={`${t("procurement.item")} *`} fullWidth required value={formData.item} onChange={(e) => setFormData({ ...formData, item: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label={t("procurement.itemId")} fullWidth value={formData.itemId} onChange={(e) => setFormData({ ...formData, itemId: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label={`${t("procurement.requesterName")} *`} fullWidth required value={formData.requesterName} onChange={(e) => setFormData({ ...formData, requesterName: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField select label={t("procurement.department")} fullWidth value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })}>
                    {departments.map((dept) => (<MenuItem key={dept} value={dept}>{dept}</MenuItem>))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField select label={t("procurement.floor")} fullWidth value={formData.floor} onChange={(e) => setFormData({ ...formData, floor: e.target.value })}>
                    {floors.map((fl) => (<MenuItem key={fl} value={fl}>{fl}</MenuItem>))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField select label={t("procurement.project")} fullWidth value={formData.project} onChange={(e) => setFormData({ ...formData, project: e.target.value })}>
                    {projects.map((proj) => (<MenuItem key={proj} value={proj}>{proj}</MenuItem>))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label={t("procurement.responsible")} fullWidth placeholder={t("procurement.responsiblePlaceholder")} value={formData.responsible} onChange={(e) => setFormData({ ...formData, responsible: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label={t("procurement.briefDescription")} fullWidth value={formData.briefDescription} onChange={(e) => setFormData({ ...formData, briefDescription: e.target.value })} />
                </Grid>
              </Grid>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#1a237e", mb: 1.5 }}>
                {t("procurement.section2")}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField label={t("procurement.supplier")} fullWidth value={formData.supplier} onChange={(e) => setFormData({ ...formData, supplier: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label={t("procurement.productLink")} fullWidth value={formData.productLink} onChange={(e) => setFormData({ ...formData, productLink: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField label={t("procurement.unitPrice")} type="number" fullWidth value={formData.unitPrice} onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField label={t("procurement.quantity")} type="number" fullWidth value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField label={t("procurement.shippingCost")} type="number" fullWidth value={formData.shippingCost} onChange={(e) => setFormData({ ...formData, shippingCost: Number(e.target.value) })} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField label={t("procurement.total")} fullWidth disabled value={`R$ ${formData.total.toFixed(2)}`} helperText={t("procurement.totalHelper")} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField select label={t("procurement.classification")} fullWidth value={formData.classification} onChange={(e) => setFormData({ ...formData, classification: e.target.value })}>
                    {classifications.map((cl) => (<MenuItem key={cl} value={cl}>{cl}</MenuItem>))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField select label={t("procurement.paymentMethod")} fullWidth value={formData.paymentMethod} onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}>
                    {paymentMethods.map((pm) => (<MenuItem key={pm} value={pm}>{pm}</MenuItem>))}
                  </TextField>
                </Grid>
              </Grid>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#1a237e", mb: 1.5 }}>
                {t("procurement.section3")}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField select label={t("procurement.priority")} fullWidth value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
                    {priorities.map((pr) => (<MenuItem key={pr} value={pr}>{pr}</MenuItem>))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField select label={t("procurement.status")} fullWidth value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                    {statuses.map((st) => (<MenuItem key={st} value={st}>{st}</MenuItem>))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField label={t("procurement.formDate")} type="date" fullWidth value={formData.formDate} onChange={(e) => setFormData({ ...formData, formDate: e.target.value })} InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label={t("procurement.purchaseDeadline")} type="date" fullWidth value={formData.purchaseDeadline} onChange={(e) => setFormData({ ...formData, purchaseDeadline: e.target.value })} InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label={t("procurement.ticketLink")} fullWidth placeholder={t("procurement.ticketLinkPlaceholder")} value={formData.ticketLink} onChange={(e) => setFormData({ ...formData, ticketLink: e.target.value })} />
                </Grid>
              </Grid>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#1a237e", mb: 1.5 }}>
                {t("procurement.section4")}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField label={t("procurement.approvedBy")} fullWidth value={formData.approvedBy} onChange={(e) => setFormData({ ...formData, approvedBy: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField label={t("procurement.approvalDate")} type="date" fullWidth value={formData.approvalDate} onChange={(e) => setFormData({ ...formData, approvalDate: e.target.value })} InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField label={t("procurement.approvalDocument")} fullWidth placeholder={t("procurement.approvalDocumentPlaceholder")} value={formData.approvalDocumentPath} onChange={(e) => setFormData({ ...formData, approvalDocumentPath: e.target.value })} InputProps={{ endAdornment: (<IconButton component="label" size="small"><CloudUploadIcon /><input type="file" hidden onChange={(e) => { if (e.target.files?.[0]) setFormData({ ...formData, approvalDocumentPath: e.target.files[0].name }); }} /></IconButton>) }} />
                </Grid>
              </Grid>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#1a237e", mb: 1.5 }}>
                {t("procurement.section5")}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField label={t("procurement.invoiceNumber")} fullWidth value={formData.invoiceNumber} onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField label={t("procurement.boletoDueDate")} type="date" fullWidth value={formData.boletoDueDate} onChange={(e) => setFormData({ ...formData, boletoDueDate: e.target.value })} InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField label={t("procurement.paymentDate")} type="date" fullWidth value={formData.paymentDate} onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })} InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label={t("procurement.boletoFile")} fullWidth placeholder={t("procurement.boletoFilePlaceholder")} value={formData.boletoFilePath} onChange={(e) => setFormData({ ...formData, boletoFilePath: e.target.value })} InputProps={{ endAdornment: (<IconButton component="label" size="small"><CloudUploadIcon /><input type="file" hidden onChange={(e) => { if (e.target.files?.[0]) setFormData({ ...formData, boletoFilePath: e.target.files[0].name }); }} /></IconButton>) }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label={t("procurement.paymentReceipt")} fullWidth placeholder={t("procurement.paymentReceiptPlaceholder")} value={formData.paymentReceiptPath} onChange={(e) => setFormData({ ...formData, paymentReceiptPath: e.target.value })} InputProps={{ endAdornment: (<IconButton component="label" size="small"><CloudUploadIcon /><input type="file" hidden onChange={(e) => { if (e.target.files?.[0]) setFormData({ ...formData, paymentReceiptPath: e.target.files[0].name }); }} /></IconButton>) }} />
                </Grid>
              </Grid>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#1a237e", mb: 1.5 }}>
                {t("procurement.section6")}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField label={t("procurement.expectedDeliveryDate")} type="date" fullWidth value={formData.expectedDeliveryDate} onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })} InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label={t("procurement.purchaseDataFile")} fullWidth placeholder={t("procurement.purchaseDataFilePlaceholder")} value={formData.purchaseDataFilePath} onChange={(e) => setFormData({ ...formData, purchaseDataFilePath: e.target.value })} InputProps={{ endAdornment: (<IconButton component="label" size="small"><CloudUploadIcon /><input type="file" hidden onChange={(e) => { if (e.target.files?.[0]) setFormData({ ...formData, purchaseDataFilePath: e.target.files[0].name }); }} /></IconButton>) }} />
                </Grid>
              </Grid>
            </Box>

          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={handleCloseDialog} variant="outlined" color="inherit">
            {t("common.cancel")}
          </Button>
          <Button variant="contained" onClick={handleSave} sx={{ bgcolor: "#1a237e" }}>
            {editingRequest ? t("procurement.updateRequest") : t("procurement.createRequest")}
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

export default Procurement;