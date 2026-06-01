[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/PSVgkgcZ)
# feedback

Aplicación **Feedback** del [Proyecto IAW 2026](https://iaw-2026.github.io/proyecto/) — comisión `AlquilAutos`.

Esta app corresponde al módulo de reseñas y calificaciones en los proyectos de tipo **A (Transporte)**, **B (Delivery)** y **C (Marketplace)**.

---

Enunciado completo: <https://iaw-2026.github.io/proyecto/>

---

## Deploy en Vercel

https://proyecto-c-feedback-alquilautos.vercel.app/

---

## Cuenta de administrador

| Campo | Valor |
|-------|-------|
| Email | adminfeedback+clerk_test@iaw.com |
| Contraseña | iawuser# |

---

## Instalación y desarrollo (local)

```bash
# Instalar dependencias
pnpm install

# Generar cliente de Prisma
pnpm prisma generate

# Correr en desarrollo
pnpm dev --webpack

```

---

## Descripción

Aplicación web para gestionar reseñas y calificaciones en una plataforma de alquiler de vehículos entre particulares. Su función es centralizar el feedback (reseñas moderadas, respuestas, calificaciones y resúmenes) del ecosistema.

### Secciones de la app

- **Moderación:** revisión y aprobación/rechazo de reseñas.
- **Reseñas:** ABML de reseñas (con respuestas y moderaciones) para alquiladores, propietarios y vehículos.
- **Entidades:** gestión y visualización de usuarios, propietarios y vehículos.

### Endpoints expuestos

- `/api/resena/` — Crear reseñas
- `/api/respuesta/` — Crear respuestas a reseñas.
- `/api/resena/<receptor>/{id}` — Obtener reseñas de un receptor (vehículo/propietario/reserva).
- `/api/resena/<receptor>/reserva/{id}` — Obtener reseñas de una reserva específica.
- `/api/promedio/<receptor>/{id}` — Calcular promedio de calificaciones de una entidad.
- `/api/resumen/<receptor>/{id}` — Generar un resumen del feedback de una entidad.

---

## Stack tecnológico

- Next.js 16 (TypeScript)
- Tailwind CSS
- Clerk (autenticación)
- Prisma + Neon (PostgreSQL)
- Vercel
- pnpm

---

## Variables de entorno

```env
# Clerk keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=
NEXT_PUBLIC_CLERK_SIGN_UP_URL=
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=
NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL=

# Base de datos
DATABASE_URL=

# API de Gemini
GEMINI_API_KEY=
```

---

> Nota: Actualmente la app utiliza datos mockeados para desarrollo (ver `lib/mocks.ts`).
