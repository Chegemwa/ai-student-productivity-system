import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ListTodo,
  CalendarDays,
  Sparkles,
  BarChart2,
  Clock,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout/");
    } catch (_) {
      // token may already be gone — proceed anyway
    }
    logout();
    navigate("/login");
  };

  const navStyle = {
    position: "sticky",
    top: 0,
    zIndex: 1000,
    background: "rgba(15, 23, 42, 0.92)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    padding: "14px 18px",
  };

  const containerStyle = {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
  };

  const brandStyle = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#ffffff",
    textDecoration: "none",
    fontWeight: "800",
    fontSize: "18px",
    letterSpacing: "-0.02em",
  };

  const linksStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
  };

  const getLinkStyle = (active) => ({
    display: "flex",
    alignItems: "center",
    gap: "8px",
    textDecoration: "none",
    padding: "10px 14px",
    borderRadius: "12px",
    fontWeight: "700",
    fontSize: "14px",
    transition: "all 0.2s ease",
    color: active ? "#ffffff" : "#cbd5e1",
    background: active
      ? "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)"
      : "transparent",
    border: active ? "none" : "1px solid rgba(255,255,255,0.08)",
    cursor: "pointer",
  });

  const logoutStyle = {
    ...getLinkStyle(false),
    background: "transparent",
    border: "1px solid rgba(239,68,68,0.4)",
    color: "#fca5a5",
  };

  return (
    <nav style={navStyle}>
      <div style={containerStyle}>
        <Link to="/" style={brandStyle}>
          <Sparkles size={20} />
          <span>AI Student Productivity</span>
        </Link>
        <div style={linksStyle}>
          <Link to="/" style={getLinkStyle(location.pathname === "/")}>
            <LayoutDashboard size={16} /> Dashboard
          </Link>
          <Link
            to="/tasks"
            style={getLinkStyle(location.pathname === "/tasks")}
          >
            <ListTodo size={16} /> Tasks
          </Link>
          <Link
            to="/availability"
            style={getLinkStyle(location.pathname === "/availability")}
          >
            <Clock size={16} /> Availability
          </Link>
          <Link
            to="/schedules"
            style={getLinkStyle(location.pathname === "/schedules")}
          >
            <CalendarDays size={16} /> Schedules
          </Link>
          <Link
            to="/reports"
            style={getLinkStyle(location.pathname === "/reports")}
          >
            <BarChart2 size={16} /> Reports
          </Link>
          <button onClick={handleLogout} style={logoutStyle}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
