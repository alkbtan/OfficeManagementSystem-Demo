import api from "../api/axios";

// ✅ Interfaces للبيانات
export interface DashboardStats {
  totalEmployees: number;
  departments: number;
  activeEmployees: number;
  inactiveEmployees: number;
  openTickets: number;
  purchaseRequests: number;
  totalBudget: number;
  spentBudget: number;
  remainingBudget: number;
  pendingMaintenance: number;
  acUnits: number;
  totalLockers: number;
  occupiedLockers: number;
  availableLockers: number;
  neededLockers: number;
  inventoryItems: number;
  totalEmployeesCount: number;
  budgetUtilization: number;
}

export interface MonthlyExpense {
  month: string;
  amount: number;
}

export interface PurchaseVsConsumption {
  month: string;
  purchase: number;
  consumption: number;
}

export interface MaintenanceCost {
  name: string;
  cost: number;
}

export interface SupplierPerformance {
  name: string;
  score: number;
}

export interface OfficeRequest {
  name: string;
  value: number;
}

// ✅ Service - جميع دوال جلب البيانات
export const dashboardService = {
  /**
   * ✅ جلب جميع إحصائيات الداشبورد
   * GET /api/Dashboard/stats
   */
  getStats: async (): Promise<DashboardStats> => {
    try {
      const response = await api.get("/Dashboard/stats");
      return response.data;
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      // ✅ بيانات افتراضية في حالة فشل الاتصال
      return {
        totalEmployees: 400,
        departments: 8,
        activeEmployees: 380,
        inactiveEmployees: 20,
        openTickets: 24,
        purchaseRequests: 12,
        totalBudget: 38400,
        spentBudget: 28000,
        remainingBudget: 10400,
        pendingMaintenance: 15,
        acUnits: 58,
        totalLockers: 400,
        occupiedLockers: 324,
        availableLockers: 76,
        neededLockers: 0,
        inventoryItems: 2845,
        totalEmployeesCount: 400,
        budgetUtilization: 73,
      };
    }
  },

  /**
   * ✅ جلب النفقات الشهرية
   * GET /api/Dashboard/expenses
   */
  getMonthlyExpenses: async (): Promise<MonthlyExpense[]> => {
    try {
      const response = await api.get("/Dashboard/expenses");
      return response.data;
    } catch (error) {
      console.error("Error fetching monthly expenses:", error);
      // ✅ بيانات افتراضية
      return [
        { month: "Jan", amount: 32000 },
        { month: "Feb", amount: 28000 },
        { month: "Mar", amount: 35000 },
        { month: "Apr", amount: 38000 },
        { month: "May", amount: 42000 },
        { month: "Jun", amount: 38400 },
      ];
    }
  },

  /**
   * ✅ جلب بيانات الشراء مقابل الاستهلاك
   * GET /api/Dashboard/purchase-vs-consumption
   */
  getPurchaseVsConsumption: async (): Promise<PurchaseVsConsumption[]> => {
    try {
      const response = await api.get("/Dashboard/purchase-vs-consumption");
      return response.data;
    } catch (error) {
      console.error("Error fetching purchase vs consumption:", error);
      // ✅ بيانات افتراضية
      return [
        { month: "Jan", purchase: 15000, consumption: 12000 },
        { month: "Feb", purchase: 14000, consumption: 11000 },
        { month: "Mar", purchase: 18000, consumption: 14000 },
        { month: "Apr", purchase: 20000, consumption: 16000 },
        { month: "May", purchase: 22000, consumption: 18000 },
        { month: "Jun", purchase: 18500, consumption: 15200 },
      ];
    }
  },

  /**
   * ✅ جلب تكاليف الصيانة
   * GET /api/Dashboard/maintenance-costs
   */
  getMaintenanceCosts: async (): Promise<MaintenanceCost[]> => {
    try {
      const response = await api.get("/Dashboard/maintenance-costs");
      return response.data;
    } catch (error) {
      console.error("Error fetching maintenance costs:", error);
      // ✅ بيانات افتراضية
      return [
        { name: "AC", cost: 18000 },
        { name: "Plumbing", cost: 12000 },
        { name: "Electrical", cost: 8000 },
        { name: "Furniture", cost: 6000 },
        { name: "Civil", cost: 4000 },
      ];
    }
  },

  /**
   * ✅ جلب أداء الموردين
   * GET /api/Dashboard/supplier-performance
   */
  getSupplierPerformance: async (): Promise<SupplierPerformance[]> => {
    try {
      const response = await api.get("/Dashboard/supplier-performance");
      return response.data;
    } catch (error) {
      console.error("Error fetching supplier performance:", error);
      // ✅ بيانات افتراضية
      return [
        { name: "ABC Company", score: 92 },
        { name: "TechCool", score: 85 },
        { name: "OfficePro", score: 78 },
        { name: "CleanCo", score: 70 },
        { name: "BuildIt", score: 65 },
      ];
    }
  },

  /**
   * ✅ جلب طلبات المكتب
   * GET /api/Dashboard/office-requests
   */
  getOfficeRequests: async (): Promise<OfficeRequest[]> => {
    try {
      const response = await api.get("/Dashboard/office-requests");
      return response.data;
    } catch (error) {
      console.error("Error fetching office requests:", error);
      // ✅ بيانات افتراضية
      return [
        { name: "Procurement", value: 12 },
        { name: "Maintenance", value: 8 },
        { name: "Furniture", value: 6 },
        { name: "Lockers", value: 4 },
        { name: "Other", value: 3 },
      ];
    }
  },
};