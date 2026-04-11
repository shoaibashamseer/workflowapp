import React, { useEffect, useMemo, useState, useCallback, memo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import Modal from "react-native-modal";
import { Calendar } from "react-native-calendars";
import api from "../api/api";

const EMPTY_ITEM = {
  productId: "",
  workflowId: "",
  quantity: 1,
  features: [],
  materials: [],
};

const SearchSelectModal = memo(function SearchSelectModal({
  visible,
  title,
  data,
  labelKey = "name",
  onClose,
  onSelect,
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return data.filter((item) =>
      String(item[labelKey]).toLowerCase().startsWith(q)
    );
  }, [data, search, labelKey]);

  return (
    <Modal isVisible={visible} onBackdropPress={onClose} style={{ justifyContent: "flex-end", margin: 0 }}>
      <View style={styles.modalBox}>
        <Text style={styles.modalTitle}>{title}</Text>
        <TextInput
          style={styles.input}
          placeholder={`Search ${title}`}
          value={search}
          onChangeText={setSearch}
        />
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id.toString()}
          style={{ maxHeight: 300 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.searchItem}
              onPress={() => {
                onSelect(item);
                setSearch("");
                onClose();
              }}
            >
              <Text>{item[labelKey]}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </Modal>
  );
});

const OrderItemCard = memo(function OrderItemCard({
  item,
  index,
  products,
  workflows,
  productMap,
  materialVariants,
  addMaterial,
  updateMaterialQty,
  getProductPrice,
  onUpdate,
}) {
  const [productModal, setProductModal] = useState(false);
  const [workflowModal, setWorkflowModal] = useState(false);
  const [materialSearch, setMaterialSearch] = useState("");
  const [showMaterialList, setShowMaterialList] = useState(false);
  const product = productMap[item.productId];
  const workflow = workflows.find((w) => w.id === item.workflowId);
  const pricePerUnit = getProductPrice(product);
  const total = pricePerUnit * Number(item.quantity || 0);
  const filteredMaterials = useMemo(() => {
      return materialVariants.filter(m =>
        `${m.material_name} ${m.name}`
          .toLowerCase()
          .startsWith(materialSearch.toLowerCase())
      );
    }, [materialSearch, materialVariants]);

  return (
    <View style={styles.card}>
      <Text style={styles.subtitle}>Item {index + 1}</Text>

      <TouchableOpacity style={styles.input} onPress={() => setProductModal(true)}>
        <Text>{product?.name || "Select Product"}</Text>
      </TouchableOpacity>

      {product && <Text style={styles.price}>Price per unit: ₹{pricePerUnit}</Text>}

      <TouchableOpacity style={styles.input} onPress={() => setWorkflowModal(true)}>
        <Text>{workflow?.name || "Select Workflow"}</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={String(item.quantity)}
        onChangeText={(v) => onUpdate(index, "quantity", parseInt(v) || 1)}
        placeholder="Quantity"
      />

      {product && <Text style={styles.total}>Total Price: ₹{total}</Text>}

      <SearchSelectModal
        visible={productModal}
        title="Product"
        data={products}
        onClose={() => setProductModal(false)}
        onSelect={(selected) => onUpdate(index, "productId", selected.id)}
      />
     <Text style={{ marginTop: 10, fontWeight: "600" }}>
          Materials
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Search Material"
          value={materialSearch}
          onChangeText={(text) => {
            setMaterialSearch(text);
            setShowMaterialList(true);
          }}
        />

        {showMaterialList && materialSearch.length > 0 && (
          <View style={styles.dropdown}>
            {filteredMaterials.map(m => (
              <TouchableOpacity
                key={m.id}
                onPress={() => {
                  addMaterial(index, m.id);
                  setMaterialSearch("");
                  setShowMaterialList(false);
                }}
              >
                <Text style={styles.dropdownItem}>
                  {m.material_name} - {m.name} (Stock: {m.stock})
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {item.materials.map((mat, mIndex) => {
            const variant = materialVariants.find(v => v.id === mat.variantId);

            return (
                <View key={mIndex} style={{ marginTop: 8 }}>
                  <Text>
                    {variant?.material_name} - {variant?.name}
                  </Text>

                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={String(mat.quantity)}
                    onChangeText={(v) =>
                      updateMaterialQty(index, mIndex, v || 1)
                    }
                    placeholder="Quantity Used"
                  />
                </View>
              );
            })}

      <SearchSelectModal
        visible={workflowModal}
        title="Workflow"
        data={workflows}
        onClose={() => setWorkflowModal(false)}
        onSelect={(selected) => onUpdate(index, "workflowId", selected.id)}
      />
    </View>
  );
});

export default function PlaceOrder({ onBack }) {
  const [products, setProducts] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [customerId, setCustomerId] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerList, setShowCustomerList] = useState(false);
  const [showNewCustomer, setShowNewCustomer] = useState(false);

  const filteredCustomers = useMemo(() => {
  return customers.filter(c =>
    c.name.toLowerCase().startsWith(customerSearch.toLowerCase())
  );
}, [customerSearch, customers]);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [customerType, setCustomerType] = useState("retail");

  const [deliveryDate, setDeliveryDate] = useState("");
  const [dateModal, setDateModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [deliveryMethod, setDeliveryMethod] = useState("bus");
  const [orderGetMethod, setOrderGetMethod] = useState("direct");

  const [items, setItems] = useState([{ ...EMPTY_ITEM }]);
  const [materialVariants, setMaterialVariants] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const [p, w, c] = await Promise.all([
        api.get("manager/products/"),
        api.get("manager/workflows/"),
        api.get("customers/"),
      ]);
      setProducts(p.data);
      setWorkflows(w.data);
      setCustomers(c.data);
    };
    loadData();
  }, []);

  useEffect(() => {
      api.get("manager/raw-material-variants/")
        .then(res => setMaterialVariants(res.data));
    }, []);

  const customerMap = useMemo(() => Object.fromEntries(customers.map(c => [c.id, c])), [customers]);
  const productMap = useMemo(() => Object.fromEntries(products.map(p => [p.id, p])), [products]);

  const selectedCustomer = customerMap[customerId];

  const getProductPrice = useCallback((product) => {
    if (!selectedCustomer || !product) return 0;
    return selectedCustomer.customer_type === "wholesale"
      ? product.wholesale_price
      : product.retail_price;
  }, [selectedCustomer]);

  const updateItem = useCallback((index, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }, []);

  const addItem = useCallback(() => setItems((prev) => [...prev, { ...EMPTY_ITEM }]), []);
  const addMaterial = (itemIndex, variantId) => {
      if (!variantId) return;

      setItems(prev => {
        const updated = [...prev];

        const exists = updated[itemIndex].materials.find(
          m => m.variantId === variantId
        );

        if (exists) return updated;

       setItems(prev => {
          const updated = [...prev];
          const item = { ...updated[itemIndex] };

          item.materials = [...item.materials, {
            variantId,
            quantity: 1,
          }];

          updated[itemIndex] = item;
          return updated;
        });

        return updated;
      });
    };

    const updateMaterialQty = (itemIndex, matIndex, qty) => {
      setItems(prev => {
        const updated = [...prev];
        updated[itemIndex].materials[matIndex].quantity = qty;
        return updated;
      });
    };
  const grandTotal = useMemo(() => items.reduce((sum, item) => {
    const product = productMap[item.productId];
    return sum + getProductPrice(product) * Number(item.quantity || 0);
  }, 0), [items, productMap, getProductPrice]);

  const submitOrder = async () =>{
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
          customer_type: customerType,
        });

        finalCustomerId = res.data.id;
      }

      const validItems = items.filter(
          (item) => item.productId && item.workflowId
        );

        if (validItems.length !==  items.length) {
          Alert.alert("Invalid Items", "Please select product and workflow.");
          return;
        }

      const payload = {
        customer: Number(finalCustomerId),
        delivery_date: deliveryDate ? deliveryDate.split("T")[0] : null,
        delivery_method: deliveryMethod,
        order_get_method: orderGetMethod,

        items: validItems.map(item => ({
          product: Number(item.productId),
          workflow: Number(item.workflowId),
          quantity: Number(item.quantity),

          features: item.materials?.map(m => ({
            variant: Number(m.variantId),
            quantity_used: parseInt(m.quantity) || 1,
          })) || [],
        })),
      };

      await api.post("orders/", payload);

      Alert.alert("Success", "Order Created Successfully",[{ text : "ok"}]);

    }catch (err) {
      console.log("STATUS:", err.response?.status);
      console.log("DATA:", err.response?.data);

      if (err.response?.status === 401 || err.response?.status === 403) {
        Alert.alert("Auth Error", "Login expired or token missing");
      } else if (typeof err.response?.data === "string") {
        Alert.alert("Server Error", "Backend error or permission issue");
      } else {
        Alert.alert("Error", JSON.stringify(err.response?.data));
      }
    }finally {
          setLoading(false);
        }
 };

  const headerComponent = (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>Advanced Order</Text>
        <TouchableOpacity onPress={onBack}><Text style={styles.back}>← Back</Text></TouchableOpacity>
      </View>
      <TextInput
          style={styles.input}
          placeholder="Search Customer"
          value={customerSearch}
          onChangeText={(text) => {
            setCustomerSearch(text);
            setShowCustomerList(true);
          }}
        />

        {showCustomerList && customerSearch.length > 0 && (
          <View style={styles.dropdown}>
            {filteredCustomers.map(c => (
              <TouchableOpacity
                key={c.id}
                onPress={() => {
                  setCustomerId(c.id);
                  setCustomerSearch(c.name);
                  setShowCustomerList(false);
                }}
              >
                <Text style={styles.dropdownItem}>{c.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ADD NEW CUSTOMER BUTTON */}
        <TouchableOpacity onPress={() => setShowNewCustomer(!showNewCustomer)}>
          <Text style={{ color: "#2563eb", marginTop: 8 }}>
            + Add New Customer
          </Text>
        </TouchableOpacity>

        {showNewCustomer && (
          <>
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
            <Text style={styles.label}>Customer Type</Text>

            <View style={styles.dropdown}>
              {["retail", "wholesale"].map(type => (
                <TouchableOpacity key={type} onPress={() => setCustomerType(type)}>
                  <Text style={styles.dropdownItem}>
                    {type.toUpperCase()} {customerType === type ? "✓" : ""}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

      <Text style={styles.label}>Delivery Date</Text>
      <TouchableOpacity style={styles.input} onPress={() => setDateModal(true)}>
        <Text>{deliveryDate ? new Date(deliveryDate).toLocaleDateString() : "Select Delivery Date"}</Text>
      </TouchableOpacity>

      <Modal isVisible={dateModal} onBackdropPress={() => setDateModal(false)} style={{ justifyContent: "flex-end", margin: 0 }}>
        <View style={styles.modalBox}>
          <Calendar onDayPress={(day) => { setDeliveryDate(new Date(day.dateString).toISOString()); setDateModal(false); }} />
        </View>
      </Modal>
      <Text style={styles.label}>Delivery Method</Text>
        <View style={styles.dropdown}>
          {["bus", "courier", "direct"].map(m => (
            <TouchableOpacity key={m} onPress={() => setDeliveryMethod(m)}>
              <Text style={styles.dropdownItem}>
                {m.toUpperCase()} {deliveryMethod === m ? "✓" : ""}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Order Get Method</Text>
        <View style={styles.dropdown}>
          {["direct", "whatsapp", "call", "email"].map(m => (
            <TouchableOpacity key={m} onPress={() => setOrderGetMethod(m)}>
              <Text style={styles.dropdownItem}>
                {m.toUpperCase()} {orderGetMethod === m ? "✓" : ""}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </>
  );

   return (
    <FlatList
      style={styles.container}
      data={items}
      keyExtractor={(_, index) => index.toString()}
      ListHeaderComponent={headerComponent}
      renderItem={({ item, index }) => (
        <OrderItemCard
          item={item}
          index={index}
          products={products}
          workflows={workflows}
          productMap={productMap}
          materialVariants={materialVariants}
          addMaterial={addMaterial}
          updateMaterialQty={updateMaterialQty}
          getProductPrice={getProductPrice}
          onUpdate={updateItem}
        />
      )}
      ListFooterComponent={
        <>
          <Text style={styles.grand}>Grand Total: ₹{grandTotal}</Text>
          <TouchableOpacity style={styles.btn} onPress={addItem}>
            <Text style={styles.btnText}>Add Item</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submit} onPress={submitOrder}>
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnText}>Submit Order</Text>}
          </TouchableOpacity>
        </>
      }
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
    />
  );

}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  title: { fontSize: 24, fontWeight: "bold" },
  back: { color: "#2563eb", fontWeight: "600" },
  label: { fontWeight: "600", marginTop: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, marginTop: 8, borderRadius: 6 },
  card: { marginTop: 16, padding: 12, borderWidth: 1, borderColor: "#ddd", borderRadius: 8, backgroundColor: "white" },
  subtitle: { fontWeight: "bold", marginBottom: 10 },
  price: { marginTop: 5, color: "green" },
  total: { marginTop: 5, fontWeight: "bold" },
  grand: { fontSize: 20, fontWeight: "bold", marginTop: 20 },
  btn: { backgroundColor: "#2563eb", padding: 12, marginTop: 20, borderRadius: 6 },
  submit: { backgroundColor: "#16a34a", padding: 12, marginTop: 10, borderRadius: 6 },
  btnText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
  modalBox: { backgroundColor: "white", padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },

  searchItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee"
     },

  dropdown: {
      backgroundColor: "#fff",
      borderWidth: 1,
      borderColor: "#ccc",
      maxHeight: 150,
      zIndex: 1000,
      elevation: 5,
    }
});
