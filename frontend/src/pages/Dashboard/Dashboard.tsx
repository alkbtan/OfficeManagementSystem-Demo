import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Button,
  CircularProgress,
  Chip,
  Avatar,
  IconButton,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Snackbar,
  Alert,
  LinearProgress,
  Fab,
  Tooltip,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import PeopleIcon from "@mui/icons-material/People";
import InventoryIcon from "@mui/icons-material/Inventory";
import BuildIcon from "@mui/icons-material/Build";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import ComputerIcon from "@mui/icons-material/Computer";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import TaskIcon from "@mui/icons-material/Task";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import WarningIcon from "@mui/icons-material/Warning";
import LowPriorityIcon from "@mui/icons-material/LowPriority";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { useTranslation } from "react-i18next";
import { taskService, type TodoTask } from "../../services/taskService";
import { getEmployees } from "../../services/employeeService";
import { inventoryService } from "../../services/inventoryService";
import { ticketService } from "../../services/ticketService";
import { acService } from "../../services/acService";
import { lockerService } from "../../services/lockerService";
import { assetService } from "../../services/assetService";
import { procurementService } from "../../services/procurementService";

interface StatsData {
  employees: { total: number; active: number };
  assets: { total: number; available: number };
  maintenance: { total: number; open: number };
  lockers: { total: number; occupied: number };
  acUnits: { total: number; operational: number };
  inventory: { total: number; lowStock: number };
  procurement: { total: number; totalAmount: number };
}

function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const [stats, setStats] = useState<StatsData>({
    employees: { total: 0, active: 0 },
    assets: { total: 0, available: 0 },
    maintenance: { total: 0, open: 0 },
    lockers: { total: 0, occupied: 0 },
    acUnits: { total: 0, operational: 0 },
    inventory: { total: 0, lowStock: 0 },
    procurement: { total: 0, totalAmount: 0 },
  });

  const [tasks, setTasks] = useState<TodoTask[]>([]);

  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "Medium" as "High" | "Medium" | "Low",
    dueDate: today.toISOString().split("T")[0],
    category: "Work" as "Work" | "Personal" | "Urgent",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [
        employees,
        assets,
        tickets,
        lockers,
        ac,
        inventory,
        procurement,
        tasksData,
      ] = await Promise.all([
        getEmployees(),
        assetService.getAll(),
        ticketService.getAll(),
        lockerService.getAll(),
        acService.getAll(),
        inventoryService.getAll(),
        procurementService.getAll(),
        taskService.getAll(),
      ]);

      setStats({
        employees: {
          total: employees.length,
          active: employees.filter((e: any) => e.status === "Active").length,
        },
        assets: {
          total: assets.length,
          available: assets.filter((a: any) => a.status === "Available").length,
        },
        maintenance: {
          total: tickets.length,
          open: tickets.filter((tk: any) => tk.status === "Open").length,
        },
        lockers: {
          total: lockers.length,
          occupied: lockers.filter((l: any) => l.status === "Occupied").length,
        },
        acUnits: {
          total: ac.length,
          operational: ac.filter((u: any) => u.status === "Operational").length,
        },
        inventory: {
          total: inventory.length,
          lowStock: inventory.filter((i: any) => i.status === "Low Stock" || i.status === "Out of Stock").length,
        },
        procurement: {
          total: procurement.length,
          totalAmount: procurement.reduce((sum: number, p: any) => sum + (p.total || 0), 0),
        },
      });

      setTasks(tasksData);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
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

  // =========================================================
  // Task handlers (using taskService)
  // =========================================================
  const handleToggleTask = async (taskId: number) => {
    try {
      const updated = await taskService.toggle(taskId);
      setTasks(tasks.map((t) => (t.id === taskId ? updated : t)));
      showSnackbar(
        updated.completed
          ? `"${updated.title}" ${t("dashboard.taskCompleted")}`
          : `"${updated.title}" ${t("dashboard.taskMarkedIncomplete")}`,
        "success"
      );
    } catch (error) {
      console.error("Error toggling task:", error);
      showSnackbar(t("common.error"), "error");
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!window.confirm(t("dashboard.deleteTaskConfirm"))) return;

    try {
      await taskService.delete(taskId);
      setTasks(tasks.filter((t) => t.id !== taskId));
      showSnackbar(`"${task?.title}" ${t("dashboard.taskDeleted")}`, "success");
    } catch (error) {
      console.error("Error deleting task:", error);
      showSnackbar(t("common.error"), "error");
    }
  };

  const handleAddTask = async () => {
    if (!newTask.title.trim()) {
      showSnackbar(t("dashboard.taskTitleRequired"), "error");
      return;
    }

    try {
      const created = await taskService.create({
        title: newTask.title,
        description: newTask.description || "",
        priority: newTask.priority,
        category: newTask.category,
        dueDate: new Date(newTask.dueDate).toISOString(),
        completed: false,
      });

      setTasks([created, ...tasks]);
      setOpenTaskDialog(false);
      setNewTask({
        title: "",
        description: "",
        priority: "Medium",
        dueDate: today.toISOString().split("T")[0],
        category: "Work",
      });
      showSnackbar(t("dashboard.taskAdded"), "success");
    } catch (error) {
      console.error("Error adding task:", error);
      showSnackbar(t("common.error"), "error");
    }
  };

  // =========================================================
  // Task filters
  // =========================================================
  const urgentTasks = tasks.filter((t) => t.category === "Urgent" && !t.completed);
  const highTasks = tasks.filter((t) => t.priority === "High" && t.category !== "Urgent" && !t.completed);
  const mediumTasks = tasks.filter((t) => t.priority === "Medium" && t.category !== "Urgent" && !t.completed);
  const lowTasks = tasks.filter((t) => t.priority === "Low" && t.category !== "Urgent" && !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  const completedCount = completedTasks.length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  // =========================================================
  // Dashboard cards config (clickable + real data)
  // =========================================================
  const cards = [
    {
      key: "employees",
      title: t("dashboard.employees"),
      value: stats.employees.total,
      subtitle: `${stats.employees.active} ${t("dashboard.active")}`,
      progress: stats.employees.total > 0 ? (stats.employees.active / stats.employees.total) * 100 : 0,
      icon: <PeopleIcon />,
      color: "#1a237e",
      bg: "#e8eaf6",
      path: "/employees",
    },
    {
      key: "assets",
      title: t("dashboard.assets"),
      value: stats.assets.total,
      subtitle: `${stats.assets.available} ${t("dashboard.available")}`,
      progress: stats.assets.total > 0 ? (stats.assets.available / stats.assets.total) * 100 : 0,
      icon: <ComputerIcon />,
      color: "#2e7d32",
      bg: "#e8f5e9",
      path: "/assets",
    },
    {
      key: "maintenance",
      title: t("dashboard.maintenance"),
      value: stats.maintenance.total,
      subtitle: `${stats.maintenance.open} ${t("dashboard.open")}`,
      progress: stats.maintenance.total > 0
        ? ((stats.maintenance.total - stats.maintenance.open) / stats.maintenance.total) * 100
        : 0,
      icon: <BuildIcon />,
      color: "#e65100",
      bg: "#fff3e0",
      path: "/maintenance",
    },
    {
      key: "lockers",
      title: t("dashboard.lockers"),
      value: stats.lockers.total,
      subtitle: `${stats.lockers.occupied} ${t("dashboard.occupied")}`,
      progress: stats.lockers.total > 0 ? (stats.lockers.occupied / stats.lockers.total) * 100 : 0,
      icon: <MeetingRoomIcon />,
      color: "#1565c0",
      bg: "#e3f2fd",
      path: "/lockers",
    },
    {
      key: "acUnits",
      title: t("dashboard.acUnits"),
      value: stats.acUnits.total,
      subtitle: `${stats.acUnits.operational} ${t("dashboard.operational")}`,
      progress: stats.acUnits.total > 0
        ? (stats.acUnits.operational / stats.acUnits.total) * 100
        : 0,
      icon: <AcUnitIcon />,
      color: "#00838f",
      bg: "#e0f7fa",
      path: "/acs",
    },
    {
      key: "inventory",
      title: t("dashboard.inventory"),
      value: stats.inventory.total,
      subtitle: `${stats.inventory.lowStock} ${t("dashboard.lowStock")}`,
      progress: stats.inventory.total > 0
        ? ((stats.inventory.total - stats.inventory.lowStock) / stats.inventory.total) * 100
        : 0,
      icon: <InventoryIcon />,
      color: "#4a148c",
      bg: "#f3e5f5",
      path: "/inventory",
    },
    {
      key: "procurement",
      title: t("dashboard.procurement"),
      value: stats.procurement.total,
      subtitle: `R$ ${stats.procurement.totalAmount.toFixed(2)}`,
      progress: 100,
      icon: <ShoppingCartIcon />,
      color: "#bf360c",
      bg: "#fbe9e7",
      path: "/procurement",
    },
  ];

  return (
    <Box sx={{ p: 3, bgcolor: "#f5f7fa", minHeight: "100vh" }}>
      {/* ========================================================= */}
      {/* Header                                                    */}
      {/* ========================================================= */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#1a237e" }}>
            📊 {t("dashboard.title")}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1 }}>
            <Typography sx={{ color: "#666" }}>{t("dashboard.welcome")}</Typography>
            <Chip
              icon={<CalendarTodayIcon />}
              label={formattedDate}
              sx={{
                bgcolor: "#1a237e",
                color: "white",
                fontWeight: 500,
                "& .MuiChip-icon": { color: "white" },
              }}
            />
          </Box>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadData}
          sx={{ borderRadius: 2, textTransform: "none" }}
        >
          {t("common.refresh")}
        </Button>
      </Box>

      {/* ========================================================= */}
      {/* Stats Cards (clickable + real data)                       */}
      {/* ========================================================= */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {cards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.key}>
            <Card
              onClick={() => navigate(card.path)}
              sx={{
                borderRadius: 3,
                boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                transition: "transform 0.2s, box-shadow 0.2s",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                },
                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "4px",
                  bgcolor: card.color,
                  opacity: 0.7,
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: "#666", fontWeight: 500 }}>
                      {card.title}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: card.color, mt: 0.5 }}>
                      {card.value}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: card.bg, width: 48, height: 48, color: card.color }}>
                    {card.icon}
                  </Avatar>
                </Box>

                {/* Progress bar */}
                <LinearProgress
                  variant="determinate"
                  value={card.progress}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: "#e0e0e0",
                    my: 1,
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 3,
                      bgcolor: card.color,
                    },
                  }}
                />

                {/* Subtitle + hover hint */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="caption" sx={{ color: "#666", fontWeight: 500 }}>
                    {card.subtitle}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: card.color,
                      fontWeight: 600,
                      opacity: 0,
                      transition: "opacity 0.2s",
                      ".MuiCard-root:hover &": { opacity: 1 },
                    }}
                  >
                    {t("dashboard.clickToView")} →
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ========================================================= */}
      {/* Tasks + Urgent Section                                    */}
      {/* ========================================================= */}
      <Grid container spacing={3}>
        {/* Left: All Tasks */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ borderRadius: 3, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
            <Box
              sx={{
                p: 3,
                bgcolor: "#1a237e",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <TaskIcon sx={{ color: "white" }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: "white" }}>
                  {t("dashboard.todayTasks")}
                </Typography>
                <Chip
                  label={`${completedCount} / ${tasks.length} ${t("dashboard.completedLabel")}`}
                  size="small"
                  sx={{
                    bgcolor: "rgba(255,255,255,0.15)",
                    color: "white",
                    fontWeight: 500,
                  }}
                />
              </Box>
              <Tooltip title={t("dashboard.addTask")}>
                <Fab
                  size="small"
                  onClick={() => setOpenTaskDialog(true)}
                  sx={{
                    bgcolor: "white",
                    color: "#1a237e",
                    "&:hover": { bgcolor: "#e8eaf6" },
                  }}
                >
                  <AddIcon />
                </Fab>
              </Tooltip>
            </Box>

            {/* Progress */}
            <Box sx={{ px: 3, py: 1, bgcolor: "#f5f7fa" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Typography variant="caption" sx={{ color: "#666" }}>
                  {t("dashboard.overallProgress")}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: "#1a237e" }}>
                  {Math.round(progress)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: "#e0e0e0",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 4,
                    bgcolor: progress === 100 ? "#4caf50" : "#1a237e",
                  },
                }}
              />
            </Box>

            {/* Tasks */}
            <Box sx={{ p: 2 }}>
              {highTasks.length > 0 && (
                <>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#d32f2f", mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                    <PriorityHighIcon /> {t("dashboard.highLabel")} ({highTasks.length})
                  </Typography>
                  {highTasks.map((task) => (
                    <TaskItem key={task.id} task={task} onToggle={handleToggleTask} onDelete={handleDeleteTask} color="#d32f2f" bg="#ffebee" />
                  ))}
                </>
              )}

              {mediumTasks.length > 0 && (
                <>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#f57c00", mt: 2, mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                    <WarningIcon /> {t("dashboard.mediumLabel")} ({mediumTasks.length})
                  </Typography>
                  {mediumTasks.map((task) => (
                    <TaskItem key={task.id} task={task} onToggle={handleToggleTask} onDelete={handleDeleteTask} color="#f57c00" bg="#fff3e0" />
                  ))}
                </>
              )}

              {lowTasks.length > 0 && (
                <>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#2e7d32", mt: 2, mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                    <LowPriorityIcon /> {t("dashboard.lowLabel")} ({lowTasks.length})
                  </Typography>
                  {lowTasks.map((task) => (
                    <TaskItem key={task.id} task={task} onToggle={handleToggleTask} onDelete={handleDeleteTask} color="#2e7d32" bg="#e8f5e9" />
                  ))}
                </>
              )}

              {completedTasks.length > 0 && (
                <>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#4caf50", mt: 2, mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                    <CheckCircleIcon /> {t("dashboard.completed")} ({completedTasks.length})
                  </Typography>
                  {completedTasks.map((task) => (
                    <TaskItem key={task.id} task={task} onToggle={handleToggleTask} onDelete={handleDeleteTask} color="#4caf50" bg="#e8f5e9" />
                  ))}
                </>
              )}

              {tasks.filter((t) => !t.completed).length === 0 && (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography sx={{ color: "#999" }}>
                    {tasks.length === 0 ? t("dashboard.noTasks") : t("dashboard.allTasksCompleted")}
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Right: Urgent */}
        <Grid item xs={12} lg={4}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
              border: "2px solid #c62828",
              position: "relative",
              overflow: "visible",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: -12,
                right: 16,
                bgcolor: "#c62828",
                color: "white",
                px: 2,
                py: 0.5,
                borderRadius: 2,
                fontSize: "0.75rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                boxShadow: "0 2px 8px rgba(198,40,40,0.3)",
              }}
            >
              <PriorityHighIcon sx={{ fontSize: 16 }} />
              {t("dashboard.urgentLabel")}
            </Box>

            <Box sx={{ p: 3, bgcolor: "#c62828", pt: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: "white" }}>
                🚨 {t("dashboard.urgentTasks")}
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)", mt: 0.5 }}>
                {t("dashboard.urgentTasksSubtitle")}
              </Typography>
            </Box>

            <Box sx={{ p: 2, maxHeight: 500, overflow: "auto" }}>
              {urgentTasks.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <CheckCircleIcon sx={{ fontSize: 48, color: "#4caf50" }} />
                  <Typography sx={{ color: "#666", mt: 1 }}>{t("dashboard.noUrgentTasks")}</Typography>
                  <Typography variant="caption" sx={{ color: "#999" }}>
                    {t("dashboard.urgentTasksCompleted")}
                  </Typography>
                </Box>
              ) : (
                urgentTasks.map((task) => (
                  <Card
                    key={task.id}
                    sx={{
                      mb: 2,
                      borderRadius: 2,
                      border: "1px solid #ffcdd2",
                      transition: "transform 0.2s",
                      "&:hover": { transform: "scale(1.01)" },
                    }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                        <Checkbox
                          checked={task.completed}
                          onChange={() => handleToggleTask(task.id)}
                          sx={{ color: "#c62828", "&.Mui-checked": { color: "#4caf50" }, p: 0, mt: -0.5 }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: "#1a237e" }}>
                            {task.title}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "#666", fontSize: "0.85rem" }}>
                            {task.description}
                          </Typography>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                            <Chip
                              label={task.priority}
                              size="small"
                              sx={{
                                bgcolor: "#ffebee",
                                color: "#c62828",
                                fontWeight: 600,
                                height: 20,
                                fontSize: "0.65rem",
                              }}
                            />
                            <Typography variant="caption" sx={{ color: "#999" }}>
                              📅 {new Date(task.dueDate).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteTask(task.id)}
                          sx={{ color: "#999", "&:hover": { color: "#c62828" } }}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                ))
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* ========================================================= */}
      {/* Add Task Dialog                                           */}
      {/* ========================================================= */}
      <Dialog open={openTaskDialog} onClose={() => setOpenTaskDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: "#1a237e", color: "white" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AddIcon />
            {t("dashboard.addTask")}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label={t("dashboard.taskTitle")}
              fullWidth
              required
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            />

            <TextField
              label={t("dashboard.taskDescription")}
              fullWidth
              multiline
              rows={2}
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label={t("common.priority")}
                  fullWidth
                  value={newTask.priority}
                  onChange={(e) =>
                    setNewTask({
                      ...newTask,
                      priority: e.target.value as "High" | "Medium" | "Low",
                    })
                  }
                >
                  <MenuItem value="High">🔥 {t("dashboard.highPriority")}</MenuItem>
                  <MenuItem value="Medium">⚡ {t("dashboard.mediumPriority")}</MenuItem>
                  <MenuItem value="Low">💡 {t("dashboard.lowPriority")}</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label={t("common.category")}
                  fullWidth
                  value={newTask.category}
                  onChange={(e) =>
                    setNewTask({
                      ...newTask,
                      category: e.target.value as "Work" | "Personal" | "Urgent",
                    })
                  }
                >
                  <MenuItem value="Work">💼 Work</MenuItem>
                  <MenuItem value="Personal">👤 Personal</MenuItem>
                  <MenuItem value="Urgent">🚨 Urgent</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            <TextField
              label={t("dashboard.dueDate")}
              type="date"
              fullWidth
              value={newTask.dueDate}
              onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={() => setOpenTaskDialog(false)} variant="outlined" color="inherit">
            {t("common.cancel")}
          </Button>
          <Button
            variant="contained"
            onClick={handleAddTask}
            sx={{ bgcolor: "#1a237e", "&:hover": { bgcolor: "#0d1445" } }}
          >
            {t("common.add")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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

// =========================================================
// Task Item Component
// =========================================================
function TaskItem({
  task,
  onToggle,
  onDelete,
  color,
  bg,
}: {
  task: TodoTask;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  color: string;
  bg: string;
}) {
  return (
    <Paper
      sx={{
        mb: 1,
        p: 1.5,
        borderRadius: 2,
        bgcolor: task.completed ? "#f5f5f5" : bg,
        border: `1px solid ${task.completed ? "#e0e0e0" : color}`,
        opacity: task.completed ? 0.7 : 1,
        transition: "all 0.2s",
        "&:hover": { boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Checkbox
          checked={task.completed}
          onChange={() => onToggle(task.id)}
          sx={{ color: color, "&.Mui-checked": { color: "#4caf50" }, p: 0.5 }}
        />
        <Box sx={{ flex: 1 }}>
          <Typography
            sx={{
              fontWeight: task.completed ? 400 : 600,
              textDecoration: task.completed ? "line-through" : "none",
              color: task.completed ? "#999" : "#1a237e",
              fontSize: "0.95rem",
            }}
          >
            {task.title}
          </Typography>
          {task.description && (
            <Typography variant="caption" sx={{ color: "#666", display: "block" }}>
              {task.description}
            </Typography>
          )}
          <Typography
            variant="caption"
            sx={{ color: "#999", display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}
          >
            <CalendarTodayIcon sx={{ fontSize: 12 }} />
            {new Date(task.dueDate).toLocaleDateString()}
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={() => onDelete(task.id)}
          sx={{ color: "#999", "&:hover": { color: "#f44336" } }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
    </Paper>
  );
}

export default Dashboard;