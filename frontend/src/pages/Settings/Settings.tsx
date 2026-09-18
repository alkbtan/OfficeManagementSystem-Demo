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
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import RestoreIcon from "@mui/icons-material/Restore";
import BusinessIcon from "@mui/icons-material/Business";
import LanguageIcon from "@mui/icons-material/Language";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ColorLensIcon from "@mui/icons-material/ColorLens";
import { useThemeContext } from "../../context/ThemeContext";
import { useTranslation } from "react-i18next";

interface SettingsData {
  organizationName: string;
  currency: string;
  locale: string;
  theme: string;
  notificationsEnabled: boolean;
  darkMode: boolean;
  dateFormat: string;
  language: string;
}

const defaultSettingsData: SettingsData = {
  organizationName: "TestFlyQA",
  currency: "BRL",
  locale: "pt-BR",
  theme: "default",
  notificationsEnabled: true,
  darkMode: false,
  dateFormat: "DD/MM/YYYY",
  language: "en",
};

function Settings() {
  const { t, i18n } = useTranslation();
  const { darkMode, setDarkMode } = useThemeContext();
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
        const parsed = JSON.parse(saved);
        return { ...defaultSettingsData, ...parsed };
      } catch (e) {
        console.error("Error loading settings:", e);
      }
    }
    return defaultSettingsData;
  };

  const [settings, setSettings] = useState<SettingsData>(loadSettings);

  // Sync dark mode with ThemeContext
  useEffect(() => {
    if (settings.darkMode !== darkMode) {
      setDarkMode(settings.darkMode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.darkMode]);

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

  const languages = [
    { value: "en", label: "English" },
    { value: "pt", label: "Português (Brasil)" },
  ];

  const showSnackbar = (
    message: string,
    severity: "success" | "error" | "info" | "warning"
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSave = () => {
    setSaving(true);
    try {
      localStorage.setItem("app_settings", JSON.stringify(settings));

      // Apply dark mode via ThemeContext
      setDarkMode(settings.darkMode);

      // Apply language change
      if (settings.language && i18n.language !== settings.language) {
        i18n.changeLanguage(settings.language);
        localStorage.setItem("language", settings.language);
      }

      setTimeout(() => {
        setSaving(false);
        showSnackbar(t("settings.settingsSaved"), "success");
      }, 500);
    } catch (error) {
      setSaving(false);
      showSnackbar(t("common.error"), "error");
    }
  };

  const handleReset = () => {
    if (window.confirm(t("common.confirmDelete"))) {
      setSettings(defaultSettingsData);
      localStorage.setItem("app_settings", JSON.stringify(defaultSettingsData));
      setDarkMode(false);
      showSnackbar(t("settings.settingsSaved"), "info");
    }
  };

  const handleChange = (field: keyof SettingsData, value: any) => {
    setSettings({ ...settings, [field]: value });
  };

  return (
    <Box sx={{ p: 3, minHeight: "100vh" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 4,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, color: "#1a237e" }}
          >
            ⚙️ {t("settings.title")}
          </Typography>
          <Typography sx={{ color: "#666", mt: 0.5 }}>
            {t("settings.subtitle")}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RestoreIcon />}
            onClick={handleReset}
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            {t("settings.resetToDefaults")}
          </Button>
          <Button
            variant="contained"
            startIcon={
              saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />
            }
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
            {saving ? t("common.loading") : t("settings.saveAll")}
          </Button>
        </Box>
      </Box>

      {/* Preview Card */}
      <Card sx={{ borderRadius: 3, p: 3, mb: 3 }}>
        <Typography variant="body2" sx={{ color: "#666" }}>
          {t("settings.preview")}
        </Typography>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={6}>
            <Typography variant="body2" sx={{ color: "#666" }}>
              {t("settings.currencyFormat")}
            </Typography>
            <Typography variant="h6" sx={{ color: "#1a237e" }}>
              {settings.currency === "BRL"
                ? "R$ 1.250,75"
                : settings.currency === "USD"
                ? "$1,250.75"
                : settings.currency === "EUR"
                ? "€1,250.75"
                : "£1,250.75"}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" sx={{ color: "#666" }}>
              {t("settings.dateFormatPreview")}
            </Typography>
            <Typography variant="h6" sx={{ color: "#1a237e" }}>
              {settings.dateFormat === "DD/MM/YYYY"
                ? "22/08/2026"
                : settings.dateFormat === "MM/DD/YYYY"
                ? "08/22/2026"
                : "2026-08-22"}
            </Typography>
          </Grid>
        </Grid>
        <Typography variant="caption" sx={{ color: "#999", display: "block", mt: 1 }}>
          {darkMode ? t("settings.darkModeActive") : t("settings.lightModeActive")}
        </Typography>
      </Card>

      {/* Organization Settings */}
      <Paper sx={{ borderRadius: 3, p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <BusinessIcon sx={{ color: "#1a237e" }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#1a237e" }}>
            {t("settings.organizationSettings")}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              label={t("settings.organizationName")}
              fullWidth
              value={settings.organizationName}
              onChange={(e) => handleChange("organizationName", e.target.value)}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              select
              label={t("settings.currency")}
              fullWidth
              value={settings.currency}
              onChange={(e) => handleChange("currency", e.target.value)}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
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
      <Paper sx={{ borderRadius: 3, p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <LanguageIcon sx={{ color: "#1a237e" }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#1a237e" }}>
            {t("settings.localization")}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <TextField
              select
              label={t("common.language")}
              fullWidth
              value={settings.language || "en"}
              onChange={(e) => handleChange("language", e.target.value)}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            >
              {languages.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              select
              label={t("settings.locale")}
              fullWidth
              value={settings.locale}
              onChange={(e) => handleChange("locale", e.target.value)}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            >
              {locales.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              select
              label={t("settings.dateFormat")}
              fullWidth
              value={settings.dateFormat}
              onChange={(e) => handleChange("dateFormat", e.target.value)}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
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
      <Paper sx={{ borderRadius: 3, p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <ColorLensIcon sx={{ color: "#1a237e" }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#1a237e" }}>
            {t("settings.appearance")}
          </Typography>
        </Box>

        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              select
              label={t("settings.theme")}
              fullWidth
              value={settings.theme}
              onChange={(e) => handleChange("theme", e.target.value)}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
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
              label={t("settings.darkMode")}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Notifications */}
      <Paper sx={{ borderRadius: 3, p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <NotificationsIcon sx={{ color: "#1a237e" }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#1a237e" }}>
            {t("settings.notifications")}
          </Typography>
        </Box>

        <FormControlLabel
          control={
            <Switch
              checked={settings.notificationsEnabled}
              onChange={(e) =>
                handleChange("notificationsEnabled", e.target.checked)
              }
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
          label={t("settings.enableNotifications")}
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