import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";

export default function TasksPage() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    course: "",
    due_date: "",
    estimated_minutes: "",
    difficulty: "medium",
  });

  const fetchTasks = async () => {
    try {
      const response = await api.get("/tasks/");
      setTasks(response.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccessMessage("");
    try {
      await api.post("/tasks/", formData);
      await fetchTasks();
      setFormData({
        title: "",
        description: "",
        course: "",
        due_date: "",
        estimated_minutes: "",
        difficulty: "medium",
      });
      setSuccessMessage("Task added successfully.");
    } catch (err) {
      console.error(err);
      setError("Failed to create task.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await api.delete(`/tasks/${taskId}/`);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      setSuccessMessage("Task deleted.");
    } catch (err) {
      console.error(err);
      setError("Failed to delete task.");
    }
  };

  const handleToggleStatus = async (task) => {
    const newStatus = task.status === "pending" ? "completed" : "pending";
    try {
      const res = await api.patch(`/tasks/${task.id}/`, { status: newStatus });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? res.data : t)));
    } catch (err) {
      console.error(err);
      setError("Failed to update task status.");
    }
  };

  const handleGenerateSchedule = async () => {
    setGenerating(true);
    setError("");
    setSuccessMessage("");
    try {
      await api.post("/schedules/generate/");
      setSuccessMessage("Schedule generated! Redirecting...");
      setTimeout(() => navigate("/schedules"), 1200);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Failed to generate schedule. Make sure you have pending tasks and availability slots set.";
      setError(msg);
      setGenerating(false);
    }
  };

  const getDifficultyBadgeStyle = (difficulty) => {
    const base = {
      display: "inline-block",
      padding: "6px 12px",
      borderRadius: "999px",
      fontSize: "12px",
      fontWeight: "700",
      textTransform: "capitalize",
      border: "1px solid transparent",
    };
    if (difficulty === "hard")
      return {
        ...base,
        backgroundColor: "#fee2e2",
        color: "#b91c1c",
        borderColor: "#fecaca",
      };
    if (difficulty === "medium")
      return {
        ...base,
        backgroundColor: "#fef3c7",
        color: "#b45309",
        borderColor: "#fde68a",
      };
    return {
      ...base,
      backgroundColor: "#dcfce7",
      color: "#166534",
      borderColor: "#bbf7d0",
    };
  };

  // ── Styles ──────────────────────────────────────────────────────────

  const pageStyle = {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
    padding: "20px 8px 40px",
  };

  const heroCardStyle = {
    background: "linear-gradient(135deg, #312e81 0%, #4338ca 100%)",
    color: "white",
    borderRadius: "24px",
    padding: "32px",
    boxShadow: "0 20px 40px rgba(49, 46, 129, 0.22)",
    marginBottom: "28px",
  };

  const statsRowStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "16px",
    marginTop: "24px",
  };

  const statCardStyle = {
    backgroundColor: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "18px",
    padding: "18px",
    backdropFilter: "blur(10px)",
  };

  const layoutStyle = {
    display: "grid",
    gridTemplateColumns: "minmax(320px, 380px) 1fr",
    gap: "24px",
    alignItems: "start",
  };

  const panelStyle = {
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "22px",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
  };

  const formPanelStyle = {
    ...panelStyle,
    padding: "24px",
    position: "sticky",
    top: "20px",
  };
  const listPanelStyle = { ...panelStyle, padding: "24px" };

  const sectionTitleStyle = {
    margin: 0,
    fontSize: "22px",
    fontWeight: "800",
    color: "#0f172a",
  };
  const sectionTextStyle = {
    marginTop: "8px",
    marginBottom: "20px",
    color: "#64748b",
    fontSize: "14px",
    lineHeight: 1.6,
  };

  const labelStyle = {
    display: "block",
    marginBottom: "8px",
    fontSize: "14px",
    fontWeight: "700",
    color: "#334155",
  };

  const inputStyle = {
    width: "100%",
    padding: "13px 14px",
    borderRadius: "14px",
    border: "1px solid #d1d5db",
    outline: "none",
    fontSize: "14px",
    backgroundColor: "#f8fafc",
    boxSizing: "border-box",
    marginBottom: "16px",
  };

  const textareaStyle = {
    ...inputStyle,
    minHeight: "100px",
    resize: "vertical",
  };

  const primaryButtonStyle = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "14px",
    border: "none",
    background: "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 10px 20px rgba(79, 70, 229, 0.22)",
    marginTop: "4px",
  };

  const secondaryButtonStyle = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "14px",
    border: "1px solid #c7d2fe",
    backgroundColor: "#eef2ff",
    color: "#3730a3",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    marginTop: "12px",
  };

  const messageStyle = {
    padding: "12px 14px",
    borderRadius: "14px",
    fontSize: "14px",
    fontWeight: "600",
    marginBottom: "16px",
  };

  const emptyStateStyle = {
    textAlign: "center",
    padding: "56px 20px",
    border: "1px dashed #cbd5e1",
    borderRadius: "18px",
    backgroundColor: "#f8fafc",
    color: "#64748b",
  };

  const taskGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "18px",
  };

  const priorityBoxStyle = {
    marginTop: "14px",
    padding: "14px",
    backgroundColor: "#eef2ff",
    border: "1px solid #c7d2fe",
    borderRadius: "16px",
  };

  // ── Render ───────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={pageStyle}>
        <div
          style={{
            ...panelStyle,
            padding: "40px",
            textAlign: "center",
            color: "#64748b",
          }}
        >
          Loading tasks...
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      {/* Hero */}
      <div style={heroCardStyle}>
        <h1
          style={{
            margin: 0,
            fontSize: "32px",
            fontWeight: "800",
            letterSpacing: "-0.02em",
          }}
        >
          Smart Task Planner
        </h1>
        <p
          style={{
            marginTop: "10px",
            marginBottom: 0,
            color: "rgba(255,255,255,0.88)",
            fontSize: "15px",
            lineHeight: 1.6,
          }}
        >
          Manage your academic tasks, monitor priority scores, and generate a
          study schedule.
        </p>
        <div style={statsRowStyle}>
          <div style={statCardStyle}>
            <div style={{ fontSize: "13px", opacity: 0.85 }}>Total Tasks</div>
            <div
              style={{ fontSize: "28px", fontWeight: "800", marginTop: "6px" }}
            >
              {tasks.length}
            </div>
          </div>
          <div style={statCardStyle}>
            <div style={{ fontSize: "13px", opacity: 0.85 }}>High Priority</div>
            <div
              style={{ fontSize: "28px", fontWeight: "800", marginTop: "6px" }}
            >
              {tasks.filter((t) => Number(t.priority_score) >= 4).length}
            </div>
          </div>
          <div style={statCardStyle}>
            <div style={{ fontSize: "13px", opacity: 0.85 }}>Hard Tasks</div>
            <div
              style={{ fontSize: "28px", fontWeight: "800", marginTop: "6px" }}
            >
              {tasks.filter((t) => t.difficulty === "hard").length}
            </div>
          </div>
          <div style={statCardStyle}>
            <div style={{ fontSize: "13px", opacity: 0.85 }}>Completed</div>
            <div
              style={{ fontSize: "28px", fontWeight: "800", marginTop: "6px" }}
            >
              {tasks.filter((t) => t.status === "completed").length}
            </div>
          </div>
        </div>
      </div>

      {/* Layout */}
      <div style={layoutStyle}>
        {/* Form panel */}
        <div style={formPanelStyle}>
          <h2 style={sectionTitleStyle}>Add New Task</h2>
          <p style={sectionTextStyle}>
            Enter task details below. The system will use the deadline and
            difficulty for prioritization.
          </p>

          {error && (
            <div
              style={{
                ...messageStyle,
                backgroundColor: "#fee2e2",
                color: "#b91c1c",
                border: "1px solid #fecaca",
              }}
            >
              {error}
            </div>
          )}
          {successMessage && (
            <div
              style={{
                ...messageStyle,
                backgroundColor: "#dcfce7",
                color: "#166534",
                border: "1px solid #bbf7d0",
              }}
            >
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label style={labelStyle}>Task Title</label>
            <input
              type="text"
              name="title"
              placeholder="e.g. Database Assignment"
              value={formData.title}
              onChange={handleChange}
              required
              style={inputStyle}
            />

            <label style={labelStyle}>Description</label>
            <textarea
              name="description"
              placeholder="Briefly describe the task"
              value={formData.description}
              onChange={handleChange}
              style={textareaStyle}
            />

            <label style={labelStyle}>Course</label>
            <input
              type="text"
              name="course"
              placeholder="e.g. APT3065A"
              value={formData.course}
              onChange={handleChange}
              required
              style={inputStyle}
            />

            <label style={labelStyle}>Due Date and Time</label>
            <input
              type="datetime-local"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              required
              style={inputStyle}
            />

            <label style={labelStyle}>Estimated Minutes</label>
            <input
              type="number"
              name="estimated_minutes"
              placeholder="e.g. 120"
              value={formData.estimated_minutes}
              onChange={handleChange}
              required
              style={inputStyle}
            />

            <label style={labelStyle}>Difficulty</label>
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            <button
              type="submit"
              disabled={submitting}
              style={primaryButtonStyle}
            >
              {submitting ? "Saving Task..." : "Add Task"}
            </button>
          </form>

          <button
            onClick={handleGenerateSchedule}
            disabled={generating || tasks.length === 0}
            style={{
              ...secondaryButtonStyle,
              opacity: generating || tasks.length === 0 ? 0.7 : 1,
              cursor:
                generating || tasks.length === 0 ? "not-allowed" : "pointer",
            }}
          >
            {generating ? "Generating Schedule..." : "Generate Schedule"}
          </button>
        </div>

        {/* Task list panel */}
        <div style={listPanelStyle}>
          <h2 style={sectionTitleStyle}>Task Overview</h2>
          <p style={sectionTextStyle}>
            View all tasks with their difficulty and calculated priority scores.
          </p>

          {tasks.length === 0 ? (
            <div style={emptyStateStyle}>
              <h3 style={{ marginTop: 0, color: "#334155" }}>No tasks yet</h3>
              <p style={{ marginBottom: 0 }}>
                Add your first task from the form on the left.
              </p>
            </div>
          ) : (
            <div style={taskGridStyle}>
              {tasks.map((task) => (
                <div
                  key={task.id}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "20px",
                    padding: "20px",
                    background:
                      "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
                    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
                    opacity: task.status === "completed" ? 0.65 : 1,
                    borderColor:
                      task.status === "completed" ? "#bbf7d0" : "#e5e7eb",
                  }}
                >
                  {/* Badge row */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "14px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span style={getDifficultyBadgeStyle(task.difficulty)}>
                      {task.difficulty}
                    </span>
                    <span
                      style={{
                        fontSize: "13px",
                        color: "#64748b",
                        fontWeight: "600",
                      }}
                    >
                      {task.estimated_minutes} mins
                    </span>
                  </div>

                  {/* Title */}
                  <h3
                    style={{
                      margin: "0 0 10px 0",
                      fontSize: "18px",
                      fontWeight: "800",
                      color:
                        task.status === "completed" ? "#94a3b8" : "#0f172a",
                      textDecoration:
                        task.status === "completed" ? "line-through" : "none",
                    }}
                  >
                    {task.title}
                  </h3>

                  <p
                    style={{
                      margin: "6px 0",
                      color: "#475569",
                      fontSize: "14px",
                      lineHeight: 1.5,
                    }}
                  >
                    <strong>Course:</strong> {task.course || "---"}
                  </p>
                  <p
                    style={{
                      margin: "6px 0",
                      color: "#475569",
                      fontSize: "14px",
                      lineHeight: 1.5,
                    }}
                  >
                    <strong>Description:</strong>{" "}
                    {task.description || "No description provided."}
                  </p>
                  <p
                    style={{
                      margin: "6px 0",
                      color: "#475569",
                      fontSize: "14px",
                      lineHeight: 1.5,
                    }}
                  >
                    <strong>Due:</strong>{" "}
                    {new Date(task.due_date).toLocaleString(undefined, {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>

                  {/* Priority score */}
                  <div style={priorityBoxStyle}>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#4338ca",
                        fontWeight: "700",
                      }}
                    >
                      AI PRIORITY SCORE
                    </div>
                    <div
                      style={{
                        fontSize: "28px",
                        fontWeight: "800",
                        color: "#312e81",
                        marginTop: "4px",
                      }}
                    >
                      {task.priority_score ?? "—"}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div
                    style={{ display: "flex", gap: "10px", marginTop: "16px" }}
                  >
                    <button
                      onClick={() => handleToggleStatus(task)}
                      style={{
                        flex: 1,
                        padding: "10px",
                        borderRadius: "10px",
                        border: "none",
                        background:
                          task.status === "completed" ? "#fef3c7" : "#dcfce7",
                        color:
                          task.status === "completed" ? "#b45309" : "#166534",
                        fontWeight: "700",
                        fontSize: "13px",
                        cursor: "pointer",
                      }}
                    >
                      {task.status === "completed"
                        ? "Mark Pending"
                        : "Mark Complete"}
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "10px",
                        border: "none",
                        background: "#fee2e2",
                        color: "#b91c1c",
                        fontWeight: "700",
                        fontSize: "13px",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
