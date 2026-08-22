import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Divider,
  Alert,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import RefreshIcon from "@mui/icons-material/Refresh";
import * as XLSX from "xlsx";
import { getEmployees } from "../../services/employeeService";
import type { Employee } from "../../services/employeeService";

// Import all services
import { assetService } from "../../services/assetService";
import { lockerService } from "../../services/lockerService";
import { acService } from "../../services/acService";
import { ticketService } from "../../services/ticketService";
import { getAllProcurementRequests } from "../../services/procurementService";
import { inventoryService } from "../../services/inventoryService";

// Report sections
const reportSections = [
  { id: "employees", label: "Employees" },
  { id: "assets", label: "Assets" },
  { id: "lockers", label: "Lockers" },
  { id: "acs", label: "AC Units" },
  { id: "tickets", label: "Maintenance Tickets" },
  { id: "procurement", label: "Procurement" },
  { id: "inventory", label: "Inventory" },
];

function Reports() {
  // User info
  const user = {
    name: "Kinoura Youssef",
    email: "KinouraYoussef@testflyqa.com",
  };

  const [loading, setLoading] = useState(true);
  const [selectedSections, setSelectedSections] = useState<string[]>(["employees"]);
  const [reportData, setReportData] = useState<any>({});
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Load all data
  const loadAllData = async () => {
    try {
      setLoading(true);
      const data: any = {};

      if (selectedSections.includes("employees")) {
        data.employees = await getEmployees();
      }

      if (selectedSections.includes("assets")) {
        data.assets = await assetService.getAll();
      }

      if (selectedSections.includes("lockers")) {
        data.lockers = await lockerService.getAll();
      }

      if (selectedSections.includes("acs")) {
        data.acs = await acService.getAll();
      }

      if (selectedSections.includes("tickets")) {
        data.tickets = await ticketService.getAll();
      }

      if (selectedSections.includes("procurement")) {
        data.procurement = await getAllProcurementRequests();
      }

      if (selectedSections.includes("inventory")) {
        data.inventory = await inventoryService.getAll();
      }

      setReportData(data);
    } catch (error) {
      console.error("Error loading report data:", error);
      setSnackbar({
        open: true,
        message: "Failed to load report data",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [selectedSections]);

  // Export to Excel
  const exportToExcel = () => {
    const allData: any[] = [];

    // Employees
    if (reportData.employees) {
      reportData.employees.forEach((emp: any) => {
        allData.push({
          Section: "Employees",
          "Name": `${emp.firstName} ${emp.lastName}`,
          "Email": emp.email,
          "Department": emp.department,
          "Status": emp.status,
          "Created": new Date(emp.createdAt).toLocaleDateString(),
        });
      });
    }

    // Assets
    if (reportData.assets) {
      reportData.assets.forEach((asset: any) => {
        allData.push({
          Section: "Assets",
          "Name": asset.name,
          "Type": asset.type,
          "Model": asset.model,
          "Serial #": asset.serialNumber,
          "Status": asset.status,
          "Assigned To": asset.assignedTo || "Unassigned",
        });
      });
    }

    // Lockers
    if (reportData.lockers) {
      reportData.lockers.forEach((locker: any) => {
        allData.push({
          Section: "Lockers",
          "Number": locker.number,
          "Location": locker.location,
          "Status": locker.status,
          "Lock Type": locker.lockType,
          "Assigned To": locker.assignedToName || "Unassigned",
          "Biometric": locker.biometricEnabled ? "Yes" : "No",
        });
      });
    }

    // AC Units
    if (reportData.acs) {
      reportData.acs.forEach((ac: any) => {
        allData.push({
          Section: "AC Units",
          "Name": ac.name,
          "Location": ac.location,
          "Brand": ac.brand,
          "Capacity": `${ac.capacity} BTU`,
          "Status": ac.status,
          "Maintenance Count": ac.maintenanceCount,
          "Total Cost": `R$ ${ac.totalMaintenanceCost.toFixed(2)}`,
        });
      });
    }

    // Maintenance Tickets
    if (reportData.tickets) {
      reportData.tickets.forEach((ticket: any) => {
        allData.push({
          Section: "Maintenance",
          "Title": ticket.title,
          "Description": ticket.description,
          "Status": ticket.status,
          "Priority": ticket.priority,
          "Assigned To": ticket.assignedTo || "Unassigned",
          "Created": new Date(ticket.createdAt).toLocaleDateString(),
        });
      });
    }

    // Procurement
    if (reportData.procurement) {
      reportData.procurement.forEach((req: any) => {
        allData.push({
          Section: "Procurement",
          "Request #": req.requestNumber,
          "Department": req.department,
          "Requester": req.requester,
          "Vendor": req.vendor,
          "Items": req.items,
          "Total Amount": `R$ ${req.totalAmount.toFixed(2)}`,
          "Status": req.status,
        });
      });
    }

    // Inventory
    if (reportData.inventory) {
      reportData.inventory.forEach((item: any) => {
        allData.push({
          Section: "Inventory",
          "Item": item.name,
          "Category": item.category,
          "Quantity": `${item.quantity} ${item.unit}`,
          "Min Stock": item.minStock,
          "Status": item.status,
          "Purchase Price": `R$ ${item.purchasePrice.toFixed(2)}`,
        });
      });
    }

    const ws = XLSX.utils.json_to_sheet(allData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, `Report_${new Date().toISOString().split("T")[0]}.xlsx`);

    setSnackbar({
      open: true,
      message: "Report exported successfully!",
      severity: "success",
    });
  };

  const exportToPDF = () => {
    window.print();
  };

  const handleSectionChange = (event: any) => {
    const value = event.target.value;
    if (value.includes("all")) {
      setSelectedSections(reportSections.map((s) => s.id));
    } else {
      setSelectedSections(value);
    }
  };

  const getTotalItems = () => {
    let total = 0;
    if (reportData.employees) total += reportData.employees.length;
    if (reportData.assets) total += reportData.assets.length;
    if (reportData.lockers) total += reportData.lockers.length;
    if (reportData.acs) total += reportData.acs.length;
    if (reportData.tickets) total += reportData.tickets.length;
    if (reportData.procurement) total += reportData.procurement.length;
    if (reportData.inventory) total += reportData.inventory.length;
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
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: "bold", color: "#1a237e" }}>
            📊 Reports
          </Typography>
          <Typography sx={{ color: "text.secondary" }}>
            {new Date().toLocaleDateString()}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadAllData}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<DownloadIcon />} onClick={exportToExcel}>
            Export Excel
          </Button>
          <Button variant="outlined" startIcon={<PictureAsPdfIcon />} onClick={exportToPDF}>
            Export PDF
          </Button>
        </Box>
      </Box>

      {/* Section Selector */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
          <Typography variant="body1" sx={{ fontWeight: "bold", minWidth: 120 }}>
            Select Sections:
          </Typography>
          <FormControl sx={{ minWidth: 300 }}>
            <InputLabel>Report Sections</InputLabel>
            <Select
              multiple
              value={selectedSections}
              onChange={handleSectionChange}
              input={<OutlinedInput label="Report Sections" />}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((value) => {
                    const section = reportSections.find((s) => s.id === value);
                    return section ? (
                      <Chip key={value} label={section.label} size="small" />
                    ) : null;
                  })}
                </Box>
              )}
            >
              <MenuItem value="all">
                <Checkbox checked={selectedSections.length === reportSections.length} />
                <ListItemText primary="All Sections" />
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
            Total Items: <strong>{getTotalItems()}</strong>
          </Typography>
        </Box>
      </Paper>

      {/* Report Content */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
          Report Summary
        </Typography>

        {/* Summary Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {reportSections.map((section) => {
            const data = reportData[section.id];
            const count = data ? data.length : 0;
            return (
              <Grid item xs={12} sm={6} md={3} key={section.id}>
                <Card>
                  <CardContent>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      {section.label}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                      {count}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Employee Report Table (if selected) */}
        {selectedSections.includes("employees") && reportData.employees && reportData.employees.length > 0 && (
          <>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
              👥 Employees
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                    <TableCell>Name</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.employees.slice(0, 10).map((emp: any) => (
                    <TableRow key={emp.id}>
                      <TableCell>{emp.firstName} {emp.lastName}</TableCell>
                      <TableCell>{emp.department}</TableCell>
                      <TableCell>{emp.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={emp.status}
                          size="small"
                          color={emp.status === "Active" ? "success" : "error"}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {reportData.employees.length > 10 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          + {reportData.employees.length - 10} more employees
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Divider sx={{ my: 2 }} />
          </>
        )}

        {/* Assets Table (if selected) */}
        {selectedSections.includes("assets") && reportData.assets && reportData.assets.length > 0 && (
          <>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
              💻 Assets
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                    <TableCell>Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Model</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.assets.slice(0, 10).map((asset: any) => (
                    <TableRow key={asset.id}>
                      <TableCell>{asset.name}</TableCell>
                      <TableCell>{asset.type}</TableCell>
                      <TableCell>{asset.model}</TableCell>
                      <TableCell>
                        <Chip
                          label={asset.status}
                          size="small"
                          color={
                            asset.status === "Available" ? "success" :
                            asset.status === "In Use" ? "primary" :
                            asset.status === "Maintenance" ? "warning" : "error"
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {reportData.assets.length > 10 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          + {reportData.assets.length - 10} more assets
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Divider sx={{ my: 2 }} />
          </>
        )}

        {/* Lockers Table (if selected) */}
        {selectedSections.includes("lockers") && reportData.lockers && reportData.lockers.length > 0 && (
          <>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
              🗄️ Lockers
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                    <TableCell>Number</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Assigned To</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.lockers.slice(0, 10).map((locker: any) => (
                    <TableRow key={locker.id}>
                      <TableCell>{locker.number}</TableCell>
                      <TableCell>{locker.location}</TableCell>
                      <TableCell>
                        <Chip
                          label={locker.status}
                          size="small"
                          color={
                            locker.status === "Available" ? "success" :
                            locker.status === "Occupied" ? "primary" :
                            locker.status === "Maintenance" ? "warning" : "info"
                          }
                        />
                      </TableCell>
                      <TableCell>{locker.assignedToName || "Unassigned"}</TableCell>
                    </TableRow>
                  ))}
                  {reportData.lockers.length > 10 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          + {reportData.lockers.length - 10} more lockers
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Divider sx={{ my: 2 }} />
          </>
        )}

        {/* AC Units Table (if selected) */}
        {selectedSections.includes("acs") && reportData.acs && reportData.acs.length > 0 && (
          <>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
              ❄️ AC Units
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                    <TableCell>Name</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Brand</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.acs.slice(0, 10).map((ac: any) => (
                    <TableRow key={ac.id}>
                      <TableCell>{ac.name}</TableCell>
                      <TableCell>{ac.location}</TableCell>
                      <TableCell>{ac.brand}</TableCell>
                      <TableCell>
                        <Chip
                          label={ac.status}
                          size="small"
                          color={
                            ac.status === "Operational" ? "success" :
                            ac.status === "Under Maintenance" ? "warning" : "error"
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {reportData.acs.length > 10 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          + {reportData.acs.length - 10} more AC units
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Divider sx={{ my: 2 }} />
          </>
        )}

        {/* Maintenance Tickets Table (if selected) */}
        {selectedSections.includes("tickets") && reportData.tickets && reportData.tickets.length > 0 && (
          <>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
              🔧 Maintenance Tickets
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                    <TableCell>Title</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Assigned To</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.tickets.slice(0, 10).map((ticket: any) => (
                    <TableRow key={ticket.id}>
                      <TableCell>{ticket.title}</TableCell>
                      <TableCell>
                        <Chip
                          label={ticket.status}
                          size="small"
                          color={
                            ticket.status === "Closed" ? "success" :
                            ticket.status === "In Progress" ? "warning" : "info"
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={ticket.priority}
                          size="small"
                          color={
                            ticket.priority === "High" ? "error" :
                            ticket.priority === "Medium" ? "warning" : "info"
                          }
                        />
                      </TableCell>
                      <TableCell>{ticket.assignedTo || "Unassigned"}</TableCell>
                    </TableRow>
                  ))}
                  {reportData.tickets.length > 10 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          + {reportData.tickets.length - 10} more tickets
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Divider sx={{ my: 2 }} />
          </>
        )}

        {/* Procurement Table (if selected) */}
        {selectedSections.includes("procurement") && reportData.procurement && reportData.procurement.length > 0 && (
          <>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
              🛒 Procurement
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                    <TableCell>Request #</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Requester</TableCell>
                    <TableCell>Total Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.procurement.slice(0, 10).map((req: any) => (
                    <TableRow key={req.id}>
                      <TableCell>{req.requestNumber}</TableCell>
                      <TableCell>{req.department}</TableCell>
                      <TableCell>{req.requester}</TableCell>
                      <TableCell>R$ {req.totalAmount.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  {reportData.procurement.length > 10 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          + {reportData.procurement.length - 10} more requests
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Divider sx={{ my: 2 }} />
          </>
        )}

        {/* Inventory Table (if selected) */}
        {selectedSections.includes("inventory") && reportData.inventory && reportData.inventory.length > 0 && (
          <>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
              📦 Inventory
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                    <TableCell>Item</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.inventory.slice(0, 10).map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.quantity} {item.unit}</TableCell>
                      <TableCell>
                        <Chip
                          label={item.status}
                          size="small"
                          color={
                            item.status === "In Stock" ? "success" :
                            item.status === "Low Stock" ? "warning" : "error"
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {reportData.inventory.length > 10 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          + {reportData.inventory.length - 10} more items
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Divider sx={{ my: 2 }} />
          </>
        )}

        {!selectedSections.some((id) => reportData[id] && reportData[id].length > 0) && (
          <Alert severity="info">
            No data available for the selected sections. Please select different sections or add data first.
          </Alert>
        )}
      </Paper>
    </Box>
  );
}

export default Reports;