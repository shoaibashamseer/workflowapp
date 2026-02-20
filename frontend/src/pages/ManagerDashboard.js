import { Link } from "react-router-dom";
import "../styles/manager.css";
import { useEffect, useState } from "react";
import api from "../api/api";


function ManagerDashboard() {
  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };
  const [lowStock, setLowStock] = useState([]);
  useEffect(() => {
      api.get("manager/low-stock/")
        .then(res => setLowStock(res.data));
    }, []);

  return (
    <div className="manager-page">
      {/* Header */}
      <div className="manager-header">
        <h1>Manager Dashboard</h1>
            {lowStock.length > 0 && (
              <div
                style={{
                  background: "#fee2e2",
                  border: "1px solid #ef4444",
                  padding: "12px",
                  borderRadius: "8px",
                  marginBottom: "15px",
                }}
              >
                <strong>⚠ Low Stock Warning</strong>

                {lowStock.map(item => (
                  <div key={item.id}>
                    {item.material_name} - {item.name} → {item.stock} {item.unit}
                  </div>
                ))}
              </div>
            )}

        <div className="manager-user">
           <strong>{localStorage.getItem("role")}</strong>
        </div>
      </div>

      {/* Action Cards */}
      <div className="manager-grid">
        <Link to="/manager/products/new" className="manager-card primary">
          ➕ Add New Product
        </Link>

        <Link to="/manager/workflows/new" className="manager-card primary">
          🔁 Add Workflow
        </Link>

        <Link to="/orders/new" className="manager-card">
          📝 Place Order
        </Link>

        <Link to="/manager/tasks" className="manager-card">
          📊 Live Tasks Monitor
        </Link>

        <Link to="/manager/products" className="manager-card">
          📦 Manage Products
        </Link>

        <Link to="/manager/workflows" className="manager-card">
          ⚙️ Manage Workflows
        </Link>
        <Link to="/manager/materials" className="manager-card">
           📦 Raw Materials & Stock
        </Link>
        <Link to="/manager/staff" className="manager-card">
          👥 Manage Staff & Roles
        </Link>

        <Link to="/manager/customers" className="manager-card">
          👤 Manage Customers
        </Link>

        <Link to="/manager/reports" className="manager-card">
          📈 Reports & Analytics
        </Link>
      </div>

      {/* Logout */}
      <div className="manager-footer">
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default ManagerDashboard;
