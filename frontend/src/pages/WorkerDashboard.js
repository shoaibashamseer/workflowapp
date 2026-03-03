import { useEffect, useState, useCallback } from "react";
import api from "../api/api";
import "../styles/worker.css";

export default function WorkerDashboard() {
  const [tasks, setTasks] = useState([]);
  const [showOthers, setShowOthers] = useState(false);

  //const role = localStorage.getItem("role");
  const username = localStorage.getItem("username");

  const loadTasks = useCallback(async () => {
    const res = await api.get("tasks/");
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

  const isUrgent = (task) => {
    if (!task.delivery_date) return false;
    const today = new Date();
    const delivery = new Date(task.delivery_date);
    const diff = (delivery - today) / (1000 * 60 * 60 * 24);
    return diff <= 1;
  };

  // 🥇 My active tasks first
  const myInProgress = tasks.filter(
    (t) =>
      t.status === "in_progress" &&
      t.assigned_to_name === username
  );

  // 🥈 Ready tasks sorted by delivery
  const readyTasks = tasks
    .filter((t) => t.status === "ready")
    .sort((a, b) =>
      new Date(a.delivery_date) - new Date(b.delivery_date)
    );

  // 🥉 Others in progress
  const othersInProgress = tasks.filter(
    (t) =>
      t.status === "in_progress" &&
      t.assigned_to_name !== username
  );

  return (
    <div className="worker-page">
      <div className="worker-header">
        <h1>Worker Dashboard</h1>
        <button
          className="logout-btn"
          onClick={() => {
            localStorage.clear();
            window.location.href = "/";
          }}
        >
          Logout
        </button>
      </div>

      {/* 🥇 MY IN PROGRESS */}
      {myInProgress.length > 0 && (
        <>
          <h2>🔄 Finish Your Work</h2>
          {myInProgress.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isUrgent={isUrgent(task)}
              onComplete={completeTask}
              isMine
            />
          ))}
        </>
      )}

      {/* 🥈 READY TASKS */}
      <h2>🆕 Available Tasks</h2>
      {readyTasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          isUrgent={isUrgent(task)}
          onStart={startTask}
        />
      ))}

      {/* 🥉 OTHERS */}
      <button
        className="toggle-btn"
        onClick={() => setShowOthers(!showOthers)}
      >
        {showOthers ? "Hide Other Workers Tasks" : "Show Other Workers Tasks"}
      </button>

      {showOthers &&
        othersInProgress.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            isUrgent={isUrgent(task)}
            readOnly
          />
        ))}
    </div>
  );
}

/* ================= Task Card Component ================= */

function TaskCard({
  task,
  isUrgent,
  onStart,
  onComplete,
  isMine,
  readOnly,
}) {
  return (
    <div
      className={`task-card
        ${isMine ? "my-role" : ""}
        ${isUrgent ? "urgent" : ""}`}
    >
      <h3>{task.workflow_step_name}</h3>

      <p>
        <strong>Customer:</strong> {task.customer_name}
        {task.customer_company && ` (${task.customer_company})`}
      </p>

      <p>
        <strong>Product:</strong> {task.product_name} × {task.quantity}
      </p>

      <p>
        <strong>Status:</strong> {task.status.toUpperCase()}
      </p>

      {task.assigned_to_name && (
        <p>
          <strong>Assigned:</strong> {task.assigned_to_name}
        </p>
      )}

      {!readOnly && task.status === "ready" && (
        <button
          className="claim-btn"
          onClick={() => onStart(task.id)}
        >
          Claim / Start
        </button>
      )}

      {!readOnly &&
        task.status === "in_progress" &&
        isMine && (
          <button
            className="complete-btn"
            onClick={() => onComplete(task.id)}
          >
            Complete
          </button>
        )}
    </div>
  );
}