import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function SignInPage() {
  return (
    <main style={{
      minHeight: "100vh",
      background: "var(--bg)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 16px",
    }}>
      {/* Branding sobre el form */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{ fontSize: 32 }}>🚗</span>
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginTop: 4 }}>
            AlquilAutos <span style={{ color: "var(--primary)" }}>Feedback</span>
          </div>
        </Link>
      </div>

      {/* Clerk SignIn con tema oscuro */}
      <SignIn
        appearance={{
          variables: {
            colorPrimary:         "#6366f1",
            colorBackground:      "#1a1d27",
            colorInputBackground: "#0f1117",
            colorInputText:       "#e2e8f0",
            colorText:            "#e2e8f0",
            colorTextSecondary:   "#64748b",
            colorNeutral:         "#94a3b8",
            colorDanger:          "#ef4444",
            colorSuccess:         "#10b981",
            borderRadius:         "8px",
            fontFamily:           "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            fontSize:             "14px",
          },
          elements: {
            card: {
              background:   "#1a1d27",
              border:       "1px solid #2a2d3e",
              boxShadow:    "0 8px 32px rgba(0,0,0,0.5)",
              borderRadius: "12px",
            },
            headerTitle:     { color: "#e2e8f0", fontWeight: "700" },
            headerSubtitle:  { color: "#64748b" },
            formFieldLabel:  { color: "#94a3b8", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" },
            formFieldInput:  { background: "#0f1117", border: "1px solid #2a2d3e", color: "#e2e8f0" },
            footerActionLink:{ color: "#6366f1" },
            // Ocultar el link de registro
            footerAction:    { display: "none" },
            lastAuthenticationStrategyBadge: {color: "#64748b"},
            identityPreviewText: {color: "#64748b"},
            dividerText: {color: "#64748b"}
          },
        }}
      />
    </main>
  );
}