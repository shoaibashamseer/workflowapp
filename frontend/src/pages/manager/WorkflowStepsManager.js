import { useEffect, useState , useCallback } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/api";
import "../../styles/manager.css";

function WorkflowStepsManager() {
  const { workflowId } = useParams();

  const [steps, setSteps] = useState([]);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [sequence, setSequence] = useState("");

  const loadSteps = useCallback(async() => {
    api
      .get(`manager/workflow-steps/?workflow=${workflowId}`)
      .then((res) => setSteps(res.data));
  }, []);

  useEffect(() => {
    loadSteps();
  }, [workflowId, loadSteps]);

  const createStep = () => {
    if (!name.trim()) return;

    api
      .post("manager/workflow-steps/", {
        name,
        role,
        sequence_order: sequence,
        workflow: workflowId,
      })
      .then(() => {
        setName("");
        setRole("");
        setSequence("");
        loadSteps();
      });
  };

  return (
    <div className="manager-page">
      {/* Header */}
      <div className="manager-header">
        <h1>Workflow Steps</h1>
      </div>

      {/* Create Step */}
      <div className="form-card">
        <h3>Add Step</h3>

        <div className="form-row">
          <input
            className="form-input"
            placeholder="Step name (Design, Print, etc)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="form-row">
          <input
            className="form-input"
            placeholder="Role (designer / printer / helper)"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
        </div>

        <div className="form-row">
          <input
            className="form-input"
            placeholder="Sequence Order"
            value={sequence}
            onChange={(e) => setSequence(e.target.value)}
          />
        </div>

        <button className="action-btn" onClick={createStep}>
          ➕ Add Step
        </button>
      </div>

      {/* Steps Table */}
      <table className="manager-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Step Name</th>
            <th>Role</th>
          </tr>
        </thead>

        <tbody>
          {steps.map((s) => (
            <tr key={s.id}>
              <td>{s.sequence_order}</td>
              <td>{s.name}</td>
              <td>{s.role_name || s.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default WorkflowStepsManager;
