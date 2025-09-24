import { Route, Routes } from "react-router-dom";

import LayoutUser from "@/layouts/LayoutUser";
import homeRoute from "./common/home.route";
import authRoute from "./common/auth.route";

export default (
  <Routes>
    <Route element={<LayoutUser />}>{homeRoute}</Route>
    <Route element={<LayoutUser />}>{authRoute}</Route>
  </Routes>
);
