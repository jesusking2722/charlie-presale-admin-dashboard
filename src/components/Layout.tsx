import { Navigate, Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { useAuth } from "./AuthProvider";

const Layout = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
