import { useState } from "react";
import api from "../../api/api";

export default function WorkAnalyser() {
  const [title, setTitle] = useState("");
  const [totalExpense, setTotalExpense] = useState("");
  const [amountReceived, setAmountReceived] = useState("");
  const [result, setResult] = useState(null);

  const analyseWork = async () => {
    try {
      const res = await api.post("boss/work-results/", {
        title,
        total_expense: totalExpense,
        amount_received: amountReceived,
      });

      setResult(res.data);
    } catch (err) {
      console.log(err.response?.data);
    }
  };

  return (
    <div className="manager-page">
      <h1>Work Profit Analyzer</h1>

      <div className="form-card">
        <input
          className="form-input"
          placeholder="Work Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          className="form-input"
          type="number"
          placeholder="Total Expense"
          value={totalExpense}
          onChange={(e) => setTotalExpense(e.target.value)}
        />

        <input
          className="form-input"
          type="number"
          placeholder="Amount Received"
          value={amountReceived}
          onChange={(e) => setAmountReceived(e.target.value)}
        />

        <button className="action-btn" onClick={analyseWork}>
          Analyse
        </button>

        {result && (
          <div style={{ marginTop: "15px" }}>
            <h3>
              {result.profit >= 0 ? "Profit" : "Loss"} : {result.profit}
            </h3>
          </div>
        )}
      </div>
    </div>
  );
}
