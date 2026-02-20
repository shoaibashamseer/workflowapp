import { useEffect, useState } from "react";
import { fetchProducts, addProductProperty } from "../api/productProperties";

function AddProductProperty() {
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState("");

  const [name, setName] = useState("");
  const [fieldType, setFieldType] = useState("text");
  const [options, setOptions] = useState("");

  useEffect(() => {
    fetchProducts().then(setProducts);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      product: productId,
      name: name,
      field_type: fieldType,
      options:
        fieldType === "dropdown"
          ? options.split(",").map(o => o.trim())
          : null
    };

    await addProductProperty(payload);
    alert("Property added");

    setName("");
    setOptions("");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Add Product Property</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Product</label><br />
          <select
            value={productId}
            onChange={e => setProductId(e.target.value)}
            required
          >
            <option value="">-- Select Product --</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Property Name</label><br />
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Field Type</label><br />
          <select
            value={fieldType}
            onChange={e => setFieldType(e.target.value)}
          >
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="dropdown">Dropdown</option>
          </select>
        </div>

        {fieldType === "dropdown" && (
          <div>
            <label>Options (comma separated)</label><br />
            <input
              value={options}
              onChange={e => setOptions(e.target.value)}
              placeholder="Small, Medium, Large"
            />
          </div>
        )}

        <br />
        <button type="submit">Save Property</button>
      </form>
    </div>
  );
}

export default AddProductProperty;
