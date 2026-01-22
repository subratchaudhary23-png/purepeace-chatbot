import { useState } from "react";
import AdminLeads from "./AdminLeads";
import Chat from "./pages/Chat";

function App() {
  const [page, setPage] = useState("leads");

  return (
    <div style={{ padding: 20 }}>
      <h2>PurePeace Exports – Admin Panel</h2>

      {/* Navigation */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setPage("leads")}>
          ?? View Leads
        </button>
        <button
          onClick={() => setPage("chat")}
          style={{ marginLeft: 10 }}
        >
          ?? Chatbot
        </button>
      </div>

      {/* Pages */}
      {page === "leads" && <AdminLeads />}
      {page === "chat" && <Chat />}
    </div>
  );
}

export default App;

