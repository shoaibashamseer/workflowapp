import { useEffect,useCallback, useState } from "react";
import {
  fetchTasksByRole,
  startTask,
  completeTask
} from "../api/workerTasks";

function WorkerDashboard() {

  const [tasks, setTasks] = useState([]);
  const myUserId = Number(localStorage.getItem("user_id"));
  const myRole = localStorage.getItem("role");
  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
    };


  const loadTasks =  useCallback(async () => {
    fetchTasksByRole(myRole).then(setTasks);
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);


  return (

    <div style={{ padding: "15px" }}>
      <h2>My Tasks</h2>
      <button onClick={logout}>Logout</button>
      <p>Logged in as: {localStorage.getItem("role")}</p>
      {tasks.length === 0 && <p>No tasks assigned</p>}

      {tasks.map(task => (
        <div
          key={task.id}
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            marginBottom: "10px",
            background:
              task.status === "ready"
                ? "#fff3cd"
                : task.status === "in_progress"
                ? "#d1ecf1"
                : "#e2e3e5"
          }}
        >


          <strong>{task.workflow_step_name}</strong><br/>
          <p>Status: {task.status}</p><br/>
          Assigned: {task.assigned_to_name || "—"}

          {task.status === "ready" && (
            <button onClick={() => startTask(task.id)}>
                Start
            </button>
            )}

          {task.status === "in_progress" &&
            task.assigned_to_name === myUserId && (
                <button onClick={() => completeTask(task.id)}>
                 Complete
                </button>
            )}
        </div>
      ))}
    </div>
  );
}

export default WorkerDashboard;
