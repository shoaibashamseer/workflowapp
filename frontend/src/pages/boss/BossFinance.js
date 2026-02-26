import { useEffect, useState ,useCallback} from "react";
import api from "../../api/api";

export default function BossFinance() {
  const today = new Date().toISOString().slice(0, 10);
  const currentMonth = today.slice(0, 7);

  const [entries, setEntries] = useState([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("credit");

  const [report, setReport] = useState(null);

  const loadEntries = () => {
    api.get("boss/daily-ledger/")
      .then(res => setEntries(res.data));
  };

  const loadMonthlyReport = useCallback(async () => {
    api.get(`boss/monthly-report/?month=${currentMonth}`)
      .then(res => setReport(res.data));
  }, []);

  useEffect(() => {
    loadEntries();
    loadMonthlyReport();
  }, [loadMonthlyReport]);

  const addEntry = async () => {
    await api.post("boss/daily-ledger/", {
      date: today,
      title,
      amount,
      type,
    });

    setTitle("");
    setAmount("");

    loadEntries();
    loadMonthlyReport();
  };

  return (
    <div className="manager-page">
      <h1>Boss Daily & Monthly Calculator</h1>

      {/* MONTHLY SUMMARY */}
      {report && (
        <div
          style={{
            background: report.status === "PROFIT" ? "#dcfce7" : "#fee2e2",
            padding: "15px",
            borderRadius: "10px",
            marginBottom: "20px",
          }}
        >
          <h3>{report.month} Summary</h3>
          <p>Total Credit: {report.total_credit}</p>
          <p>Total Debit: {report.total_debit}</p>
          <h2>{report.status}: {report.profit}</h2>
        </div>
      )}

      {/* DAILY ENTRY FORM */}
      <div className="form-card">
        <input
          className="form-input"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />

        <input
          className="form-input"
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={e => setAmount(e.target.value)}
        />

        <select
          className="form-input"
          value={type}
          onChange={e => setType(e.target.value)}
        >
          <option value="credit">Credit</option>
          <option value="debit">Debit</option>
        </select>

        <button className="action-btn" onClick={addEntry}>
          Add Entry
        </button>
      </div>

      {/* DAILY LIST */}
      <div className="form-card">
        <h3>Daily Entries</h3>

        {entries.map(e => (
          <div key={e.id}>
            {e.title} — {e.amount} ({e.type})
          </div>
        ))}
      </div>
    </div>
  );
}
