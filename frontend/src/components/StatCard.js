export default function StatCard({ title, value }) {
  return (
    <div className="stat-card">
      <div className="stat-value">{value}</div>
      <div className="stat-title">{title}</div>
    </div>
  );
}
