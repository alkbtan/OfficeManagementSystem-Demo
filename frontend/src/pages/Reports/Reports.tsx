import { useEffect, useState } from "react";
import {
  Box, Typography, Grid, Card, CardContent, Paper, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Chip, FormControl, InputLabel, Select, MenuItem,
  Checkbox, ListItemText, OutlinedInput, Divider, Alert, Snackbar,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import RefreshIcon from "@mui/icons-material/Refresh";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useTranslation } from "react-i18next";

import { getEmployees } from "../../services/employeeService";
import { assetService } from "../../services/assetService";
import { lockerService } from "../../services/lockerService";
import { acService } from "../../services/acService";
import { ticketService } from "../../services/ticketService";
import { procurementService } from "../../services/procurementService";
import { inventoryService } from "../../services/inventoryService";

function Reports() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [selectedSections, setSelectedSections] = useState<string[]>([
    "employees", "assets", "lockers", "acs", "tickets", "procurement", "inventory",
  ]);
  const [reportData, setReportData] = useState<any>({});
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  const reportSections = [
    { id: "employees", label: t("reports.sections.employees") },
    { id: "assets", label: t("reports.sections.assets") },
    { id: "lockers", label: t("reports.sections.lockers") },
    { id: "acs", label: t("reports.sections.acs") },
    { id: "tickets", label: t("reports.sections.tickets") },
    { id: "procurement", label: t("reports.sections.procurement") },
    { id: "inventory", label: t("reports.sections.inventory") },
  ];

  const loadAllData = async () => {
    try {
      setLoading(true);
      const data: any = {};

      if (selectedSections.includes("employees")) data.employees = await getEmployees();
      if (selectedSections.includes("assets")) data.assets = await assetService.getAll();
      if (selectedSections.includes("lockers")) data.lockers = await lockerService.getAll();
      if (selectedSections.includes("acs")) data.acs = await acService.getAll();
      if (selectedSections.includes("tickets")) data.tickets = await ticketService.getAll();
      if (selectedSections.includes("procurement")) data.procurement = await procurementService.getAll();
      if (selectedSections.includes("inventory")) data.inventory = await inventoryService.getAll();

      setReportData(data);
    } catch (error) {
      console.error("Error loading report data:", error);
      setSnackbar({ open: true, message: t("reports.failedLoad"), severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [selectedSections]);

  const exportToExcel = () => {
    try {
      const wb = XLSX.utils.book_new();

      if (selectedSections.includes("employees") && reportData.employees?.length) {
        const ws = XLSX.utils.json_to_sheet(
          reportData.employees.map((e: any) => ({
            Name: `${e.firstName} ${e.lastName}`,
            Department: e.department,
            Email: e.email,
            Location: e.location || "-",
            Status: e.status,
          }))
        );
        XLSX.utils.book_append_sheet(wb, ws, "Employees");
      }

      if (selectedSections.includes("assets") && reportData.assets?.length) {
        const ws = XLSX.utils.json_to_sheet(
          reportData.assets.map((a: any) => ({
            Name: a.name, Type: a.type, Model: a.model || "-",
            Serial: a.serialNumber || "-", Status: a.status,
            Location: a.location || "-", AssignedTo: a.assignedTo || "Unassigned",
          }))
        );
        XLSX.utils.book_append_sheet(wb, ws, "Assets");
      }

      if (selectedSections.includes("lockers") && reportData.lockers?.length) {
        const ws = XLSX.utils.json_to_sheet(
          reportData.lockers.map((l: any) => ({
            Number: l.number, Location: l.location, Status: l.status,
            LockType: l.lockType, AssignedTo: l.assignedToName || l.assignedTo || "Unassigned",
          }))
        );
        XLSX.utils.book_append_sheet(wb, ws, "Lockers");
      }

      if (selectedSections.includes("acs") && reportData.acs?.length) {
        const ws = XLSX.utils.json_to_sheet(
          reportData.acs.map((ac: any) => ({
            Name: ac.name, Location: ac.location, Brand: ac.brand,
            CapacityBTU: ac.capacity, Status: ac.status,
          }))
        );
        XLSX.utils.book_append_sheet(wb, ws, "AC Units");
      }

      if (selectedSections.includes("tickets") && reportData.tickets?.length) {
        const ws = XLSX.utils.json_to_sheet(
          reportData.tickets.map((t: any) => ({
            Title: t.title, Priority: t.priority, Status: t.status,
            Floor: t.floor || "-", Company: t.company || "-", Amount: t.amount,
          }))
        );
        XLSX.utils.book_append_sheet(wb, ws, "Maintenance");
      }

      if (selectedSections.includes("procurement") && reportData.procurement?.length) {
        const ws = XLSX.utils.json_to_sheet(
          reportData.procurement.map((p: any) => ({
            RequestNumber: p.requestNumber, Item: p.item, Requester: p.requesterName,
            Department: p.department, Supplier: p.supplier || "-",
            Total: p.total, Status: p.status,
          }))
        );
        XLSX.utils.book_append_sheet(wb, ws, "Procurement");
      }

      if (selectedSections.includes("inventory") && reportData.inventory?.length) {
        const ws = XLSX.utils.json_to_sheet(
          reportData.inventory.map((i: any) => ({
            Name: i.name, Category: i.category, Quantity: i.quantity,
            Unit: i.unit, MinStock: i.minStock, Status: i.status,
          }))
        );
        XLSX.utils.book_append_sheet(wb, ws, "Inventory");
      }

      XLSX.writeFile(wb, `TestFlyQA_Report_${new Date().toISOString().split("T")[0]}.xlsx`);
      setSnackbar({ open: true, message: t("reports.excelExported"), severity: "success" });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: t("reports.excelFailed"), severity: "error" });
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFillColor(26, 35, 126);
      doc.rect(0, 0, 210, 24, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(15);
      doc.text(`TestFlyQA - ${t("reports.title")}`, 14, 16);

      doc.setTextColor(120, 120, 120);
      doc.setFontSize(9);
      doc.text(`${t("reports.generatedBy")}: Kinoura Youssef (kinour.youssef@testflyqa.com)`, 14, 30);
      doc.text(`${t("reports.date")}: ${new Date().toLocaleString()}`, 14, 35);

      let currentY = 42;

      if (selectedSections.includes("employees") && reportData.employees?.length) {
        doc.setTextColor(26, 35, 126);
        doc.setFontSize(12);
        doc.text(t("reports.sections.employees"), 14, currentY);
        autoTable(doc, {
          startY: currentY + 3,
          head: [["Name", "Department", "Email", "Status"]],
          body: reportData.employees.map((e: any) => [`${e.firstName} ${e.lastName}`, e.department, e.email, e.status]),
          headStyles: { fillColor: [26, 35, 126] },
          styles: { fontSize: 8 },
        });
        currentY = (doc as any).lastAutoTable.finalY + 10;
      }

      if (selectedSections.includes("assets") && reportData.assets?.length) {
        if (currentY > 230) { doc.addPage(); currentY = 20; }
        doc.setTextColor(26, 35, 126);
        doc.setFontSize(12);
        doc.text(t("reports.sections.assets"), 14, currentY);
        autoTable(doc, {
          startY: currentY + 3,
          head: [["Name", "Type", "Location", "Status", "Assigned To"]],
          body: reportData.assets.map((a: any) => [a.name, a.type, a.location || "-", a.status, a.assignedTo || "Unassigned"]),
          headStyles: { fillColor: [26, 35, 126] },
          styles: { fontSize: 8 },
        });
        currentY = (doc as any).lastAutoTable.finalY + 10;
      }

      if (selectedSections.includes("lockers") && reportData.lockers?.length) {
        if (currentY > 230) { doc.addPage(); currentY = 20; }
        doc.setTextColor(26, 35, 126);
        doc.setFontSize(12);
        doc.text(t("reports.sections.lockers"), 14, currentY);
        autoTable(doc, {
          startY: currentY + 3,
          head: [["Number", "Location", "Status", "Lock Type", "Assigned To"]],
          body: reportData.lockers.map((l: any) => [l.number, l.location, l.status, l.lockType, l.assignedToName || l.assignedTo || "Unassigned"]),
          headStyles: { fillColor: [26, 35, 126] },
          styles: { fontSize: 8 },
        });
        currentY = (doc as any).lastAutoTable.finalY + 10;
      }

      if (selectedSections.includes("acs") && reportData.acs?.length) {
        if (currentY > 230) { doc.addPage(); currentY = 20; }
        doc.setTextColor(26, 35, 126);
        doc.setFontSize(12);
        doc.text(t("reports.sections.acs"), 14, currentY);
        autoTable(doc, {
          startY: currentY + 3,
          head: [["Name", "Location", "Brand", "Capacity", "Status"]],
          body: reportData.acs.map((ac: any) => [ac.name, ac.location, ac.brand, `${ac.capacity} BTU`, ac.status]),
          headStyles: { fillColor: [26, 35, 126] },
          styles: { fontSize: 8 },
        });
        currentY = (doc as any).lastAutoTable.finalY + 10;
      }

      if (selectedSections.includes("tickets") && reportData.tickets?.length) {
        if (currentY > 230) { doc.addPage(); currentY = 20; }
        doc.setTextColor(26, 35, 126);
        doc.setFontSize(12);
        doc.text(t("reports.sections.tickets"), 14, currentY);
        autoTable(doc, {
          startY: currentY + 3,
          head: [["Title", "Floor", "Company", "Priority", "Status"]],
          body: reportData.tickets.map((t: any) => [t.title, t.floor || "-", t.company || "-", t.priority, t.status]),
          headStyles: { fillColor: [26, 35, 126] },
          styles: { fontSize: 8 },
        });
        currentY = (doc as any).lastAutoTable.finalY + 10;
      }

      if (selectedSections.includes("procurement") && reportData.procurement?.length) {
        if (currentY > 230) { doc.addPage(); currentY = 20; }
        doc.setTextColor(26, 35, 126);
        doc.setFontSize(12);
        doc.text(t("reports.sections.procurement"), 14, currentY);
        autoTable(doc, {
          startY: currentY + 3,
          head: [["Request #", "Item", "Requester", "Total", "Status"]],
          body: reportData.procurement.map((p: any) => [p.requestNumber, p.item, p.requesterName, `R$ ${(p.total || 0).toFixed(2)}`, p.status]),
          headStyles: { fillColor: [26, 35, 126] },
          styles: { fontSize: 8 },
        });
        currentY = (doc as any).lastAutoTable.finalY + 10;
      }

      if (selectedSections.includes("inventory") && reportData.inventory?.length) {
        if (currentY > 230) { doc.addPage(); currentY = 20; }
        doc.setTextColor(26, 35, 126);
        doc.setFontSize(12);
        doc.text(t("reports.sections.inventory"), 14, currentY);
        autoTable(doc, {
          startY: currentY + 3,
          head: [["Item", "Category", "Qty", "Min Stock", "Status"]],
          body: reportData.inventory.map((i: any) => [i.name, i.category, `${i.quantity} ${i.unit}`, i.minStock, i.status]),
          headStyles: { fillColor: [26, 35, 126] },
          styles: { fontSize: 8 },
        });
      }

      doc.save(`TestFlyQA_Report_${new Date().toISOString().split("T")[0]}.pdf`);
      setSnackbar({ open: true, message: t("reports.pdfExported"), severity: "success" });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: t("reports.pdfFailed"), severity: "error" });
    }
  };

  const handleSectionChange = (event: any) => {
    const value = event.target.value;
    if (value.includes("all")) {
      if (selectedSections.length === reportSections.length) setSelectedSections([]);
      else setSelectedSections(reportSections.map((s) => s.id));
    } else {
      setSelectedSections(value);
    }
  };

  const getTotalItems = () => {
    let total = 0;
    if (selectedSections.includes("employees") && reportData.employees) total += reportData.employees.length;
    if (selectedSections.includes("assets") && reportData.assets) total += reportData.assets.length;
    if (selectedSections.includes("lockers") && reportData.lockers) total += reportData.lockers.length;
    if (selectedSections.includes("acs") && reportData.acs) total += reportData.acs.length;
    if (selectedSections.includes("tickets") && reportData.tickets) total += reportData.tickets.length;
    if (selectedSections.includes("procurement") && reportData.procurement) total += reportData.procurement.length;
    if (selectedSections.includes("inventory") && reportData.inventory) total += reportData.inventory.length;
    return total;
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: "bold", color: "#1a237e" }}>
            📊 {t("reports.title")}
          </Typography>
          <Typography sx={{ color: "text.secondary" }}>
            {new Date().toLocaleDateString()}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadAllData}>
            {t("common.refresh")}
          </Button>
          <Button variant="contained" startIcon={<DownloadIcon />} onClick={exportToExcel}>
            {t("reports.exportExcel")}
          </Button>
          <Button variant="contained" color="secondary" startIcon={<PictureAsPdfIcon />} onClick={exportToPDF}>
            {t("reports.exportPDF")}
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
          <Typography variant="body1" sx={{ fontWeight: "bold", minWidth: 120 }}>
            {t("reports.selectSections")}
          </Typography>
          <FormControl sx={{ minWidth: 320 }}>
            <InputLabel>{t("reports.reportSections")}</InputLabel>
            <Select
              multiple
              value={selectedSections}
              onChange={handleSectionChange}
              input={<OutlinedInput label={t("reports.reportSections")} />}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((value) => {
                    const section = reportSections.find((s) => s.id === value);
                    return section ? <Chip key={value} label={section.label} size="small" /> : null;
                  })}
                </Box>
              )}
            >
              <MenuItem value="all">
                <Checkbox checked={selectedSections.length === reportSections.length} />
                <ListItemText primary={t("reports.selectAll")} />
              </MenuItem>
              <Divider />
              {reportSections.map((section) => (
                <MenuItem key={section.id} value={section.id}>
                  <Checkbox checked={selectedSections.includes(section.id)} />
                  <ListItemText primary={section.label} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {t("reports.totalItems")}: <strong>{getTotalItems()}</strong>
          </Typography>
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
          {t("reports.detailedReport")}
        </Typography>

        {selectedSections.includes("employees") && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#1a237e", mb: 1 }}>
              {t("reports.sections.employees")} ({reportData.employees?.length || 0})
            </Typography>
            <TableContainer sx={{ border: "1px solid #e0e0e0", borderRadius: 1 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>{t("common.name")}</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>{t("employees.department")}</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>{t("employees.email")}</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>{t("common.status")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.employees?.map((emp: any) => (
                    <TableRow key={emp.id}>
                      <TableCell>{emp.firstName} {emp.lastName}</TableCell>
                      <TableCell>{emp.department}</TableCell>
                      <TableCell>{emp.email}</TableCell>
                      <TableCell><Chip label={emp.status} size="small" color={emp.status === "Active" ? "success" : "default"} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {selectedSections.includes("assets") && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#1a237e", mb: 1 }}>
              {t("reports.sections.assets")} ({reportData.assets?.length || 0})
            </Typography>
            <TableContainer sx={{ border: "1px solid #e0e0e0", borderRadius: 1 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>{t("common.name")}</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>{t("common.type")}</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>{t("common.location")}</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>{t("common.status")}</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>{t("assets.assignedTo")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.assets?.map((a: any) => (
                    <TableRow key={a.id}>
                      <TableCell>{a.name}</TableCell>
                      <TableCell>{a.type}</TableCell>
                      <TableCell>{a.location || "-"}</TableCell>
                      <TableCell><Chip label={a.status} size="small" variant="outlined" /></TableCell>
                      <TableCell>{a.assignedTo || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {selectedSections.includes("lockers") && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#1a237e", mb: 1 }}>
              {t("reports.sections.lockers")} ({reportData.lockers?.length || 0})
            </Typography>
            <TableContainer sx={{ border: "1px solid #e0e0e0", borderRadius: 1 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>{t("lockers.lockerNumber")}</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>{t("common.location")}</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>{t("lockers.lockType")}</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>{t("common.status")}</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>{t("assets.assignedTo")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.lockers?.map((l: any) => (
                    <TableRow key={l.id}>
                      <TableCell>#{l.number}</TableCell>
                      <TableCell>{l.location}</TableCell>
                      <TableCell>{l.lockType}</TableCell>
                      <TableCell><Chip label={l.status} size="small" color={l.status === "Available" ? "success" : "warning"} /></TableCell>
                      <TableCell>{l.assignedToName || l.assignedTo || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {selectedSections.includes("acs") && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#1a237e", mb: 1 }}>
              {t("reports.sections.acs")} ({reportData.acs?.length || 0})
            </Typography>
            <TableContainer sx={{ border: "1px solid #e0e0e0", borderRadius: 1 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>{t("common.name")}</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>{t("common.location")}</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>{t("ac.brand")}</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>{t("ac.capacity")}</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>{t("common.status")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.acs?.map((ac: any) => (
                    <TableRow key={ac.id}>
                      <TableCell>{ac.name}</TableCell>
                      <TableCell>{ac.location}</TableCell>
                      <TableCell>{ac.brand}</TableCell>
                      <TableCell>{ac.capacity} BTU</TableCell>
                      <TableCell><Chip label={ac.status} size="small" color={ac.status === "Operational" ? "success" : "error"} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {selectedSections.includes("tickets") && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#1a237e", mb: 1 }}>
              {t("reports.sections.tickets")} ({reportData.tickets?.length || 0})
            </Typography>
            <TableContainer sx={{ border: "1px solid #e0e0e0", borderRadius: 1 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>{t("maintenance.ticketTitle")}</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>{t("maintenance.company")}</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>{t("maintenance.floor")}</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>{t("common.priority")}</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>{t("common.status")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.tickets?.map((t: any) => (
                    <TableRow key={t.id}>
                      <TableCell>{t.title}</TableCell>
                      <TableCell>{t.company || "-"}</TableCell>
                      <TableCell>{t.floor || "-"}</TableCell>
                      <TableCell><Chip label={t.priority} size="small" color="info" /></TableCell>
                      <TableCell><Chip label={t.status} size="small" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {selectedSections.includes("procurement") && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#1a237e", mb: 1 }}>
              {t("reports.sections.procurement")} ({reportData.procurement?.length || 0})
            </Typography>
            <TableContainer sx={{ border: "1px solid #e0e0e0", borderRadius: 1 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>{t("procurement.requestNumber")}</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>{t("procurement.item")}</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>{t("procurement.requesterName")}</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>{t("procurement.total")}</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>{t("common.status")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.procurement?.map((p: any) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.requestNumber}</TableCell>
                      <TableCell>{p.item}</TableCell>
                      <TableCell>{p.requesterName}</TableCell>
                      <TableCell>R$ {(p.total || 0).toFixed(2)}</TableCell>
                      <TableCell><Chip label={p.status} size="small" color="primary" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {selectedSections.includes("inventory") && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#1a237e", mb: 1 }}>
              {t("reports.sections.inventory")} ({reportData.inventory?.length || 0})
            </Typography>
            <TableContainer sx={{ border: "1px solid #e0e0e0", borderRadius: 1 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>{t("inventory.itemName")}</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>{t("common.category")}</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>{t("inventory.quantity")}</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>{t("inventory.minStock")}</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>{t("common.status")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.inventory?.map((i: any) => (
                    <TableRow key={i.id}>
                      <TableCell>{i.name}</TableCell>
                      <TableCell>{i.category}</TableCell>
                      <TableCell>{i.quantity} {i.unit}</TableCell>
                      <TableCell>{i.minStock}</TableCell>
                      <TableCell><Chip label={i.status} size="small" color={i.status === "In Stock" ? "success" : "error"} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Paper>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}

export default Reports;