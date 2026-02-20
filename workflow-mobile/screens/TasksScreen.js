import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import api from "../api/api";

export default function TasksScreen({ user, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [showCompleted, setShowCompleted] = useState(false);

  const loadTasks = async () => {
    try {
      const res = await api.get("tasks/");
      setTasks(res.data || []);
    } catch (err) {
      console.log("Task load error:", err);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const startTask = async (id) => {
    await api.post(`tasks/${id}/start/`);
    loadTasks();
  };

  const completeTask = async (id) => {
    await api.post(`tasks/${id}/complete/`);
    loadTasks();
  };

  /* ===== FILTER TASKS ===== */

  const readyTasks = tasks.filter((t) => t.status === "ready");
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress");
  const completedTasks = tasks.filter((t) => t.status === "completed");

  /* ===== NEXT PRIORITY TASK ===== */

  const nextTask = readyTasks.find(
    (t) => user && t.workflow_role_name === user.role
  );

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerText}>My Tasks</Text>
        <TouchableOpacity onPress={onLogout}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* NEXT TASK */}
      {nextTask && (
        <View style={styles.nextCard}>
          <Text style={styles.nextTitle}>⭐ Next Task</Text>
          <Text style={styles.title}>{nextTask.workflow_step_name}</Text>

          <Text style={styles.customer}>
            👤 {nextTask.customer_name}
            {nextTask.customer_company
              ? ` (${nextTask.customer_company})`
              : ""}
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => startTask(nextTask.id)}
          >
            <Text style={styles.buttonText}>Start Now</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ACTIVE TASKS */}
      <Text style={styles.section}>Active Tasks</Text>

      {[...readyTasks, ...inProgressTasks].map((task) => {
        const isMyRole =
          user && task.workflow_role_name === user.role;

        return (
          <View
            key={task.id}
            style={[styles.card, isMyRole && styles.myRoleCard]}
          >
            <Text style={styles.title}>{task.workflow_step_name}</Text>

            <Text style={styles.customer}>
              👤 {task.customer_name}
              {task.customer_company
                ? ` (${task.customer_company})`
                : ""}
            </Text>

            <Text style={styles.sub}>
              📦 {task.product_name} × {task.quantity}
            </Text>

            <Text style={styles.sub}>
              Status:{" "}
              <Text style={styles[task.status]}>
                {task.status.toUpperCase()}
              </Text>
            </Text>

            {task.assigned_to_name && (
              <Text style={styles.assigned}>
                👷 {task.assigned_to_name}
              </Text>
            )}

            {/* ACTIONS */}
            {task.status === "ready" && (
              <TouchableOpacity
                style={styles.button}
                onPress={() => startTask(task.id)}
              >
                <Text style={styles.buttonText}>Claim</Text>
              </TouchableOpacity>
            )}

            {task.status === "in_progress" &&
              user &&
              task.assigned_to === user.id && (
                <TouchableOpacity
                  style={styles.completeButton}
                  onPress={() => completeTask(task.id)}
                >
                  <Text style={styles.buttonText}>Complete</Text>
                </TouchableOpacity>
              )}
          </View>
        );
      })}

      {/* COMPLETED TOGGLE */}
      <TouchableOpacity
        onPress={() => setShowCompleted(!showCompleted)}
      >
        <Text style={styles.toggle}>
          {showCompleted ? "Hide Completed" : "Show Completed"}
        </Text>
      </TouchableOpacity>

      {showCompleted &&
        completedTasks.map((task) => (
          <View key={task.id} style={styles.completedCard}>
            <Text>{task.workflow_step_name}</Text>
          </View>
        ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f4f6f8",
    padding: 12,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  headerText: {
    fontSize: 22,
    fontWeight: "bold",
  },

  logout: {
    color: "#d9534f",
    fontWeight: "600",
    fontSize: 16,
  },

  section: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
  },

  nextCard: {
    backgroundColor: "#ecfdf5",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#10b981",
  },

  nextTitle: {
    fontWeight: "bold",
    marginBottom: 5,
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
  },

  myRoleCard: {
    borderLeftWidth: 5,
    borderLeftColor: "#28a745",
  },

  title: {
    fontSize: 16,
    fontWeight: "bold",
  },

  sub: {
    fontSize: 13,
    color: "#555",
  },

  assigned: {
    marginTop: 4,
    fontStyle: "italic",
  },

  customer: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
    color: "#111827",
  },

  ready: {
    color: "#f0ad4e",
    fontWeight: "bold",
  },

  in_progress: {
    color: "#0275d8",
    fontWeight: "bold",
  },

  completed: {
    color: "#777",
    fontWeight: "bold",
  },

  button: {
    backgroundColor: "#0275d8",
    padding: 10,
    borderRadius: 6,
    marginTop: 10,
  },

  completeButton: {
    backgroundColor: "#5cb85c",
    padding: 10,
    borderRadius: 6,
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },

  toggle: {
    color: "#2563eb",
    marginVertical: 15,
    textAlign: "center",
    fontWeight: "600",
  },

  completedCard: {
    backgroundColor: "#f3f4f6",
    padding: 10,
    borderRadius: 8,
    marginBottom: 5,
  },
});
