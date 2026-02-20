const statusMap = {
  pending: { label: "Pending", color: "red" },
  ready: { label: "Ready", color: "orange" },
  in_progress: { label: "In Progress", color: "blue" },
  completed: { label: "Completed", color: "green" }
};

export default function StatusBadge({ status }) {
  const s = statusMap[status];

  return (
    <span style={{
      padding: "4px 8px",
      borderRadius: "6px",
      backgroundColor: s.color,
      color: "white",
      fontSize: "12px"
    }}>
      {s.label}
    </span>
  );
}
