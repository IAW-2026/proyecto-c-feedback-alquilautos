// ============================================================
// Mocks para las APIs de otras aplicaciones del sistema
// Simula las respuestas de: Buyer App, Seller App, Shipping App, Payments App
// Formato según contrato definido en 1.3 — Diseño de APIs Inter-Servicios
// ============================================================

export interface Alquilador {
  idAlquilador: string;
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
  idPropietario: string;
  email: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  dni: string;
  direccion: string;
}

export interface Vehiculo {
  idVehiculo: string;
  idPropietario: string;
  marca: string;
  modelo: string;
  precio: number;
  fotos: string;
}

export interface Reserva {
  idReserva: string;
  idVehiculo: string;
  idPropietario: string;
  idAlquilador: string;
  fechaInicio: string;
  fechaFinal: string;
  estado: "Pendiente" | "Aceptada" | "Rechazada";
}

// ── Alquiladores (Buyer App) ──────────────────────────────
const MOCK_ALQUILADORES: Record<string, Alquilador> = {
  "user_3Dmf9HwdoxxklMpbBR3spfNw8s1": { idAlquilador: "user_3Dmf9HwdoxxklMpbBR3spfNw8s1", email: "juan.perez@mail.com", nombre: "Juan", apellido: "Pérez", fechaNacimiento: "15-03-1990", dni: "28456789", licenciaConducir: "LC001234", direccion: "Av. Alem 500, Bahía Blanca", idLista: 10 },
  "user_3Dmf9HwdoxxklMpbBR3spfNw8s2": { idAlquilador: "user_3Dmf9HwdoxxklMpbBR3spfNw8s2", email: "maria.garcia@mail.com", nombre: "María", apellido: "García", fechaNacimiento: "22-07-1985", dni: "24789123", licenciaConducir: "LC005678", direccion: "Calle Mitre 123, Buenos Aires", idLista: 11 },
  "user_3Dmf9HwdoxxklMpbBR3spfNw8s3": { idAlquilador: "user_3Dmf9HwdoxxklMpbBR3spfNw8s3", email: "carlos.lopez@mail.com", nombre: "Carlos", apellido: "López", fechaNacimiento: "10-11-1992", dni: "32145678", licenciaConducir: "LC009012", direccion: "San Martín 200, Rosario", idLista: 12 },
  "user_3Dmf9HwdoxxklMpbBR3spfNw8s4": { idAlquilador: "user_3Dmf9HwdoxxklMpbBR3spfNw8s4", email: "ana.martinez@mail.com", nombre: "Ana", apellido: "Martínez", fechaNacimiento: "05-01-1988", dni: "26321456", licenciaConducir: "LC003456", direccion: "Belgrano 789, Córdoba", idLista: 13 },
  "user_3Dmf9HwdoxxklMpbBR3spfNw8s5": { idAlquilador: "user_3Dmf9HwdoxxklMpbBR3spfNw8s5", email: "pedro.gonzalez@mail.com", nombre: "Pedro", apellido: "González", fechaNacimiento: "18-09-1995", dni: "35678901", licenciaConducir: "LC007890", direccion: "Rivadavia 340, Mendoza", idLista: 14 },
  "user_3Dmf9HwdoxxklMpbBR3spfNw8s6": { idAlquilador: "user_3Dmf9HwdoxxklMpbBR3spfNw8s6", email: "laura.sanchez@mail.com", nombre: "Laura", apellido: "Sánchez", fechaNacimiento: "30-04-1991", dni: "29012345", licenciaConducir: "LC001357", direccion: "Independencia 450, La Plata", idLista: 15 },
  "user_3Dmf9HwdoxxklMpbBR3spfNw8s7": { idAlquilador: "user_3Dmf9HwdoxxklMpbBR3spfNw8s7", email: "miguel.ramirez@mail.com", nombre: "Miguel", apellido: "Ramírez", fechaNacimiento: "12-12-1987", dni: "25678012", licenciaConducir: "LC002468", direccion: "Urquiza 112, Salta", idLista: 16 },
  "user_3Dmf9HwdoxxklMpbBR3spfNw8s8": { idAlquilador: "user_3Dmf9HwdoxxklMpbBR3spfNw8s8", email: "sofia.torres@mail.com", nombre: "Sofía", apellido: "Torres", fechaNacimiento: "28-06-1993", dni: "33456789", licenciaConducir: "LC008024", direccion: "Moreno 67, Mar del Plata", idLista: 17 },
};

// ── Propietarios (Seller App) ────────────────────────────
const MOCK_PROPIETARIOS: Record<string, Propietario> = {
  "user_345fgwergoxxklMpbBR3spfNw7j1": { idPropietario: "user_345fgwergoxxklMpbBR3spfNw7j1", email: "roberto.diaz@mail.com", nombre: "Roberto", apellido: "Díaz", fechaNacimiento: "10-05-1975", dni: "18234567", direccion: "Yrigoyen 100, Bahía Blanca" },
  "user_345fgwergoxxklMpbBR3spfNw7j2": { idPropietario: "user_345fgwergoxxklMpbBR3spfNw7j2", email: "claudia.villa@mail.com", nombre: "Claudia", apellido: "Villa", fechaNacimiento: "20-08-1980", dni: "21345678", direccion: "O'Higgins 300, Buenos Aires" },
  "user_345fgwergoxxklMpbBR3spfNw7j3": { idPropietario: "user_345fgwergoxxklMpbBR3spfNw7j3", email: "marcelo.ruiz@mail.com", nombre: "Marcelo", apellido: "Ruiz", fechaNacimiento: "15-02-1970", dni: "14567890", direccion: "Corrientes 500, Rosario" },
  "user_345fgwergoxxklMpbBR3spfNw7j4": { idPropietario: "user_345fgwergoxxklMpbBR3spfNw7j4", email: "patricia.mora@mail.com", nombre: "Patricia", apellido: "Mora", fechaNacimiento: "03-11-1978", dni: "20456789", direccion: "Tucumán 200, Córdoba" },
  "user_345fgwergoxxklMpbBR3spfNw7j5": { idPropietario: "user_345fgwergoxxklMpbBR3spfNw7j5", email: "fernando.silva@mail.com", nombre: "Fernando", apellido: "Silva", fechaNacimiento: "25-07-1972", dni: "16789012", direccion: "Sarmiento 80, Mendoza" },
};

// ── Vehículos (Seller App) ───────────────────────────────
const MOCK_VEHICULOS: Record<string, Vehiculo> = {
  "veh_1f3a2a71-2d4d-4d7f-b3d8-374fd5e2a1f1": { idVehiculo: "veh_1f3a2a71-2d4d-4d7f-b3d8-374fd5e2a1f1", idPropietario: "user_345fgwergoxxklMpbBR3spfNw7j1", marca: "Toyota", modelo: "Corolla", precio: 8000, fotos: "https://placehold.co/400x300?text=Toyota+Corolla" },
  "veh_8d6f0c22-5c98-4fdf-8e8f-2b30ab4b15d0": { idVehiculo: "veh_8d6f0c22-5c98-4fdf-8e8f-2b30ab4b15d0", idPropietario: "user_345fgwergoxxklMpbBR3spfNw7j1", marca: "Ford", modelo: "Focus", precio: 6500, fotos: "https://placehold.co/400x300?text=Ford+Focus" },
  "veh_3c5e4f99-7b1a-49de-bb2b-5c6b8ea9a23d": { idVehiculo: "veh_3c5e4f99-7b1a-49de-bb2b-5c6b8ea9a23d", idPropietario: "user_345fgwergoxxklMpbBR3spfNw7j2", marca: "Chevrolet", modelo: "Cruze", precio: 7000, fotos: "https://placehold.co/400x300?text=Chevrolet+Cruze" },
  "veh_50b4d328-e2a0-4520-a5b9-89a28e7b2c82": { idVehiculo: "veh_50b4d328-e2a0-4520-a5b9-89a28e7b2c82", idPropietario: "user_345fgwergoxxklMpbBR3spfNw7j2", marca: "Fiat", modelo: "Cronos", precio: 5800, fotos: "https://placehold.co/400x300?text=Fiat+Cronos" },
  "veh_9a6e4fa4-6c37-44b1-b69d-7d1d8c8f3c3a": { idVehiculo: "veh_9a6e4fa4-6c37-44b1-b69d-7d1d8c8f3c3a", idPropietario: "user_345fgwergoxxklMpbBR3spfNw7j3", marca: "Honda", modelo: "Civic", precio: 9000, fotos: "https://placehold.co/400x300?text=Honda+Civic" },
  "veh_1c2d3e44-5b6f-47f8-a993-1eef1c47b5a5": { idVehiculo: "veh_1c2d3e44-5b6f-47f8-a993-1eef1c47b5a5", idPropietario: "user_345fgwergoxxklMpbBR3spfNw7j3", marca: "Peugeot", modelo: "208", precio: 6200, fotos: "https://placehold.co/400x300?text=Peugeot+208" },
  "veh_2b4d5f66-8a7c-41db-b3f8-9f9d5c6a4b1c": { idVehiculo: "veh_2b4d5f66-8a7c-41db-b3f8-9f9d5c6a4b1c", idPropietario: "user_345fgwergoxxklMpbBR3spfNw7j4", marca: "Volkswagen", modelo: "Golf", precio: 7500, fotos: "https://placehold.co/400x300?text=VW+Golf" },
  "veh_7c8d9e20-3b2a-4c1f-8a0f-6d3b5e6f7a8b": { idVehiculo: "veh_7c8d9e20-3b2a-4c1f-8a0f-6d3b5e6f7a8b", idPropietario: "user_345fgwergoxxklMpbBR3spfNw7j4", marca: "Jeep", modelo: "Renegade", precio: 9500, fotos: "https://placehold.co/400x300?text=Jeep+Renegade" },
  "veh_4e5f6a77-6b0c-4d1a-8e0f-2b4c6d7e8f9a": { idVehiculo: "veh_4e5f6a77-6b0c-4d1a-8e0f-2b4c6d7e8f9a", idPropietario: "user_345fgwergoxxklMpbBR3spfNw7j5", marca: "Renault", modelo: "Megane", precio: 5500, fotos: "https://placehold.co/400x300?text=Renault+Megane" },
  "veh_8f9a0b11-2c3d-4e5f-8a9b-0c1d2e3f4a5b": { idVehiculo: "veh_8f9a0b11-2c3d-4e5f-8a9b-0c1d2e3f4a5b", idPropietario: "user_345fgwergoxxklMpbBR3spfNw7j5", marca: "Nissan", modelo: "Sentra", precio: 7800, fotos: "https://placehold.co/400x300?text=Nissan+Sentra" },
};

// ── Reservas (Seller App) ────────────────────────────────
const MOCK_RESERVAS: Record<string, Reserva> = {};
const ESTADOS: Reserva["estado"][] = ["Pendiente", "Aceptada", "Rechazada"];
for (let i = 1; i <= 20; i++) {
  const key = `res_${i}`;
  MOCK_RESERVAS[key] = {
    idReserva: key,
    idVehiculo: Object.keys(MOCK_VEHICULOS)[(i - 1) % Object.keys(MOCK_VEHICULOS).length],
    idPropietario: `user_${((i - 1) % 5) + 11}`,
    idAlquilador: `user_${((i - 1) % 8) + 1}`,
    fechaInicio: `${String(i % 28 + 1).padStart(2, "0")}-06-2026`,
    fechaFinal: `${String(i % 28 + 5).padStart(2, "0")}-06-2026`,
    estado: ESTADOS[i % 3],
  };
}

// ── Funciones de acceso (simulan llamadas HTTP) ──────────

export function getMockAlquilador(id: string): Alquilador | null {
  return MOCK_ALQUILADORES[id] ?? null;
}

export function getMockPropietario(id: string): Propietario | null {
  return MOCK_PROPIETARIOS[id] ?? null;
}

export function getMockVehiculo(id: string): Vehiculo | null {
  return MOCK_VEHICULOS[id] ?? null;
}

export function getMockReserva(id: string): Reserva | null {
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
