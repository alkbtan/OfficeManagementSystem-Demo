import { AppBar, Toolbar, Box, Button, useMediaQuery, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Notifications from "../Notifications/Notifications";
import LanguageSwitcher from "../LanguageSwitcher";

function Navbar() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { t } = useTranslation();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error("Failed to parse user data:", error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <AppBar position="static" sx={{ bgcolor: "#1a237e", boxShadow: "none" }}>
      <Toolbar sx={{ justifyContent: "flex-end" }}>
        {user && (
          <Box display="flex" alignItems="center" gap={isMobile ? 1 : 2}>
            <LanguageSwitcher />
            <Notifications />
            {!isMobile && (
              <Box component="span" sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.875rem" }}>
                {user.name} ({user.role})
              </Box>
            )}
            <Button color="inherit" onClick={handleLogout} size={isMobile ? "small" : "medium"}>
              {t("common.logout")}
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;