import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import Employees from "../pages/Employees/Employees";
import Maintenance from "../pages/Maintenance/Maintenance";
import Assets from "../pages/Assets/Assets";
import Users from "../pages/Users/Users";
import Reports from "../pages/Reports/Reports";
import Requests from "../pages/Requests/Requests";
import Inventory from "../pages/Inventory/Inventory";
import ACs from "../pages/ACs/ACs";
import Lockers from "../pages/Lockers/Lockers";
import Procurement from "../pages/Procurement/Procurement";
import BudgetPage from "../pages/Budget/Budget";
import Events from "../pages/Events/Events";
import Sports from "../pages/Sports/Sports";
import Documents from "../pages/Documents/Documents";
import Settings from "../pages/Settings/Settings";
import { useAuth } from "../hooks/useAuth";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function AppRouter() {
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
          <Route index element={<Dashboard />} />
          <Route path="employees" element={<Employees />} />
          <Route path="maintenance" element={<Maintenance />} />
          <Route path="assets" element={<Assets />} />
          <Route path="users" element={<Users />} />
          <Route path="reports" element={<Reports />} />
          <Route path="requests" element={<Requests />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="acs" element={<ACs />} />
          <Route path="lockers" element={<Lockers />} />
          <Route path="procurement" element={<Procurement />} />
          <Route path="budget" element={<BudgetPage />} />
          <Route path="events" element={<Events />} />
          <Route path="sports" element={<Sports />} />
          <Route path="documents" element={<Documents />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;