import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Snackbar,
  Alert,
  LinearProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import { budgetService } from "../../services/budgetService";
import type { Budget as BudgetModel, BudgetSummary } from "../../services/budgetService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function BudgetPage() {
  const [budgets, setBudgets] = useState<BudgetModel[]>([]);
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const [formData, setFormData] = useState({
    category: "",
    planned: 0,
    spent: 0,
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });

  const showSnackbar = (
    message: string,
    severity: "success" | "error"
  ) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const loadData = async () => {
    try {
      setLoading(true);

      const [budgetsData, summaryData] = await Promise.all([
        budgetService.getAll(),
        budgetService.getSummary(),
      ]);

      setBudgets(budgetsData);
      setSummary(summaryData);
    } catch (error) {
      console.error("Error loading budget:", error);
      showSnackbar("Failed to load budget", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveBudget = async () => {
    try {
      await budgetService.create(formData);

      showSnackbar(
        "Budget created successfully!",
        "success"
      );

      setOpenDialog(false);
      loadData();
    } catch (error) {
      console.error("Error saving budget:", error);
      showSnackbar("Failed to save budget", "error");
    }
  };

  const categories = [
    "Maintenance",
    "Procurement",
    "Utilities",
    "Events",
    "Projects",
  ];

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          py: 8,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const categoryData =
    summary?.categories.map((cat) => ({
      name: cat.category,
      planned: cat.planned,
      spent: cat.spent,
    })) || [];

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              color: "#1a237e",
            }}
          >
            💰 Budget
          </Typography>

          <Typography
            sx={{
              color: "text.secondary",
            }}
          >
            Planned vs spent
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 2,
          }}
        >
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadData}
          >
            Refresh
          </Button>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Add Budget
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ bgcolor: "#e3f2fd" }}>
            <CardContent>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary" }}
              >
                Planned
              </Typography>

              <Typography
                variant="h4"
                sx={{
                  fontWeight: "bold",
                  color: "#1976d2",
                }}
              >
                R$ {summary?.planned.toFixed(2) || "0.00"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ bgcolor: "#fff3e0" }}>
            <CardContent>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary" }}
              >
                Spent
              </Typography>

              <Typography
                variant="h4"
                sx={{
                  fontWeight: "bold",
                  color: "#ff9800",
                }}
              >
                R$ {summary?.spent.toFixed(2) || "0.00"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ bgcolor: "#e8f5e9" }}>
            <CardContent>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary" }}
              >
                Remaining
              </Typography>

              <Typography
                variant="h4"
                sx={{
                  fontWeight: "bold",
                  color: "#4caf50",
                }}
              >
                R$ {summary?.remaining.toFixed(2) || "0.00"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                mb: 2,
              }}
            >
              Budget by Category
            </Typography>

            <ResponsiveContainer
              width="100%"
              height={300}
            >
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />

                <Bar
                  dataKey="planned"
                  fill="#1976d2"
                />

                <Bar
                  dataKey="spent"
                  fill="#ff9800"
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                mb: 2,
              }}
            >
              Budget Utilization
            </Typography>

            <Box sx={{ p: 2 }}>
              {summary?.categories.map((cat) => (
                <Box
                  key={cat.category}
                  sx={{ mb: 2 }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                    }}
                  >
                    <Typography variant="body2">
                      {cat.category}
                    </Typography>

                    <Typography variant="body2">
                      {cat.planned > 0
                        ? (
                            (cat.spent /
                              cat.planned) *
                            100
                          ).toFixed(0)
                        : 0}
                      %
                    </Typography>
                  </Box>

                  <LinearProgress
                    variant="determinate"
                    value={
                      cat.planned > 0
                        ? Math.min(
                            (cat.spent /
                              cat.planned) *
                              100,
                            100
                          )
                        : 0
                    }
                    sx={{
                      height: 8,
                      borderRadius: 4,
                    }}
                    color={
                      cat.spent > cat.planned
                        ? "error"
                        : "primary"
                    }
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            mb: 2,
          }}
        >
          Budget Details
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow
                sx={{ bgcolor: "#f5f5f5" }}
              >
                <TableCell>Category</TableCell>
                <TableCell align="right">
                  Planned
                </TableCell>
                <TableCell align="right">
                  Spent
                </TableCell>
                <TableCell align="right">
                  Remaining
                </TableCell>
                <TableCell>Month</TableCell>
                <TableCell>Year</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {budgets.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    align="center"
                  >
                    No budget entries found
                  </TableCell>
                </TableRow>
              ) : (
                budgets.map((budget) => (
                  <TableRow key={budget.id}>
                    <TableCell>
                      {budget.category}
                    </TableCell>

                    <TableCell align="right">
                      R${" "}
                      {budget.planned.toFixed(2)}
                    </TableCell>

                    <TableCell align="right">
                      R${" "}
                      {budget.spent.toFixed(2)}
                    </TableCell>

                    <TableCell
                      align="right"
                      sx={{
                        color:
                          budget.planned -
                            budget.spent <
                          0
                            ? "error.main"
                            : "success.main",
                      }}
                    >
                      R${" "}
                      {(
                        budget.planned -
                        budget.spent
                      ).toFixed(2)}
                    </TableCell>

                    <TableCell>
                      {new Date(
                        2000,
                        budget.month - 1
                      ).toLocaleString(
                        "default",
                        {
                          month: "long",
                        }
                      )}
                    </TableCell>

                    <TableCell>
                      {budget.year}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Add Budget Entry
        </DialogTitle>

        <DialogContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              mt: 1,
            }}
          >
            <TextField
              select
              label="Category"
              fullWidth
              required
              value={formData.category}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  category: e.target.value,
                })
              }
            >
              {categories.map((cat) => (
                <MenuItem
                  key={cat}
                  value={cat}
                >
                  {cat}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Planned Amount"
              type="number"
              fullWidth
              required
              value={formData.planned}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  planned: Number(
                    e.target.value
                  ),
                })
              }
            />

            <TextField
              label="Spent Amount"
              type="number"
              fullWidth
              required
              value={formData.spent}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  spent: Number(
                    e.target.value
                  ),
                })
              }
            />

            <TextField
              label="Year"
              type="number"
              fullWidth
              required
              value={formData.year}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  year: Number(
                    e.target.value
                  ),
                })
              }
            />

            <TextField
              select
              label="Month"
              fullWidth
              required
              value={formData.month}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  month: Number(
                    e.target.value
                  ),
                })
              }
            >
              {Array.from(
                { length: 12 },
                (_, i) => i + 1
              ).map((month) => (
                <MenuItem
                  key={month}
                  value={month}
                >
                  {new Date(
                    2000,
                    month - 1
                  ).toLocaleString(
                    "default",
                    {
                      month: "long",
                    }
                  )}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setOpenDialog(false)
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSaveBudget}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() =>
          setSnackbar({
            ...snackbar,
            open: false,
          })
        }
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() =>
            setSnackbar({
              ...snackbar,
              open: false,
            })
          }
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default BudgetPage;