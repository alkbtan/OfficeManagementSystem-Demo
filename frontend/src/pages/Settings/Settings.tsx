import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Button,
  TextField,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import RestoreIcon from "@mui/icons-material/Restore";
import BusinessIcon from "@mui/icons-material/Business";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import LanguageIcon from "@mui/icons-material/Language";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ColorLensIcon from "@mui/icons-material/ColorLens";

interface SettingsData {
  organizationName: string;
  currency: string;
  locale: string;
  theme: string;
  notificationsEnabled: boolean;
  darkMode: boolean;
  dateFormat: string;
}

function Settings() {
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  // Load settings from localStorage
  const loadSettings = (): SettingsData => {
    const saved = localStorage.getItem("app_settings");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error loading settings:", e);
      }
    }
    return {
      organizationName: "TestFlyQA",
      currency: "BRL",
      locale: "pt-BR",
      theme: "default",
      notificationsEnabled: true,
      darkMode: false,
      dateFormat: "DD/MM/YYYY",
    };
  };

  const [settings, setSettings] = useState<SettingsData>(loadSettings);

  // ✅ Apply dark mode immediately when settings change
  useEffect(() => {
    applyTheme(settings.darkMode);
  }, [settings.darkMode]);

  const applyTheme = (darkMode: boolean) => {
    const root = document.documentElement;
    if (darkMode) {
      root.style.backgroundColor = "#121212";
      root.style.color = "#ffffff";
      document.body.style.backgroundColor = "#121212";
      document.body.style.color = "#ffffff";
      
      // Apply to all MUI components via CSS
      const style = document.createElement('style');
      style.id = 'dark-mode-style';
      style.textContent = `
        .MuiPaper-root { background-color: #1e1e1e !important; color: #ffffff !important; }
        .MuiTypography-root { color: #ffffff !important; }
        .MuiInputLabel-root { color: #aaaaaa !important; }
        .MuiOutlinedInput-root fieldset { border-color: #444444 !important; }
        .MuiOutlinedInput-root input { color: #ffffff !important; }
        .MuiSelect-select { color: #ffffff !important; }
        .MuiCard-root { background-color: #1e1e1e !important; }
        .MuiCardContent-root { color: #ffffff !important; }
        .MuiFormControlLabel-label { color: #ffffff !important; }
        .MuiChip-root { color: #ffffff !important; }
        .MuiTable-root { background-color: #1e1e1e !important; }
        .MuiTableRow-root { background-color: #1e1e1e !important; }
        .MuiTableCell-root { color: #ffffff !important; border-color: #444444 !important; }
      `;
      
      // Remove existing dark mode style if any
      const existing = document.getElementById('dark-mode-style');
      if (existing) existing.remove();
      document.head.appendChild(style);
    } else {
      // Remove dark mode
      const existing = document.getElementById('dark-mode-style');
      if (existing) existing.remove();
      
      root.style.backgroundColor = "#f5f7fa";
      root.style.color = "#000000";
      document.body.style.backgroundColor = "#f5f7fa";
      document.body.style.color = "#000000";
    }
  };

  const currencies = [
    { value: "BRL", label: "R$ - Brazilian Real" },
    { value: "USD", label: "$ - US Dollar" },
    { value: "EUR", label: "€ - Euro" },
    { value: "GBP", label: "£ - British Pound" },
  ];

  const locales = [
    { value: "pt-BR", label: "Portuguese (Brazil)" },
    { value: "en-US", label: "English (US)" },
    { value: "en-UK", label: "English (UK)" },
    { value: "es-ES", label: "Spanish (Spain)" },
  ];

  const dateFormats = [
    { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
    { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
    { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
  ];

  const themes = [
    { value: "default", label: "Default" },
    { value: "dark", label: "Dark" },
    { value: "light", label: "Light" },
  ];

  const showSnackbar = (message: string, severity: "success" | "error" | "info" | "warning") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSave = () => {
    setSaving(true);
    try {
      localStorage.setItem("app_settings", JSON.stringify(settings));
      
      // ✅ Apply settings immediately
      applyTheme(settings.darkMode);
      
      setTimeout(() => {
        setSaving(false);
        showSnackbar("Settings saved successfully! Changes applied.", "success");
      }, 500);
    } catch (error) {
      setSaving(false);
      showSnackbar("Failed to save settings", "error");
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all settings to defaults?")) {
      const defaultSettings: SettingsData = {
        organizationName: "TestFlyQA",
        currency: "BRL",
        locale: "pt-BR",
        theme: "default",
        notificationsEnabled: true,
        darkMode: false,
        dateFormat: "DD/MM/YYYY",
      };
      setSettings(defaultSettings);
      localStorage.setItem("app_settings", JSON.stringify(defaultSettings));
      applyTheme(false);
      showSnackbar("Settings reset to defaults!", "info");
    }
  };

  const handleChange = (field: keyof SettingsData, value: any) => {
    setSettings({ ...settings, [field]: value });
  };

  return (
    <Box sx={{ p: 3, minHeight: "100vh", bgcolor: settings.darkMode ? "#121212" : "#f5f7fa" }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: settings.darkMode ? "#ffffff" : "#1a237e" }}>
            ⚙️ Settings
          </Typography>
          <Typography sx={{ color: settings.darkMode ? "#aaaaaa" : "#666", mt: 0.5 }}>
            System configuration and management
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RestoreIcon />}
            onClick={handleReset}
            sx={{ 
              borderRadius: 2, 
              textTransform: "none",
              color: settings.darkMode ? "#ffffff" : undefined,
              borderColor: settings.darkMode ? "#666" : undefined,
            }}
          >
            Reset to Defaults
          </Button>
          <Button
            variant="contained"
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            onClick={handleSave}
            disabled={saving}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              bgcolor: "#1a237e",
              "&:hover": { bgcolor: "#0d1445" },
              minWidth: 140,
            }}
          >
            {saving ? "Saving..." : "Save All"}
          </Button>
        </Box>
      </Box>

      {/* Preview Card - Shows current settings in action */}
      <Card sx={{ borderRadius: 3, p: 3, mb: 3, bgcolor: settings.darkMode ? "#1e1e1e" : "white" }}>
        <Typography variant="body2" sx={{ color: settings.darkMode ? "#aaa" : "#666" }}>
          Preview
        </Typography>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={6}>
            <Typography variant="body2" sx={{ color: settings.darkMode ? "#aaa" : "#666" }}>
              Currency Format:
            </Typography>
            <Typography variant="h6" sx={{ color: settings.darkMode ? "#fff" : "#1a237e" }}>
              {settings.currency === "BRL" ? "R$ 1.250,75" :
               settings.currency === "USD" ? "$1,250.75" :
               settings.currency === "EUR" ? "€1,250.75" :
               "£1,250.75"}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" sx={{ color: settings.darkMode ? "#aaa" : "#666" }}>
              Date Format:
            </Typography>
            <Typography variant="h6" sx={{ color: settings.darkMode ? "#fff" : "#1a237e" }}>
              {settings.dateFormat === "DD/MM/YYYY" ? "22/08/2026" :
               settings.dateFormat === "MM/DD/YYYY" ? "08/22/2026" :
               "2026-08-22"}
            </Typography>
          </Grid>
        </Grid>
        <Typography variant="caption" sx={{ color: settings.darkMode ? "#666" : "#999", display: "block", mt: 1 }}>
          {settings.darkMode ? "🌙 Dark Mode Active" : "☀️ Light Mode Active"}
        </Typography>
      </Card>

      {/* Organization Settings */}
      <Paper sx={{ borderRadius: 3, p: 3, mb: 3, bgcolor: settings.darkMode ? "#1e1e1e" : "white" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <BusinessIcon sx={{ color: "#1a237e" }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: settings.darkMode ? "#ffffff" : "#1a237e" }}>
            Organization Settings
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Organization Name"
              fullWidth
              value={settings.organizationName}
              onChange={(e) => handleChange("organizationName", e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
                "& .MuiInputLabel-root": { color: settings.darkMode ? "#aaa" : undefined },
                "& .MuiOutlinedInput-input": { color: settings.darkMode ? "#fff" : undefined },
                "& .MuiOutlinedInput-root fieldset": { 
                  borderColor: settings.darkMode ? "#444" : undefined 
                },
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              select
              label="Currency"
              fullWidth
              value={settings.currency}
              onChange={(e) => handleChange("currency", e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
                "& .MuiInputLabel-root": { color: settings.darkMode ? "#aaa" : undefined },
                "& .MuiOutlinedInput-input": { color: settings.darkMode ? "#fff" : undefined },
                "& .MuiOutlinedInput-root fieldset": { 
                  borderColor: settings.darkMode ? "#444" : undefined 
                },
                "& .MuiSelect-select": { color: settings.darkMode ? "#fff" : undefined },
              }}
            >
              {currencies.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Localization */}
      <Paper sx={{ borderRadius: 3, p: 3, mb: 3, bgcolor: settings.darkMode ? "#1e1e1e" : "white" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <LanguageIcon sx={{ color: "#1a237e" }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: settings.darkMode ? "#ffffff" : "#1a237e" }}>
            Localization
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              select
              label="Locale"
              fullWidth
              value={settings.locale}
              onChange={(e) => handleChange("locale", e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
                "& .MuiInputLabel-root": { color: settings.darkMode ? "#aaa" : undefined },
                "& .MuiOutlinedInput-input": { color: settings.darkMode ? "#fff" : undefined },
                "& .MuiOutlinedInput-root fieldset": { 
                  borderColor: settings.darkMode ? "#444" : undefined 
                },
                "& .MuiSelect-select": { color: settings.darkMode ? "#fff" : undefined },
              }}
            >
              {locales.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              select
              label="Date Format"
              fullWidth
              value={settings.dateFormat}
              onChange={(e) => handleChange("dateFormat", e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
                "& .MuiInputLabel-root": { color: settings.darkMode ? "#aaa" : undefined },
                "& .MuiOutlinedInput-input": { color: settings.darkMode ? "#fff" : undefined },
                "& .MuiOutlinedInput-root fieldset": { 
                  borderColor: settings.darkMode ? "#444" : undefined 
                },
                "& .MuiSelect-select": { color: settings.darkMode ? "#fff" : undefined },
              }}
            >
              {dateFormats.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Appearance */}
      <Paper sx={{ borderRadius: 3, p: 3, mb: 3, bgcolor: settings.darkMode ? "#1e1e1e" : "white" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <ColorLensIcon sx={{ color: "#1a237e" }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: settings.darkMode ? "#ffffff" : "#1a237e" }}>
            Appearance
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              select
              label="Theme"
              fullWidth
              value={settings.theme}
              onChange={(e) => handleChange("theme", e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
                "& .MuiInputLabel-root": { color: settings.darkMode ? "#aaa" : undefined },
                "& .MuiOutlinedInput-input": { color: settings.darkMode ? "#fff" : undefined },
                "& .MuiOutlinedInput-root fieldset": { 
                  borderColor: settings.darkMode ? "#444" : undefined 
                },
                "& .MuiSelect-select": { color: settings.darkMode ? "#fff" : undefined },
              }}
            >
              {themes.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.darkMode}
                  onChange={(e) => handleChange("darkMode", e.target.checked)}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: "#7b1fa2",
                    },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      bgcolor: "#7b1fa2",
                    },
                  }}
                />
              }
              label={
                <Typography sx={{ color: settings.darkMode ? "#fff" : "#000" }}>
                  Dark Mode
                </Typography>
              }
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Notifications */}
      <Paper sx={{ borderRadius: 3, p: 3, bgcolor: settings.darkMode ? "#1e1e1e" : "white" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <NotificationsIcon sx={{ color: "#1a237e" }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: settings.darkMode ? "#ffffff" : "#1a237e" }}>
            Notifications
          </Typography>
        </Box>

        <FormControlLabel
          control={
            <Switch
              checked={settings.notificationsEnabled}
              onChange={(e) => handleChange("notificationsEnabled", e.target.checked)}
              sx={{
                "& .MuiSwitch-switchBase.Mui-checked": {
                  color: "#7b1fa2",
                },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                  bgcolor: "#7b1fa2",
                },
              }}
            />
          }
          label={
            <Typography sx={{ color: settings.darkMode ? "#fff" : "#000" }}>
              Enable Notifications
            </Typography>
          }
        />
      </Paper>

      {/* Snackbar */}
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

export default Settings;