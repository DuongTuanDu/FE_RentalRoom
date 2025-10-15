import { Outlet } from "react-router-dom";

import Header from "./header/Header";
import Footer from "./footer/Footer";
import ScrollToTopButton from "@/components/ScrollToTop";

const LayoutUser = () => {
  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      <Header />
      <div className="flex-grow min-h-screen mt-16">
        <Outlet />
      <ScrollToTopButton />

      </div>
      <Footer />
    </div>
  );
};

export default LayoutUser;
