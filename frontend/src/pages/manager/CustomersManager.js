import { useEffect, useState } from "react";
import api from "../../api/api";

function CustomersManager() {
  const [customers, setCustomers] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    customer_type: "retail", // ⭐ NEW FIELD
  });

  const loadCustomers = () => {
    api.get("customers/").then((res) => setCustomers(res.data));
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const startEdit = (c) => {
    setEditingId(c.id);
    setForm({
      name: c.name,
      phone: c.phone,
      email: c.email || "",
      address: c.address || "",
      customer_type: c.customer_type || "retail",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({
      name: "",
      phone: "",
      email: "",
      address: "",
      customer_type: "retail",
    });
  };

  const saveCustomer = () => {
    if (editingId) {
      api.put(`customers/${editingId}/`, form).then(() => {
        cancelEdit();
        loadCustomers();
      });
    } else {
      api.post("customers/", form).then(() => {
        cancelEdit();
        loadCustomers();
      });
    }
  };

  const deleteCustomer = (id) => {
    if (!window.confirm("Delete this customer?")) return;
    api.delete(`customers/${id}/`).then(() => loadCustomers());
  };

  return (
    <div className="manager-page">
      <h2>Customers</h2>

      {/* ===== FORM ===== */}
      <div className="form-card">
        <h4>{editingId ? "Edit Customer" : "Add Customer"}</h4>

        <input
          className="form-input"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
        />

        <input
          className="form-input"
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
        />

        <input
          className="form-input"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />

        <textarea
          className="form-input"
          name="address"
          placeholder="Address"
          value={form.address}
          onChange={handleChange}
        />

        {/* ⭐ CUSTOMER TYPE SELECT */}
        <select
          className="form-input"
          name="customer_type"
          value={form.customer_type}
          onChange={handleChange}
        >
          <option value="retail">Retail</option>
          <option value="wholesale">Wholesale</option>
        </select>

        <button className="action-btn" onClick={saveCustomer}>
          {editingId ? "Update" : "Add"}
        </button>

        {editingId && (
          <button className="action-btn secondary" onClick={cancelEdit}>
            Cancel
          </button>
        )}
      </div>

      {/* ===== TABLE ===== */}
      <div className="form-card">
         <table className="manager-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {customers.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.phone}</td>
                <td>{c.email || "—"}</td>
                <td>
                  {c.customer_type === "wholesale"
                    ? "Wholesale"
                    : "Retail"}
                </td>
                <td>
                  <button onClick={() => startEdit(c)}>Edit</button>
                  <button onClick={() => deleteCustomer(c.id)}>
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

export default CustomersManager;
