export interface GeminiModerationResult {
  decision: "APROBADA" | "RECHAZADA" | "PENDIENTE";
  motivo: string;
}

export async function evaluarResenaConGemini(
  descripcion: string,
  calificacionGeneral: number
): Promise<GeminiModerationResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { decision: "PENDIENTE", motivo: "No se pudo evaluar automáticamente: API key no configurada" };
  }

  const prompt = `Eres un moderador de reseñas de un sistema de alquiler de autos llamado AlquilAutos. Debes evaluar si la siguiente reseña debe ser aprobada o rechazada.

Una reseña debe ser RECHAZADA si:
- Contiene lenguaje ofensivo, discriminatorio o inapropiado
- Es spam o publicidad
- No tiene relación con el servicio de alquiler de autos
- Contiene información personal de terceros (nombres, direcciones, teléfonos, etc.)
- Es claramente falsa o maliciosa
- La calificacion no coincide con la descripcion

Una reseña debe ser APROBADA si:
- Es una opinión genuina sobre el servicio
- Aunque sea negativa, expresa una experiencia real del usuario
- Es constructiva y relevante

Una reseña debe seguir PENDIENTE si:
- La reseña es ambigua, confusa o no se entiende el contexto.
- Falta información para verificar si es una experiencia real (ej: "No sé si era el auto que reservé").

SI TIENES DUDAS sobre si aprobar o rechazar, responde PENDIENTE.

Reseña a evaluar:
Calificación: ${calificacionGeneral}/5
Descripción: "${descripcion}"

Responde ÚNICAMENTE con un objeto JSON en una sola línea con el siguiente formato (sin texto adicional, sin markdown):
{"decision": "APROBADA"|"RECHAZADA"|"PENDIENTE", "motivo": "Explicación breve de por qué"}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 200, temperature: 0.2 },
        }),
      }
    );

    if (!response.ok) {
      console.error(`Gemini API error: ${response.status}`);
      return { decision: "PENDIENTE", motivo: "Error al comunicarse con el servicio de moderación automática" };
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { decision: "PENDIENTE", motivo: "No se pudo interpretar la respuesta del moderador automático" };
    }

    const result = JSON.parse(jsonMatch[0]) as GeminiModerationResult;

    if (!["APROBADA", "RECHAZADA", "PENDIENTE"].includes(result.decision)) {
      return { decision: "PENDIENTE", motivo: "Respuesta inesperada del moderador automático" };
    }

    return result;
  } catch (error) {
    console.error("Error en evaluarResenaConGemini:", error);
    return { decision: "PENDIENTE", motivo: "Error en la moderación automática" };
  }
}
