import { useState } from "react";
import AdminLeads from "./AdminLeads";
import Chat from "./pages/Chat";

function App() {
  const [page, setPage] = useState("leads");

  return (
    <div style={{ padding: 20 }}>
      {/* Pages */}
      {page === "leads" && <AdminLeads />}
      </div>
  );
}

export default App;

