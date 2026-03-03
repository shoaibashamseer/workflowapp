import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import api from "../api/api";

export default function PlaceOrder({ user, onBack }) {
  const [loading, setLoading] = useState(true);

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [materials, setMaterials] = useState([]);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [deliveryDate, setDeliveryDate] = useState("");

  const [items, setItems] = useState([
    {
      product: null,
      workflow: null,
      material: null,
      quantity: 1,
      total: 0,
    },
  ]);

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    const loadData = async () => {
      try {
        const [c, p, w, m] = await Promise.all([
          api.get("customers/"),
          api.get("manager/products/"),
          api.get("manager/workflows/"),
          api.get("manager/raw-material-variants/"),
        ]);

        setCustomers(c.data);
        console.log("customer:", c.data);
        setProducts(p.data);
        setWorkflows(w.data);
        setMaterials(m.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  /* ================= PRICE CALCULATION ================= */

  const calculatePrice = (item) => {
    if (!item.product || !selectedCustomer) return 0;

    const product = products.find(p => p.id === item.product);
    const material = materials.find(m => m.id === item.material);

    if (!product) return 0;

    let basePrice =
      selectedCustomer.customer_type === "wholesale"
        ? product.price_wholesale
        : product.price_retail;

    let materialPrice = material ? material.price : 0;

    return (basePrice + materialPrice) * item.quantity;
  };

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    updated[index].total = calculatePrice(updated[index]);
    setItems(updated);
  };

  const addItem = () => {
    setItems([
      ...items,
      { product: null, workflow: null, material: null, quantity: 1, total: 0 },
    ]);
  };

  const grandTotal = items.reduce((sum, i) => sum + i.total, 0);

  /* ================= SUBMIT ================= */

  const submitOrder = async () => {
    try {
      const payload = {
        customer: selectedCustomer.id,
        delivery_date: deliveryDate,
        items: items.map(i => ({
          product: i.product,
          workflow: i.workflow,
          quantity: i.quantity,
          materials: i.material ? [i.material] : [],
          features: [],
        })),
      };

      await api.post("orders/", payload);
      alert("Order Created Successfully");
      onBack();
    } catch (err) {
      console.log(err.response?.data);
      alert("Error creating order");
    }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 50 }} />;

  /* ================= UI ================= */

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Advanced Order</Text>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
      </View>

      {/* CUSTOMER */}
      <Text style={styles.label}>Select Customer</Text>
      <Picker
        selectedValue={selectedCustomer?.id}
        onValueChange={(val) =>
          setSelectedCustomer(customers.find(c => c.id === val))
        }
      >
        <Picker.Item label="Select Customer" value={null} />
        {customers.map(c => (
          <Picker.Item key={c.id} label={c.name} value={c.id} />
        ))}
      </Picker>

      {/* DELIVERY DATE */}
      <TextInput
        style={styles.input}
        placeholder="Delivery Date YYYY-MM-DD"
        value={deliveryDate}
        onChangeText={setDeliveryDate}
      />

      {/* ITEMS */}
      {items.map((item, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.itemTitle}>Item {index + 1}</Text>

          <Text>Product</Text>
          <Picker
            selectedValue={item.product}
            onValueChange={(val) => updateItem(index, "product", val)}
          >
            <Picker.Item label="Select Product" value={null} />
            {products.map(p => (
              <Picker.Item key={p.id} label={p.name} value={p.id} />
            ))}
          </Picker>

          <Text>Workflow</Text>
          <Picker
            selectedValue={item.workflow}
            onValueChange={(val) => updateItem(index, "workflow", val)}
          >
            <Picker.Item label="Select Workflow" value={null} />
            {workflows.map(w => (
              <Picker.Item key={w.id} label={w.name} value={w.id} />
            ))}
          </Picker>

          <Text>Material</Text>
          <Picker
            selectedValue={item.material}
            onValueChange={(val) => updateItem(index, "material", val)}
          >
            <Picker.Item label="Select Material" value={null} />
            {materials.map(m => (
              <Picker.Item key={m.id} label={m.name} value={m.id} />
            ))}
          </Picker>

          <TextInput
            style={styles.input}
            placeholder="Quantity"
            keyboardType="numeric"
            value={String(item.quantity)}
            onChangeText={(val) =>
              updateItem(index, "quantity", Number(val))
            }
          />

          <Text style={styles.total}>
            Item Total: ₹ {item.total.toFixed(2)}
          </Text>
        </View>
      ))}

      <TouchableOpacity style={styles.addBtn} onPress={addItem}>
        <Text style={styles.btnText}>+ Add Item</Text>
      </TouchableOpacity>

      <Text style={styles.grand}>
        Grand Total: ₹ {grandTotal.toFixed(2)}
      </Text>

      <TouchableOpacity style={styles.submitBtn} onPress={submitOrder}>
        <Text style={styles.btnText}>Submit Order</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#f4f6f8" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  title: { fontSize: 20, fontWeight: "bold" },
  back: { color: "#2563eb", fontWeight: "600" },
  label: { fontWeight: "600", marginTop: 10 },
  input: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 6,
    marginTop: 5,
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  itemTitle: { fontWeight: "bold", marginBottom: 5 },
  total: { marginTop: 5, fontWeight: "600", color: "#16a34a" },
  grand: { fontSize: 18, fontWeight: "bold", marginVertical: 15 },
  addBtn: {
    backgroundColor: "#64748b",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  submitBtn: {
    backgroundColor: "#16a34a",
    padding: 14,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 10,
  },
  btnText: { color: "#fff", fontWeight: "600" },
});