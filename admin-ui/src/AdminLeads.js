import { useEffect, useMemo, useState } from "react";

const API_BASE = "https://purepeace-chatbot.onrender.com";

function AdminLeads() {
  const [adminKey, setAdminKey] = useState(sessionStorage.getItem("ADMIN_KEY") || "");
  const [inputKey, setInputKey] = useState("");

  const [leads, setLeads] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [sortNewest, setSortNewest] = useState(true);

  // ? pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchLeads = async (key) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/admin/leads`, {
        headers: { "x-admin-key": key },
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
    if (adminKey) fetchLeads(adminKey);
    // eslint-disable-next-line
  }, [adminKey]);

  const downloadCSV = async () => {
    setError("");
    try {
      const res = await fetch(`${API_BASE}/admin/leads/export`, {
        headers: { "x-admin-key": adminKey },
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

  const normalizePhoneForWhatsApp = (text) => {
    if (!text) return "";
    // keep only digits
    const digits = text.replace(/[^\d]/g, "");
    // if user already included country code like 91xxxx...
    return digits;
  };

  const filteredLeads = useMemo(() => {
    let list = [...leads];

    // ? sort
    list.sort((a, b) => {
      const da = new Date(a.createdAt || 0).getTime();
      const db = new Date(b.createdAt || 0).getTime();
      return sortNewest ? db - da : da - db;
    });

    // ? search
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter((lead) => {
        return (
          (lead.name || "").toLowerCase().includes(s) ||
          (lead.country || "").toLowerCase().includes(s) ||
          (lead.contact || "").toLowerCase().includes(s)
        );
      });
    }

    return list;
  }, [leads, search, sortNewest]);

  // ? pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const pageData = filteredLeads.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    // whenever search changes, go page 1
    setPage(1);
  }, [search, sortNewest]);

  // ? Login Screen
  if (!adminKey) {
    return (
      <div style={styles.pageCenter}>
        <div style={styles.cardSmall}>
          <h2 style={{ margin: 0 }}>Admin Login</h2>
          <p style={styles.subText}>Enter Admin Key to view leads</p>

          <input
            type="password"
            placeholder="Enter Admin Key"
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            style={styles.input}
          />

          <button onClick={handleLogin} style={styles.primaryBtn}>
            Login
          </button>
        </div>
      </div>
    );
  }

  // ? Dashboard
  return (
    <div style={styles.page}>
      <div style={styles.cardBig}>
        {/* Header */}
        <div style={styles.headerRow}>
          <div>
            <h2 style={styles.title}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M16 3H8a2 2 0 0 0-2 2v16l6-3 6 3V5a2 2 0 0 0-2-2Z"
                  stroke="black"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Leads Dashboard
            </h2>

            <p style={styles.subText}>
              Total Leads: <b>{filteredLeads.length}</b> (Page {currentPage}/{totalPages})
            </p>
          </div>

          <button onClick={logout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>

        {/* Actions */}
        <div style={styles.actionsRow}>
          <button onClick={() => fetchLeads(adminKey)} style={styles.primaryBtnSmall}>
            Refresh
          </button>

          <button onClick={downloadCSV} style={styles.secondaryBtnSmall}>
            Download CSV
          </button>

          <button
            onClick={() => setSortNewest((p) => !p)}
            style={styles.grayBtnSmall}
            title="Sort by date"
          >
            Sort: {sortNewest ? "Newest" : "Oldest"}
          </button>

          <input
            placeholder="Search name / country / contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...styles.input, margin: 0, flex: 1, minWidth: 220 }}
          />
        </div>

        {loading && <p style={{ marginTop: 10 }}>Loading...</p>}
        {error && <p style={{ marginTop: 10, color: "red" }}>{error}</p>}

        {/* Table */}
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.theadRow}>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Country</th>
                <th style={styles.th}>Contact</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>

            <tbody>
              {pageData.map((lead) => {
                const phone = normalizePhoneForWhatsApp(lead.contact);
                const waLink = phone ? `https://wa.me/${phone}` : null;

                return (
                  <tr key={lead._id} style={styles.tr}>
                    <td style={styles.td}>{lead.name || "-"}</td>
                    <td style={styles.td}>{lead.country || "-"}</td>
                    <td style={styles.td}>{lead.contact || "-"}</td>
                    <td style={styles.td}>
                      {lead.createdAt ? new Date(lead.createdAt).toLocaleString() : "-"}
                    </td>
                    <td style={styles.td}>
                      {waLink ? (
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noreferrer"
                          style={styles.whatsappBtn}
                        >
                          WhatsApp
                        </a>
                      ) : (
                        <span style={{ color: "#888", fontSize: 13 }}>No number</span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {!loading && pageData.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: 16, textAlign: "center", color: "#555" }}>
                    No leads found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={styles.paginationRow}>
	  <button
		style={styles.pageBtn}
		disabled={currentPage === 1}
		onClick={() => setPage(1)}
	  >
		<span style={styles.btnIcon}>
		  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
			<path d="M19 6 13 12l6 6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
			<path d="M11 6 5 12l6 6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
		  </svg>
		</span>
		First
	  </button>

	  <button
		style={styles.pageBtn}
		disabled={currentPage === 1}
		onClick={() => setPage((p) => Math.max(1, p - 1))}
	  >
		<span style={styles.btnIcon}>
		  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
			<path d="M15 18 9 12l6-6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
		  </svg>
		</span>
		Prev
	  </button>

	  <div style={{ fontSize: 14, color: "#333" }}>
		Page <b>{currentPage}</b> of <b>{totalPages}</b>
	  </div>

	  <button
		style={styles.pageBtn}
		disabled={currentPage === totalPages}
		onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
	  >
		Next
		<span style={styles.btnIcon}>
		  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
			<path d="M9 6l6 6-6 6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
		  </svg>
		</span>
	  </button>

	  <button
		style={styles.pageBtn}
		disabled={currentPage === totalPages}
		onClick={() => setPage(totalPages)}
	  >
		Last
		<span style={styles.btnIcon}>
		  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
			<path d="M5 6l6 6-6 6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
			<path d="M13 6l6 6-6 6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
		  </svg>
		</span>
	  </button>
	</div>

      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f6f8",
    padding: 20,
    display: "grid",
    placeItems: "start center",
  },
  pageCenter: {
    minHeight: "100vh",
    background: "#f5f6f8",
    padding: 20,
    display: "grid",
    placeItems: "center",
  },
  cardSmall: {
    background: "white",
    borderRadius: 14,
    padding: 18,
    border: "1px solid #eee",
    boxShadow: "0 10px 30px rgba(0,0,0,0.07)",
    width: "100%",
    maxWidth: 420,
  },
  cardBig: {
    background: "white",
    borderRadius: 14,
    padding: 18,
    border: "1px solid #eee",
    boxShadow: "0 10px 30px rgba(0,0,0,0.07)",
    width: "100%",
    maxWidth: 1100,
  },
  title: {
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  subText: {
    marginTop: 6,
    marginBottom: 0,
    fontSize: 13,
    color: "#666",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  actionsRow: {
    display: "flex",
    gap: 10,
    marginTop: 14,
    alignItems: "center",
    flexWrap: "wrap",
  },
  input: {
    width: "100%",
    padding: 12,
    borderRadius: 10,
    border: "1px solid #ddd",
    outline: "none",
    fontSize: 14,
    marginTop: 12,
  },
  primaryBtn: {
    width: "100%",
    padding: 12,
    borderRadius: 10,
    border: "none",
    background: "#075e54",
    color: "white",
    cursor: "pointer",
    fontWeight: 600,
    marginTop: 12,
  },
  primaryBtnSmall: {
    padding: "10px 14px",
    borderRadius: 10,
    border: "none",
    background: "#075e54",
    color: "white",
    cursor: "pointer",
    fontWeight: 600,
  },
  secondaryBtnSmall: {
    padding: "10px 14px",
    borderRadius: 10,
    border: "none",
    background: "#0275d8",
    color: "white",
    cursor: "pointer",
    fontWeight: 600,
  },
  grayBtnSmall: {
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 600,
  },
  logoutBtn: {
	  padding: "10px 14px",
	  borderRadius: 10,
	  border: "none",
	  background: "#d9534f",   // ? red
	  color: "white",
	  cursor: "pointer",
	  fontWeight: 700,
	},

  tableWrap: {
    marginTop: 16,
    borderRadius: 12,
    overflow: "hidden",
    border: "1px solid #eee",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  theadRow: {
    background: "#f2f2f2",
  },
  th: {
    textAlign: "left",
    padding: "12px 14px",
    fontSize: 13,
    color: "#333",
  },
  td: {
    padding: "12px 14px",
    fontSize: 14,
    color: "#111",
    borderTop: "1px solid #eee",
  },
  tr: {},
  whatsappBtn: {
    display: "inline-block",
    padding: "7px 10px",
    borderRadius: 10,
    background: "#25D366",
    color: "white",
    textDecoration: "none",
    fontWeight: 700,
    fontSize: 13,
  },
  paginationRow: {
    marginTop: 14,
    display: "flex",
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
  },
  pageBtn: {
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid #ddd",
    background: "white",
    cursor: "pointer",
    fontWeight: 600,
  },
  btnIcon: {
	  display: "inline-flex",
	  alignItems: "center",
	  justifyContent: "center",
	  marginRight: 6,
	  marginLeft: 6,
	},
};

export default AdminLeads;
