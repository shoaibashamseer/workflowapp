import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/api";
import "../../styles/manager.css";

function ProductsManager() {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    base_cost: "",
    wholesale_price: "",
    retail_price: "",
  });

  const loadProducts = () => {
    api.get("manager/products/")
      .then(res => setProducts(res.data));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const startEdit = (product) => {
    setEditingProduct(product.id);
    setForm({
      name: product.name,
      description: product.description || "",
      base_cost: product.base_cost,
      wholesale_price: product.wholesale_price || "",
      retail_price: product.retail_price || "",
    });
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setForm({
      name: "",
      description: "",
      base_cost: "",
      wholesale_price: "",
      retail_price: "",
    });
  };

  const saveEdit = () => {
    api.put(`manager/products/${editingProduct}/`, form)
      .then(() => {
        cancelEdit();
        loadProducts();
      });
  };

  const deleteProduct = (id) => {
    if (!window.confirm("Delete this product?")) return;

    api.delete(`manager/products/${id}/`)
      .then(() => loadProducts());
  };

  return (
    <div className="manager-page">
      {/* Header */}
      <div className="manager-header">
        <h1>Products</h1>
        <Link to="/manager/products/new" className="action-btn">
          ➕ Add Product
        </Link>
      </div>

      {/* Table */}
      <table className="manager-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Base Cost</th>
            <th>Wholesale Price</th>
            <th>Retail Price</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              {/* NAME */}
              <td>
                {editingProduct === p.id ? (
                  <input
                    className="table-input"
                    value={form.name}
                    onChange={e =>
                      setForm({ ...form, name: e.target.value })
                    }
                  />
                ) : (
                  p.name
                )}
              </td>

              {/* DESCRIPTION */}
              <td>
                {editingProduct === p.id ? (
                  <input
                    className="table-input"
                    value={form.description}
                    onChange={e =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                ) : (
                  p.description || "-"
                )}
              </td>

              {/* BASE COST */}
              <td>
                {editingProduct === p.id ? (
                  <input
                    className="table-input"
                    value={form.base_cost}
                    onChange={e =>
                      setForm({ ...form, base_cost: e.target.value })
                    }
                  />
                ) : (
                  `₹ ${p.base_cost}`
                )}
              </td>

              {/* WHOLESALE PRICE */}
              <td>
                {editingProduct === p.id ? (
                  <input
                    className="table-input"
                    value={form.wholesale_price}
                    onChange={e =>
                      setForm({ ...form, wholesale_price: e.target.value })
                    }
                  />
                ) : (
                  `₹ ${p.wholesale_price || 0}`
                )}
              </td>

              {/* RETAIL PRICE */}
              <td>
                {editingProduct === p.id ? (
                  <input
                    className="table-input"
                    value={form.retail_price}
                    onChange={e =>
                      setForm({ ...form, retail_price: e.target.value })
                    }
                  />
                ) : (
                  `₹ ${p.retail_price || 0}`
                )}
              </td>

              {/* ACTIONS */}
              <td>
                {editingProduct === p.id ? (
                  <>
                    <button className="link-btn" onClick={saveEdit}>
                      Save
                    </button>
                    <button className="danger-btn" onClick={cancelEdit}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="link-btn"
                      onClick={() => startEdit(p)}
                    >
                      Edit
                    </button>
                    <button
                      className="danger-btn"
                      onClick={() => deleteProduct(p.id)}
                    >
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ProductsManager;
