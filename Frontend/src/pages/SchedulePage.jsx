import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";

export default function SchedulePage() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const fetchSchedules = async () => {
    try {
      const response = await api.get("/schedules/");
      setSchedules(response.data);
      setError("");
    } catch (err) {
      setError("Failed to load schedules.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
    const interval = setInterval(fetchSchedules, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleGenerateSchedule = async () => {
    setGenerating(true);
    setError("");
    setSuccessMessage("");
    try {
      await api.post("/schedules/generate/");
      setSuccessMessage("Schedule generated successfully!");
      await fetchSchedules();
    } catch (err) {
      // Show the backend's descriptive error message if available
      const msg =
        err.response?.data?.message ||
        "Failed to generate schedule. Make sure you have pending tasks and availability slots set.";
      setError(msg);
    } finally {
      setGenerating(false);
    }
  };

  // Uses period_start / period_end — the correct backend field names
  const getScheduleStatus = (start, end) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(start);
    const endDate = new Date(end);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    if (today >= startDate && today <= endDate) return "active";
    if (today < startDate) return "upcoming";
    return "past";
  };

  const isToday = (dateString) => {
    const today = new Date();
    const date = new Date(dateString);
    return (
      today.getFullYear() === date.getFullYear() &&
      today.getMonth() === date.getMonth() &&
      today.getDate() === date.getDate()
    );
  };

  const formatDayHeading = (dateString) =>
    new Date(dateString).toLocaleDateString(undefined, {
      weekday: "long",
      day: "numeric",
      month: "short",
    });

  const formatTime = (dateTimeString) =>
    new Date(dateTimeString).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });

  const formatDeadline = (deadline) =>
    new Date(deadline).toLocaleString(undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    });

  const calculateProgress = (items) => {
    if (!items.length) return 0;
    const completed = items.filter(
      (item) => new Date(item.end_datetime) < new Date(),
    ).length;
    return Math.round((completed / items.length) * 100);
  };

  const groupItemsByDay = (items) => {
    const grouped = {};
    const seen = new Set();
    items.forEach((item) => {
      const uniqueKey = `${item.task_title}-${item.start_datetime}`;
      if (seen.has(uniqueKey)) return;
      seen.add(uniqueKey);
      const key = item.study_date;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    });
    return Object.entries(grouped).sort(
      ([a], [b]) => new Date(a) - new Date(b),
    );
  };

  const messageStyle = (type) => ({
    padding: "12px 16px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    marginBottom: "16px",
    backgroundColor: type === "error" ? "#fee2e2" : "#dcfce7",
    color: type === "error" ? "#b91c1c" : "#166534",
    border: `1px solid ${type === "error" ? "#fecaca" : "#bbf7d0"}`,
  });

  if (loading)
    return <p style={{ textAlign: "center", padding: "40px" }}>Loading...</p>;

  return (
    <div style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "28px",
            fontWeight: "800",
            color: "#0f172a",
          }}
        >
          Study Schedules
        </h2>
        <button
          onClick={handleGenerateSchedule}
          disabled={generating}
          style={{
            padding: "12px 20px",
            borderRadius: "12px",
            border: "none",
            background: "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)",
            color: "#fff",
            fontWeight: "700",
            fontSize: "14px",
            cursor: generating ? "not-allowed" : "pointer",
            opacity: generating ? 0.7 : 1,
          }}
        >
          {generating ? "Generating..." : "Generate New Schedule"}
        </button>
      </div>

      {error && <div style={messageStyle("error")}>{error}</div>}
      {successMessage && (
        <div style={messageStyle("success")}>{successMessage}</div>
      )}

      {schedules.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            border: "1px dashed #cbd5e1",
            borderRadius: "18px",
            backgroundColor: "#f8fafc",
            color: "#64748b",
          }}
        >
          <h3 style={{ color: "#334155", marginTop: 0 }}>No schedules yet</h3>
          <p>
            Make sure you have pending tasks and availability slots set, then
            click "Generate New Schedule".
          </p>
          <button
            onClick={() => navigate("/availability")}
            style={{
              marginTop: "16px",
              padding: "10px 20px",
              borderRadius: "10px",
              background: "#4f46e5",
              color: "#fff",
              border: "none",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Set Availability First
          </button>
        </div>
      ) : (
        schedules.map((schedule) => {
          const items = schedule.items || [];
          const groupedDays = groupItemsByDay(items);
          // FIX: use period_start / period_end not start_date / end_date
          const status = getScheduleStatus(
            schedule.period_start,
            schedule.period_end,
          );
          const progress = calculateProgress(items);

          return (
            <div
              key={schedule.id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "16px",
                padding: "24px",
                marginBottom: "24px",
                background: "#fff",
                boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                opacity: status === "past" ? 0.65 : 1,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "4px 12px",
                      borderRadius: "999px",
                      fontSize: "12px",
                      fontWeight: "700",
                      marginBottom: "8px",
                      background:
                        status === "active"
                          ? "#dcfce7"
                          : status === "upcoming"
                            ? "#dbeafe"
                            : "#e5e7eb",
                      color:
                        status === "active"
                          ? "#166534"
                          : status === "upcoming"
                            ? "#1e40af"
                            : "#6b7280",
                    }}
                  >
                    {status.toUpperCase()}
                  </span>
                  <h3
                    style={{
                      margin: "0 0 4px",
                      fontSize: "20px",
                      fontWeight: "800",
                      color: "#0f172a",
                    }}
                  >
                    {schedule.title}
                  </h3>
                  {/* FIX: period_start / period_end */}
                  <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                    {new Date(schedule.period_start).toLocaleDateString()} –{" "}
                    {new Date(schedule.period_end).toLocaleDateString()}
                    {" · "}
                    {schedule.total_allocated_minutes} mins allocated
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ marginBottom: "20px" }}>
                <div
                  style={{
                    height: "8px",
                    background: "#e5e7eb",
                    borderRadius: "5px",
                  }}
                >
                  <div
                    style={{
                      width: `${progress}%`,
                      height: "8px",
                      background: "#4f46e5",
                      borderRadius: "5px",
                      transition: "width 0.4s",
                    }}
                  />
                </div>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                    marginTop: "6px",
                  }}
                >
                  {progress}% completed
                </p>
              </div>

              {groupedDays.map(([date, dayItems]) => (
                <div
                  key={date}
                  style={{
                    marginBottom: "20px",
                    padding: "14px",
                    borderRadius: "12px",
                    background: isToday(date) ? "#eef2ff" : "#f8fafc",
                    border: isToday(date)
                      ? "1px solid #6366f1"
                      : "1px solid #e5e7eb",
                  }}
                >
                  <h4 style={{ color: "#4f46e5", margin: "0 0 12px" }}>
                    {formatDayHeading(date)}
                  </h4>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {dayItems.map((item, index) => {
                      const isPast = new Date(item.end_datetime) < new Date();
                      // FIX: use task_due_date not item.deadline
                      const isOverdue =
                        item.task_due_date &&
                        new Date(item.task_due_date) < new Date();
                      return (
                        <li
                          key={index}
                          style={{
                            padding: "14px",
                            border: "1px solid #e5e7eb",
                            borderRadius: "12px",
                            marginBottom: "10px",
                            background: "#ffffff",
                            opacity: isPast ? 0.55 : 1,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              marginBottom: "6px",
                            }}
                          >
                            <strong
                              style={{ fontSize: "15px", color: "#0f172a" }}
                            >
                              {item.task_title}
                            </strong>
                            {isOverdue && (
                              <span
                                style={{
                                  background: "#fee2e2",
                                  color: "#b91c1c",
                                  padding: "2px 8px",
                                  borderRadius: "5px",
                                  fontSize: "11px",
                                  fontWeight: "700",
                                }}
                              >
                                OVERDUE
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: "14px", color: "#475569" }}>
                            {formatTime(item.start_datetime)} –{" "}
                            {formatTime(item.end_datetime)} |{" "}
                            {item.allocated_minutes} mins
                          </div>
                          {/* FIX: task_due_date not item.deadline */}
                          {item.task_due_date && (
                            <div
                              style={{
                                fontSize: "13px",
                                color: "#b91c1c",
                                marginTop: "4px",
                              }}
                            >
                              Due: {formatDeadline(item.task_due_date)}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          );
        })
      )}
    </div>
  );
}
