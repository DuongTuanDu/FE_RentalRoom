import type { ReactElement } from "react";
import { Route, Navigate, Outlet } from "react-router-dom";
import Cookies from "js-cookie";
import config from "@/config/config";

import adminRoutes from "./admin.route";
import LayoutAdmin from "@/layouts/LayoutAdmin";
import { useSelector } from "react-redux";
import LayoutLandlord from "@/layouts/LayoutLandlord";
import landlordRoutes from "./landlord.route";
import residentRoute from "./resident.route";
import LayoutUser from "@/layouts/LayoutUser";

const RequireAdminRole = () => {
  const { accessToken, isAuthenticated, userInfo } = useSelector(
    (state: any) => state.auth
  );

  // Kiểm tra xem có token không
  if (!Cookies.get("accessToken")) {
    return <Navigate to={config.loginPath} replace />;
  }

  // Nếu chưa có thông tin auth hoặc role không phải là admin
  if (!accessToken || !isAuthenticated || userInfo !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

const RequireLandlordRole = () => {
  const { accessToken, isAuthenticated, userInfo } = useSelector(
    (state: any) => state.auth
  );

  // Kiểm tra xem có token không
  if (!Cookies.get("accessToken")) {
    return <Navigate to={config.loginPath} replace />;
  }

  if (!accessToken || !isAuthenticated || userInfo !== "landlord") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

const RequireResidentRole = () => {
  const { accessToken, isAuthenticated, userInfo } = useSelector(
    (state: any) => state.auth
  );

  // Kiểm tra xem có token không
  if (!Cookies.get("accessToken")) {
    return <Navigate to={config.loginPath} replace />;
  }

  if (!accessToken || !isAuthenticated || userInfo !== "resident") {
    if (userInfo === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/errors/403" replace />;
  }

  return <Outlet />;
};

const routes = (
  <>
    <Route element={<RequireResidentRole />}>
      <Route element={<LayoutUser />}>{residentRoute}</Route>
    </Route>
    <Route path="admin" element={<RequireAdminRole />}>
      <Route element={<LayoutAdmin />}>{adminRoutes}</Route>
    </Route>
    <Route path="landlord" element={<RequireLandlordRole />}>
      <Route element={<LayoutLandlord />}>{landlordRoutes}</Route>
    </Route>
  </>
) as ReactElement;

export default routes;
