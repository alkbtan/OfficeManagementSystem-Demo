import { useState, useEffect } from "react";
import {
  Badge,
  IconButton,
  Menu,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  Avatar,
  Button,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import InfoIcon from "@mui/icons-material/Info";
import ErrorIcon from "@mui/icons-material/Error";
import { getEmployees } from "../../services/employeeService";

interface Notification {
  id: number;
  message: string;
  type: "success" | "warning" | "info" | "error";
  time: string;
  read: boolean;
  link?: string;
}

function Notifications() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      message: "New employee added: Mohammad Ali",
      type: "success",
      time: "2 min ago",
      read: false,
    },
    {
      id: 2,
      message: "Ticket #3 closed successfully",
      type: "info",
      time: "15 min ago",
      read: false,
    },
    {
      id: 3,
      message: "Asset Dell XPS 15 needs maintenance",
      type: "warning",
      time: "1 hour ago",
      read: false,
    },
    {
      id: 4,
      message: "AC-021 is not cooling properly",
      type: "error",
      time: "2 hours ago",
      read: false,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    // Mark all as read when opened
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircleIcon sx={{ color: "#4caf50" }} />;
      case "warning":
        return <WarningIcon sx={{ color: "#ff9800" }} />;
      case "error":
        return <ErrorIcon sx={{ color: "#f44336" }} />;
      default:
        return <InfoIcon sx={{ color: "#1976d2" }} />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case "success":
        return "success";
      case "warning":
        return "warning";
      case "error":
        return "error";
      default:
        return "info";
    }
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleClick}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 380,
            maxHeight: 500,
            mt: 1,
            borderRadius: 2,
            boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <NotificationsIcon sx={{ color: "#1976d2" }} />
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Notifications
            </Typography>
            <Chip
              label={`${unreadCount} unread`}
              size="small"
              color={unreadCount > 0 ? "primary" : "default"}
            />
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            {notifications.length > 0 && (
              <>
                <Button size="small" onClick={handleMarkAllRead}>
                  Mark all read
                </Button>
                <Button size="small" color="error" onClick={handleClearAll}>
                  Clear all
                </Button>
              </>
            )}
          </Box>
        </Box>

        {/* Notifications List */}
        <List sx={{ p: 0 }}>
          {notifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                🎉 No notifications
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                You're all caught up!
              </Typography>
            </Box>
          ) : (
            notifications.map((notif) => (
              <ListItem
                key={notif.id}
                sx={{
                  bgcolor: notif.read ? "transparent" : "action.hover",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                  "&:last-child": {
                    borderBottom: "none",
                  },
                  py: 1.5,
                }}
              >
                <ListItemIcon>{getIcon(notif.type)}</ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body2" sx={{ fontWeight: notif.read ? "normal" : "medium" }}>
                      {notif.message}
                    </Typography>
                  }
                  secondary={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                      <Chip
                        label={notif.type}
                        size="small"
                        color={getColor(notif.type) as any}
                        variant="outlined"
                        sx={{ height: 20, fontSize: "0.6rem" }}
                      />
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        {notif.time}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))
          )}
        </List>

        {/* Footer */}
        <Divider />
        <Box sx={{ p: 1.5, textAlign: "center" }}>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {notifications.length} total notifications
          </Typography>
        </Box>
      </Menu>
    </>
  );
}

export default Notifications;