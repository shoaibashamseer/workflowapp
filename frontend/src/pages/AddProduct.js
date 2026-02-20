import { useState } from "react";
import { createProduct } from "../api/products";
import { addProductProperty } from "../api/productProperties";
import "../styles/manager.css";

function AddProduct() {

  // product fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [wholesalePrice,setWholesalePrice] = useState("");
  const [retailPrice,setRetailPrice] = useState("");

  // property fields
  const [propName, setPropName] = useState("");
  const [fieldType, setFieldType] = useState("text");
  const [options, setOptions] = useState("");

  // local property list
  const [properties, setProperties] = useState([]);

  const addPropertyToList = () => {
    if (!propName) return;

    setProperties([
      ...properties,
      {
        name: propName,
        field_type: fieldType,
        options:
          fieldType === "dropdown"
            ? options.split(",").map(o => o.trim())
            : null
      }
    ]);

    setPropName("");
    setOptions("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const product = await createProduct({
      name,
      description,
      wholesale_price: wholesalePrice,
      retail_price: retailPrice,
    });

    for (const prop of properties) {
      await addProductProperty({
        product: product.id,
        ...prop
      });
    }

    alert("Product and properties created successfully");

    setName("");
    setDescription("");
    setWholesalePrice("");
    setRetailPrice("");
    setProperties([]);
  };

  return (
    <div className="manager-page">
      <h1>Add New Product</h1>

      {/* ================= PRODUCT DETAILS ================= */}
      <div className="form-card">
        <h3>Product Details</h3>

        <input
          className="form-input"
          placeholder="Product Name"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <textarea
          className="form-input"
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />

        <input
          className="form-input"
          type="number"
          placeholder="Wholesale Price"
          value={wholesalePrice}
          onChange={(e)=>setWholesalePrice(e.target.value)}
        />

        <input
          className="form-input"
          type="number"
          placeholder="Retail Price"
          value={retailPrice}
          onChange={(e)=>setRetailPrice(e.target.value)}
        />
      </div>

      {/* ================= PRODUCT PROPERTIES ================= */}
      <div className="form-card">
        <h3>Product Properties</h3>

        <input
          className="form-input"
          placeholder="Property Name"
          value={propName}
          onChange={e => setPropName(e.target.value)}
        />

        <select
          className="form-input"
          value={fieldType}
          onChange={e => setFieldType(e.target.value)}
        >
          <option value="text">Text</option>
          <option value="number">Number</option>
          <option value="dropdown">Dropdown</option>
        </select>

        {fieldType === "dropdown" && (
          <input
            className="form-input"
            placeholder="Options (comma separated)"
            value={options}
            onChange={e => setOptions(e.target.value)}
          />
        )}

        <button className="action-btn" type="button" onClick={addPropertyToList}>
          ➕ Add Property
        </button>

        {/* PROPERTY LIST */}
        {properties.length > 0 && (
          <table className="manager-table" style={{ marginTop: "15px" }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((p, i) => (
                <tr key={i}>
                  <td>{p.name}</td>
                  <td>{p.field_type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ================= SAVE BUTTON ================= */}
      <button className="action-btn" onClick={handleSubmit}>
        Save Product
      </button>
    </div>
  );
}

export default AddProduct;
