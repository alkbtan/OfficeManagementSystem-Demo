import { useEffect, useState } from "react";
import {
  Box, Typography, Grid, Card, CardContent, Paper, Button, IconButton,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Snackbar, Alert, Chip, Avatar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { useTranslation } from "react-i18next";
import { userService } from "../../services/userService";
import type { User } from "../../services/userService";

function Users() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openResetPasswordDialog, setOpenResetPasswordDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "User",
    status: "Active",
  });

  const roles = ["User", "Admin", "Manager"];
  const statuses = ["Active", "Inactive"];

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await userService.getAll();
      setUsers(data);
    } catch (error) {
      console.error("Error loading users:", error);
      showSnackbar(t("common.error"), "error");
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

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username || "",
        email: user.email || "",
        password: "",
        role: user.role || "User",
        status: user.status || "Active",
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: "",
        email: "",
        password: "",
        role: "User",
        status: "Active",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
  };

  const handleOpenResetPassword = (user: User) => {
    setSelectedUser(user);
    setNewPassword("");
    setOpenResetPasswordDialog(true);
  };

  const handleCloseResetPassword = () => {
    setOpenResetPasswordDialog(false);
    setSelectedUser(null);
    setNewPassword("");
  };

  const handleResetPassword = async () => {
    if (!selectedUser) return;
    if (!newPassword.trim() || newPassword.length < 6) {
      showSnackbar(t("users.passwordHelper"), "error");
      return;
    }

    try {
      await userService.resetPassword(selectedUser.id, newPassword);
      showSnackbar(t("common.success"), "success");
      handleCloseResetPassword();
    } catch (error: any) {
      console.error("Error resetting password:", error);
      const errorMessage =
        error?.response?.data?.message || t("common.error");
      showSnackbar(errorMessage, "error");
    }
  };

  const handleSaveUser = async () => {
    if (!formData.username.trim()) {
      showSnackbar(`${t("users.username")} ${t("common.required")}`, "error");
      return;
    }
    if (!formData.email.trim()) {
      showSnackbar(`${t("users.email")} ${t("common.required")}`, "error");
      return;
    }
    if (!editingUser && !formData.password.trim()) {
      showSnackbar(`${t("users.password")} ${t("common.required")}`, "error");
      return;
    }

    try {
      const dataToSend = {
        username: formData.username,
        name: formData.username, // Use username as name automatically
        email: formData.email,
        password: formData.password || undefined,
        role: formData.role,
        status: formData.status,
      };

      if (editingUser) {
        await userService.update(editingUser.id, dataToSend);
        showSnackbar(t("common.success"), "success");
      } else {
        await userService.create(dataToSend);
        showSnackbar(t("common.success"), "success");
      }
      handleCloseDialog();
      loadData();
    } catch (error: any) {
      console.error("Error saving user:", error);
      const errorMessage =
        error?.response?.data?.message || t("common.error");
      showSnackbar(errorMessage, "error");
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (window.confirm(t("common.confirmDelete"))) {
      try {
        await userService.delete(id);
        showSnackbar(t("common.success"), "success");
        loadData();
      } catch (error) {
        console.error("Error deleting user:", error);
        showSnackbar(t("common.error"), "error");
      }
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "error";
      case "Manager":
        return "warning";
      default:
        return "info";
    }
  };

  const getStatusColor = (status: string) => {
    return status === "Active" ? "success" : "default";
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: "#f5f7fa", minHeight: "100vh" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#1a237e" }}>
            👤 {t("users.title")}
          </Typography>
          <Typography sx={{ color: "#666", mt: 0.5 }}>
            {t("users.subtitle")}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadData}
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            {t("common.refresh")}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              bgcolor: "#1a237e",
              "&:hover": { bgcolor: "#0d1445" },
            }}
          >
            {t("users.addUser")}
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: "#666", fontWeight: 500 }}
                  >
                    {t("users.totalUsers")}
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 700, color: "#1a237e", mt: 0.5 }}
                  >
                    {users.length}
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    bgcolor: "#e8eaf6",
                    width: 48,
                    height: 48,
                    color: "#1a237e",
                  }}
                >
                  <PersonIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: "#666", fontWeight: 500 }}
                  >
                    {t("users.admins")}
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 700, color: "#d32f2f", mt: 0.5 }}
                  >
                    {users.filter((u) => u.role === "Admin").length}
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    bgcolor: "#ffebee",
                    width: 48,
                    height: 48,
                    color: "#d32f2f",
                  }}
                >
                  <AdminPanelSettingsIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: "#666", fontWeight: 500 }}
                  >
                    {t("users.activeUsers")}
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 700, color: "#4caf50", mt: 0.5 }}
                  >
                    {users.filter((u) => u.status === "Active").length}
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    bgcolor: "#e8f5e9",
                    width: 48,
                    height: 48,
                    color: "#4caf50",
                  }}
                >
                  <PersonIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        }}
      >
        {users.length === 0 ? (
          <Box sx={{ p: 6, textAlign: "center" }}>
            <PersonIcon sx={{ fontSize: 64, color: "#ccc", mb: 2 }} />
            <Typography variant="h6" sx={{ color: "#666" }}>
              {t("common.noItems")}
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: "#f5f7fa" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: "#1a237e" }}>
                    {t("users.username")}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#1a237e" }}>
                    {t("users.email")}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#1a237e" }}>
                    {t("users.role")}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#1a237e" }}>
                    {t("common.status")}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#1a237e" }}>
                    {t("common.actions")}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} sx={{ "&:hover": { bgcolor: "#f8f9ff" } }}>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: "#1a237e",
                            width: 36,
                            height: 36,
                          }}
                        >
                          {user.username?.[0]?.toUpperCase() || "U"}
                        </Avatar>
                        <Typography sx={{ fontWeight: 600 }}>
                          {user.username}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <EmailIcon sx={{ fontSize: 16, color: "#999" }} />
                        <Typography variant="body2">{user.email}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        size="small"
                        color={getRoleColor(user.role) as any}
                        sx={{ fontWeight: 500, borderRadius: 2 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.status}
                        size="small"
                        color={getStatusColor(user.status) as any}
                        sx={{ fontWeight: 500, borderRadius: 2 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Tooltip title={t("common.edit")}>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(user)}
                            sx={{
                              color: "#1a237e",
                              bgcolor: "#e8eaf6",
                              "&:hover": { bgcolor: "#c5cae9" },
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t("users.resetPassword")}>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenResetPassword(user)}
                            sx={{
                              color: "#e65100",
                              bgcolor: "#fff3e0",
                              "&:hover": { bgcolor: "#ffe0b2" },
                            }}
                          >
                            <VpnKeyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t("common.delete")}>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteUser(user.id)}
                            sx={{
                              color: "#f44336",
                              bgcolor: "#ffebee",
                              "&:hover": { bgcolor: "#ffcdd2" },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: "#1a237e", color: "white" }}>
          {editingUser
            ? `✏️ ${t("users.editUser")}`
            : `➕ ${t("users.addUser")}`}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box
            sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
          >
            <TextField
              label={t("users.username")}
              fullWidth
              required
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
            />
            <TextField
              label={t("users.email")}
              fullWidth
              required
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
            {!editingUser ? (
              <TextField
                label={t("users.password")}
                fullWidth
                required
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            ) : (
              <TextField
                label={t("users.keepPasswordEmpty")}
                fullWidth
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            )}
            <TextField
              select
              label={t("users.role")}
              fullWidth
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
            >
              {roles.map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label={t("common.status")}
              fullWidth
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
            >
              {statuses.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            onClick={handleCloseDialog}
            variant="outlined"
            color="inherit"
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            {t("common.cancel")}
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveUser}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              bgcolor: "#1a237e",
              "&:hover": { bgcolor: "#0d1445" },
            }}
          >
            {editingUser ? t("common.update") : t("common.add")}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openResetPasswordDialog}
        onClose={handleCloseResetPassword}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: "#e65100", color: "white" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <VpnKeyIcon />
            {t("users.resetPassword")}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <Typography variant="body2" sx={{ color: "#666" }}>
              {selectedUser?.username} ({selectedUser?.email})
            </Typography>
            <TextField
              label={t("users.newPassword")}
              fullWidth
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t("users.passwordPlaceholder")}
              helperText={t("users.passwordHelper")}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            onClick={handleCloseResetPassword}
            variant="outlined"
            color="inherit"
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            {t("common.cancel")}
          </Button>
          <Button
            variant="contained"
            onClick={handleResetPassword}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              bgcolor: "#e65100",
              "&:hover": { bgcolor: "#bf360c" },
            }}
          >
            {t("users.resetPassword")}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
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

export default Users;