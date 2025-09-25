import { Route, Routes } from "react-router-dom";

import LayoutUser from "@/layouts/LayoutUser";
import homeRoute from "./common/home.route";
import authRoute from "./common/auth.route";
import aboutUsRoute from "./common/about-us.route";
import LayoutAboutUs from "@/layouts/LayoutAboutUs";

export default (
  <Routes>
    <Route element={<LayoutUser />}>{homeRoute}</Route>
    <Route element={<LayoutAboutUs />}>{authRoute}</Route>
    <Route element={<LayoutAboutUs />}>{aboutUsRoute}</Route>
  </Routes>
);
