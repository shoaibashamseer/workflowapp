import { Link } from "react-router-dom";

export default function BossDashboard() {
  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="manager-page">
      <h1>Boss Finance Dashboard</h1>
      <div className="dashboard-grid">
        <Link className="dash-card" to="work-estimator">
          📊 Work Price Estimator
        </Link>

        <Link className="dash-card" to="/boss/work-analyser">
          📈 Work Profit Analyzer
        </Link>

        <Link className="dash-card" to="/boss/finance">
            💰 Daily + Monthly Calculator
        </Link>
     </div>

     <div className="manager-footer">
        <button className="logout-btn" onClick={logout}>
          Logout
      </button>
     </div>
    </div>
  );
}
