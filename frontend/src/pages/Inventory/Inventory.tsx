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
  Chip,
  Button,
  CircularProgress,
  TextField,
  InputAdornment,
  LinearProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import WarningIcon from "@mui/icons-material/Warning";
import { inventoryService } from "../../services/inventoryService";
import type { InventoryItem } from "../../services/inventoryService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

function Inventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    lowStock: 0,
    categories: 0,
  });
  const [purchaseVsConsumption, setPurchaseVsConsumption] = useState<any[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [itemsData, consumptionData] = await Promise.all([
        inventoryService.getAll(),
        inventoryService.getPurchaseVsConsumption(),
      ]);
      setItems(itemsData);
      setFilteredItems(itemsData);
      setPurchaseVsConsumption(consumptionData);
      setStats({
        total: itemsData.length,
        lowStock: itemsData.filter((i) => i.quantity <= i.minStock).length,
        categories: new Set(itemsData.map((i) => i.category)).size,
      });
    } catch (error) {
      console.error("Error loading inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const filtered = items.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredItems(filtered);
  }, [searchQuery, items]);

  const getStatusColor = (item: InventoryItem) => {
    if (item.quantity <= item.minStock) return "error";
    if (item.quantity <= item.minStock * 1.5) return "warning";
    return "success";
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  // Chart data for purchase vs consumption
  const chartData = purchaseVsConsumption.map((item) => ({
    name: item.month,
    "Purchase": item.purchase,
    "Consumption": item.consumption,
  }));

  // Inventory category data
  const categoryData = items.reduce((acc: any[], item) => {
    const existing = acc.find((c) => c.name === item.category);
    if (existing) {
      existing.value += item.quantity;
    } else {
      acc.push({ name: item.category, value: item.quantity });
    }
    return acc;
  }, []);

  const COLORS = ["#1976d2", "#2196f3", "#4caf50", "#ff9800", "#9c27b0"];

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            📦 Inventory Management
          </Typography>
          <Typography color="text.secondary">
            Track inventory, consumption, and purchase vs consumption analysis
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadData}
        >
          Refresh
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: "#f5f5f5" }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Total Items
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: 4, borderColor: "error.main" }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Low Stock Items
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="error.main">
                {stats.lowStock}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: 4, borderColor: "secondary.main" }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Categories
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="secondary.main">
                {stats.categories}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: 4, borderColor: "info.main" }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Purchase vs Consumption
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="info.main">
                {purchaseVsConsumption.length > 0
                  ? `${((purchaseVsConsumption[purchaseVsConsumption.length - 1]?.purchase || 0) / 
                      (purchaseVsConsumption[purchaseVsConsumption.length - 1]?.consumption || 1) * 100).toFixed(0)}%`
                  : "N/A"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              📊 Purchase vs Consumption Trend
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" mb={2}>
              Compare monthly purchases with actual consumption
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Purchase" fill="#1976d2" />
                <Bar dataKey="Consumption" fill="#ff9800" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              📈 Inventory by Category
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Items Table */}
      <Paper sx={{ p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <TextField
            placeholder="Search inventory..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ width: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Typography variant="body2" color="text.secondary">
            {filteredItems.length} items found
          </Typography>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell>Min Stock</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Purchase Price</TableCell>
                <TableCell align="right">Consumption</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No items found
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item.id} sx={{ "&:hover": { bgcolor: "#fafafa" } }}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {item.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={item.category} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="bold">
                        {item.quantity}
                      </Typography>
                    </TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>{item.minStock}</TableCell>
                    <TableCell>
                      <Chip
                        label={item.quantity <= item.minStock ? "Low Stock" : "In Stock"}
                        size="small"
                        color={getStatusColor(item)}
                      />
                      {item.quantity <= item.minStock && (
                        <WarningIcon color="error" fontSize="small" sx={{ ml: 1 }} />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      ${item.purchasePrice.toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      <Box>
                        <Typography variant="body2">{item.consumption}</Typography>
                        <LinearProgress
                          variant="determinate"
                          value={(item.consumption / (item.purchasePrice || 1)) * 100}
                          sx={{ height: 4, borderRadius: 2 }}
                        />
                      </Box>
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

export default Inventory;