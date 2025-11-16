import config from "@/config/config";
import type { ReactNode } from "react";
import { useSelector } from "react-redux";

interface PermissionProps {
  permission: string;     
  children: ReactNode;  
}

const Permission = ({ permission, children }: PermissionProps) => {
  const authState = useSelector((state: any) => state.auth);
  const { role, staffPermissions } = authState || {};
  // console.log("staffPermissions", staffPermissions);

  const hasPermission = (key: string) => {
    if (role === config.roleLandlord) return true; // landlord full quyền
    if (role === config.roleStaff) return staffPermissions?.includes(key);
    return false;
  };

  if (!hasPermission(permission)) return null;

  return <>{children}</>;
};

export default Permission;
