import { useEffect, useState } from "react";
import api from "../api/api";
import "../styles/manager.css";

export default function PlaceOrder() {
  const [products, setProducts] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [materialVariants, setMaterialVariants] = useState([]);

  const [customerId, setCustomerId] = useState("");
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");

  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState("bus");
  const [orderGetMethod, setOrderGetMethod] = useState("direct");

  const [items, setItems] = useState([
    {
      productId: "",
      workflowId: "",
      quantity: 1,
      features: [],
      materials: [],
    },
  ]);

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    api.get("manager/products/").then(res => setProducts(res.data));
    api.get("manager/workflows/").then(res => setWorkflows(res.data));
    api.get("customers/").then(res => setCustomers(res.data));
    api.get("manager/raw-material-variants/").then(res =>
      setMaterialVariants(res.data)
    );
  }, []);

  /* ================= HELPERS ================= */

  const getSelectedCustomer = () => {
    return customers.find(c => c.id === parseInt(customerId));
  };

  const getProductPrice = (product) => {
    const customer = getSelectedCustomer();
    if (!customer || !product) return 0;

    return customer.customer_type === "wholesale"
      ? product.wholesale_price
      : product.retail_price;
  };

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        productId: "",
        workflowId: "",
        quantity: 1,
        features: [],
        materials: [],
      },
    ]);
  };

  const addMaterial = (index, variantId) => {
    if (!variantId) return;

    const updated = [...items];

    if (updated[index].materials.find(m => m.variantId === variantId)) return;

    updated[index].materials.push({
      variantId,
      quantity: 1,
    });

    setItems(updated);
  };

  /* ================= SUBMIT ORDER ================= */

  const submitOrder = async () => {
    try {
      let finalCustomerId = customerId;

      if (!customerId && newCustomerName.trim()) {
        const res = await api.post("customers/", {
          name: newCustomerName,
          phone: newCustomerPhone,
        });
        finalCustomerId = res.data.id;
      }

      const payload = {
        customer: Number(finalCustomerId),
        delivery_date: deliveryDate
          ? deliveryDate.split("T")[0]
          : "",
        delivery_method: deliveryMethod,
        order_get_method: orderGetMethod,

        items: items.map(item => ({
          product: Number(item.productId),
          workflow: Number(item.workflowId),
          quantity: Number(item.quantity),
          features: item.features,
          materials: item.materials.map(m => ({
            variant: Number(m.variantId),
            quantity_used: Number(m.quantity),
          })),
        })),
      };

      await api.post("orders/", payload);
      alert("Order Created Successfully");

    } catch (err) {
      console.log("ORDER ERROR:", err.response?.data);
      alert(JSON.stringify(err.response?.data));
    }
  };
      const calculateGrandTotal = () => {
      let total = 0;

      items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        const price = getProductPrice(product);
        total += price * (item.quantity || 0);
      });

      return total;
        };


  /* ================= UI ================= */

  return (
    <div className="manager-page">
      <h1>Place Order</h1>

      {/* ================= CUSTOMER SECTION ================= */}
      <div className="form-card">
        <h3>Customer</h3>

        <select
          className="form-input"
          value={customerId}
          onChange={e => setCustomerId(e.target.value)}
        >
          <option value="">Select Existing Customer</option>
          {customers.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* ⭐ CUSTOMER TYPE BADGE */}
        {getSelectedCustomer() && (
          <div className="price-box">
            Customer Type: {getSelectedCustomer().customer_type.toUpperCase()}
          </div>
        )}

        <input
          className="form-input"
          placeholder="Or Add New Customer"
          value={newCustomerName}
          onChange={e => setNewCustomerName(e.target.value)}
        />

        <input
          className="form-input"
          placeholder="Customer Phone Number"
          value={newCustomerPhone}
          onChange={e => setNewCustomerPhone(e.target.value)}
        />

        <h3>Delivery Info</h3>

        <input
          className="form-input"
          type="datetime-local"
          value={deliveryDate}
          onChange={e => setDeliveryDate(e.target.value)}
        />

        <select
          className="form-input"
          value={deliveryMethod}
          onChange={e => setDeliveryMethod(e.target.value)}
        >
          <option value="bus">Bus</option>
          <option value="courier">Courier</option>
          <option value="direct">Direct</option>
          <option value="others">Others</option>
        </select>

        <select
          className="form-input"
          value={orderGetMethod}
          onChange={e => setOrderGetMethod(e.target.value)}
        >
          <option value="direct">Direct</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="email">Email</option>
          <option value="call">Call</option>
          <option value="person">Person</option>
        </select>
      </div>

      {/* ================= ITEMS ================= */}
      {items.map((item, index) => {
        const product = products.find(p => p.id === item.productId);
        const pricePerUnit = getProductPrice(product);
        const total = pricePerUnit * (item.quantity || 0);

        return (
          <div key={index} className="form-card">
            <h3>Item {index + 1}</h3>

            <select
              className="form-input"
              value={item.productId}
              onChange={e => updateItem(index, "productId", e.target.value)}
            >
              <option value="">Select Product</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            {/* ⭐ AUTO PRICE DISPLAY */}
            {product && (
              <div className="price-box">
                Price per unit: ₹{pricePerUnit}
              </div>
            )}

            <select
              className="form-input"
              value={item.workflowId}
              onChange={e => updateItem(index, "workflowId", e.target.value)}
            >
              <option value="">Select Workflow</option>
              {workflows.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>

            <input
              className="form-input"
              type="number"
              placeholder="Quantity"
              value={item.quantity}
              onChange={e => updateItem(index, "quantity", e.target.value)}
            />

            {/* ⭐ TOTAL PRICE */}
            {product && (
              <div className="total-price">
                Total Price: ₹{total}
              </div>
            )}

            <h4>Materials</h4>

            <select
              className="form-input"
              onChange={e => addMaterial(index, e.target.value)}
            >
              <option value="">Select Material Variant</option>
              {materialVariants.map(m => (
                <option key={m.id} value={m.id}>
                  {m.material_name} - {m.name} (Stock: {m.stock})
                </option>
              ))}
            </select>

            {item.materials.map((mat, mIndex) => {
              const variant = materialVariants.find(v => v.id === mat.variantId);

              return (
                <div key={mIndex} style={{ marginTop: "6px" }}>
                  {variant?.material_name} - {variant?.name}

                  <input
                    className="form-input"
                    type="number"
                    value={mat.quantity}
                    onChange={(e) => {
                      const updated = [...items];
                      updated[index].materials[mIndex].quantity = e.target.value;
                      setItems(updated);
                    }}
                  />
                </div>
              );
            })}
          </div>
        );
      })}

     {/* GRAND TOTAL CARD */}
    <div className="form-card" style={{ marginTop: "20px" }}>
      <h2 style={{ marginBottom: "10px" }}>
        Grand Total: ₹{calculateGrandTotal()}
      </h2>
    </div>

    <button className="action-btn" onClick={addItem}>
      ➕ Add Item
    </button>

    <button
      className="action-btn"
      style={{ marginLeft: "10px", background: "#16a34a" }}
      onClick={submitOrder}
    >
      Submit Order
</button>

    </div>
  );
}
