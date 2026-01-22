import { useEffect, useState } from "react";

const API_BASE = "https://purepeace-chatbot.onrender.com";

function AdminLeads() {
  const [adminKey, setAdminKey] = useState(sessionStorage.getItem("ADMIN_KEY") || "");
  const [inputKey, setInputKey] = useState("");
  const [leads, setLeads] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchLeads = async (key) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/admin/leads`, {
        headers: {
          "x-admin-key": key,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Unauthorized");
        setLeads([]);
        return;
      }

      setLeads(data.leads || []);
    } catch (err) {
      setError("Server error");
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    if (!inputKey.trim()) return;
    sessionStorage.setItem("ADMIN_KEY", inputKey.trim());
    setAdminKey(inputKey.trim());
    setInputKey("");
  };

  const logout = () => {
    sessionStorage.removeItem("ADMIN_KEY");
    setAdminKey("");
    setLeads([]);
    setError("");
  };

  useEffect(() => {
    if (adminKey) {
      fetchLeads(adminKey);
    }
    // eslint-disable-next-line
  }, [adminKey]);

  const downloadCSV = async () => {
    setError("");
    try {
      const res = await fetch(`${API_BASE}/admin/leads/export`, {
        headers: {
          "x-admin-key": adminKey,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data?.error || "Unauthorized");
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "leads.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError("CSV download failed");
    }
  };

  // ? Login Screen
  if (!adminKey) {
    return (
      <div style={{ padding: 20, maxWidth: 400, margin: "0 auto" }}>
        <h2>Admin Login</h2>

        <input
          type="password"
          placeholder="Enter Admin Key"
          value={inputKey}
          onChange={(e) => setInputKey(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 8,
            border: "1px solid #ccc",
            marginBottom: 10,
          }}
        />

        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 8,
            border: "none",
            background: "#075e54",
            color: "white",
            cursor: "pointer",
          }}
        >
          Login
        </button>
      </div>
    );
  }

  // ? Dashboard
  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>?? Leads Dashboard</h2>
        <button
          onClick={logout}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "none",
            background: "#d9534f",
            color: "white",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 15 }}>
        <button
          onClick={() => fetchLeads(adminKey)}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "none",
            background: "#075e54",
            color: "white",
            cursor: "pointer",
          }}
        >
          Refresh Leads
        </button>

        <button
          onClick={downloadCSV}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "none",
            background: "#0275d8",
            color: "white",
            cursor: "pointer",
          }}
        >
          ? Download CSV
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <table border="1" cellPadding="8" style={{ marginTop: 20, width: "100%" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Country</th>
            <th>Contact</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>
          {leads.map((lead) => (
            <tr key={lead._id}>
              <td>{lead.name}</td>
              <td>{lead.country}</td>
              <td>{lead.contact}</td>
              <td>{new Date(lead.createdAt).toLocaleString()}</td>
            </tr>
          ))}

          {!loading && leads.length === 0 && (
            <tr>
              <td colSpan="4" style={{ textAlign: "center" }}>
                No leads found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AdminLeads;
