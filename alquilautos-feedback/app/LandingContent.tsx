import Link from "next/link";

export default function LandingContent() {
  return (
    <main style={{
      minHeight: "100vh",
      background: "var(--bg)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
    }}>
      <div style={{ textAlign: "center", marginBottom: 56 }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>🚗</div>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.5px" }}>
          AlquilAutos
        </h1>
        <p style={{ fontSize: 16, color: "var(--primary)", fontWeight: 600, marginTop: 4 }}>
          Feedback App
        </p>
        <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 10, maxWidth: 380 }}>
          Panel de gestión de reseñas, moderación y calificaciones del sistema de alquiler de autos.
        </p>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 16,
        width: "100%",
        maxWidth: 680,
        marginBottom: 48,
      }}>
        {[
          { icon: "🛡️", title: "Moderación",  desc: "Revisá y aprobá reseñas antes de que sean públicas" },
          { icon: "⭐", title: "Reseñas",     desc: "Gestioná el historial completo de calificaciones" },
          { icon: "🤖", title: "Análisis IA", desc: "Resúmenes automáticos de las reseñas por entidad" },
        ].map(f => (
          <div key={f.title} style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "20px 18px",
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{f.icon}</div>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{f.title}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>{f.desc}</div>
          </div>
        ))}
      </div>

      <Link href="/sign-in" style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        background: "var(--primary)", color: "#fff",
        padding: "13px 32px", borderRadius: "var(--radius)",
        fontSize: 15, fontWeight: 600, textDecoration: "none",
      }}>
        Ingresar al panel →
      </Link>

      <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 20 }}>
        Acceso restringido · Solo usuarios autorizados
      </p>
    </main>
  );
}