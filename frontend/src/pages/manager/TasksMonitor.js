import { useEffect, useState } from "react";
import api from "../../api/api";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "../../styles/manager.css";

function TasksMonitor() {
  const [tasks, setTasks] = useState([]);

  const loadTasks = () => {
    api.get("manager/tasks/").then(res => setTasks(res.data));
  };

  useEffect(() => {
    loadTasks();
    const interval = setInterval(loadTasks, 5000);
    return () => clearInterval(interval);
  }, []);

  const getTasks = (status) => tasks.filter(t => t.status === status);

  // 🔥 DRAG HANDLER
  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const taskId = result.draggableId;
    const source = result.source.droppableId;
    const dest = result.destination.droppableId;

    if (source === dest) return;

    try {
      if (dest === "in_progress") {
        await api.post(`tasks/${taskId}/start/`);
      }

      if (dest === "completed") {
        await api.post(`tasks/${taskId}/complete/`);
      }

      loadTasks();
    } catch (err) {
      console.log("Drag action error:", err);
    }
  };

  const Column = ({ title, status }) => {
  const list = getTasks(status);

  return (
            <Droppable droppableId={status}>
              {(provided) => (
                <div
                  className="kanban-column"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <h3>
                    {title} <span className="column-count">({list.length})</span>
                  </h3>


                  {list.map((task, index) => (
                    <Draggable
                      key={task.id}
                      draggableId={String(task.id)}
                      index={index}
                    >
                      {(provided) => (
                       <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`kanban-card ${getRoleClass(task.workflow_role_name)}`}
                          style={{
                            ...provided.draggableProps.style,
                            transition: "all 0.18s ease",
                          }}
                        >

                          <div className="kanban-title">
                            {task.workflow_step_name}
                          </div>

                          <div className="kanban-sub">
                            Order #{task.order}
                          </div>
                            {getDeadlineInfo(task.delivery_date || task.order_delivery_date) && (
                              <div
                                className={`deadline-badge ${
                                  getDeadlineInfo(task.delivery_date || task.order_delivery_date).class
                                }`}
                              >
                                ⏱ {getDeadlineInfo(task.delivery_date || task.order_delivery_date).label}
                              </div>
                            )}

                          <div className="kanban-role">
                            Role: {task.workflow_role_name}
                          </div>

                         {task.assigned_to_name && (
                             <div className="kanban-user">
                               <div className="avatar-circle">
                                 {task.assigned_to_name.charAt(0).toUpperCase()}
                               </div>
                               <span>{task.assigned_to_name}</span>
                             </div>
                          )}

                        </div>
                      )}
                    </Draggable>
                  ))}

                  {provided.placeholder}
                </div>
              )}
            </Droppable>
    );
};
    // 🎨 Role → Color mapping
    const getRoleClass = (role) => {
      if (!role) return "";

      const r = role.toLowerCase();

      if (r.includes("design")) return "role-design";
      if (r.includes("print")) return "role-print";
      if (r.includes("sublimation")) return "role-sublimation";
      if (r.includes("helper")) return "role-helper";
      if (r.includes("bill")) return "role-billing";

      return "role-default";
    };

    // ⏱ Deadline badge logic
    const getDeadlineInfo = (dateStr) => {
      if (!dateStr) return null;

      const today = new Date();
      const delivery = new Date(dateStr);

      const diffDays = Math.ceil(
        (delivery - today) / (1000 * 60 * 60 * 24)
      );

      if (diffDays <= 0) return { label: "TODAY", class: "deadline-today" };
      if (diffDays === 1) return { label: "Tomorrow", class: "deadline-soon" };
      if (diffDays <= 3) return { label: `${diffDays} days`, class: "deadline-warn" };

      return { label: `${diffDays} days`, class: "deadline-normal" };
    };


  return (
    <div className="manager-page">
      <div className="manager-header">
        <h1>Live Task Monitor</h1>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-board">
          <Column title="🟡 Ready" status="ready" />
          <Column title="🔵 In Progress" status="in_progress" />
          <Column title="✅ Completed" status="completed" />
        </div>
      </DragDropContext>
    </div>
  );
}

export default TasksMonitor;
