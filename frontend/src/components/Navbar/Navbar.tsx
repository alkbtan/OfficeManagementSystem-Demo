import { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  Popover,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";
import { useNavigate } from "react-router-dom";

interface Notification {
  id: number;
  message: string;
  type: "success" | "warning" | "error" | "info";
  read: boolean;
  timestamp: Date;
  title?: string;
}

function Navbar() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [userAnchorEl, setUserAnchorEl] = useState<null | HTMLElement>(null);
  
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Load notifications from localStorage
  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    const saved = localStorage.getItem("notifications");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setNotifications(parsed);
        setUnreadCount(parsed.filter((n: Notification) => !n.read).length);
      } catch (e) {
        console.error("Error loading notifications:", e);
      }
    }
  };

  const saveNotifications = (newNotifications: Notification[]) => {
    localStorage.setItem("notifications", JSON.stringify(newNotifications));
    setNotifications(newNotifications);
    setUnreadCount(newNotifications.filter(n => !n.read).length);
  };

  const addNotification = (message: string, type: Notification["type"], title?: string) => {
    const newNotification: Notification = {
      id: Date.now(),
      message,
      type,
      read: false,
      timestamp: new Date(),
      title,
    };
    const newNotifications = [newNotification, ...notifications];
    saveNotifications(newNotifications);
  };

  const markAsRead = (id: number) => {
    const updated = notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    saveNotifications(updated);
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    saveNotifications(updated);
  };

  const clearAll = () => {
    saveNotifications([]);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircleIcon sx={{ color: "#4caf50" }} />;
      case "warning": return <WarningIcon sx={{ color: "#ff9800" }} />;
      case "error": return <ErrorIcon sx={{ color: "#f44336" }} />;
      default: return <InfoIcon sx={{ color: "#2196f3" }} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "success": return "#4caf50";
      case "warning": return "#ff9800";
      case "error": return "#f44336";
      default: return "#2196f3";
    }
  };

  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setAnchorEl(null);
  };

  const handleUserMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setUserAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleNotificationClickItem = (id: number) => {
    markAsRead(id);
  };

  const getTimeAgo = (date: Date) => {
    const diff = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        bgcolor: "white",
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        color: "#1a237e",
        zIndex: 1200,
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: "#1a237e" }}>
          {document.title || "Dashboard"}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Notifications */}
          <IconButton onClick={handleNotificationClick}>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon sx={{ color: "#1a237e" }} />
            </Badge>
          </IconButton>

          {/* User */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Chip
              label={user?.role || "Admin"}
              size="small"
              sx={{
                bgcolor: "#e8eaf6",
                color: "#1a237e",
                fontWeight: 500,
              }}
            />
            <IconButton onClick={handleUserMenuClick} sx={{ p: 0 }}>
              <Avatar sx={{ bgcolor: "#7b1fa2", width: 36, height: 36 }}>
                {user?.name?.[0] || "A"}
              </Avatar>
            </IconButton>
          </Box>
        </Box>
      </Toolbar>

      {/* Notifications Popover */}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 500,
            borderRadius: 3,
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            mt: 1,
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: "1px solid #e0e0e0" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Notifications
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              {unreadCount > 0 && (
                <Button size="small" onClick={markAllAsRead} sx={{ textTransform: "none" }}>
                  Mark all read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button size="small" onClick={clearAll} sx={{ textTransform: "none", color: "#f44336" }}>
                  Clear all
                </Button>
              )}
            </Box>
          </Box>
        </Box>

        <Box sx={{ overflow: "auto", maxHeight: 400 }}>
          {notifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <NotificationsIcon sx={{ fontSize: 48, color: "#ccc", mb: 1 }} />
              <Typography variant="body2" sx={{ color: "#999" }}>
                No notifications
              </Typography>
            </Box>
          ) : (
            notifications.map((notif) => (
              <Box
                key={notif.id}
                sx={{
                  p: 2,
                  borderBottom: "1px solid #f0f0f0",
                  bgcolor: notif.read ? "transparent" : "#f8f9ff",
                  cursor: "pointer",
                  "&:hover": { bgcolor: "#f5f5f5" },
                }}
                onClick={() => handleNotificationClickItem(notif.id)}
              >
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                  {getIcon(notif.type)}
                  <Box sx={{ flex: 1 }}>
                    {notif.title && (
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {notif.title}
                      </Typography>
                    )}
                    <Typography variant="body2" sx={{ color: "#333" }}>
                      {notif.message}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#999", display: "block", mt: 0.5 }}>
                      {getTimeAgo(notif.timestamp)}
                    </Typography>
                  </Box>
                  {!notif.read && (
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: getTypeColor(notif.type),
                        mt: 1,
                      }}
                    />
                  )}
                </Box>
              </Box>
            ))
          )}
        </Box>
      </Popover>

      {/* User Menu */}
      <Menu
        anchorEl={userAnchorEl}
        open={Boolean(userAnchorEl)}
        onClose={handleUserMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: 2,
            boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
            minWidth: 180,
          },
        }}
      >
        <MenuItem disabled sx={{ opacity: 1 }}>
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {user?.name || "User"}
            </Typography>
            <Typography variant="caption" sx={{ color: "#999" }}>
              {user?.email || ""}
            </Typography>
          </Box>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { handleUserMenuClose(); navigate("/settings"); }}>
          <SettingsIcon sx={{ mr: 1, fontSize: 20 }} />
          Settings
        </MenuItem>
        <MenuItem onClick={handleLogout} sx={{ color: "#d32f2f" }}>
          <LogoutIcon sx={{ mr: 1, fontSize: 20 }} />
          Logout
        </MenuItem>
      </Menu>
    </AppBar>
  );
}

export default Navbar;