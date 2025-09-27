import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const GuestRoute = () => {
  const { isAuthenticated } = useSelector((state: any) => state.auth);

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  return <Outlet />;
};

export default GuestRoute;
