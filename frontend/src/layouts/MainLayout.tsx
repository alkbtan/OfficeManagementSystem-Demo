import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import Sidebar from "../components/Sidebar/Sidebar";
import Navbar from "../components/Navbar/Navbar";

function MainLayout() {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          bgcolor: "#f8f9fa",
          minHeight: "100vh",
          overflowY: "auto",
        }}
      >
        <Navbar />
        <Box sx={{ flex: 1, p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export default MainLayout;