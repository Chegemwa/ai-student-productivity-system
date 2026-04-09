import { useState } from "react";
import { Link } from "react-router-dom";
import { ListTodo, BrainCircuit, CalendarClock } from "lucide-react";

export default function Dashboard() {
  const pageStyle = {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
    padding: "20px 8px 40px",
  };

  const containerStyle = {
    width: "100%",
  };

  const heroStyle = {
    background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
    color: "white",
    borderRadius: "24px",
    padding: "40px",
    textAlign: "center",
    boxShadow: "0 20px 40px rgba(15, 23, 42, 0.25)",
    marginBottom: "30px",
  };

  const titleStyle = {
    margin: 0,
    fontSize: "42px",
    fontWeight: "900",
    letterSpacing: "-0.02em",
  };

  const subtitleStyle = {
    marginTop: "12px",
    color: "rgba(255,255,255,0.8)",
    fontSize: "16px",
  };

  const buttonContainer = {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    marginTop: "30px",
    flexWrap: "wrap",
  };

  const buttonStyle = {
    padding: "14px 24px",
    borderRadius: "14px",
    textDecoration: "none",
    fontWeight: "700",
    fontSize: "15px",
    color: "#ffffff",
    background: "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)",
    boxShadow: "0 10px 20px rgba(79, 70, 229, 0.25)",
    transition: "0.2s",
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
    boxShadow: "0 10px 20px rgba(14, 165, 233, 0.25)",
  };

  const infoGrid = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "20px",
  };

  const infoCard = {
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "20px",
    padding: "24px",
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
  };

  const cardTitle = {
    fontSize: "18px",
    fontWeight: "800",
    marginBottom: "10px",
    color: "#0f172a",
  };

  const cardText = {
    fontSize: "14px",
    color: "#64748b",
    lineHeight: 1.6,
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        {/* HERO */}
        <div style={heroStyle}>
          <h1 style={titleStyle}>AI Student Productivity System</h1>
          <p style={subtitleStyle}>
            Intelligent task prioritization and automated study scheduling.
          </p>

          <div style={buttonContainer}>
            <Link to="/tasks" style={buttonStyle}>
              Go to Tasks
            </Link>

            <Link to="/schedules" style={secondaryButtonStyle}>
              View Schedules
            </Link>
          </div>
        </div>
        {/* INFO SECTION */}
        <div style={infoGrid}>
          <div style={infoCard}>
            <div style={{ marginBottom: "12px", color: "#4f46e5" }}>
              <ListTodo size={26} />
            </div>
            <div style={cardTitle}>Task Management</div>
            <div style={cardText}>
              Create and manage academic tasks with deadlines, estimated time,
              and difficulty levels.
            </div>
          </div>

          <div style={infoCard}>
            <div style={{ marginBottom: "12px", color: "#0ea5e9" }}>
              <BrainCircuit size={26} />
            </div>
            <div style={cardTitle}>AI Prioritization</div>
            <div style={cardText}>
              Tasks are automatically ranked based on urgency and difficulty
              using rule-based scoring.
            </div>
          </div>

          <div style={infoCard}>
            <div style={{ marginBottom: "12px", color: "#10b981" }}>
              <CalendarClock size={26} />
            </div>
            <div style={cardTitle}>Smart Scheduling</div>
            <div style={cardText}>
              Generate optimized study schedules that allocate time efficiently
              based on your workload.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
