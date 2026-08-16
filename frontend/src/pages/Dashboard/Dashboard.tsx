import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  LinearProgress,
  CircularProgress,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import {
  People,
  AttachMoney,
  Build,
  MeetingRoom,
  Inventory,
  AcUnit,
  Assignment,
  ShoppingCart,
} from "@mui/icons-material";
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
  ComposedChart,
  Area,
} from "recharts";
import { dashboardService } from "../../services/dashboardService";
import { getEmployeesStats } from "../../services/employeeService";

const CHART_COLORS = ["#1976d2", "#ff9800", "#4caf50", "#f44336", "#9c27b0", "#00bcd4"];

function Dashboard() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    openTickets: 0,
    purchaseRequests: 0,
    totalBudget: 0,
    acUnits: 0,
    totalLockers: 0,
    occupiedLockers: 0,
    inventoryItems: 0,
    pendingMaintenance: 0,
  });
  const [monthlyExpenses, setMonthlyExpenses] = useState<any[]>([]);
  const [purchaseVsConsumption, setPurchaseVsConsumption] = useState<any[]>([]);
  const [maintenanceCosts, setMaintenanceCosts] = useState<any[]>([]);
  const [supplierPerformance, setSupplierPerformance] = useState<any[]>([]);
  const [officeRequests, setOfficeRequests] = useState<any[]>([]);

  const todayTasks = [
    { id: 1, task: "Repair Meeting Room AC", priority: "high", time: "2h ago" },
    { id: 2, task: "Order Coffee", priority: "medium", time: "4h ago" },
    { id: 3, task: "Replace Broken Tiles", priority: "high", time: "1d ago" },
    { id: 4, task: "Install New Lockers", priority: "low", time: "2d ago" },
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      
      const employeesStats = await getEmployeesStats();
      const dashStats = await dashboardService.getStats();
      const expenses = await dashboardService.getMonthlyExpenses();
      const purchaseVsCons = await dashboardService.getPurchaseVsConsumption();
      const maintCosts = await dashboardService.getMaintenanceCosts();
      const supplierPerf = await dashboardService.getSupplierPerformance();
      const officeReqs = await dashboardService.getOfficeRequests();

      setStats({
        totalEmployees: employeesStats.total || 0,
        openTickets: dashStats.openTickets || 0,
        purchaseRequests: dashStats.purchaseRequests || 0,
        totalBudget: dashStats.totalBudget || 0,
        acUnits: dashStats.acUnits || 0,
        totalLockers: dashStats.totalLockers || 0,
        occupiedLockers: dashStats.occupiedLockers || 0,
        inventoryItems: dashStats.inventoryItems || 0,
        pendingMaintenance: dashStats.pendingMaintenance || 0,
      });
      
      setMonthlyExpenses(expenses.length > 0 ? expenses : [
        { month: "Jan", amount: 32000 },
        { month: "Feb", amount: 28000 },
        { month: "Mar", amount: 35000 },
        { month: "Apr", amount: 38000 },
        { month: "May", amount: 42000 },
        { month: "Jun", amount: 38400 },
      ]);
      
      setPurchaseVsConsumption(purchaseVsCons.length > 0 ? purchaseVsCons : [
        { month: "Jan", purchase: 15000, consumption: 12000 },
        { month: "Feb", purchase: 14000, consumption: 11000 },
        { month: "Mar", purchase: 18000, consumption: 14000 },
        { month: "Apr", purchase: 20000, consumption: 16000 },
        { month: "May", purchase: 22000, consumption: 18000 },
        { month: "Jun", purchase: 18500, consumption: 15200 },
      ]);
      
      setMaintenanceCosts(maintCosts.length > 0 ? maintCosts : [
        { name: "AC", cost: 18000 },
        { name: "Plumbing", cost: 12000 },
        { name: "Electrical", cost: 8000 },
        { name: "Furniture", cost: 6000 },
        { name: "Civil", cost: 4000 },
      ]);
      
      setSupplierPerformance(supplierPerf.length > 0 ? supplierPerf : [
        { name: "ABC Company", score: 92 },
        { name: "TechCool", score: 85 },
        { name: "OfficePro", score: 78 },
        { name: "CleanCo", score: 70 },
        { name: "BuildIt", score: 65 },
      ]);
      
      setOfficeRequests(officeReqs.length > 0 ? officeReqs : [
        { name: "Procurement", value: 12 },
        { name: "Maintenance", value: 8 },
        { name: "Furniture", value: 6 },
        { name: "Lockers", value: 4 },
        { name: "Other", value: 3 },
      ]);
      
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setStats({
        totalEmployees: 400,
        openTickets: 24,
        purchaseRequests: 12,
        totalBudget: 38400,
        acUnits: 58,
        totalLockers: 400,
        occupiedLockers: 324,
        inventoryItems: 2845,
        pendingMaintenance: 15,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const mainCards = [
    {
      title: t("dashboard.employees"),
      value: stats.totalEmployees,
      icon: <People />,
      color: "#1976d2",
      bgColor: "#e3f2fd",
    },
    {
      title: t("dashboard.openTickets"),
      value: stats.openTickets,
      icon: <Assignment />,
      color: "#ff9800",
      bgColor: "#fff3e0",
    },
    {
      title: t("dashboard.purchaseRequests"),
      value: stats.purchaseRequests,
      icon: <ShoppingCart />,
      color: "#4caf50",
      bgColor: "#e8f5e9",
    },
    {
      title: t("dashboard.monthlyBudget"),
      value: `R$ ${stats.totalBudget.toLocaleString()}`,
      icon: <AttachMoney />,
      color: "#9c27b0",
      bgColor: "#f3e5f5",
    },
    {
      title: t("dashboard.acUnits"),
      value: stats.acUnits,
      icon: <AcUnit />,
      color: "#2196f3",
      bgColor: "#e3f2fd",
    },
    {
      title: t("dashboard.lockers"),
      value: `${stats.occupiedLockers}/${stats.totalLockers}`,
      icon: <MeetingRoom />,
      color: "#607d8b",
      bgColor: "#eceff1",
      progress: stats.totalLockers > 0 ? (stats.occupiedLockers / stats.totalLockers) * 100 : 0,
    },
    {
      title: t("dashboard.inventoryItems"),
      value: stats.inventoryItems,
      icon: <Inventory />,
      color: "#2e7d32",
      bgColor: "#e8f5e9",
    },
    {
      title: t("dashboard.pendingMaintenance"),
      value: stats.pendingMaintenance,
      icon: <Build />,
      color: "#f44336",
      bgColor: "#ffebee",
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: "#f8f9fa", minHeight: "100vh" }}>
      <Box 
        sx={{ 
          mb: 4, 
          display: "flex", 
          flexDirection: { xs: "column", sm: "row" }, 
          justifyContent: "space-between", 
          alignItems: { xs: "flex-start", sm: "center" },
          borderBottom: "1px solid",
          borderColor: "divider",
          pb: 2 
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: "700", color: "#1a237e", letterSpacing: "-0.5px" }}>
            Executive Dashboard
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            Real-time overview of office operations, tasks, and key performance metrics.
          </Typography>
        </Box>
        
        <Chip 
          label={`Today: ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
          variant="outlined"
          sx={{ mt: { xs: 1, sm: 0 }, fontWeight: 500, borderColor: "#1a237e", color: "#1a237e" }}
        />
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {mainCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                borderRadius: 2,
                boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
                transition: "all 0.2s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                },
              }}
            >
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500, display: "block" }}>
                      {card.title}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: "bold", color: card.color, mt: 0.5 }}>
                      {card.value}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: card.bgColor, color: card.color, width: 40, height: 40 }}>
                    {card.icon}
                  </Avatar>
                </Box>
                {card.progress !== undefined && (
                  <LinearProgress
                    variant="determinate"
                    value={card.progress}
                    sx={{ mt: 1.5, height: 4, borderRadius: 2 }}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2.5, borderRadius: 2, boxShadow: "0 1px 8px rgba(0,0,0,0.06)", height: "100%" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
              📅 {t("dashboard.todayTasks")}
            </Typography>
            <List sx={{ p: 0 }}>
              {todayTasks.map((task) => (
                <ListItem
                  key={task.id}
                  sx={{
                    bgcolor:
                      task.priority === "high"
                        ? "#ffebee"
                        : task.priority === "medium"
                        ? "#fff3e0"
                        : "#e8f5e9",
                    borderRadius: 1.5,
                    mb: 0.75,
                    py: 0.75,
                    px: 1.5,
                    transition: "all 0.2s",
                    "&:hover": { transform: "translateX(4px)" },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <Typography fontSize="14px">
                      {task.priority === "high" ? "🔴" : task.priority === "medium" ? "🟡" : "🟢"}
                    </Typography>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {task.task}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        {task.time}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2.5, borderRadius: 2, boxShadow: "0 1px 8px rgba(0,0,0,0.06)", height: "100%" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1.5 }}>
              📊 {t("dashboard.monthlyExpenses")}
            </Typography>
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={monthlyExpenses}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "none",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                    fontSize: 12,
                  }}
                  formatter={(value) => [`R$ ${value.toLocaleString()}`, "Amount"]}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="amount" fill="#1976d2" stroke="#1976d2" fillOpacity={0.2} />
                <Bar dataKey="amount" fill="#1976d2" radius={[3, 3, 0, 0]} />
              </ComposedChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2.5, borderRadius: 2, boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1.5 }}>
              🛒 {t("dashboard.purchaseVsConsumption")}
            </Typography>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={purchaseVsConsumption}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "none",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                    fontSize: 12,
                  }}
                  formatter={(value) => [`R$ ${value.toLocaleString()}`, ""]}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="purchase" fill="#1976d2" radius={[3, 3, 0, 0]} />
                <Bar dataKey="consumption" fill="#ff9800" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2.5, borderRadius: 2, boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1.5 }}>
              🔧 {t("dashboard.maintenanceCosts")}
            </Typography>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={maintenanceCosts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "none",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                    fontSize: 12,
                  }}
                  formatter={(value) => [`R$ ${value.toLocaleString()}`, "Cost"]}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="cost" id="cost" fill="#2196f3" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2.5, borderRadius: 2, boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1.5 }}>
              🏆 {t("dashboard.supplierPerformance")}
            </Typography>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={supplierPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "none",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="score" fill="#4caf50" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2.5, borderRadius: 2, boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1.5 }}>
              📨 {t("dashboard.officeRequests")}
            </Typography>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={officeRequests}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={75}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {officeRequests.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "none",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;