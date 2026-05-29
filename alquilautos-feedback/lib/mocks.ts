// ============================================================
// Mocks para las APIs de otras aplicaciones del sistema
// Simula las respuestas de: Buyer App, Seller App, Shipping App, Payments App
// Formato según contrato definido en 1.3 — Diseño de APIs Inter-Servicios
// ============================================================

export interface Alquilador {
  idAlquilador: number;
  email: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  dni: string;
  licenciaConducir: string;
  direccion: string;
  idLista: number;
}

export interface Propietario {
  idPropietario: number;
  email: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  dni: string;
  direccion: string;
}

export interface Vehiculo {
  idVehiculo: number;
  idPropietario: number;
  marca: string;
  modelo: string;
  precio: number;
  fotos: string;
}

export interface Reserva {
  idReserva: number;
  idVehiculo: number;
  idPropietario: number;
  idAlquilador: number;
  fechaInicio: string;
  fechaFinal: string;
  estado: "Pendiente" | "Aceptada" | "Rechazada";
}

// ── Alquiladores (Buyer App) ──────────────────────────────
const MOCK_ALQUILADORES: Record<number, Alquilador> = {
  1: { idAlquilador: 1, email: "juan.perez@mail.com", nombre: "Juan", apellido: "Pérez", fechaNacimiento: "15-03-1990", dni: "28456789", licenciaConducir: "LC001234", direccion: "Av. Alem 500, Bahía Blanca", idLista: 10 },
  2: { idAlquilador: 2, email: "maria.garcia@mail.com", nombre: "María", apellido: "García", fechaNacimiento: "22-07-1985", dni: "24789123", licenciaConducir: "LC005678", direccion: "Calle Mitre 123, Buenos Aires", idLista: 11 },
  3: { idAlquilador: 3, email: "carlos.lopez@mail.com", nombre: "Carlos", apellido: "López", fechaNacimiento: "10-11-1992", dni: "32145678", licenciaConducir: "LC009012", direccion: "San Martín 200, Rosario", idLista: 12 },
  4: { idAlquilador: 4, email: "ana.martinez@mail.com", nombre: "Ana", apellido: "Martínez", fechaNacimiento: "05-01-1988", dni: "26321456", licenciaConducir: "LC003456", direccion: "Belgrano 789, Córdoba", idLista: 13 },
  5: { idAlquilador: 5, email: "pedro.gonzalez@mail.com", nombre: "Pedro", apellido: "González", fechaNacimiento: "18-09-1995", dni: "35678901", licenciaConducir: "LC007890", direccion: "Rivadavia 340, Mendoza", idLista: 14 },
  6: { idAlquilador: 6, email: "laura.sanchez@mail.com", nombre: "Laura", apellido: "Sánchez", fechaNacimiento: "30-04-1991", dni: "29012345", licenciaConducir: "LC001357", direccion: "Independencia 450, La Plata", idLista: 15 },
  7: { idAlquilador: 7, email: "miguel.ramirez@mail.com", nombre: "Miguel", apellido: "Ramírez", fechaNacimiento: "12-12-1987", dni: "25678012", licenciaConducir: "LC002468", direccion: "Urquiza 112, Salta", idLista: 16 },
  8: { idAlquilador: 8, email: "sofia.torres@mail.com", nombre: "Sofía", apellido: "Torres", fechaNacimiento: "28-06-1993", dni: "33456789", licenciaConducir: "LC008024", direccion: "Moreno 67, Mar del Plata", idLista: 17 },
};

// ── Propietarios (Seller App) ────────────────────────────
const MOCK_PROPIETARIOS: Record<number, Propietario> = {
  1: { idPropietario: 1, email: "roberto.diaz@mail.com", nombre: "Roberto", apellido: "Díaz", fechaNacimiento: "10-05-1975", dni: "18234567", direccion: "Yrigoyen 100, Bahía Blanca" },
  2: { idPropietario: 2, email: "claudia.villa@mail.com", nombre: "Claudia", apellido: "Villa", fechaNacimiento: "20-08-1980", dni: "21345678", direccion: "O'Higgins 300, Buenos Aires" },
  3: { idPropietario: 3, email: "marcelo.ruiz@mail.com", nombre: "Marcelo", apellido: "Ruiz", fechaNacimiento: "15-02-1970", dni: "14567890", direccion: "Corrientes 500, Rosario" },
  4: { idPropietario: 4, email: "patricia.mora@mail.com", nombre: "Patricia", apellido: "Mora", fechaNacimiento: "03-11-1978", dni: "20456789", direccion: "Tucumán 200, Córdoba" },
  5: { idPropietario: 5, email: "fernando.silva@mail.com", nombre: "Fernando", apellido: "Silva", fechaNacimiento: "25-07-1972", dni: "16789012", direccion: "Sarmiento 80, Mendoza" },
};

// ── Vehículos (Seller App) ───────────────────────────────
const MOCK_VEHICULOS: Record<number, Vehiculo> = {
  1: { idVehiculo: 1, idPropietario: 1, marca: "Toyota", modelo: "Corolla", precio: 8000, fotos: "https://placehold.co/400x300?text=Toyota+Corolla" },
  2: { idVehiculo: 2, idPropietario: 1, marca: "Ford", modelo: "Focus", precio: 6500, fotos: "https://placehold.co/400x300?text=Ford+Focus" },
  3: { idVehiculo: 3, idPropietario: 2, marca: "Chevrolet", modelo: "Cruze", precio: 7000, fotos: "https://placehold.co/400x300?text=Chevrolet+Cruze" },
  4: { idVehiculo: 4, idPropietario: 3, marca: "Honda", modelo: "Civic", precio: 9000, fotos: "https://placehold.co/400x300?text=Honda+Civic" },
  5: { idVehiculo: 5, idPropietario: 4, marca: "Volkswagen", modelo: "Golf", precio: 7500, fotos: "https://placehold.co/400x300?text=VW+Golf" },
  6: { idVehiculo: 6, idPropietario: 5, marca: "Renault", modelo: "Megane", precio: 5500, fotos: "https://placehold.co/400x300?text=Renault+Megane" },
};

// ── Reservas (Seller App) ────────────────────────────────
const MOCK_RESERVAS: Record<number, Reserva> = {};
const ESTADOS: Reserva["estado"][] = ["Pendiente", "Aceptada", "Rechazada"];
for (let i = 1; i <= 20; i++) {
  MOCK_RESERVAS[i] = {
    idReserva: i,
    idVehiculo: ((i - 1) % 6) + 1,
    idPropietario: ((i - 1) % 5) + 1,
    idAlquilador: ((i - 1) % 8) + 1,
    fechaInicio: `${String(i % 28 + 1).padStart(2, "0")}-06-2026`,
    fechaFinal: `${String(i % 28 + 5).padStart(2, "0")}-06-2026`,
    estado: ESTADOS[i % 3],
  };
}

// ── Funciones de acceso (simulan llamadas HTTP) ──────────

export function getMockAlquilador(id: number): Alquilador | null {
  return MOCK_ALQUILADORES[id] ?? null;
}

export function getMockPropietario(id: number): Propietario | null {
  return MOCK_PROPIETARIOS[id] ?? null;
}

export function getMockVehiculo(id: number): Vehiculo | null {
  return MOCK_VEHICULOS[id] ?? null;
}

export function getMockReserva(id: number): Reserva | null {
  return MOCK_RESERVAS[id] ?? null;
}

export function getAllMockAlquiladores(): Alquilador[] {
  return Object.values(MOCK_ALQUILADORES);
}

export function getAllMockPropietarios(): Propietario[] {
  return Object.values(MOCK_PROPIETARIOS);
}

export function getAllMockVehiculos(): Vehiculo[] {
  return Object.values(MOCK_VEHICULOS);
}

export function getAllMockReservas(): Reserva[] {
  return Object.values(MOCK_RESERVAS);
}
