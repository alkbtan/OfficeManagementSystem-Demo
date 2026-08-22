import { useState, useEffect, useRef } from "react";
import {
  IconButton,
  Badge,
  Popover,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  Chip,
  CircularProgress,
  Tabs,
  Tab,
  Avatar,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
  DoneAll as DoneAllIcon,
  DeleteSweep as DeleteSweepIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export interface Notification {
  id: string;
  type: "info" | "warning" | "success" | "error";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link: string;
}

// ✅ دالة عمومية لإضافة إشعار جديد من أي مكان في التطبيق
export const addNotification = (notification: Omit<Notification, "id" | "read" | "createdAt">) => {
  try {
    const saved = localStorage.getItem("notifications");
    const notifications: Notification[] = saved ? JSON.parse(saved) : [];
    
    const newNotif: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      read: false,
      createdAt: new Date().toISOString(),
    };
    
    const updated = [newNotif, ...notifications];
    localStorage.setItem("notifications", JSON.stringify(updated));
    
    // ✅ إرسال حدث لتحديث الـ UI
    window.dispatchEvent(new CustomEvent("newNotification", { detail: updated }));
  } catch (error) {
    console.error("Failed to add notification:", error);
  }
};

function Notifications() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const loadSavedNotifications = (): Notification[] => {
    try {
      const saved = localStorage.getItem("notifications");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
    return [];
  };

  const saveNotifications = (data: Notification[]) => {
    try {
      localStorage.setItem("notifications", JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save notifications:", error);
    }
  };

  // ✅ الاستماع للإشعارات الجديدة من أي مكان
  useEffect(() => {
    const handleNewNotification = (event: CustomEvent) => {
      const updated = event.detail;
      setNotifications(updated);
      const unread = updated.filter((n: Notification) => !n.read).length;
      setUnreadCount(unread);
    };

    window.addEventListener("newNotification", handleNewNotification as EventListener);
    return () => {
      window.removeEventListener("newNotification", handleNewNotification as EventListener);
    };
  }, []);

  const loadNotifications = () => {
    setLoading(true);
    let saved = loadSavedNotifications();
    
    if (saved.length === 0 && isInitialLoad) {
      const defaultNotifs: Notification[] = [
        {
          id: "default-1",
          type: "success",
          title: "✅ Purchase Request Approved",
          message: "PR-2026-042 for Office Supplies has been approved.",
          read: true,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          link: "/procurement",
        },
        {
          id: "default-2",
          type: "info",
          title: "📝 New Employee Added",
          message: "Maria Silva has been added to Marketing.",
          read: true,
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          link: "/employees",
        },
        {
          id: "default-3",
          type: "info",
          title: "📅 Upcoming Event",
          message: "Team Building event scheduled for Friday.",
          read: true,
          createdAt: new Date(Date.now() - 10800000).toISOString(),
          link: "/events",
        },
      ];
      saved = defaultNotifs;
      saveNotifications(saved);
    }

    setNotifications(saved);
    const unread = saved.filter((n) => !n.read).length;
    setUnreadCount(unread);
    setLoading(false);
    setIsInitialLoad(false);
  };

  useEffect(() => {
    loadNotifications();

    intervalRef.current = setInterval(() => {
      // Check for new notifications from localStorage
      const saved = loadSavedNotifications();
      if (saved.length > notifications.length) {
        setNotifications(saved);
        const unread = saved.filter((n) => !n.read).length;
        setUnreadCount(unread);
      }
    }, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [notifications.length]);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      saveNotifications(updated);
      const unread = updated.filter((n) => !n.read).length;
      setUnreadCount(unread);
      return updated;
    });
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      saveNotifications(updated);
      setUnreadCount(0);
      return updated;
    });
  };

  const handleClearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
    saveNotifications([]);
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    handleClose();
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircleIcon sx={{ color: "#4caf50" }} />;
      case "warning":
        return <WarningIcon sx={{ color: "#ff9800" }} />;
      case "error":
        return <ErrorIcon sx={{ color: "#f44336" }} />;
      default:
        return <InfoIcon sx={{ color: "#2196f3" }} />;
    }
  };

  const getFilteredNotifications = () => {
    if (tabValue === 0) {
      return notifications.filter((n) => !n.read);
    } else if (tabValue === 1) {
      return notifications.filter((n) => n.read);
    } else {
      return notifications;
    }
  };

  const filteredNotifications = getFilteredNotifications();

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleOpen}
        sx={{
          "&:hover": {
            bgcolor: "rgba(255,255,255,0.1)",
          },
        }}
      >
        <Badge
          badgeContent={unreadCount}
          color="error"
          sx={{
            "& .MuiBadge-badge": {
              animation: unreadCount > 0 ? "pulse 1.5s ease-in-out infinite" : "none",
              "@keyframes pulse": {
                "0%": { transform: "scale(1)" },
                "50%": { transform: "scale(1.2)" },
                "100%": { transform: "scale(1)" },
              },
            },
          }}
        >
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 500,
            borderRadius: 2,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            overflow: "hidden",
          },
        }}
      >
        <Box
          sx={{
            p: 2,
            bgcolor: "#1a237e",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1rem" }}>
            🔔 Notifications
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            {notifications.filter(n => !n.read).length > 0 && (
              <Button
                size="small"
                onClick={handleMarkAllAsRead}
                sx={{
                  color: "white",
                  borderColor: "rgba(255,255,255,0.3)",
                  fontSize: "0.7rem",
                  textTransform: "none",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                }}
                startIcon={<DoneAllIcon fontSize="small" />}
              >
                Read All
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                size="small"
                onClick={handleClearAll}
                sx={{
                  color: "white",
                  borderColor: "rgba(255,255,255,0.3)",
                  fontSize: "0.7rem",
                  textTransform: "none",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                }}
                startIcon={<DeleteSweepIcon fontSize="small" />}
              >
                Clear All
              </Button>
            )}
          </Box>
        </Box>

        <Tabs
          value={tabValue}
          onChange={(_, v) => setTabValue(v)}
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            px: 2,
            "& .MuiTab-root": {
              textTransform: "none",
              fontSize: "0.8rem",
              minHeight: 40,
            },
          }}
        >
          <Tab label={`Unread (${unreadCount})`} />
          <Tab label="Read" />
          <Tab label="All" />
        </Tabs>

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress size={30} />
          </Box>
        )}

        {!loading && (
          <List sx={{ overflowY: "auto", maxHeight: 350, p: 0 }}>
            {filteredNotifications.length === 0 ? (
              <Box sx={{ textAlign: "center", p: 4 }}>
                <NotificationsIcon sx={{ fontSize: 48, color: "#ccc", mb: 1 }} />
                <Typography sx={{ color: "text.secondary", fontSize: "0.9rem" }}>
                  No notifications
                </Typography>
              </Box>
            ) : (
              filteredNotifications.map((notification, index) => (
                <div key={notification.id}>
                  <ListItem
                    sx={{
                      py: 1.5,
                      px: 2,
                      bgcolor: notification.read ? "transparent" : "#f0f4ff",
                      cursor: "pointer",
                      "&:hover": {
                        bgcolor: notification.read ? "#f5f5f5" : "#e3e9ff",
                      },
                      transition: "background-color 0.2s",
                    }}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: notification.read ? "#e0e0e0" : 
                            notification.type === "success" ? "#e8f5e9" :
                            notification.type === "warning" ? "#fff3e0" :
                            notification.type === "error" ? "#ffebee" : "#e3f2fd",
                          color: notification.read ? "#999" :
                            notification.type === "success" ? "#4caf50" :
                            notification.type === "warning" ? "#ff9800" :
                            notification.type === "error" ? "#f44336" : "#2196f3",
                        }}
                      >
                        {getNotificationIcon(notification.type)}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography
                          sx={{
                            fontWeight: notification.read ? 400 : 600,
                            fontSize: "0.875rem",
                          }}
                        >
                          {notification.title}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "text.secondary",
                              fontSize: "0.8rem",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {notification.message}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: "text.secondary", fontSize: "0.65rem" }}
                          >
                            {new Date(notification.createdAt).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </Typography>
                        </>
                      }
                    />
                    {!notification.read && (
                      <Chip
                        label="New"
                        size="small"
                        color="primary"
                        sx={{ height: 18, fontSize: "0.6rem", fontWeight: 600 }}
                      />
                    )}
                  </ListItem>
                  {index < filteredNotifications.length - 1 && <Divider />}
                </div>
              ))
            )}
          </List>
        )}

        <Box
          sx={{
            p: 1.5,
            borderTop: 1,
            borderColor: "divider",
            textAlign: "center",
            bgcolor: "#fafafa",
          }}
        >
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {notifications.length} notifications • Last updated: {new Date().toLocaleTimeString()}
          </Typography>
        </Box>
      </Popover>
    </>
  );
}

export default Notifications;