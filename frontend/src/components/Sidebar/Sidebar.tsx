import { Link } from "react-router-dom";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useMediaQuery,
  useTheme,
  Drawer,
  IconButton,
  Typography,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import BuildIcon from "@mui/icons-material/Build";
import ComputerIcon from "@mui/icons-material/Computer";
import SettingsIcon from "@mui/icons-material/Settings";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import AssessmentIcon from "@mui/icons-material/Assessment";
import InventoryIcon from "@mui/icons-material/Inventory";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import EventIcon from "@mui/icons-material/Event";
import SportsIcon from "@mui/icons-material/Sports";
import FolderIcon from "@mui/icons-material/Folder";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

import logoImage from "../../assets/images/testfly-logo.webp";

function Sidebar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { text: t("sidebar.dashboard"), icon: <DashboardIcon />, path: "/" },
    { text: t("sidebar.employees"), icon: <PeopleIcon />, path: "/employees" },
    { text: t("sidebar.procurement"), icon: <ShoppingCartIcon />, path: "/procurement" },
    { text: t("sidebar.inventory"), icon: <InventoryIcon />, path: "/inventory" },
    { text: t("sidebar.assets"), icon: <ComputerIcon />, path: "/assets" },
    { text: t("sidebar.acManagement"), icon: <AcUnitIcon />, path: "/acs" },
    { text: t("sidebar.lockers"), icon: <MeetingRoomIcon />, path: "/lockers" },
    { text: t("sidebar.maintenance"), icon: <BuildIcon />, path: "/maintenance" },
    { text: t("sidebar.budget"), icon: <AttachMoneyIcon />, path: "/budget" },
    { text: t("sidebar.reports"), icon: <AssessmentIcon />, path: "/reports" },
    { text: t("sidebar.events"), icon: <EventIcon />, path: "/events" },
    { text: t("sidebar.sports"), icon: <SportsIcon />, path: "/sports" },
    { text: t("sidebar.documents"), icon: <FolderIcon />, path: "/documents" },
    { text: t("sidebar.users"), icon: <PersonAddIcon />, path: "/users" },
    { text: t("sidebar.settings"), icon: <SettingsIcon />, path: "/settings" },
  ];

  const sidebarContent = (
    <Box
      sx={{
        width: 260,
        bgcolor: "#1a237e",
        color: "white",
        minHeight: "100vh",
        p: 2,
        overflowY: "auto",
      }}
    >
      {/* Brand Logo and Name */}
      <Box sx={{ mb: 2, display: "flex", alignItems: "center", justifyContent: "space-between", px: 1 }}>
        <Box 
          component={Link} 
          to="/" 
          sx={{ display: "flex", alignItems: "center", gap: 1.5, textDecoration: "none", color: "inherit" }}
        >
          <img 
            src={logoImage} 
            alt="TestFlyQA Logo" 
            style={{ height: "55px", width: "auto", objectFit: "contain", borderRadius: "4px" }} 
          />
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "white", fontSize: "1.15rem", letterSpacing: "0.5px" }}>
            TestFlyQA
          </Typography>
        </Box>

        {isMobile && (
          <IconButton onClick={() => setMobileOpen(false)} sx={{ color: "white" }}>
            ✕
          </IconButton>
        )}
      </Box>

      <Divider sx={{ bgcolor: "rgba(255,255,255,0.15)", mb: 2 }} />

      {/* Navigation List */}
      <List>
        {menuItems.map((item) => (
          <ListItem
            key={item.text}
            component={Link}
            to={item.path}
            onClick={() => isMobile && setMobileOpen(false)}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              color: "white",
              textDecoration: "none",
              cursor: "pointer",
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.1)",
              },
            }}
          >
            <ListItemIcon sx={{ color: "white", minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} sx={{ color: "white" }} />
          </ListItem>
        ))}
      </List>

      <Divider sx={{ bgcolor: "rgba(255,255,255,0.15)", my: 2 }} />

      <Box sx={{ mt: 2, px: 1 }}>
        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>
          {t("app.version")}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      {isMobile && (
        <IconButton
          onClick={() => setMobileOpen(true)}
          sx={{ position: "fixed", top: 70, left: 10, zIndex: 1000, color: "#1a237e" }}
        >
          <MenuIcon />
        </IconButton>
      )}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
        >
          {sidebarContent}
        </Drawer>
      ) : (
        sidebarContent
      )}
    </>
  );
}

export default Sidebar;