import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import api from "../api/api";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function PlaceOrder({  onBack }) {

  const [products, setProducts] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [materialVariants, setMaterialVariants] = useState([]);

  const [customerId, setCustomerId] = useState("");
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");

  const [deliveryDate, setDeliveryDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

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

  /* LOAD DATA */

  useEffect(() => {
    api.get("manager/products/").then(res => setProducts(res.data));
    api.get("manager/workflows/").then(res => setWorkflows(res.data));
    api.get("customers/").then(res => setCustomers(res.data));
    api.get("manager/raw-material-variants/").then(res =>
      setMaterialVariants(res.data)
    );
  }, []);

  /* HELPERS */

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

  /* SUBMIT ORDER */

  const submitOrder = async () => {
     if (!customerId && !newCustomerName.trim()) {
        Alert.alert("Customer Required", "Please select or add a customer.");
        return;
     }

     if (items.length === 0) {
        Alert.alert("No Items", "Please add at least one product.");
        return;
     }

    setLoading(true);

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
        delivery_date: deliveryDate ? deliveryDate.split("T")[0] : "",
        delivery_method: deliveryMethod,
        order_get_method: orderGetMethod,

        items: items.map(item => ({
          product: Number(item.productId),
          workflow: Number(item.workflowId),
          quantity: Number(item.quantity),

          materials: item.materials.map(m => ({
            variant: Number(m.variantId),
            quantity_used: Number(m.quantity),
          })),
        })),
      };

      await api.post("orders/", payload);

      Alert.alert("Success", "Order Created Successfully",[{ text : "ok"}]);

    } catch (err) {
     const data = err.response?.data;

     let message = "Something went wrong while creating the order.";

     if (data?.customer) {
       message = "Please select a valid customer.";
     }

     if (data?.items) {
      message = "One or more items are invalid.";
     }

    if (data?.non_field_errors) {
      message = data.non_field_errors.join("\n");
    }

    Alert.alert("Order Failed", message);

   } finally {
    setLoading(false);
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

  return (

    <ScrollView style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.title}>Advanced Order</Text>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
      </View>

      {/* CUSTOMER */}

      <Text style={styles.label}>Select Customer</Text>

      <Picker
        selectedValue={customerId}
        onValueChange={(itemValue) => setCustomerId(itemValue)}
      >
        <Picker.Item label="Select Customer" value="" />

        {customers.map(c => (
          <Picker.Item key={c.id} label={c.name} value={c.id} />
        ))}

      </Picker>

      <TextInput
        style={styles.input}
        placeholder="New Customer Name"
        value={newCustomerName}
        onChangeText={setNewCustomerName}
      />

      <TextInput
        style={styles.input}
        placeholder="Customer Phone"
        value={newCustomerPhone}
        onChangeText={setNewCustomerPhone}
      />
      <Text style={styles.label}>Delivery Date</Text>

      <TouchableOpacity
           style={styles.input}
           onPress={() => setShowDatePicker(true)}
       >
         <Text>
            {deliveryDate
              ? new Date(deliveryDate).toLocaleString()
              : "Select Delivery Date"}
          </Text>
      </TouchableOpacity>

      {showDatePicker && (
          <DateTimePicker
            value={deliveryDate ? new Date(deliveryDate) : new Date()}
            mode="datetime"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);

              if (event.type === "dismissed") return;

              if (selectedDate) {
                setDeliveryDate(selectedDate.toISOString());
              }
            }}
          />
      )}
      {/* ITEMS */}

      {items.map((item, index) => {

        const product = products.find(p => p.id === item.productId);

        const pricePerUnit = getProductPrice(product);

        const total = pricePerUnit * (item.quantity || 0);

        return (

          <View key={index} style={styles.card}>

            <Text style={styles.subtitle}>Item {index + 1}</Text>

            <Picker
              selectedValue={item.productId}
              onValueChange={(v) => updateItem(index, "productId", v)}
            >
              <Picker.Item label="Select Product" value="" />

              {products.map(p => (
                <Picker.Item key={p.id} label={p.name} value={p.id} />
              ))}

            </Picker>

            {product && (
              <Text style={styles.price}>
                Price per unit: ₹{pricePerUnit}
              </Text>
            )}

            <Picker
              selectedValue={item.workflowId}
              onValueChange={(v) => updateItem(index, "workflowId", v)}
            >
              <Picker.Item label="Select Workflow" value="" />

              {workflows.map(w => (
                <Picker.Item key={w.id} label={w.name} value={w.id} />
              ))}

            </Picker>

            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={String(item.quantity)}
              onChangeText={(v) => updateItem(index, "quantity", v)}
            />

            {product && (
              <Text style={styles.total}>
                Total Price: ₹{total}
              </Text>
            )}

          </View>
        );
      })}

      <Text style={styles.grand}>
        Grand Total: ₹{calculateGrandTotal()}
      </Text>

      <TouchableOpacity style={styles.btn} onPress={addItem}>
        <Text style={styles.btnText}>Add Item</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.submit} onPress={submitOrder}>
         {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.btnText}>Submit Order</Text>
         )}
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 16,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20
  },

  label: {
    fontWeight: "600",
    marginTop: 10
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginTop: 8,
    borderRadius: 6
  },

  card: {
    marginTop: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8
  },

  subtitle: {
    fontWeight: "bold",
    marginBottom: 10
  },

  price: {
    marginTop: 5,
    color: "green"
  },

  total: {
    marginTop: 5,
    fontWeight: "bold"
  },

  grand: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20
  },

  btn: {
    backgroundColor: "#2563eb",
    padding: 12,
    marginTop: 20,
    borderRadius: 6
  },

  submit: {
    backgroundColor: "#16a34a",
    padding: 12,
    marginTop: 10,
    borderRadius: 6
  },

  btnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold"
  }

});