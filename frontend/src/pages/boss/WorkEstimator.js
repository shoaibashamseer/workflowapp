import { useState } from "react";
import api from "../../api/api";

export default function WorkEstimator() {
  const [title, setTitle] = useState("");
  const [materialCost, setMaterialCost] = useState("");
  const [salaryCost, setSalaryCost] = useState("");
  const [otherCost, setOtherCost] = useState("");
  const [suggestedPrice, setSuggestedPrice] = useState("");

  const saveEstimate = async () => {
    try {
      await api.post("boss/work-estimates/", {
        title,
        material_cost: materialCost,
        salary_cost: salaryCost,
        other_cost: otherCost,
        suggested_price: suggestedPrice,
      });

      alert("Estimate Saved");
      setTitle("");
      setMaterialCost("");
      setSalaryCost("");
      setOtherCost("");
      setSuggestedPrice("");
    } catch (err) {
      console.log(err.response?.data);
    }
  };

  return (
    <div className="manager-page">
      <h1>Work Price Estimator</h1>

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
          placeholder="Material Cost"
          value={materialCost}
          onChange={(e) => setMaterialCost(e.target.value)}
        />

        <input
          className="form-input"
          type="number"
          placeholder="Worker Salary Cost"
          value={salaryCost}
          onChange={(e) => setSalaryCost(e.target.value)}
        />

        <input
          className="form-input"
          type="number"
          placeholder="Other Expenses"
          value={otherCost}
          onChange={(e) => setOtherCost(e.target.value)}
        />

        <input
          className="form-input"
          type="number"
          placeholder="Suggested Selling Price"
          value={suggestedPrice}
          onChange={(e) => setSuggestedPrice(e.target.value)}
        />

        <button className="action-btn" onClick={saveEstimate}>
          Save Estimate
        </button>
      </div>
    </div>
  );
}
