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
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import * as XLSX from "xlsx";
import { getEmployees } from "../../services/employeeService";
import type { Employee } from "../../services/employeeService";

function Reports() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getEmployees();
        setEmployees(data);
      } catch (error) {
        console.error("Error loading employees:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const exportToExcel = () => {
    const data = employees.map(emp => ({
      "First Name": emp.firstName,
      "Last Name": emp.lastName,
      "Email": emp.email,
      "Department": emp.department,
      "Status": emp.status,
      "Created": new Date(emp.createdAt).toLocaleDateString(),
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employees");
    XLSX.writeFile(wb, `Employees_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToPDF = () => {
    window.print();
  };

  const stats = {
    total: employees.length,
    active: employees.filter(e => e.status === "Active").length,
    inactive: employees.filter(e => e.status !== "Active").length,
    departments: new Set(employees.map(e => e.department)).size,
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Reports
          </Typography>
          <Typography color="text.secondary">
            Generate and export reports
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={exportToExcel}
          >
            Export Excel
          </Button>
          <Button
            variant="outlined"
            startIcon={<PictureAsPdfIcon />}
            onClick={exportToPDF}
          >
            Export PDF
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            transition: "transform 0.3s, box-shadow 0.3s",
            "&:hover": {
              transform: "translateY(-8px)",
              boxShadow: "0 8px 30px rgba(0,0,0,0.12)"
            }
          }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Total Employees
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="primary">
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            borderLeft: 4, 
            borderColor: "success.main",
            transition: "transform 0.3s, box-shadow 0.3s",
            "&:hover": {
              transform: "translateY(-8px)",
              boxShadow: "0 8px 30px rgba(0,0,0,0.12)"
            }
          }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Active Employees
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {stats.active}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            borderLeft: 4, 
            borderColor: "error.main",
            transition: "transform 0.3s, box-shadow 0.3s",
            "&:hover": {
              transform: "translateY(-8px)",
              boxShadow: "0 8px 30px rgba(0,0,0,0.12)"
            }
          }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Inactive Employees
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="error.main">
                {stats.inactive}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            borderLeft: 4, 
            borderColor: "secondary.main",
            transition: "transform 0.3s, box-shadow 0.3s",
            "&:hover": {
              transform: "translateY(-8px)",
              boxShadow: "0 8px 30px rgba(0,0,0,0.12)"
            }
          }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Departments
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="secondary.main">
                {stats.departments}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Employee Report Table */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Employee Report
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                <TableCell>#</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Joined</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No employees found
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((emp, index) => (
                  <TableRow key={emp.id} sx={{ "&:hover": { bgcolor: "#fafafa" } }}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {emp.firstName} {emp.lastName}
                      </Typography>
                    </TableCell>
                    <TableCell>{emp.email}</TableCell>
                    <TableCell>
                      <Chip label={emp.department} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={emp.status}
                        size="small"
                        color={emp.status === "Active" ? "success" : "error"}
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(emp.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}

export default Reports;