import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Avatar,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Tab,
  Tabs,
} from "@mui/material";
import {
  Settings as SettingsIcon,
  Security,
  Language,
  Palette,
  Storage,
  Notifications,
  People,
  Business,
  Save,
  RestartAlt,
  Delete,
  AdminPanelSettings,
  Person,
  VpnKey,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useThemeContext } from "../../context/ThemeContext";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function Settings() {
  const { t } = useTranslation();
  const { primaryColor, setPrimaryColor, darkMode, setDarkMode } = useThemeContext();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  // ✅ General settings
  const [generalSettings, setGeneralSettings] = useState({
    companyName: "QA Company",
    department: "Office Management",
    currency: "R$ (BRL)",
    locale: "Brazil (pt-BR)",
  });

  // ✅ Appearance settings (synced with context)
  const [appearanceSettings, setAppearanceSettings] = useState({
    darkMode: darkMode,
    primaryColor: primaryColor,
    fontSize: "medium",
  });

  // ✅ Security settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 60,
    passwordExpiry: 90,
  });

  // ✅ Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    maintenance: true,
    lowStock: true,
  });

  // ✅ Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("appSettings");
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        setGeneralSettings(settings.general || { companyName: "QA Company", department: "Office Management", currency: "R$ (BRL)", locale: "Brazil (pt-BR)" });
        setAppearanceSettings({
          darkMode: settings.appearance?.darkMode || false,
          primaryColor: settings.appearance?.primaryColor || "#1976d2",
          fontSize: settings.appearance?.fontSize || "medium",
        });
        setSecuritySettings(settings.security || { twoFactorAuth: false, sessionTimeout: 60, passwordExpiry: 90 });
        setNotificationSettings(settings.notifications || { email: true, push: true, maintenance: true, lowStock: true });
      } catch {
        // Use defaults
      }
    }
  }, []);

  // ✅ Roles
  const [roles, setRoles] = useState(() => {
    const saved = localStorage.getItem("appRoles");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [
          { id: 1, name: "Admin", users: 3, permissions: ["All"] },
          { id: 2, name: "Manager", users: 5, permissions: ["Read", "Write"] },
          { id: 3, name: "Staff", users: 12, permissions: ["Read"] },
          { id: 4, name: "Viewer", users: 8, permissions: ["Read"] },
        ];
      }
    }
    return [
      { id: 1, name: "Admin", users: 3, permissions: ["All"] },
      { id: 2, name: "Manager", users: 5, permissions: ["Read", "Write"] },
      { id: 3, name: "Staff", users: 12, permissions: ["Read"] },
      { id: 4, name: "Viewer", users: 8, permissions: ["Read"] },
    ];
  });

  // ✅ Users
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem("appUsers");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [
          { id: 1, name: "Admin User", email: "admin@example.com", role: "Admin", status: "Active" },
          { id: 2, name: "Mohammad Alshaar", email: "mohammad@example.com", role: "Manager", status: "Active" },
          { id: 3, name: "Ahmed Ali", email: "ahmed@example.com", role: "Staff", status: "Inactive" },
        ];
      }
    }
    return [
      { id: 1, name: "Admin User", email: "admin@example.com", role: "Admin", status: "Active" },
      { id: 2, name: "Mohammad Alshaar", email: "mohammad@example.com", role: "Manager", status: "Active" },
      { id: 3, name: "Ahmed Ali", email: "ahmed@example.com", role: "Staff", status: "Inactive" },
    ];
  });

  const [openRoleDialog, setOpenRoleDialog] = useState(false);
  const [newRole, setNewRole] = useState({ name: "", permissions: [] as string[] });
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "Staff", password: "" });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const showSnackbar = (message: string, severity: "success" | "error" | "info" | "warning") => {
    setSnackbar({ open: true, message, severity });
  };

  // ✅ Save all settings
  const saveAllSettings = () => {
    setLoading(true);
    
    // ✅ Update context (this will update the theme)
    setPrimaryColor(appearanceSettings.primaryColor);
    setDarkMode(appearanceSettings.darkMode);
    
    const settings = {
      general: generalSettings,
      appearance: appearanceSettings,
      security: securitySettings,
      notifications: notificationSettings,
    };
    localStorage.setItem("appSettings", JSON.stringify(settings));
    localStorage.setItem("appRoles", JSON.stringify(roles));
    localStorage.setItem("appUsers", JSON.stringify(users));
    
    setTimeout(() => {
      setLoading(false);
      showSnackbar("All settings saved successfully!", "success");
    }, 500);
  };

  // ✅ Reset to defaults
  const resetToDefaults = () => {
    if (window.confirm("Are you sure you want to reset all settings to defaults?")) {
      setGeneralSettings({ companyName: "QA Company", department: "Office Management", currency: "R$ (BRL)", locale: "Brazil (pt-BR)" });
      setAppearanceSettings({ darkMode: false, primaryColor: "#1976d2", fontSize: "medium" });
      setSecuritySettings({ twoFactorAuth: false, sessionTimeout: 60, passwordExpiry: 90 });
      setNotificationSettings({ email: true, push: true, maintenance: true, lowStock: true });
      setPrimaryColor("#1976d2");
      setDarkMode(false);
      localStorage.removeItem("appSettings");
      localStorage.removeItem("appRoles");
      localStorage.removeItem("appUsers");
      showSnackbar("Settings reset to defaults!", "info");
    }
  };

  const handleAddRole = () => {
    if (newRole.name) {
      const updated = [...roles, { id: roles.length + 1, name: newRole.name, users: 0, permissions: ["Read"] }];
      setRoles(updated);
      localStorage.setItem("appRoles", JSON.stringify(updated));
      setOpenRoleDialog(false);
      setNewRole({ name: "", permissions: [] });
      showSnackbar(`Role "${newRole.name}" added successfully!`, "success");
    }
  };

  const handleDeleteRole = (id: number) => {
    if (window.confirm("Are you sure you want to delete this role?")) {
      const updated = roles.filter((r) => r.id !== id);
      setRoles(updated);
      localStorage.setItem("appRoles", JSON.stringify(updated));
      showSnackbar("Role deleted successfully!", "success");
    }
  };

  const handleAddUser = () => {
    if (newUser.name && newUser.email) {
      const updated = [...users, { 
        id: users.length + 1, 
        name: newUser.name, 
        email: newUser.email, 
        role: newUser.role, 
        status: "Active" 
      }];
      setUsers(updated);
      localStorage.setItem("appUsers", JSON.stringify(updated));
      setOpenUserDialog(false);
      setNewUser({ name: "", email: "", role: "Staff", password: "" });
      showSnackbar(`User "${newUser.name}" added successfully!`, "success");
    }
  };

  const handleDeleteUser = (id: number) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      const updated = users.filter((u) => u.id !== id);
      setUsers(updated);
      localStorage.setItem("appUsers", JSON.stringify(updated));
      showSnackbar("User deleted successfully!", "success");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: "bold", color: "#1a237e" }}>
            ⚙️ {t("sidebar.settings")}
          </Typography>
          <Typography sx={{ color: "text.secondary" }}>
            System configuration and management
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="outlined" color="error" startIcon={<RestartAlt />} onClick={resetToDefaults}>
            Reset to Defaults
          </Button>
          <Button variant="contained" startIcon={<Save />} onClick={saveAllSettings} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Save All"}
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            bgcolor: "#f5f5f5",
            borderBottom: 1,
            borderColor: "divider",
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 500,
              minHeight: 64,
            },
            "& .Mui-selected": {
              color: "#1976d2",
            },
          }}
        >
          <Tab icon={<Business />} label="Organization" />
          <Tab icon={<Palette />} label="Appearance" />
          <Tab icon={<Security />} label="Security" />
          <Tab icon={<People />} label="Roles" />
          <Tab icon={<AdminPanelSettings />} label="Users" />
          <Tab icon={<Notifications />} label="Notifications" />
        </Tabs>

        {/* Tab: Organization */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 3 }}>
            Organization Settings
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Organization Name"
                fullWidth
                value={generalSettings.companyName}
                onChange={(e) =>
                  setGeneralSettings({ ...generalSettings, companyName: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Department"
                fullWidth
                value={generalSettings.department}
                onChange={(e) =>
                  setGeneralSettings({ ...generalSettings, department: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Currency</InputLabel>
                <Select
                  value={generalSettings.currency}
                  label="Currency"
                  onChange={(e) =>
                    setGeneralSettings({ ...generalSettings, currency: e.target.value })
                  }
                >
                  <MenuItem value="R$ (BRL)">R$ (BRL)</MenuItem>
                  <MenuItem value="$ (USD)">$ (USD)</MenuItem>
                  <MenuItem value="€ (EUR)">€ (EUR)</MenuItem>
                  <MenuItem value="£ (GBP)">£ (GBP)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Locale</InputLabel>
                <Select
                  value={generalSettings.locale}
                  label="Locale"
                  onChange={(e) =>
                    setGeneralSettings({ ...generalSettings, locale: e.target.value })
                  }
                >
                  <MenuItem value="Brazil (pt-BR)">Brazil (pt-BR)</MenuItem>
                  <MenuItem value="United States (en-US)">United States (en-US)</MenuItem>
                  <MenuItem value="United Kingdom (en-GB)">United Kingdom (en-GB)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab: Appearance - ✅ يعمل مع Context */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 3 }}>
            Appearance Settings
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={appearanceSettings.darkMode}
                    onChange={(e) => {
                      setAppearanceSettings({ ...appearanceSettings, darkMode: e.target.checked });
                      setDarkMode(e.target.checked); // ✅ Update context immediately
                    }}
                  />
                }
                label="Dark Mode"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Primary Color</InputLabel>
                <Select
                  value={appearanceSettings.primaryColor}
                  label="Primary Color"
                  onChange={(e) => {
                    const color = e.target.value;
                    setAppearanceSettings({ ...appearanceSettings, primaryColor: color });
                    setPrimaryColor(color); // ✅ Update context immediately
                  }}
                >
                  <MenuItem value="#1976d2">🔵 Blue</MenuItem>
                  <MenuItem value="#4caf50">🟢 Green</MenuItem>
                  <MenuItem value="#f44336">🔴 Red</MenuItem>
                  <MenuItem value="#ff9800">🟠 Orange</MenuItem>
                  <MenuItem value="#9c27b0">🟣 Purple</MenuItem>
                  <MenuItem value="#1a237e">🔵 Dark Blue</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Font Size</InputLabel>
                <Select
                  value={appearanceSettings.fontSize}
                  label="Font Size"
                  onChange={(e) =>
                    setAppearanceSettings({ ...appearanceSettings, fontSize: e.target.value })
                  }
                >
                  <MenuItem value="small">Small</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="large">Large</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab: Security */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 3 }}>
            Security Settings
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={securitySettings.twoFactorAuth}
                    onChange={(e) =>
                      setSecuritySettings({ ...securitySettings, twoFactorAuth: e.target.checked })
                    }
                  />
                }
                label="Two-Factor Authentication"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Session Timeout (minutes)"
                type="number"
                fullWidth
                value={securitySettings.sessionTimeout}
                onChange={(e) =>
                  setSecuritySettings({ ...securitySettings, sessionTimeout: Number(e.target.value) })
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Password Expiry (days)"
                type="number"
                fullWidth
                value={securitySettings.passwordExpiry}
                onChange={(e) =>
                  setSecuritySettings({ ...securitySettings, passwordExpiry: Number(e.target.value) })
                }
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab: Roles */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Roles & Permissions
            </Typography>
            <Button variant="contained" onClick={() => setOpenRoleDialog(true)}>
              Add Role
            </Button>
          </Box>
          <Grid container spacing={2}>
            {roles.map((role) => (
              <Grid item xs={12} md={6} key={role.id}>
                <Card sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                          {role.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                          {role.users} users · {role.permissions.join(", ")}
                        </Typography>
                      </Box>
                      <IconButton color="error" onClick={() => handleDeleteRole(role.id)}>
                        <Delete />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Tab: Users */}
        <TabPanel value={tabValue} index={4}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              User Management
            </Typography>
            <Button variant="contained" onClick={() => setOpenUserDialog(true)}>
              Add User
            </Button>
          </Box>
          <List>
            {users.map((user) => (
              <ListItem
                key={user.id}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  bgcolor: "#f5f5f5",
                  "&:hover": { bgcolor: "#e0e0e0" },
                }}
              >
                <ListItemIcon>
                  <Avatar sx={{ bgcolor: user.status === "Active" ? "#4caf50" : "#f44336" }}>
                    <Person />
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={user.name}
                  secondary={`${user.email} · ${user.role}`}
                />
                <ListItemSecondaryAction>
                  <Chip
                    label={user.status}
                    size="small"
                    color={user.status === "Active" ? "success" : "error"}
                    sx={{ mr: 1 }}
                  />
                  <IconButton color="error" onClick={() => handleDeleteUser(user.id)}>
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </TabPanel>

        {/* Tab: Notifications */}
        <TabPanel value={tabValue} index={5}>
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 3 }}>
            Notification Settings
          </Typography>
          <List>
            {[
              { id: "email", label: "Email Notifications", description: "Receive notifications via email", key: "email" },
              { id: "push", label: "Push Notifications", description: "Receive push notifications in browser", key: "push" },
              { id: "maintenance", label: "Maintenance Alerts", description: "Get alerts for maintenance tasks", key: "maintenance" },
              { id: "lowStock", label: "Low Stock Alerts", description: "Get alerts when inventory is low", key: "lowStock" },
            ].map((item) => (
              <ListItem key={item.id} sx={{ borderBottom: 1, borderColor: "divider" }}>
                <ListItemText
                  primary={item.label}
                  secondary={item.description}
                />
                <Switch
                  checked={notificationSettings[item.key as keyof typeof notificationSettings]}
                  onChange={(e) =>
                    setNotificationSettings({ ...notificationSettings, [item.key]: e.target.checked })
                  }
                />
              </ListItem>
            ))}
          </List>
        </TabPanel>
      </Paper>

      {/* Dialogs */}
      <Dialog open={openRoleDialog} onClose={() => setOpenRoleDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Role</DialogTitle>
        <DialogContent>
          <TextField
            label="Role Name"
            fullWidth
            margin="normal"
            value={newRole.name}
            onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRoleDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddRole}>Add</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openUserDialog} onClose={() => setOpenUserDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            margin="normal"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          />
          <TextField
            label="Email"
            fullWidth
            margin="normal"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select
              value={newUser.role}
              label="Role"
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            >
              <MenuItem value="Admin">Admin</MenuItem>
              <MenuItem value="Manager">Manager</MenuItem>
              <MenuItem value="Staff">Staff</MenuItem>
              <MenuItem value="Viewer">Viewer</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUserDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddUser}>Add</Button>
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
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Settings;