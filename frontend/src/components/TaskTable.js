import StatusBadge from "./StatusBadge";

export default function TaskTable({ tasks }) {
  return (
    <table width="100%" border="1" cellPadding="8">
      <thead>
        <tr>
          <th>Order</th>
          <th>Product</th>
          <th>Step</th>
          <th>Worker</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {tasks.map(task => (
          <tr key={task.id}>
            <td>{task.order_id}</td>
            <td>{task.product}</td>
            <td>{task.step_name}</td>
            <td>{task.assigned_to || "—"}</td>
            <td><StatusBadge status={task.status} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
