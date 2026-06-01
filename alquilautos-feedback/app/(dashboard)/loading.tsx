export default function DashboardLoading() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
      <div style={{
        width: 28, height: 28,
        border: "3px solid var(--border)",
        borderTopColor: "var(--primary)",
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}