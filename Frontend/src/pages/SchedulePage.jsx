import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import api from "../api/client";

// ── Colour per course (softer modern palette) ───────────────────────
const COURSE_COLOURS = [
  "#6366f1", // indigo
  "#0ea5e9", // sky
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#14b8a6", // teal
];

function courseColour(course, map) {
  if (!course) return COURSE_COLOURS[0];
  if (!map[course]) {
    map[course] =
      COURSE_COLOURS[Object.keys(map).length % COURSE_COLOURS.length];
  }
  return map[course];
}

// ── Modern Event Popup with backdrop blur ────────────────────────────
function EventPopup({ event, position, onClose }) {
  if (!event) return null;
  const { title, extendedProps, start, end } = event;
  const { course, allocated_minutes, task_due_date, colour, isDeadline } =
    extendedProps;

  const isOverdue = task_due_date && new Date(task_due_date) < new Date();

  const fmt = (dt) =>
    dt
      ? new Date(dt).toLocaleString(undefined, {
          weekday: "short",
          day: "numeric",
          month: "short",
          hour: "numeric",
          minute: "2-digit",
        })
      : "—";

  const fmtTime = (dt) =>
    dt
      ? new Date(dt).toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        })
      : "—";

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 999,
          backdropFilter: "blur(3px)",
          background: "rgba(0,0,0,0.2)",
        }}
      />
      <div
        style={{
          position: "fixed",
          top: Math.min(position.y, window.innerHeight - 320),
          left: Math.min(position.x, window.innerWidth - 340),
          zIndex: 1000,
          background: "rgba(255,255,255,0.98)",
          backdropFilter: "blur(8px)",
          border: `1px solid ${colour}40`,
          borderRadius: "24px",
          padding: "20px",
          width: "320px",
          boxShadow:
            "0 25px 40px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.5) inset",
          transition: "all 0.2s ease",
        }}
      >
        <div
          style={{
            background: colour,
            margin: "-20px -20px 16px",
            padding: "14px 20px",
            borderRadius: "22px 22px 20px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              color: "#fff",
              fontWeight: "800",
              fontSize: "15px",
              letterSpacing: "-0.01em",
            }}
          >
            {isDeadline ? "⏰ " + title : title}
          </span>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "none",
              borderRadius: "40px",
              width: "28px",
              height: "28px",
              color: "#fff",
              fontWeight: "700",
              cursor: "pointer",
              fontSize: "14px",
              transition: "0.1s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.35)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.2)")
            }
          >
            ✕
          </button>
        </div>

        <div style={{ fontSize: "14px", color: "#1e293b", lineHeight: 1.7 }}>
          {course && (
            <div style={{ marginBottom: "12px" }}>
              <span
                style={{
                  background: colour + "15",
                  color: colour,
                  padding: "4px 12px",
                  borderRadius: "40px",
                  fontSize: "12px",
                  fontWeight: "700",
                }}
              >
                📚 {course}
              </span>
            </div>
          )}

          {isDeadline ? (
            <div
              style={{
                color: "#b91c1c",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>⚠️ Deadline at {fmtTime(start)}</span>
            </div>
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "8px",
                }}
              >
                <span>🕒</span> <strong>Session:</strong> {fmtTime(start)} –{" "}
                {fmtTime(end)}
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span>⏱️</span> <strong>Duration:</strong> {allocated_minutes}{" "}
                mins
              </div>
            </>
          )}

          {task_due_date && !isDeadline && (
            <div
              style={{
                marginTop: "12px",
                paddingTop: "8px",
                borderTop: "1px solid #e2e8f0",
              }}
            >
              <strong>📅 Deadline:</strong>{" "}
              <span
                style={{
                  color: isOverdue ? "#b91c1c" : "#334155",
                  fontWeight: "500",
                }}
              >
                {fmt(task_due_date)}
                {isOverdue && (
                  <span
                    style={{
                      marginLeft: "8px",
                      background: "#fee2e2",
                      color: "#b91c1c",
                      padding: "2px 8px",
                      borderRadius: "20px",
                      fontSize: "10px",
                      fontWeight: "800",
                    }}
                  >
                    OVERDUE
                  </span>
                )}
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Main Page ────────────────────────────────────────────────────────
export default function SchedulePage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [deadlineMarkers, setDeadlineMarkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [view, setView] = useState("timeGridWeek");
  const [totalSessions, setTotalSessions] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const calendarRef = useRef(null);
  const colourMap = useRef({});

  useEffect(() => {
    fetchCalendarData();
  }, []);

  const fetchCalendarData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/schedules/");
      const schedules = res.data;

      const sessionEvents = [];
      const deadlines = [];
      const seenDeadlines = new Set();
      let mins = 0;

      schedules.forEach((schedule) => {
        (schedule.items || []).forEach((item) => {
          const colour = courseColour(
            item.task_course || "General",
            colourMap.current,
          );

          sessionEvents.push({
            id: `session-${item.id}`,
            title: item.task_title,
            start: item.start_datetime,
            end: item.end_datetime,
            backgroundColor: colour,
            borderColor: colour,
            textColor: "#ffffff",
            extendedProps: {
              course: item.task_course || "",
              allocated_minutes: item.allocated_minutes,
              task_due_date: item.task_due_date,
              colour,
              isDeadline: false,
            },
          });

          mins += item.allocated_minutes || 0;

          if (item.task_due_date && !seenDeadlines.has(item.task_title)) {
            seenDeadlines.add(item.task_title);
            deadlines.push({
              id: `deadline-${item.id}`,
              title: `Due: ${item.task_title}`,
              start: item.task_due_date,
              allDay: false,
              backgroundColor: "#fee2e2",
              borderColor: "#b91c1c",
              textColor: "#b91c1c",
              extendedProps: {
                isDeadline: true,
                course: item.task_course || "",
                allocated_minutes: 0,
                task_due_date: item.task_due_date,
                colour: "#b91c1c",
              },
            });
          }
        });
      });

      setEvents(sessionEvents);
      setDeadlineMarkers(deadlines);
      setTotalSessions(sessionEvents.length);
      setTotalMinutes(mins);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load schedule data.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/schedules/generate/");
      setSuccess("✨ Schedule generated successfully!");
      colourMap.current = {};
      await fetchCalendarData();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Failed to generate schedule. Make sure you have pending tasks and availability slots set.";
      setError(msg);
    } finally {
      setGenerating(false);
    }
  };

  const handleEventClick = (info) => {
    const rect = info.el.getBoundingClientRect();
    setPopupPosition({ x: rect.left + 20, y: rect.bottom + 12 });
    setSelectedEvent(info.event);
  };

  const switchView = (newView) => {
    setView(newView);
    calendarRef.current?.getApi().changeView(newView);
  };

  const legendItems = Object.entries(colourMap.current);

  // ── Improved calendar CSS (modern, clean, rounded) ─────────────────
  const calendarCSS = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700;14..32,800&display=swap');
    .fc { font-family: 'Inter', system-ui, -apple-system, sans-serif; }

    /* Toolbar */
    .fc-toolbar { padding: 16px 4px 20px !important; }
    .fc-toolbar-title {
      font-size: 22px !important;
      font-weight: 800 !important;
      color: #0f172a;
      letter-spacing: -0.02em;
    }

    /* Buttons */
    .fc-button {
      border-radius: 40px !important;
      font-weight: 600 !important;
      font-size: 13px !important;
      padding: 7px 16px !important;
      box-shadow: none !important;
      transition: all 0.15s ease !important;
      border: none !important;
    }
    .fc-button-primary {
      background: #6366f1 !important;
    }
    .fc-button-primary:hover {
      background: #4f46e5 !important;
      transform: translateY(-1px);
    }
    .fc-button-primary:not(:disabled).fc-button-active {
      background: #4338ca !important;
      box-shadow: inset 0 1px 2px rgba(0,0,0,0.1) !important;
    }
    .fc-today-button {
      background: #f1f5f9 !important;
      color: #1e293b !important;
      border: 1px solid #e2e8f0 !important;
    }
    .fc-today-button:hover {
      background: #e2e8f0 !important;
      transform: translateY(-1px);
    }

    /* Column headers */
    .fc-col-header {
      background: #fefce8;
      border-bottom: 1px solid #e2e8f0 !important;
      border-radius: 16px 16px 0 0;
    }
    .fc-col-header-cell {
      padding: 12px 0 !important;
      font-size: 13px !important;
      font-weight: 700 !important;
      color: #334155 !important;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .fc-col-header-cell a { color: #334155 !important; text-decoration: none; }

    /* Today column */
    .fc-day-today {
      background: linear-gradient(135deg, #fef9e0 0%, #fff5e6 100%) !important;
    }
    .fc-col-header-cell.fc-day-today {
      background: #fef9e0 !important;
    }
    .fc-col-header-cell.fc-day-today a { color: #ea580c !important; font-weight: 800; }

    /* Time slots */
    .fc-timegrid-slot { height: 48px !important; }
    .fc-timegrid-slot-label {
      font-size: 12px !important;
      color: #94a3b8 !important;
      font-weight: 600 !important;
      padding-right: 12px !important;
    }
    .fc-timegrid-axis { border-right: 1px solid #eef2ff !important; }

    /* Grid lines */
    .fc-scrollgrid { border: none !important; border-radius: 16px !important; overflow: hidden; }
    .fc-scrollgrid td, .fc-scrollgrid th {
      border-color: #f1f5f9 !important;
    }
    .fc-timegrid-slot-lane { border-color: #f1f5f9 !important; }

    /* Events */
    .fc-timegrid-event {
      border-radius: 12px !important;
      border: none !important;
      padding: 6px 8px !important;
      box-shadow: 0 4px 10px rgba(0,0,0,0.08) !important;
      transition: all 0.1s ease !important;
    }
    .fc-timegrid-event:hover {
      transform: scale(1.01);
      filter: brightness(1.02);
      box-shadow: 0 8px 18px rgba(0,0,0,0.12) !important;
    }
    .fc-timegrid-event .fc-event-title {
      font-size: 12px !important;
      font-weight: 700 !important;
      line-height: 1.4 !important;
    }
    .fc-timegrid-event .fc-event-time {
      font-size: 10px !important;
      font-weight: 600 !important;
      opacity: 0.85;
      margin-bottom: 2px;
    }
    .fc-daygrid-event {
      border-radius: 20px !important;
      border: none !important;
      padding: 4px 10px !important;
      font-size: 12px !important;
      font-weight: 600 !important;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
    }
    .fc-event { cursor: pointer !important; transition: all 0.1s !important; }
    .fc-event:hover { filter: brightness(0.97); transform: translateY(-1px); }

    /* Now indicator */
    .fc-timegrid-now-indicator-line {
      border-color: #f97316 !important;
      border-width: 2px !important;
      filter: drop-shadow(0 0 2px #f97316);
    }
    .fc-timegrid-now-indicator-arrow {
      border-top-color: #f97316 !important;
      border-bottom-color: #f97316 !important;
    }

    /* Month view day numbers */
    .fc-daygrid-day-number {
      font-size: 14px !important;
      font-weight: 700 !important;
      color: #1e293b !important;
      padding: 8px 10px !important;
    }
    .fc-day-today .fc-daygrid-day-number { color: #ea580c !important; background: #ffedd5; border-radius: 30px; padding: 4px 10px; }
    .fc-daygrid-day.fc-day-today { background: #fff7ed !important; }

    /* Custom scrollbar */
    .fc-scroller-harness::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    .fc-scroller-harness::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 4px;
    }
    .fc-scroller-harness::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 4px;
    }
  `;

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "radial-gradient(circle at 10% 20%, #f8fafc, #eef2ff)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "3px solid #e2e8f0",
              borderTopColor: "#6366f1",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              marginBottom: "16px",
            }}
          ></div>
          <p style={{ color: "#475569", fontWeight: "500" }}>
            Loading schedule...
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 0% 0%, #fefce8 0%, #eff6ff 100%)",
        padding: "28px 20px 60px",
      }}
    >
      <style>{calendarCSS}</style>

      {/* Hero Card - Glassmorphism */}
      <div
        style={{
          background: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(12px)",
          borderRadius: "32px",
          padding: "28px 32px",
          marginBottom: "28px",
          boxShadow:
            "0 20px 35px -12px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.6) inset",
          border: "1px solid rgba(255,255,255,0.8)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "24px",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "32px",
                fontWeight: "800",
                background: "linear-gradient(135deg, #1e293b, #4f46e5)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                letterSpacing: "-0.02em",
              }}
            >
              📘 Study Flow
            </h1>
            <p
              style={{
                margin: "6px 0 16px",
                color: "#475569",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Your intelligent study planner
            </p>

            {/* Stats Cards */}
            <div
              style={{
                display: "flex",
                gap: "14px",
                flexWrap: "wrap",
                marginTop: "8px",
              }}
            >
              {[
                { label: "Sessions", value: totalSessions, icon: "📖" },
                { label: "Minutes", value: totalMinutes, icon: "⏱️" },
                {
                  label: "Deadlines",
                  value: deadlineMarkers.length,
                  icon: "⚠️",
                },
              ].map(({ label, value, icon }) => (
                <div
                  key={label}
                  style={{
                    background: "rgba(255,255,255,0.7)",
                    borderRadius: "24px",
                    padding: "6px 18px",
                    backdropFilter: "blur(4px)",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    border: "1px solid rgba(255,255,255,0.9)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "22px",
                      fontWeight: "800",
                      color: "#0f172a",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    {icon} {value}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#64748b",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>

            {/* View Toggle */}
            <div
              style={{
                display: "flex",
                gap: "8px",
                background: "rgba(0,0,0,0.04)",
                padding: "5px",
                borderRadius: "60px",
                width: "fit-content",
                marginTop: "20px",
              }}
            >
              {[
                { v: "dayGridMonth", label: "Month", icon: "📅" },
                { v: "timeGridWeek", label: "Week", icon: "📆" },
                { v: "timeGridDay", label: "Day", icon: "☀️" },
              ].map(({ v, label, icon }) => (
                <button
                  key={v}
                  onClick={() => switchView(v)}
                  style={{
                    padding: "8px 20px",
                    borderRadius: "40px",
                    border: "none",
                    fontWeight: "600",
                    fontSize: "13px",
                    cursor: "pointer",
                    background: view === v ? "#ffffff" : "transparent",
                    color: view === v ? "#4f46e5" : "#475569",
                    boxShadow:
                      view === v ? "0 2px 6px rgba(0,0,0,0.05)" : "none",
                    transition: "all 0.15s",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {icon} {label}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={generating}
            style={{
              padding: "12px 26px",
              borderRadius: "40px",
              background: generating ? "#94a3b8" : "#6366f1",
              color: "#fff",
              fontWeight: "700",
              fontSize: "14px",
              border: "none",
              cursor: generating ? "not-allowed" : "pointer",
              boxShadow: "0 8px 18px rgba(99,102,241,0.3)",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
            onMouseEnter={(e) =>
              !generating && (e.currentTarget.style.background = "#4f46e5")
            }
            onMouseLeave={(e) =>
              !generating && (e.currentTarget.style.background = "#6366f1")
            }
          >
            {generating ? "🌀 Generating..." : "✨ Generate Schedule"}
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div
          style={{
            padding: "14px 20px",
            borderRadius: "60px",
            marginBottom: "20px",
            background: "#fee2e2",
            color: "#b91c1c",
            border: "1px solid #fecaca",
            fontWeight: "500",
            fontSize: "14px",
          }}
        >
          ⚠️ {error}
        </div>
      )}
      {success && (
        <div
          style={{
            padding: "14px 20px",
            borderRadius: "60px",
            marginBottom: "20px",
            background: "#d1fae5",
            color: "#065f46",
            border: "1px solid #a7f3d0",
            fontWeight: "500",
            fontSize: "14px",
          }}
        >
          ✅ {success}
        </div>
      )}

      {/* Legend */}
      {legendItems.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "20px",
            padding: "12px 20px",
            background: "rgba(255,255,255,0.6)",
            backdropFilter: "blur(8px)",
            borderRadius: "60px",
            border: "1px solid rgba(255,255,255,0.8)",
            alignItems: "center",
          }}
        >
          <span
            style={{ fontSize: "13px", fontWeight: "700", color: "#475569" }}
          >
            🎨 Courses:
          </span>
          {legendItems.map(([course, colour]) => (
            <span
              key={course}
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <span
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "20px",
                  background: colour,
                }}
              />
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#1e293b",
                }}
              >
                {course}
              </span>
            </span>
          ))}
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "20px",
                background: "#fee2e2",
                border: "1px solid #b91c1c",
              }}
            />
            <span
              style={{ fontSize: "12px", fontWeight: "600", color: "#b91c1c" }}
            >
              Deadline
            </span>
          </span>
        </div>
      )}

      {/* Calendar Container */}
      {events.length === 0 && !error ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 24px",
            background: "rgba(255,255,255,0.6)",
            backdropFilter: "blur(8px)",
            borderRadius: "32px",
            border: "1px solid rgba(255,255,255,0.8)",
            color: "#475569",
          }}
        >
          <h3 style={{ color: "#1e293b", marginTop: 0, fontWeight: "700" }}>
            ✨ No study sessions yet
          </h3>
          <p>
            Add tasks and set your availability, then hit{" "}
            <strong>Generate Schedule</strong>.
          </p>
          <div
            style={{
              display: "flex",
              gap: "14px",
              justifyContent: "center",
              marginTop: "28px",
            }}
          >
            <button
              onClick={() => navigate("/tasks")}
              style={{
                padding: "10px 24px",
                borderRadius: "40px",
                background: "#6366f1",
                color: "#fff",
                border: "none",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              ➕ Go to Tasks
            </button>
            <button
              onClick={() => navigate("/availability")}
              style={{
                padding: "10px 24px",
                borderRadius: "40px",
                background: "#f1f5f9",
                color: "#334155",
                border: "1px solid #cbd5e1",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              🕒 Set Availability
            </button>
          </div>
        </div>
      ) : (
        <div
          style={{
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(4px)",
            borderRadius: "32px",
            padding: "8px 8px 8px 8px",
            boxShadow: "0 20px 35px -12px rgba(0,0,0,0.15)",
            border: "1px solid rgba(255,255,255,0.9)",
          }}
        >
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={view}
            initialDate={events.length > 0 ? events[0].start : undefined}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "",
            }}
            events={[...events, ...deadlineMarkers]}
            eventClick={handleEventClick}
            height="auto"
            slotMinTime="06:00:00"
            slotMaxTime="23:00:00"
            allDaySlot={false}
            nowIndicator={true}
            slotLabelFormat={{
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            }}
            eventTimeFormat={{
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            }}
            slotLabelClassNames="fc-slot-label"
            dayHeaderFormat={{
              weekday: "short",
              day: "numeric",
              month: "short",
            }}
          />
        </div>
      )}

      {/* Event Popup */}
      <EventPopup
        event={selectedEvent}
        position={popupPosition}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}
