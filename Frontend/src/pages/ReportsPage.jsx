import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";

// ── Helpers ──────────────────────────────────────────────────────────
const fmtDate = (d) =>
  new Date(d).toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const fmtDateTime = (d) =>
  new Date(d).toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });

const difficultyColour = (d) => {
  if (d === "hard")
    return { bg: "#fee2e2", text: "#b91c1c", border: "#fecaca" };
  if (d === "medium")
    return { bg: "#fef3c7", text: "#b45309", border: "#fde68a" };
  return { bg: "#dcfce7", text: "#166534", border: "#bbf7d0" };
};

const COURSE_COLOURS = [
  "#4f46e5",
  "#0891b2",
  "#059669",
  "#d97706",
  "#dc2626",
  "#7c3aed",
  "#db2777",
  "#65a30d",
];

// ── Donut chart (pure SVG) ────────────────────────────────────────────
function DonutChart({ completed, total }) {
  const pct = total > 0 ? completed / total : 0;
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ;
  const colour = pct >= 0.75 ? "#059669" : pct >= 0.4 ? "#d97706" : "#dc2626";

  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle
        cx="70"
        cy="70"
        r={r}
        fill="none"
        stroke="#f1f5f9"
        strokeWidth="16"
      />
      <circle
        cx="70"
        cy="70"
        r={r}
        fill="none"
        stroke={colour}
        strokeWidth="16"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 70 70)"
        style={{ transition: "stroke-dasharray 0.6s ease" }}
      />
      <text
        x="70"
        y="65"
        textAnchor="middle"
        fontSize="22"
        fontWeight="800"
        fill="#0f172a"
      >
        {Math.round(pct * 100)}%
      </text>
      <text
        x="70"
        y="84"
        textAnchor="middle"
        fontSize="11"
        fontWeight="600"
        fill="#64748b"
      >
        complete
      </text>
    </svg>
  );
}

// ── Bar chart row ────────────────────────────────────────────────────
function CourseBar({ course, total, completed, colour }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const pending = total - completed;

  return (
    <div style={{ marginBottom: "18px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "3px",
              background: colour,
              display: "inline-block",
            }}
          />
          <span
            style={{ fontWeight: "700", fontSize: "14px", color: "#0f172a" }}
          >
            {course}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "12px", color: "#64748b" }}>
            {completed}/{total} done
          </span>
          <span
            style={{
              fontSize: "12px",
              fontWeight: "700",
              color: pct >= 75 ? "#059669" : pct >= 40 ? "#d97706" : "#dc2626",
            }}
          >
            {pct}%
          </span>
        </div>
      </div>
      <div
        style={{
          height: "10px",
          background: "#f1f5f9",
          borderRadius: "999px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: colour,
            borderRadius: "999px",
            transition: "width 0.6s ease",
          }}
        />
      </div>
      <div style={{ display: "flex", gap: "12px", marginTop: "6px" }}>
        <span style={{ fontSize: "11px", color: "#059669", fontWeight: "600" }}>
          {completed} completed
        </span>
        {pending > 0 && (
          <span
            style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}
          >
            {pending} pending
          </span>
        )}
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────
export default function ReportsPage() {
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    fetchReport();
  }, [weekOffset]);

  const fetchReport = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/reports/weekly/?week=${weekOffset}`);
      setReport(res.data);
    } catch (err) {
      console.error(err);
      setError(
        "Failed to load report. Make sure the reports endpoint is running.",
      );
    } finally {
      setLoading(false);
    }
  };

  const isCurrentWeek = weekOffset === 0;

  // ── Stat card ────────────────────────────────────────────────────
  const StatCard = ({ label, value, sub, accent, icon }) => (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "18px",
        padding: "22px 20px",
        boxShadow: "0 4px 16px rgba(15,23,42,0.06)",
        borderTop: `4px solid ${accent}`,
      }}
    >
      <div style={{ fontSize: "24px", marginBottom: "8px" }}>{icon}</div>
      <div
        style={{
          fontSize: "30px",
          fontWeight: "800",
          color: "#0f172a",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: "13px",
          fontWeight: "700",
          color: "#334155",
          marginTop: "6px",
        }}
      >
        {label}
      </div>
      {sub && (
        <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
          {sub}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p style={{ color: "#64748b", fontSize: "16px" }}>Loading report...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
        padding: "24px 16px 56px",
      }}
    >
      {/* Hero */}
      <div
        style={{
          background: "linear-gradient(135deg, #312e81 0%, #4338ca 100%)",
          color: "#fff",
          borderRadius: "24px",
          padding: "28px 32px",
          marginBottom: "24px",
          boxShadow: "0 20px 40px rgba(49,46,129,0.22)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <h1
              style={{
                margin: "0 0 8px",
                fontSize: "28px",
                fontWeight: "800",
                letterSpacing: "-0.02em",
              }}
            >
              Weekly Report
            </h1>
            <p
              style={{
                margin: 0,
                color: "rgba(255,255,255,0.82)",
                fontSize: "14px",
              }}
            >
              {report
                ? `${fmtDate(report.week_start)} – ${fmtDate(report.week_end)}`
                : "Loading..."}
              {isCurrentWeek && (
                <span
                  style={{
                    marginLeft: "10px",
                    background: "rgba(255,255,255,0.2)",
                    padding: "2px 10px",
                    borderRadius: "999px",
                    fontSize: "11px",
                    fontWeight: "700",
                  }}
                >
                  CURRENT WEEK
                </span>
              )}
            </p>
          </div>

          {/* Week navigation */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={() => setWeekOffset((w) => w + 1)}
              style={{
                padding: "9px 16px",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.3)",
                background: "rgba(255,255,255,0.12)",
                color: "#fff",
                fontWeight: "700",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              ← Prev
            </button>
            {!isCurrentWeek && (
              <button
                onClick={() => setWeekOffset(0)}
                style={{
                  padding: "9px 16px",
                  borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,0.3)",
                  background: "rgba(255,255,255,0.2)",
                  color: "#fff",
                  fontWeight: "700",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                This Week
              </button>
            )}
            <button
              onClick={() => setWeekOffset((w) => Math.max(0, w - 1))}
              disabled={isCurrentWeek}
              style={{
                padding: "9px 16px",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.3)",
                background: "rgba(255,255,255,0.12)",
                color: isCurrentWeek ? "rgba(255,255,255,0.35)" : "#fff",
                fontWeight: "700",
                fontSize: "13px",
                cursor: isCurrentWeek ? "not-allowed" : "pointer",
              }}
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: "13px 16px",
            borderRadius: "12px",
            marginBottom: "20px",
            background: "#fee2e2",
            color: "#b91c1c",
            border: "1px solid #fecaca",
            fontWeight: "600",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}

      {report && (
        <>
          {/* Top stat cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            <StatCard
              icon="📋"
              label="Total Tasks"
              value={report.total_tasks}
              sub="due this week"
              accent="#4f46e5"
            />
            <StatCard
              icon="✅"
              label="Completed"
              value={report.completed_tasks}
              sub={`${report.completion_rate}% completion rate`}
              accent="#059669"
            />
            <StatCard
              icon="⏳"
              label="Pending"
              value={report.pending_tasks}
              sub="still to do"
              accent="#d97706"
            />
            <StatCard
              icon="⏱️"
              label="Study Time"
              value={`${report.total_scheduled_minutes}m`}
              sub="scheduled this week"
              accent="#0891b2"
            />
            <StatCard
              icon="🎯"
              label="Sessions Done"
              value={report.completed_sessions}
              sub={`${report.missed_sessions} missed`}
              accent="#7c3aed"
            />
            {report.overdue_tasks.length > 0 && (
              <StatCard
                icon="🚨"
                label="Overdue"
                value={report.overdue_tasks.length}
                sub="needs attention"
                accent="#dc2626"
              />
            )}
          </div>

          {/* Middle row: donut + course breakdown */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "220px 1fr",
              gap: "20px",
              marginBottom: "24px",
              alignItems: "start",
            }}
          >
            {/* Donut card */}
            <div
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "20px",
                padding: "28px 20px",
                boxShadow: "0 4px 16px rgba(15,23,42,0.06)",
                textAlign: "center",
              }}
            >
              <h3
                style={{
                  margin: "0 0 20px",
                  fontSize: "16px",
                  fontWeight: "800",
                  color: "#0f172a",
                }}
              >
                Completion
              </h3>
              <DonutChart
                completed={report.completed_tasks}
                total={report.total_tasks}
              />
              <div
                style={{
                  marginTop: "16px",
                  fontSize: "13px",
                  color: "#64748b",
                }}
              >
                {report.completed_tasks} of {report.total_tasks} tasks done
              </div>
            </div>

            {/* Course breakdown */}
            <div
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "20px",
                padding: "24px",
                boxShadow: "0 4px 16px rgba(15,23,42,0.06)",
              }}
            >
              <h3
                style={{
                  margin: "0 0 20px",
                  fontSize: "18px",
                  fontWeight: "800",
                  color: "#0f172a",
                }}
              >
                Progress by Course
              </h3>

              {report.tasks_by_course.length === 0 ? (
                <p style={{ color: "#64748b", fontSize: "14px" }}>
                  No tasks due this week.
                </p>
              ) : (
                report.tasks_by_course.map((item, i) => (
                  <CourseBar
                    key={item.course}
                    course={item.course}
                    total={item.total}
                    completed={item.completed}
                    colour={COURSE_COLOURS[i % COURSE_COLOURS.length]}
                  />
                ))
              )}
            </div>
          </div>

          {/* Overdue tasks */}
          {report.overdue_tasks.length > 0 && (
            <div
              style={{
                background: "#fff",
                border: "1px solid #fecaca",
                borderRadius: "20px",
                padding: "24px",
                boxShadow: "0 4px 16px rgba(185,28,28,0.08)",
                marginBottom: "24px",
              }}
            >
              <h3
                style={{
                  margin: "0 0 16px",
                  fontSize: "18px",
                  fontWeight: "800",
                  color: "#b91c1c",
                }}
              >
                🚨 Overdue Tasks ({report.overdue_tasks.length})
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                  gap: "12px",
                }}
              >
                {report.overdue_tasks.map((task) => {
                  const dc = difficultyColour(task.difficulty);
                  return (
                    <div
                      key={task.id}
                      style={{
                        padding: "16px",
                        borderRadius: "14px",
                        border: "1px solid #fecaca",
                        background: "#fff9f9",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: "8px",
                          marginBottom: "8px",
                        }}
                      >
                        <strong
                          style={{
                            fontSize: "14px",
                            color: "#0f172a",
                            lineHeight: 1.4,
                          }}
                        >
                          {task.title}
                        </strong>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: "700",
                            padding: "2px 8px",
                            borderRadius: "999px",
                            whiteSpace: "nowrap",
                            background: dc.bg,
                            color: dc.text,
                            border: `1px solid ${dc.border}`,
                          }}
                        >
                          {task.difficulty}
                        </span>
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>
                        {task.course && (
                          <span style={{ fontWeight: "600" }}>
                            {task.course} ·{" "}
                          </span>
                        )}
                        Due {fmtDateTime(task.due_date)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* All tasks this week */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "20px",
              padding: "24px",
              boxShadow: "0 4px 16px rgba(15,23,42,0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "18px",
                  fontWeight: "800",
                  color: "#0f172a",
                }}
              >
                Tasks This Week
              </h3>
              <button
                onClick={() => navigate("/tasks")}
                style={{
                  padding: "9px 18px",
                  borderRadius: "10px",
                  background: "#eef2ff",
                  color: "#4f46e5",
                  border: "1px solid #c7d2fe",
                  fontWeight: "700",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                Manage Tasks
              </button>
            </div>

            {report.task_list.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  border: "1px dashed #cbd5e1",
                  borderRadius: "14px",
                  color: "#64748b",
                }}
              >
                No tasks due this week.
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "14px",
                  }}
                >
                  <thead>
                    <tr style={{ borderBottom: "2px solid #f1f5f9" }}>
                      {[
                        "Task",
                        "Course",
                        "Due",
                        "Difficulty",
                        "Priority",
                        "Status",
                      ].map((h) => (
                        <th
                          key={h}
                          style={{
                            textAlign: "left",
                            padding: "10px 12px",
                            fontSize: "12px",
                            fontWeight: "700",
                            color: "#64748b",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {report.task_list.map((task, i) => {
                      const dc = difficultyColour(task.difficulty);
                      const isCompleted = task.status === "completed";
                      return (
                        <tr
                          key={task.id}
                          style={{
                            borderBottom: "1px solid #f8fafc",
                            background: i % 2 === 0 ? "#fff" : "#fafafa",
                            opacity: isCompleted ? 0.65 : 1,
                          }}
                        >
                          <td
                            style={{
                              padding: "12px",
                              fontWeight: "700",
                              color: "#0f172a",
                              textDecoration: isCompleted
                                ? "line-through"
                                : "none",
                            }}
                          >
                            {task.title}
                          </td>
                          <td style={{ padding: "12px", color: "#475569" }}>
                            {task.course || "—"}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              color: "#475569",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {fmtDateTime(task.due_date)}
                          </td>
                          <td style={{ padding: "12px" }}>
                            <span
                              style={{
                                padding: "3px 10px",
                                borderRadius: "999px",
                                fontSize: "11px",
                                fontWeight: "700",
                                background: dc.bg,
                                color: dc.text,
                                border: `1px solid ${dc.border}`,
                              }}
                            >
                              {task.difficulty}
                            </span>
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              fontWeight: "800",
                              color: "#4f46e5",
                            }}
                          >
                            {task.priority_score ?? "—"}
                          </td>
                          <td style={{ padding: "12px" }}>
                            <span
                              style={{
                                padding: "4px 12px",
                                borderRadius: "999px",
                                fontSize: "12px",
                                fontWeight: "700",
                                background: isCompleted ? "#dcfce7" : "#fef3c7",
                                color: isCompleted ? "#166534" : "#b45309",
                                border: `1px solid ${isCompleted ? "#bbf7d0" : "#fde68a"}`,
                              }}
                            >
                              {isCompleted ? "Completed" : "Pending"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
