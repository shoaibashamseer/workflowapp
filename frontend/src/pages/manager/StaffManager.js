import { useEffect, useState } from "react";
import api from "../../api/api";
import "../../styles/manager.css";

function StaffManager() {
  const [staff, setStaff] = useState([]);
  const [roles, setRoles] = useState([]);
  const [newUsername, setNewUsername] = useState("");
  const [newRole, setNewRole] = useState("");
  const [createdPassword, setCreatedPassword] = useState(null);
  const [copied, setCopied] = useState(false);

  const loadData = () => {
    api.get("manager/staff/").then(res => setStaff(res.data));
    api.get("roles/").then(res => setRoles(res.data));
  };

  useEffect(() => {
    loadData();
  }, []);

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(createdPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Copy failed. Please copy manually.");
    }
  };

  const updateRole = (userId, roleId) => {
    api.patch(`manager/staff/${userId}/`, { role: roleId })
      .then(() => loadData());
  };

  const createStaff = () => {
    if (!newUsername || !newRole) {
      alert("Username and role required");
      return;
    }

    api.post("manager/staff/create/", {
      username: newUsername,
      role: newRole
    }).then(res => {
      setCreatedPassword(res.data.password);
      setNewUsername("");
      setNewRole("");
      loadData();
    });
  };

  return (
    <div className="manager-page">
      <h1>Staff Management</h1>

      {/* ================= CREATE STAFF ================= */}
      <div className="form-card">
        <h3>Add New Staff</h3>

        <input
          className="form-input"
          placeholder="Username (e.g. designer1)"
          value={newUsername}
          onChange={e => setNewUsername(e.target.value)}
        />

        <select
          className="form-input"
          value={newRole}
          onChange={e => setNewRole(e.target.value)}
        >
          <option value="">Select Role</option>
          {roles.map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>

        <button className="action-btn" onClick={createStaff}>
          ➕ Create Staff
        </button>

        {/* PASSWORD DISPLAY */}
        {createdPassword && (
          <div className="password-box">
            <div className="password-row">
              <strong>Password:</strong>
              <code>{createdPassword}</code>
              <button className="link-btn" onClick={copyPassword}>
                {copied ? "Copied ✓" : "Copy"}
              </button>
            </div>
            <small>
              Share this password with the staff. It will not be shown again.
            </small>
          </div>
        )}
      </div>

      {/* ================= STAFF TABLE ================= */}
      <div className="form-card">
        <h3>Existing Staff</h3>

        <table className="manager-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Current Role</th>
              <th>Change Role</th>
            </tr>
          </thead>
          <tbody>
            {staff.map(u => (
              <tr key={u.id}>
                <td>{u.username}</td>
                <td>{u.role_name || "—"}</td>
                <td>
                  <select
                    className="table-input"
                    onChange={e => updateRole(u.id, e.target.value)}
                    defaultValue=""
                  >
                    <option value="">Select role</option>
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StaffManager;
