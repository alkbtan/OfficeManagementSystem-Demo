import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import Employees from "./pages/Employees/Employees";
import Procurement from "./pages/Procurement/Procurement";
import Inventory from "./pages/Inventory/Inventory";
import Assets from "./pages/Assets/Assets";
import ACs from "./pages/ACs/ACs";
import Lockers from "./pages/Lockers/Lockers";
import Maintenance from "./pages/Maintenance/Maintenance";
import Budget from "./pages/Budget/Budget";
import Reports from "./pages/Reports/Reports";
import Events from "./pages/Events/Events";
import Sports from "./pages/Sports/Sports";
import Documents from "./pages/Documents/Documents";
import Users from "./pages/Users/Users";
import Settings from "./pages/Settings/Settings";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="employees" element={<Employees />} />
          <Route path="procurement" element={<Procurement />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="assets" element={<Assets />} />
          <Route path="acs" element={<ACs />} />
          <Route path="lockers" element={<Lockers />} />
          <Route path="maintenance" element={<Maintenance />} />
          <Route path="budget" element={<Budget />} />
          <Route path="reports" element={<Reports />} />
          <Route path="events" element={<Events />} />
          <Route path="sports" element={<Sports />} />
          <Route path="documents" element={<Documents />} />
          <Route
            path="users"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;