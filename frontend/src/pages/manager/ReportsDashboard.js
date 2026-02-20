import { useEffect, useState } from "react";
import api from "../../api/api";
import "../../styles/manager.css";

function ReportsDashboard() {
  const [report, setReport] = useState(null);

  useEffect(() => {
    api.get("manager/reports/tasks/")
      .then(res => setReport(res.data));
  }, []);

  if (!report) {
    return (
      <div className="manager-page">
        <div className="form-card">
          <p>Loading reports…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="manager-page">
      <h1>Reports & Analytics</h1>

      {/* ================= STATUS SUMMARY ================= */}
      <div className="form-card">
        <h3>Task Status Summary</h3>

        <table className="manager-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            {report.status_summary.map(s => (
              <tr key={s.status}>
                <td>{s.status}</td>
                <td>{s.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= WORKFLOW STEP TIME ================= */}
      <div className="form-card">
        <h3>Average Time per Workflow Step</h3>

        <table className="manager-table">
          <thead>
            <tr>
              <th>Step</th>
              <th>Avg Time</th>
              <th>Total Tasks</th>
            </tr>
          </thead>
          <tbody>
            {report.by_step.map((s, i) => (
              <tr key={i}>
                <td>{s.workflow_step__name}</td>
                <td>{s.avg_time}</td>
                <td>{s.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= WORKER PERFORMANCE ================= */}
      <div className="form-card">
        <h3>Average Time per Worker</h3>

        <table className="manager-table">
          <thead>
            <tr>
              <th>Worker</th>
              <th>Avg Time</th>
              <th>Total Tasks</th>
            </tr>
          </thead>
          <tbody>
            {report.by_worker.map((w, i) => (
              <tr key={i}>
                <td>Worker #{w.assigned_to__id}</td>
                <td>{w.avg_time}</td>
                <td>{w.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ReportsDashboard;
