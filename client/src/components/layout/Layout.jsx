import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import Navbar from "./Navbar";

const Layout = () => (
  <div className="relative min-h-screen overflow-hidden">
    <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(255,107,107,0.08),transparent_30%)]" />
    <Navbar />
    <main>
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default Layout;
