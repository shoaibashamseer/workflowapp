import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/api";
import "../../styles/manager.css";

function WorkflowsManager() {
  const [workflows, setWorkflows] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const loadWorkflows = () => {
    api.get("manager/workflows/")
      .then(res => setWorkflows(res.data));
  };

  useEffect(() => {
    loadWorkflows();
  }, []);

  const createWorkflow = () => {
    if (!name.trim()) return;

    api.post("manager/workflows/", { name, description })
      .then(() => {
        setName("");
        setDescription("");
        loadWorkflows();
      });
  };

  return (
    <div className="manager-page">
      {/* Header */}
      <div className="manager-header">
        <h1>Workflows</h1>
      </div>

      {/* Create Workflow */}
      <div className="form-card">
        <h3>Create Workflow</h3>

        <div className="form-row">
          <input
            className="form-input"
            placeholder="Workflow name"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>

        <div className="form-row">
          <input
            className="form-input"
            placeholder="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        <button className="action-btn" onClick={createWorkflow}>
          ➕ Create Workflow
        </button>
      </div>

      {/* Workflow List */}
      <table className="manager-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {workflows.map(w => (
            <tr key={w.id}>
              <td>{w.name}</td>
              <td>{w.description || "-"}</td>
              <td>
                <Link
                  to={`/manager/workflows/${w.id}/steps`}
                  className="link-btn"
                >
                  Manage Steps
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default WorkflowsManager;
