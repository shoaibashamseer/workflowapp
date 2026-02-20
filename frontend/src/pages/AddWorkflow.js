import { useEffect, useState } from "react";
import {
  createWorkflow,
  addWorkflowStep,
  fetchProducts,
  fetchRoles
} from "../api/workflows";
import "../styles/manager.css";

function AddWorkflow() {
  const [products, setProducts] = useState([]);
  const [roles, setRoles] = useState([]);

  const [productId, setProductId] = useState("");
  const [workflowName, setWorkflowName] = useState("");

  const [stepName, setStepName] = useState("");
  const [stepRole, setStepRole] = useState("");
  const [steps, setSteps] = useState([]);

  useEffect(() => {
    fetchProducts().then(setProducts);
    fetchRoles().then(setRoles);
  }, []);

  const addStep = () => {
    if (!stepName || !stepRole) {
      alert("Step name and role are required");
      return;
    }

    setSteps([
      ...steps,
      {
        name: stepName,
        role: parseInt(stepRole),
        sequence_order: steps.length + 1
      }
    ]);

    setStepName("");
    setStepRole("");
  };

  const handleSubmit = async () => {
    if (!productId || !workflowName) {
      alert("Product and workflow name are required");
      return;
    }

    const workflow = await createWorkflow({
      product: parseInt(productId),
      name: workflowName
    });

    if (!workflow || !workflow.id) {
      alert("Workflow creation failed");
      return;
    }

    for (const step of steps) {
      await addWorkflowStep({
        workflow: workflow.id,
        name: step.name,
        sequence_order: step.sequence_order,
        role: step.role
      });
    }

    alert("Workflow and steps created successfully");

    setWorkflowName("");
    setSteps([]);
  };

  return (
    <div className="manager-page">
      <h1>Create Workflow</h1>

      {/* ================= WORKFLOW DETAILS ================= */}
      <div className="form-card">
        <h3>Workflow Details</h3>

        <select
          className="form-input"
          value={productId}
          onChange={e => setProductId(e.target.value)}
        >
          <option value="">-- Select Product --</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <input
          className="form-input"
          placeholder="Workflow Name"
          value={workflowName}
          onChange={e => setWorkflowName(e.target.value)}
        />
      </div>

      {/* ================= ADD STEPS ================= */}
      <div className="form-card">
        <h3>Add Workflow Steps</h3>

        <input
          className="form-input"
          placeholder="Step Name"
          value={stepName}
          onChange={e => setStepName(e.target.value)}
        />

        <select
          className="form-input"
          value={stepRole}
          onChange={e => setStepRole(e.target.value)}
        >
          <option value="">-- Select Role --</option>
          {roles.map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>

        <button className="action-btn" type="button" onClick={addStep}>
          ➕ Add Step
        </button>

        {/* STEP LIST */}
        {steps.length > 0 && (
          <table className="manager-table" style={{ marginTop: "15px" }}>
            <thead>
              <tr>
                <th>Order</th>
                <th>Step Name</th>
              </tr>
            </thead>
            <tbody>
              {steps.map((s, i) => (
                <tr key={i}>
                  <td>{s.sequence_order}</td>
                  <td>{s.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ================= SAVE BUTTON ================= */}
      <button className="action-btn" onClick={handleSubmit}>
        Save Workflow
      </button>
    </div>
  );
}

export default AddWorkflow;
