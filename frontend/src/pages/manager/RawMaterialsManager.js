import { useEffect, useState } from "react";
import api from "../../api/api";
import "../../styles/manager.css";

export default function RawMaterialsManager() {
  const [materials, setMaterials] = useState([]);
  const [variants, setVariants] = useState([]);
  const [deleteError, setDeleteError] = useState("");
  const [newMaterial, setNewMaterial] = useState("");
  const [lowStockLimit, setLowStockLimit] = useState("");

  const [variantForm, setVariantForm] = useState({
    material: "",
    name: "",
    stock: "",
    unit: "pcs",
    base_cost:"",
  });

  const loadData = () => {
    api.get("manager/raw-materials/").then(res => setMaterials(res.data));
    api.get("manager/raw-material-variants/").then(res => setVariants(res.data));
  };
    // ⭐ AUTO HIDE DELETE WARNING
   useEffect(() => {
      if (!deleteError) return;

      const timer = setTimeout(() => {
        setDeleteError("");
      }, 3000); // 3 seconds

      return () => clearTimeout(timer);
    }, [deleteError]);

  useEffect(() => {
    loadData();
  }, []);

  /* ================= ADD MATERIAL ================= */
  const addMaterial = async () => {
    if (!newMaterial) return;

    await api.post("manager/raw-materials/", {
      name: newMaterial,
      low_stock_limit: lowStockLimit,
    });

    setNewMaterial("");
    setLowStockLimit("");

    loadData();
  };

  /* ================= ADD VARIANT ================= */
  const addVariant = async () => {
    await api.post("manager/raw-material-variants/", variantForm);
    setVariantForm({ material: "", name: "", stock: "", unit: "pcs" , base_cost:"",});
    loadData();
  };

  return (
    <div className="manager-page">
      <h1>Raw Materials & Stock</h1>

      {/* ================= ADD MATERIAL ================= */}
      <div className="form-card">
        <h3>Add Raw Material</h3>

        <input
          className="form-input"
          placeholder="Material name (Hook, Holder...)"
          value={newMaterial}
          onChange={(e) => setNewMaterial(e.target.value)}
        />

        <input
          className="form-input"
          type="number"
          placeholder="Low stock alert limit"
          value={lowStockLimit}
          onChange={(e) => setLowStockLimit(e.target.value)}
        />

        <button className="action-btn" onClick={addMaterial}>
          Add Material
        </button>
      </div>

      {/* ================= ADD VARIANT ================= */}
      <div className="form-card">
        <h3>Add Material Variant</h3>

        <select
          className="form-input"
          value={variantForm.material}
          onChange={(e) =>
            setVariantForm({ ...variantForm, material: e.target.value })
          }
        >
          <option value="">Select Material</option>
          {materials.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>

        <input
          className="form-input"
          placeholder="Variant name (Fish Hook)"
          value={variantForm.name}
          onChange={(e) =>
            setVariantForm({ ...variantForm, name: e.target.value })
          }
        />

        <input
          className="form-input"
          type="number"
          placeholder="Stock"
          value={variantForm.stock}
          onChange={(e) =>
            setVariantForm({ ...variantForm, stock: e.target.value })
          }
        />

        <input
          className="form-input"
          placeholder="Unit (pcs, meter)"
          value={variantForm.unit}
          onChange={(e) =>
            setVariantForm({ ...variantForm, unit: e.target.value })
          }
        />
         {/* ⭐ PRICE PER UNIT */}
        <input
          className="form-input"
          type="number"
          placeholder="Price per unit (₹)"
          value={variantForm.base_cost}
          onChange={e =>
            setVariantForm({ ...variantForm, base_cost: e.target.value })
          }
        />
        <button className="action-btn" onClick={addVariant}>
          Add Variant
        </button>
      </div>

      {/* ================= STOCK TABLE ================= */}
      <div className="form-card">
        <h3>Current Stock</h3>
            {deleteError && (
              <div
                style={{
                  background: "#fee2e2",
                  color: "#991b1b",
                  padding: "10px",
                  marginBottom: "10px",
                  borderRadius: "6px",
                  fontWeight: "600"
                }}
              >
               <div className="warning-box">
                  ⚠ {deleteError}
               </div>

              </div>
            )}

        <table className="manager-table">
          <thead>
            <tr>
              <th>Material</th>
              <th>Variant</th>
              <th>Price per unit</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Delete</th>
            </tr>
          </thead>

          <tbody>
            {variants.map((v) => (

              <tr
                key={v.id}

                style={{
                  background: v.low_stock ? "#fee2e2" : "white",
                }}
              >
                <td>{v.material_name}</td>
                <td>{v.name}</td>
                <td>₹ {v.base_cost}</td>

                <td>
                  <div className="stock-actions">
                    <input
                      type="number"
                      className="stock-input"
                      value={v.stock}
                      onChange={(e) => {
                        const updated = variants.map((item) =>
                          item.id === v.id
                            ? { ...item, stock: e.target.value }
                            : item
                        );
                        setVariants(updated);
                      }}
                    />

                    <button
                      className="action-btn"
                      onClick={() => {
                        api
                          .put(`manager/raw-material-variants/${v.id}/`, v)
                          .then(loadData);
                      }}
                    >
                      Save
                    </button>
                  </div>
                </td>

                <td>{v.low_stock ? "⚠ LOW STOCK" : "OK"}</td>

                <td>
                  <button
                    className="delete-btn"
                    onClick={() => {
                      if (!window.confirm("Delete variant?")) return;
                    api
                      .delete(`manager/raw-material-variants/${v.id}/`)
                      .then(() => {
                        setDeleteError(""); // clear old warning
                        loadData();
                      })
                      .catch(err => {
                        const message =
                          err.response?.data?.error ||
                          "Cannot delete this material.";

                        setDeleteError(message);
                      });
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
