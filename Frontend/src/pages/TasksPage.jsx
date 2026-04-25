import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";

// ── Helpers ──────────────────────────────────────────────────────────
const getDifficultyStyle = (difficulty) => {
  if (difficulty === "hard")
    return { bg: "#fee2e2", color: "#b91c1c", border: "#fecaca" };
  if (difficulty === "medium")
    return { bg: "#fef3c7", color: "#b45309", border: "#fde68a" };
  return { bg: "#dcfce7", color: "#166534", border: "#bbf7d0" };
};

// ── Share Modal ───────────────────────────────────────────────────────
function ShareModal({ task, onClose }) {
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const share = async () => {
      try {
        const res = await api.post("/tasks/share/", { task_id: task.id });
        setGroup(res.data);
      } catch (err) {
        setError("Failed to create share link.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    share();
  }, [task.id]);

  const handleCopy = () => {
    if (!group) return;
    navigator.clipboard.writeText(group.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1000,
          background: "rgba(15,23,42,0.55)",
          backdropFilter: "blur(4px)",
        }}
      />
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 1001,
          background: "#fff",
          borderRadius: "24px",
          padding: "32px",
          width: "min(440px, 92vw)",
          boxShadow: "0 32px 64px rgba(15,23,42,0.22)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "24px",
          }}
        >
          <div>
            <h2
              style={{
                margin: "0 0 6px",
                fontSize: "22px",
                fontWeight: "800",
                color: "#0f172a",
              }}
            >
              Share Task
            </h2>
            <p style={{ margin: 0, fontSize: "14px", color: "#64748b" }}>
              Give this code to classmates so they can join
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#f1f5f9",
              border: "none",
              borderRadius: "50%",
              width: "34px",
              height: "34px",
              cursor: "pointer",
              fontSize: "18px",
              color: "#475569",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            x
          </button>
        </div>

        <div
          style={{
            background: "#f8fafc",
            borderRadius: "14px",
            padding: "16px",
            marginBottom: "20px",
            border: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              fontSize: "16px",
              fontWeight: "800",
              color: "#0f172a",
              marginBottom: "4px",
            }}
          >
            {task.title}
          </div>
          <div style={{ fontSize: "13px", color: "#64748b" }}>
            {task.course} · Due{" "}
            {new Date(task.due_date).toLocaleDateString(undefined, {
              weekday: "short",
              day: "numeric",
              month: "short",
            })}
          </div>
        </div>

        {error && (
          <div
            style={{
              padding: "12px",
              borderRadius: "10px",
              marginBottom: "16px",
              background: "#fee2e2",
              color: "#b91c1c",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <div
            style={{ textAlign: "center", padding: "24px", color: "#64748b" }}
          >
            Generating invite code...
          </div>
        ) : (
          group && (
            <>
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: "10px",
                  }}
                >
                  Invite Code
                </label>
                <div
                  style={{ display: "flex", gap: "10px", alignItems: "center" }}
                >
                  <div
                    style={{
                      flex: 1,
                      padding: "16px 20px",
                      background:
                        "linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%)",
                      border: "2px solid #c7d2fe",
                      borderRadius: "14px",
                      fontSize: "28px",
                      fontWeight: "900",
                      color: "#4f46e5",
                      letterSpacing: "0.15em",
                      textAlign: "center",
                      fontFamily: "monospace",
                    }}
                  >
                    {group.invite_code}
                  </div>
                  <button
                    onClick={handleCopy}
                    style={{
                      padding: "16px 20px",
                      borderRadius: "14px",
                      border: "none",
                      background: copied
                        ? "linear-gradient(135deg, #059669, #047857)"
                        : "linear-gradient(135deg, #4f46e5, #4338ca)",
                      color: "#fff",
                      fontWeight: "700",
                      fontSize: "13px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              <div
                style={{
                  padding: "14px 16px",
                  background: "#f8fafc",
                  borderRadius: "12px",
                  border: "1px solid #e5e7eb",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "#64748b",
                    marginBottom: "10px",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {group.member_count} Member
                  {group.member_count !== 1 ? "s" : ""}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {group.members.map((m) => (
                    <span
                      key={m.id}
                      style={{
                        padding: "5px 12px",
                        borderRadius: "999px",
                        background: "#e0e7ff",
                        color: "#4338ca",
                        fontSize: "13px",
                        fontWeight: "700",
                      }}
                    >
                      {m.username}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )
        )}
      </div>
    </>
  );
}

// ── Join Modal ────────────────────────────────────────────────────────
function JoinModal({ onClose, onJoined }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  const handleJoin = async () => {
    if (!code.trim()) {
      setError("Please enter an invite code.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/tasks/share/join/", {
        invite_code: code.trim().toUpperCase(),
      });
      setSuccess(res.data);
      onJoined();
    } catch (err) {
      setError(
        err.response?.data?.error || "Invalid invite code. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1000,
          background: "rgba(15,23,42,0.55)",
          backdropFilter: "blur(4px)",
        }}
      />
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 1001,
          background: "#fff",
          borderRadius: "24px",
          padding: "32px",
          width: "min(420px, 92vw)",
          boxShadow: "0 32px 64px rgba(15,23,42,0.22)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "24px",
          }}
        >
          <div>
            <h2
              style={{
                margin: "0 0 6px",
                fontSize: "22px",
                fontWeight: "800",
                color: "#0f172a",
              }}
            >
              Join Shared Task
            </h2>
            <p style={{ margin: 0, fontSize: "14px", color: "#64748b" }}>
              Enter the invite code from a classmate
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#f1f5f9",
              border: "none",
              borderRadius: "50%",
              width: "34px",
              height: "34px",
              cursor: "pointer",
              fontSize: "18px",
              color: "#475569",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            x
          </button>
        </div>

        {success ? (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>🎉</div>
            <h3
              style={{ margin: "0 0 8px", color: "#059669", fontSize: "18px" }}
            >
              Joined successfully!
            </h3>
            <p
              style={{
                color: "#64748b",
                fontSize: "14px",
                marginBottom: "20px",
              }}
            >
              <strong>{success.task_title}</strong> has been added to your
              tasks.
            </p>
            <button
              onClick={onClose}
              style={{
                padding: "12px 28px",
                borderRadius: "12px",
                border: "none",
                background: "#4f46e5",
                color: "#fff",
                fontWeight: "700",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            {error && (
              <div
                style={{
                  padding: "12px",
                  borderRadius: "10px",
                  marginBottom: "16px",
                  background: "#fee2e2",
                  color: "#b91c1c",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                {error}
              </div>
            )}
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: "700",
                color: "#64748b",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "10px",
              }}
            >
              Invite Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. A3KX9QBT"
              maxLength={12}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              style={{
                width: "100%",
                padding: "16px 20px",
                fontSize: "24px",
                fontWeight: "800",
                fontFamily: "monospace",
                letterSpacing: "0.15em",
                textAlign: "center",
                color: "#4f46e5",
                border: "2px solid #c7d2fe",
                borderRadius: "14px",
                background: "#eef2ff",
                outline: "none",
                marginBottom: "16px",
                boxSizing: "border-box",
              }}
            />
            <button
              onClick={handleJoin}
              disabled={loading || !code.trim()}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "14px",
                border: "none",
                background: "linear-gradient(135deg, #4f46e5, #4338ca)",
                color: "#fff",
                fontWeight: "700",
                fontSize: "15px",
                cursor: loading || !code.trim() ? "not-allowed" : "pointer",
                opacity: loading || !code.trim() ? 0.7 : 1,
              }}
            >
              {loading ? "Joining..." : "Join Task Group"}
            </button>
          </>
        )}
      </div>
    </>
  );
}

// ── Shared Tasks Tab ─────────────────────────────────────────────────
function SharedTasksTab({ refresh }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [leavingId, setLeavingId] = useState(null);

  useEffect(() => {
    fetchGroups();
  }, [refresh]);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await api.get("/tasks/shared/");
      setGroups(res.data);
    } catch (err) {
      setError("Failed to load shared tasks.");
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = async (groupId) => {
    if (!window.confirm("Leave this shared task group?")) return;
    setLeavingId(groupId);
    try {
      await api.delete(`/tasks/shared/${groupId}/leave/`);
      setGroups((prev) => prev.filter((g) => g.id !== groupId));
    } catch (err) {
      setError("Failed to leave group.");
    } finally {
      setLeavingId(null);
    }
  };

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "48px", color: "#64748b" }}>
        Loading shared tasks...
      </div>
    );

  return (
    <div>
      {error && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "10px",
            marginBottom: "16px",
            background: "#fee2e2",
            color: "#b91c1c",
            fontWeight: "600",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}

      {groups.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            border: "1px dashed #cbd5e1",
            borderRadius: "18px",
            background: "#f8fafc",
            color: "#64748b",
          }}
        >
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>🤝</div>
          <h3 style={{ color: "#334155", marginTop: 0 }}>
            No shared tasks yet
          </h3>
          <p style={{ marginBottom: 0, maxWidth: "320px", margin: "0 auto" }}>
            Click Share on any task to collaborate, or use the Join button to
            enter an invite code.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "18px",
          }}
        >
          {groups.map((group) => (
            <div
              key={group.id}
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "20px",
                padding: "20px",
                boxShadow: "0 4px 16px rgba(15,23,42,0.06)",
                borderTop: "4px solid #4f46e5",
              }}
            >
              <h3
                style={{
                  margin: "0 0 6px",
                  fontSize: "17px",
                  fontWeight: "800",
                  color: "#0f172a",
                }}
              >
                {group.task_title}
              </h3>
              <p
                style={{
                  margin: "0 0 16px",
                  fontSize: "13px",
                  color: "#64748b",
                }}
              >
                {group.task_course || "No course"} · Created by{" "}
                <strong style={{ color: "#4f46e5" }}>
                  {group.created_by_username}
                </strong>
              </p>

              <div
                style={{
                  background: "#eef2ff",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  marginBottom: "14px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    color: "#6366f1",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Invite Code
                </span>
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: "16px",
                    fontWeight: "900",
                    color: "#4f46e5",
                    letterSpacing: "0.12em",
                  }}
                >
                  {group.invite_code}
                </span>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "#64748b",
                    marginBottom: "8px",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {group.member_count} Member
                  {group.member_count !== 1 ? "s" : ""}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {group.members.map((m) => (
                    <span
                      key={m.id}
                      style={{
                        padding: "3px 10px",
                        borderRadius: "999px",
                        background: "#e0e7ff",
                        color: "#4338ca",
                        fontSize: "12px",
                        fontWeight: "700",
                      }}
                    >
                      {m.username}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleLeave(group.id)}
                disabled={leavingId === group.id}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "10px",
                  border: "1px solid #fecaca",
                  background: "#fff",
                  color: "#b91c1c",
                  fontWeight: "700",
                  fontSize: "13px",
                  cursor: leavingId === group.id ? "not-allowed" : "pointer",
                  opacity: leavingId === group.id ? 0.6 : 1,
                }}
              >
                {leavingId === group.id ? "Leaving..." : "Leave Group"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────
export default function TasksPage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [activeTab, setActiveTab] = useState("my");
  const [shareTask, setShareTask] = useState(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [sharedRefresh, setSharedRefresh] = useState(0);
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
      const res = await api.get("/tasks/");
      setTasks(res.data);
      setError("");
    } catch (err) {
      setError("Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

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
      setError("Failed to delete task.");
    }
  };

  const handleToggleStatus = async (task) => {
    const newStatus = task.status === "pending" ? "completed" : "pending";
    try {
      const res = await api.patch(`/tasks/${task.id}/`, { status: newStatus });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? res.data : t)));
    } catch (err) {
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
        "Failed to generate schedule. Add availability slots first.";
      setError(msg);
      setGenerating(false);
    }
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

  const labelStyle = {
    display: "block",
    marginBottom: "8px",
    fontSize: "14px",
    fontWeight: "700",
    color: "#334155",
  };

  const tabStyle = (active) => ({
    padding: "10px 20px",
    borderRadius: "10px",
    border: "none",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
    background: active
      ? "linear-gradient(135deg, #4f46e5, #4338ca)"
      : "transparent",
    color: active ? "#fff" : "#64748b",
    transition: "all 0.2s",
  });

  if (loading)
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
        <p style={{ color: "#64748b" }}>Loading tasks...</p>
      </div>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
        padding: "20px 8px 40px",
      }}
    >
      {/* Hero */}
      <div
        style={{
          background: "linear-gradient(135deg, #312e81 0%, #4338ca 100%)",
          color: "white",
          borderRadius: "24px",
          padding: "32px",
          boxShadow: "0 20px 40px rgba(49,46,129,0.22)",
          marginBottom: "28px",
        }}
      >
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
          }}
        >
          Manage tasks, collaborate with classmates, and generate your study
          schedule.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
            gap: "16px",
            marginTop: "24px",
          }}
        >
          {[
            { label: "Total Tasks", value: tasks.length },
            {
              label: "High Priority",
              value: tasks.filter((t) => Number(t.priority_score) >= 4).length,
            },
            {
              label: "Hard Tasks",
              value: tasks.filter((t) => t.difficulty === "hard").length,
            },
            {
              label: "Completed",
              value: tasks.filter((t) => t.status === "completed").length,
            },
          ].map(({ label, value }) => (
            <div
              key={label}
              style={{
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "18px",
                padding: "18px",
                backdropFilter: "blur(10px)",
              }}
            >
              <div style={{ fontSize: "13px", opacity: 0.85 }}>{label}</div>
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "800",
                  marginTop: "6px",
                }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(300px, 360px) 1fr",
          gap: "24px",
          alignItems: "start",
        }}
      >
        {/* Form panel */}
        <div
          style={{
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "22px",
            padding: "24px",
            boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
            position: "sticky",
            top: "20px",
          }}
        >
          <h2
            style={{
              margin: "0 0 6px",
              fontSize: "20px",
              fontWeight: "800",
              color: "#0f172a",
            }}
          >
            Add New Task
          </h2>
          <p style={{ margin: "0 0 20px", color: "#64748b", fontSize: "14px" }}>
            The system will score it by deadline and difficulty.
          </p>

          {error && (
            <div
              style={{
                padding: "12px",
                borderRadius: "10px",
                marginBottom: "16px",
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
          {successMessage && (
            <div
              style={{
                padding: "12px",
                borderRadius: "10px",
                marginBottom: "16px",
                background: "#dcfce7",
                color: "#166534",
                border: "1px solid #bbf7d0",
                fontWeight: "600",
                fontSize: "14px",
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
              style={{ ...inputStyle, minHeight: "90px", resize: "vertical" }}
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
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "14px",
                border: "none",
                background: "linear-gradient(135deg, #4f46e5, #4338ca)",
                color: "#fff",
                fontSize: "15px",
                fontWeight: "700",
                cursor: submitting ? "not-allowed" : "pointer",
                boxShadow: "0 10px 20px rgba(79,70,229,0.22)",
                marginBottom: "12px",
              }}
            >
              {submitting ? "Saving..." : "Add Task"}
            </button>
          </form>

          <button
            onClick={handleGenerateSchedule}
            disabled={generating || tasks.length === 0}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "14px",
              border: "1px solid #c7d2fe",
              background: "#eef2ff",
              color: "#3730a3",
              fontSize: "15px",
              fontWeight: "700",
              cursor:
                generating || tasks.length === 0 ? "not-allowed" : "pointer",
              opacity: generating || tasks.length === 0 ? 0.7 : 1,
              marginBottom: "10px",
            }}
          >
            {generating ? "Generating..." : "Generate Schedule"}
          </button>

          <button
            onClick={() => setShowJoinModal(true)}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "14px",
              border: "1px solid #bbf7d0",
              background: "#f0fdf4",
              color: "#166534",
              fontSize: "15px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Join Shared Task
          </button>
        </div>

        {/* Right panel */}
        <div
          style={{
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "22px",
            padding: "24px",
            boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
          }}
        >
          {/* Tabs */}
          <div
            style={{
              display: "flex",
              gap: "4px",
              marginBottom: "24px",
              background: "#f8fafc",
              padding: "4px",
              borderRadius: "12px",
              width: "fit-content",
            }}
          >
            <button
              style={tabStyle(activeTab === "my")}
              onClick={() => setActiveTab("my")}
            >
              My Tasks ({tasks.length})
            </button>
            <button
              style={tabStyle(activeTab === "shared")}
              onClick={() => setActiveTab("shared")}
            >
              Shared Tasks
            </button>
          </div>

          {/* My Tasks */}
          {activeTab === "my" && (
            <>
              <p
                style={{
                  margin: "0 0 20px",
                  color: "#64748b",
                  fontSize: "14px",
                }}
              >
                All your tasks with AI priority scores. Click Share to
                collaborate with classmates.
              </p>
              {tasks.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "56px 20px",
                    border: "1px dashed #cbd5e1",
                    borderRadius: "18px",
                    background: "#f8fafc",
                    color: "#64748b",
                  }}
                >
                  <h3 style={{ color: "#334155", marginTop: 0 }}>
                    No tasks yet
                  </h3>
                  <p style={{ marginBottom: 0 }}>
                    Add your first task from the form on the left.
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(260px, 1fr))",
                    gap: "18px",
                  }}
                >
                  {tasks.map((task) => {
                    const dc = getDifficultyStyle(task.difficulty);
                    const isCompleted = task.status === "completed";
                    return (
                      <div
                        key={task.id}
                        style={{
                          border: "1px solid #e5e7eb",
                          borderRadius: "20px",
                          padding: "20px",
                          background:
                            "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
                          boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
                          opacity: isCompleted ? 0.65 : 1,
                          borderColor: isCompleted ? "#bbf7d0" : "#e5e7eb",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "14px",
                          }}
                        >
                          <span
                            style={{
                              padding: "4px 12px",
                              borderRadius: "999px",
                              fontSize: "12px",
                              fontWeight: "700",
                              textTransform: "capitalize",
                              background: dc.bg,
                              color: dc.color,
                              border: `1px solid ${dc.border}`,
                            }}
                          >
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

                        <h3
                          style={{
                            margin: "0 0 10px",
                            fontSize: "17px",
                            fontWeight: "800",
                            color: isCompleted ? "#94a3b8" : "#0f172a",
                            textDecoration: isCompleted
                              ? "line-through"
                              : "none",
                          }}
                        >
                          {task.title}
                        </h3>

                        <p
                          style={{
                            margin: "4px 0",
                            color: "#475569",
                            fontSize: "13px",
                          }}
                        >
                          <strong>Course:</strong> {task.course || "—"}
                        </p>
                        <p
                          style={{
                            margin: "4px 0",
                            color: "#475569",
                            fontSize: "13px",
                          }}
                        >
                          <strong>Description:</strong>{" "}
                          {task.description || "No description."}
                        </p>
                        <p
                          style={{
                            margin: "4px 0 0",
                            color: "#475569",
                            fontSize: "13px",
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

                        <div
                          style={{
                            marginTop: "14px",
                            padding: "12px",
                            background: "#eef2ff",
                            border: "1px solid #c7d2fe",
                            borderRadius: "12px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "11px",
                              color: "#4338ca",
                              fontWeight: "700",
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                            }}
                          >
                            AI Priority Score
                          </div>
                          <div
                            style={{
                              fontSize: "26px",
                              fontWeight: "800",
                              color: "#312e81",
                              marginTop: "4px",
                            }}
                          >
                            {task.priority_score ?? "—"}
                          </div>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            marginTop: "14px",
                          }}
                        >
                          <button
                            onClick={() => handleToggleStatus(task)}
                            style={{
                              flex: 1,
                              padding: "9px",
                              borderRadius: "10px",
                              border: "none",
                              background: isCompleted ? "#fef3c7" : "#dcfce7",
                              color: isCompleted ? "#b45309" : "#166534",
                              fontWeight: "700",
                              fontSize: "12px",
                              cursor: "pointer",
                            }}
                          >
                            {isCompleted ? "Mark Pending" : "Mark Complete"}
                          </button>
                          <button
                            onClick={() => setShareTask(task)}
                            style={{
                              padding: "9px 12px",
                              borderRadius: "10px",
                              border: "none",
                              background: "#eef2ff",
                              color: "#4f46e5",
                              fontWeight: "700",
                              fontSize: "12px",
                              cursor: "pointer",
                            }}
                          >
                            Share
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            style={{
                              padding: "9px 12px",
                              borderRadius: "10px",
                              border: "none",
                              background: "#fee2e2",
                              color: "#b91c1c",
                              fontWeight: "700",
                              fontSize: "12px",
                              cursor: "pointer",
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Shared Tasks */}
          {activeTab === "shared" && <SharedTasksTab refresh={sharedRefresh} />}
        </div>
      </div>

      {/* Modals */}
      {shareTask && (
        <ShareModal task={shareTask} onClose={() => setShareTask(null)} />
      )}
      {showJoinModal && (
        <JoinModal
          onClose={() => setShowJoinModal(false)}
          onJoined={() => {
            setSharedRefresh((n) => n + 1);
            fetchTasks();
          }}
        />
      )}
    </div>
  );
}
