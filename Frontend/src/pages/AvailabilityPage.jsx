import { useEffect, useState } from "react";
import api from "../api/client";

const DAYS = [
  { value: "MON", label: "Monday" },
  { value: "TUE", label: "Tuesday" },
  { value: "WED", label: "Wednesday" },
  { value: "THU", label: "Thursday" },
  { value: "FRI", label: "Friday" },
  { value: "SAT", label: "Saturday" },
  { value: "SUN", label: "Sunday" },
];

const DAY_LABEL = Object.fromEntries(DAYS.map((d) => [d.value, d.label]));

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid #d1d5db",
  fontSize: "14px",
  backgroundColor: "#f8fafc",
  boxSizing: "border-box",
  marginBottom: "16px",
  outline: "none",
};

const btnStyle = (variant = "primary") => ({
  padding: "12px 18px",
  borderRadius: "12px",
  border: "none",
  fontWeight: "700",
  fontSize: "14px",
  cursor: "pointer",
  ...(variant === "primary"
    ? {
        background: "linear-gradient(135deg, #4f46e5, #4338ca)",
        color: "#fff",
        width: "100%",
      }
    : { background: "#fee2e2", color: "#b91c1c" }),
});

export default function AvailabilityPage() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    day_of_week: "MON",
    start_time: "",
    end_time: "",
  });

  const fetchSlots = async () => {
    try {
      const res = await api.get("/schedules/availability/");
      setSlots(res.data);
    } catch (err) {
      setError("Failed to load availability slots.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.start_time || !form.end_time) {
      setError("Start time and end time are required.");
      return;
    }
    if (form.start_time >= form.end_time) {
      setError("Start time must be before end time.");
      return;
    }
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/schedules/availability/", form);
      setSuccess("Availability slot added.");
      setForm({ day_of_week: "MON", start_time: "", end_time: "" });
      await fetchSlots();
    } catch (err) {
      setError("Failed to save slot. Check for conflicts.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this availability slot?")) return;
    try {
      await api.delete(`/schedules/availability/${id}/`);
      setSlots((prev) => prev.filter((s) => s.id !== id));
      setSuccess("Slot removed.");
    } catch (err) {
      setError("Failed to delete slot.");
    }
  };

  const msgStyle = (type) => ({
    padding: "12px 16px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    marginBottom: "16px",
    backgroundColor: type === "error" ? "#fee2e2" : "#dcfce7",
    color: type === "error" ? "#b91c1c" : "#166534",
    border: `1px solid ${type === "error" ? "#fecaca" : "#bbf7d0"}`,
  });

  // Group slots by day for display
  const slotsByDay = DAYS.reduce((acc, d) => {
    acc[d.value] = slots.filter((s) => s.day_of_week === d.value);
    return acc;
  }, {});

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
        padding: "24px 16px 48px",
      }}
    >
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #312e81 0%, #4338ca 100%)",
            color: "white",
            borderRadius: "24px",
            padding: "32px",
            marginBottom: "28px",
            boxShadow: "0 20px 40px rgba(49,46,129,0.22)",
          }}
        >
          <h1 style={{ margin: 0, fontSize: "28px", fontWeight: "800" }}>
            Study Availability
          </h1>
          <p
            style={{
              marginTop: "10px",
              marginBottom: 0,
              color: "rgba(255,255,255,0.85)",
              fontSize: "15px",
            }}
          >
            Set the days and times you are available to study. The scheduler
            uses these slots to build your weekly plan.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(280px, 340px) 1fr",
            gap: "24px",
            alignItems: "start",
          }}
        >
          {/* Add slot form */}
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
              Add Slot
            </h2>
            <p
              style={{ margin: "0 0 20px", color: "#64748b", fontSize: "14px" }}
            >
              Each slot represents one block of study time per week.
            </p>

            {error && <div style={msgStyle("error")}>{error}</div>}
            {success && <div style={msgStyle("success")}>{success}</div>}

            <form onSubmit={handleSubmit}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "700",
                  fontSize: "14px",
                  color: "#334155",
                }}
              >
                Day of Week
              </label>
              <select
                name="day_of_week"
                value={form.day_of_week}
                onChange={handleChange}
                style={inputStyle}
              >
                {DAYS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>

              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "700",
                  fontSize: "14px",
                  color: "#334155",
                }}
              >
                Start Time
              </label>
              <input
                type="time"
                name="start_time"
                value={form.start_time}
                onChange={handleChange}
                required
                style={inputStyle}
              />

              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "700",
                  fontSize: "14px",
                  color: "#334155",
                }}
              >
                End Time
              </label>
              <input
                type="time"
                name="end_time"
                value={form.end_time}
                onChange={handleChange}
                required
                style={inputStyle}
              />

              <button
                type="submit"
                disabled={submitting}
                style={btnStyle("primary")}
              >
                {submitting ? "Saving..." : "Add Availability Slot"}
              </button>
            </form>
          </div>

          {/* Slot list grouped by day */}
          <div
            style={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "22px",
              padding: "24px",
              boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
            }}
          >
            <h2
              style={{
                margin: "0 0 20px",
                fontSize: "20px",
                fontWeight: "800",
                color: "#0f172a",
              }}
            >
              Your Availability ({slots.length} slot
              {slots.length !== 1 ? "s" : ""})
            </h2>

            {loading ? (
              <p style={{ color: "#64748b" }}>Loading...</p>
            ) : slots.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "48px 20px",
                  border: "1px dashed #cbd5e1",
                  borderRadius: "16px",
                  backgroundColor: "#f8fafc",
                  color: "#64748b",
                }}
              >
                <h3 style={{ color: "#334155", marginTop: 0 }}>
                  No availability set
                </h3>
                <p style={{ marginBottom: 0 }}>
                  Add your first slot from the form on the left.
                </p>
              </div>
            ) : (
              DAYS.filter((d) => slotsByDay[d.value].length > 0).map((d) => (
                <div key={d.value} style={{ marginBottom: "24px" }}>
                  <h3
                    style={{
                      margin: "0 0 12px",
                      fontSize: "16px",
                      fontWeight: "700",
                      color: "#4f46e5",
                    }}
                  >
                    {d.label}
                  </h3>
                  {slotsByDay[d.value].map((slot) => (
                    <div
                      key={slot.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "14px 16px",
                        border: "1px solid #e5e7eb",
                        borderRadius: "14px",
                        marginBottom: "10px",
                        background: "#f8fafc",
                      }}
                    >
                      <div>
                        <span
                          style={{
                            fontSize: "16px",
                            fontWeight: "700",
                            color: "#0f172a",
                          }}
                        >
                          {slot.start_time} – {slot.end_time}
                        </span>
                        <span
                          style={{
                            marginLeft: "12px",
                            fontSize: "13px",
                            color: "#64748b",
                          }}
                        >
                          {/* compute duration */}
                          {(() => {
                            const [sh, sm] = slot.start_time
                              .split(":")
                              .map(Number);
                            const [eh, em] = slot.end_time
                              .split(":")
                              .map(Number);
                            const mins = eh * 60 + em - (sh * 60 + sm);
                            return `${mins} mins`;
                          })()}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDelete(slot.id)}
                        style={btnStyle("danger")}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
