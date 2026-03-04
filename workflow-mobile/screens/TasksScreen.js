import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../api/api";

export default function TasksScreen({ user, onLogout,  goToPlaceOrder }) {
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState("my"); // my | completed | queue

  const loadTasks = useCallback(async () => {
    const res = await api.get("tasks/");
    //console.log("TASKS API:", res.data);
    //console.log("USER:", user);//to debug
    setTasks(res.data);
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const startTask = async (id) => {
    await api.post(`tasks/${id}/start/`);
    loadTasks();
  };

  const completeTask = async (id) => {
    await api.post(`tasks/${id}/complete/`);
    loadTasks();
  };

  /* ================= FILTERS ================= */

  const myInProgress = tasks.filter(
    t => t.status === "in_progress" && t.assigned_to === user.id
  );

  const myReady = tasks.filter(
    t => t.status === "ready" && t.assigned_to === user.id
  );

  const completed = tasks.filter(
    t => t.status === "completed" && t.assigned_to === user.id
  );

  const queue = tasks.filter(
    t => t.status === "ready"  && t.assigned_to !== user.id
  );

  const renderMyTasks = () => (
    <>
      {myInProgress.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          type="progress"
          onComplete={completeTask}
        />
      ))}

      {myReady.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          type="ready"
          onStart={startTask}
        />
      ))}
    </>
  );

  const renderCompleted = () =>
    completed.map(task => (
      <TaskCard key={task.id} task={task} type="completed" />
    ));

  const renderQueue = () => (
    <>
     {queue.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          type="ready"
          onStart={startTask}
        />
      ))}
    </>
  );
 /* const renderQueue = () =>
    queue.map(task => (
      <TaskCard key={task.id} task={task}  type="queue" />
    ));*/

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>

        {/* HEADER */}

        <View style={styles.header}>

          <Text style={styles.headerText}>My Page</Text>


          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.placeBtn}
              //onPress={ goToPlaceOrder }
              onPress={() => {
                  console.log("ORDER BUTTON CLICKED");
                  goToPlaceOrder && goToPlaceOrder();
              }}
            >
              <Text style={styles.placeText}> + Order</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
              <Text style={styles.logout}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* TAB BAR */}
        <View style={styles.tabBar}>
          <TabButton
            title="My Tasks"
            active={activeTab === "my"}
            onPress={() => setActiveTab("my")}
          />
          <TabButton
            title="Completed"
            active={activeTab === "completed"}
            onPress={() => setActiveTab("completed")}
          />
          <TabButton
            title="Queue"
            active={activeTab === "queue"}
            onPress={() => setActiveTab("queue")}
          />
        </View>

        {/* CONTENT */}
        <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
          {activeTab === "my" && renderMyTasks()}
          {activeTab === "completed" && renderCompleted()}
          {activeTab === "queue" && renderQueue()}
        </ScrollView>

      </View>
    </SafeAreaView>
  );
}

/* ================= REUSABLE CARD ================= */

function TaskCard({ task, type, onStart, onComplete }) {
  return (
    <View style={[styles.card, type === "progress" && styles.myCard]}>
      <Text style={styles.title}>{task.workflow_step_name}</Text>

      <Text style={styles.customer}>
        👤 {task.customer_name}
      </Text>

      <Text style={styles.sub}>
        📦 {task.product_name} × {task.quantity}
      </Text>

      {type === "ready" && (
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => onStart(task.id)}
        >
          <Text style={styles.buttonText}>Claim / Start</Text>
        </TouchableOpacity>
      )}

      {type === "progress" && (
        <TouchableOpacity
          style={styles.completeButton}
          onPress={() => onComplete(task.id)}
        >
          <Text style={styles.buttonText}>Complete</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

/* ================= TAB BUTTON ================= */

function TabButton({ title, active, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.tab, active && styles.activeTab]}
      onPress={onPress}
    >
      <Text style={[styles.tabText, active &&  styles.activeTabText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6f8",
    paddingHorizontal: 15,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },

  headerText: {
    fontSize: 20,
    fontWeight: "bold",
  },

  headerRight: {
    flexDirection: "row",
    alignItems: "center",

  },

  logout: {
    color: "#fff",
    fontWeight: "600",

    //color: "#dc2626",

  },
  logoutBtn: {
    backgroundColor: "#dc2626",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },

  placeBtn: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 10,
  },

  placeText: {
    color: "#fff",
    fontWeight: "600",
  },

  tabBar: {
    flexDirection: "row",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  tab: {
    flex: 1,
    paddingVertical: 12,
    //backgroundColor: "#e5e7eb",
    alignItems: "center",
    //borderRadius: 6,
    //marginRight: 5,
  },

  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: "#2563EB",
  },

  tabText: {
    fontWeight: "600",
    color: "#6B7280",
  },

  activeTabText: {
    color: "#2563EB",
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 2,
  },

  myCard: {
    borderLeftWidth: 5,
    borderLeftColor: "#16a34a",
  },

  title: {
    fontSize: 15,
    fontWeight: "bold",
  },

  sub: {
    fontSize: 13,
    color: "#555",
    marginTop: 4,
  },

  customer: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },

  startButton: {
    backgroundColor: "#2563eb",
    padding: 10,
    borderRadius: 6,
    marginTop: 8,
  },

  completeButton: {
    backgroundColor: "#16a34a",
    padding: 10,
    borderRadius: 6,
    marginTop: 8,
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
});