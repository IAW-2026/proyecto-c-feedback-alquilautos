"use client";

import { useState } from "react";
import { PageHeader, Alert } from "@/app/components/ui";
import DebugResenas from "@/app/components/debug/DebugResenas";
import DebugModeraciones from "@/app/components/debug/DebugModeraciones";
import DebugRespuestas from "@/app/components/debug/DebugRespuestas";

const TABS = [
  { id: "resenas",      label: "⭐ Reseñas" },
  { id: "moderaciones", label: "🛡️ Moderaciones" },
  { id: "respuestas",   label: "💬 Respuestas" },
];

export default function DebugPage() {
  const [tab, setTab] = useState("resenas");

  return (
    <div>
      <PageHeader
        title="🔧 Debug — Panel de Entidades"
        subtitle="CRUD completo sobre todas las entidades de la Feedback App"
      />

      <div style={{
        background: "var(--warning-light)",
        border: "1px solid var(--warning)",
        borderRadius: "var(--radius-sm)",
        padding: "10px 14px",
        marginBottom: 20,
        fontSize: 12,
        color: "var(--warning)",
      }}>
        ⚠️ Sección de desarrollo. Las operaciones aquí son inmediatas y afectan la base de datos real.
      </div>

      <div className="tabs">
        {TABS.map(t => (
          <button key={t.id} className={`tab-btn ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "resenas" && <DebugResenas />}
      {tab === "moderaciones" && <DebugModeraciones />}
      {tab === "respuestas" && <DebugRespuestas />}
    </div>
  );
}
