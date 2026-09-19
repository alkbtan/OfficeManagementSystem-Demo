import { useEffect, useState } from "react";

interface UserData {
  id: number;
  username: string;
  name: string;
  email: string;
  role: string;
}

export const useUserPermissions = () => {
  const [user, setUser] = useState<UserData | null>(null);

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

  const isAdmin = user?.role === "Admin";
  const isManager = user?.role === "Manager";
  const isUser = user?.role === "User";

  /**
   * Can delete any record (Admin, Manager)
   */
  const canDeleteAny = isAdmin || isManager;

  /**
   * Can edit any record (Admin, Manager)
   */
  const canEditAny = isAdmin || isManager;

  /**
   * Can delete a specific record based on CreatedBy
   */
  const canDelete = (createdBy: string | undefined): boolean => {
    if (canDeleteAny) return true;
    if (!user) return false;
    return createdBy === user.username;
  };

  /**
   * Can edit a specific record based on CreatedBy
   */
  const canEdit = (createdBy: string | undefined): boolean => {
    if (canEditAny) return true;
    if (!user) return false;
    return createdBy === user.username;
  };

  return {
    user,
    isAdmin,
    isManager,
    isUser,
    canDeleteAny,
    canEditAny,
    canDelete,
    canEdit,
  };
};

export default useUserPermissions;