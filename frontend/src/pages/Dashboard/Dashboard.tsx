import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Button,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
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
  Badge,
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
import PendingIcon from "@mui/icons-material/Pending";
import EventIcon from "@mui/icons-material/Event";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import WarningIcon from "@mui/icons-material/Warning";
import LowPriorityIcon from "@mui/icons-material/LowPriority";
import { getEmployees } from "../../services/employeeService";
import { inventoryService } from "../../services/inventoryService";
import { ticketService } from "../../services/ticketService";
import { acService } from "../../services/acService";
import { lockerService } from "../../services/lockerService";
import { assetService } from "../../services/assetService";
import { procurementService } from "../../services/procurementService";

interface Task {
  id: number;
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  dueDate: string;
  completed: boolean;
  category?: "Work" | "Personal" | "Urgent";
}

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalAssets: 0,
    totalTickets: 0,
    totalLockers: 0,
    totalAC: 0,
    totalInventory: 0,
    totalProcurement: 0,
  });

  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "Medium" as "High" | "Medium" | "Low",
    dueDate: today.toISOString().split("T")[0],
    category: "Work" as "Work" | "Personal" | "Urgent",
  });

  // ✅ Load tasks from localStorage or use default
  const getDefaultTasks = (): Task[] => [
    {
      id: 1,
      title: "Review urgent procurement requests",
      description: "Approve pending procurement requests from QA department",
      priority: "High",
      dueDate: new Date().toISOString(),
      completed: false,
      category: "Urgent",
    },
    {
      id: 2,
      title: "Fix AC on 17th floor",
      description: "AC unit 3 is not cooling properly",
      priority: "High",
      dueDate: new Date().toISOString(),
      completed: false,
      category: "Urgent",
    },
    {
      id: 3,
      title: "Update inventory stock",
      description: "Update inventory levels for kitchen supplies",
      priority: "Medium",
      dueDate: new Date().toISOString(),
      completed: false,
      category: "Work",
    },
    {
      id: 4,
      title: "Prepare weekly report",
      description: "Weekly report for management meeting",
      priority: "Medium",
      dueDate: new Date().toISOString(),
      completed: false,
      category: "Work",
    },
    {
      id: 5,
      title: "Plan team building event",
      description: "Plan next month's team building event",
      priority: "Low",
      dueDate: new Date(Date.now() + 86400000 * 7).toISOString(),
      completed: false,
      category: "Work",
    },
    {
      id: 6,
      title: "Order office supplies",
      description: "Order paper, pens, and other office supplies",
      priority: "Low",
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
      completed: false,
      category: "Work",
    },
  ];

  const loadTasksFromStorage = (): Task[] => {
    const stored = localStorage.getItem('dashboard_tasks');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return getDefaultTasks();
      }
    }
    return getDefaultTasks();
  };

  const [tasks, setTasks] = useState<Task[]>(loadTasksFromStorage);

  // ✅ Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('dashboard_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [employees, assets, tickets, lockers, ac, inventory, procurement] = await Promise.all([
        getEmployees(),
        assetService.getAll(),
        ticketService.getAll(),
        lockerService.getAll(),
        acService.getAll(),
        inventoryService.getAll(),
        procurementService.getAll(),
      ]);

      setStats({
        totalEmployees: employees.length,
        totalAssets: assets.length,
        totalTickets: tickets.length,
        totalLockers: lockers.length,
        totalAC: ac.length,
        totalInventory: inventory.length,
        totalProcurement: procurement.length,
      });
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

  const handleToggleTask = (taskId: number) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      showSnackbar(
        task.completed ? `"${task.title}" marked as incomplete` : `"${task.title}" completed! 🎉`,
        "success"
      );
    }
  };

  const handleDeleteTask = (taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (window.confirm(`Delete task "${task?.title}"?`)) {
      setTasks(tasks.filter(task => task.id !== taskId));
      showSnackbar(`Task "${task?.title}" deleted`, "success");
    }
  };

  const handleAddTask = () => {
    if (!newTask.title.trim()) {
      showSnackbar("Task title is required", "error");
      return;
    }

    const task: Task = {
      id: Date.now(),
      title: newTask.title,
      description: newTask.description || "",
      priority: newTask.priority,
      dueDate: new Date(newTask.dueDate).toISOString(),
      completed: false,
      category: newTask.category,
    };

    setTasks([task, ...tasks]);
    setOpenTaskDialog(false);
    setNewTask({
      title: "",
      description: "",
      priority: "Medium",
      dueDate: today.toISOString().split("T")[0],
      category: "Work",
    });
    showSnackbar(`Task "${task.title}" added successfully!`, "success");
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "#d32f2f";
      case "Medium": return "#f57c00";
      case "Low": return "#2e7d32";
      default: return "#666";
    }
  };

  const getPriorityBg = (priority: string) => {
    switch (priority) {
      case "High": return "#ffebee";
      case "Medium": return "#fff3e0";
      case "Low": return "#e8f5e9";
      default: return "#f5f5f5";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "High": return <PriorityHighIcon fontSize="small" />;
      case "Medium": return <WarningIcon fontSize="small" />;
      case "Low": return <LowPriorityIcon fontSize="small" />;
      default: return null;
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case "Work": return "#1a237e";
      case "Personal": return "#e65100";
      case "Urgent": return "#c62828";
      default: return "#666";
    }
  };

  const getCategoryBg = (category?: string) => {
    switch (category) {
      case "Work": return "#e8eaf6";
      case "Personal": return "#fbe9e7";
      case "Urgent": return "#ffebee";
      default: return "#f5f5f5";
    }
  };

  const urgentTasks = tasks.filter(t => t.category === "Urgent" && !t.completed);
  const highTasks = tasks.filter(t => t.priority === "High" && t.category !== "Urgent" && !t.completed);
  const mediumTasks = tasks.filter(t => t.priority === "Medium" && t.category !== "Urgent" && !t.completed);
  const lowTasks = tasks.filter(t => t.priority === "Low" && t.category !== "Urgent" && !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  const completedCount = tasks.filter(t => t.completed).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  const cards = [
    { title: "Employees", value: stats.totalEmployees, icon: <PeopleIcon />, color: "#1a237e", bg: "#e8eaf6" },
    { title: "Assets", value: stats.totalAssets, icon: <ComputerIcon />, color: "#2e7d32", bg: "#e8f5e9" },
    { title: "Maintenance", value: stats.totalTickets, icon: <BuildIcon />, color: "#e65100", bg: "#fff3e0" },
    { title: "Lockers", value: stats.totalLockers, icon: <MeetingRoomIcon />, color: "#1565c0", bg: "#e3f2fd" },
    { title: "AC Units", value: stats.totalAC, icon: <AcUnitIcon />, color: "#00838f", bg: "#e0f7fa" },
    { title: "Inventory", value: stats.totalInventory, icon: <InventoryIcon />, color: "#4a148c", bg: "#f3e5f5" },
    { title: "Procurement", value: stats.totalProcurement, icon: <ShoppingCartIcon />, color: "#bf360c", bg: "#fbe9e7" },
  ];

  return (
    <Box sx={{ p: 3, bgcolor: "#f5f7fa", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#1a237e" }}>
            📊 Dashboard
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1 }}>
            <Typography sx={{ color: "#666" }}>
              Welcome back! Here's your organization overview.
            </Typography>
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
          Refresh
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {cards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.title}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
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
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Content: Tasks Section */}
      <Grid container spacing={3}>
        {/* Left Column: All Tasks */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ borderRadius: 3, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
            {/* Header */}
            <Box sx={{ p: 3, bgcolor: "#1a237e", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <TaskIcon sx={{ color: "white" }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: "white" }}>
                  Today's Tasks
                </Typography>
                <Chip
                  label={`${completedCount} / ${tasks.length} completed`}
                  size="small"
                  sx={{
                    bgcolor: "rgba(255,255,255,0.15)",
                    color: "white",
                    fontWeight: 500,
                  }}
                />
              </Box>
              <Tooltip title="Add new task">
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

            {/* Progress Bar */}
            <Box sx={{ px: 3, py: 1, bgcolor: "#f5f7fa" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Typography variant="caption" sx={{ color: "#666" }}>Overall Progress</Typography>
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

            {/* Tasks List by Priority */}
            <Box sx={{ p: 2 }}>
              {/* High Priority Tasks */}
              {highTasks.length > 0 && (
                <>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#d32f2f", mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                    <PriorityHighIcon /> High Priority ({highTasks.length})
                  </Typography>
                  {highTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={handleToggleTask}
                      onDelete={handleDeleteTask}
                      color="#d32f2f"
                      bg="#ffebee"
                    />
                  ))}
                </>
              )}

              {/* Medium Priority Tasks */}
              {mediumTasks.length > 0 && (
                <>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#f57c00", mt: 2, mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                    <WarningIcon /> Medium Priority ({mediumTasks.length})
                  </Typography>
                  {mediumTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={handleToggleTask}
                      onDelete={handleDeleteTask}
                      color="#f57c00"
                      bg="#fff3e0"
                    />
                  ))}
                </>
              )}

              {/* Low Priority Tasks */}
              {lowTasks.length > 0 && (
                <>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#2e7d32", mt: 2, mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                    <LowPriorityIcon /> Low Priority ({lowTasks.length})
                  </Typography>
                  {lowTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={handleToggleTask}
                      onDelete={handleDeleteTask}
                      color="#2e7d32"
                      bg="#e8f5e9"
                    />
                  ))}
                </>
              )}

              {/* Completed Tasks */}
              {completedTasks.length > 0 && (
                <>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#4caf50", mt: 2, mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                    <CheckCircleIcon /> Completed ({completedTasks.length})
                  </Typography>
                  {completedTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={handleToggleTask}
                      onDelete={handleDeleteTask}
                      color="#4caf50"
                      bg="#e8f5e9"
                    />
                  ))}
                </>
              )}

              {tasks.filter(t => !t.completed).length === 0 && (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography sx={{ color: "#999" }}>All tasks completed! 🎉</Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Right Column: Urgent Section */}
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
            {/* Urgent Badge */}
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
              URGENT
            </Box>

            <Box sx={{ p: 3, bgcolor: "#c62828", pt: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: "white", display: "flex", alignItems: "center", gap: 1 }}>
                🚨 Urgent Tasks
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)", mt: 0.5 }}>
                Tasks that require immediate attention
              </Typography>
            </Box>

            <Box sx={{ p: 2, maxHeight: 500, overflow: "auto" }}>
              {urgentTasks.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <CheckCircleIcon sx={{ fontSize: 48, color: "#4caf50" }} />
                  <Typography sx={{ color: "#666", mt: 1 }}>No urgent tasks! 🎉</Typography>
                  <Typography variant="caption" sx={{ color: "#999" }}>All urgent tasks are completed</Typography>
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

      {/* Add Task Dialog */}
      <Dialog open={openTaskDialog} onClose={() => setOpenTaskDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: "#1a237e", color: "white" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AddIcon />
            Add New Task
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Task Title"
              fullWidth
              required
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              placeholder="Enter task title..."
            />

            <TextField
              label="Description"
              fullWidth
              multiline
              rows={2}
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              placeholder="Enter task description..."
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Priority"
                  fullWidth
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as "High" | "Medium" | "Low" })}
                >
                  <MenuItem value="High">🔥 High</MenuItem>
                  <MenuItem value="Medium">⚡ Medium</MenuItem>
                  <MenuItem value="Low">💡 Low</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Category"
                  fullWidth
                  value={newTask.category}
                  onChange={(e) => setNewTask({ ...newTask, category: e.target.value as "Work" | "Personal" | "Urgent" })}
                >
                  <MenuItem value="Work">💼 Work</MenuItem>
                  <MenuItem value="Personal">👤 Personal</MenuItem>
                  <MenuItem value="Urgent">🚨 Urgent</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            <TextField
              label="Due Date"
              type="date"
              fullWidth
              value={newTask.dueDate}
              onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={() => setOpenTaskDialog(false)} variant="outlined" color="inherit" sx={{ borderRadius: 2, textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddTask}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              bgcolor: "#1a237e",
              "&:hover": { bgcolor: "#0d1445" },
            }}
          >
            Add Task
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
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// Task Item Component
function TaskItem({ task, onToggle, onDelete, color, bg }: {
  task: Task;
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
          <Typography variant="caption" sx={{ color: "#666", display: "block" }}>
            {task.description}
          </Typography>
          <Typography variant="caption" sx={{ color: "#999", display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
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