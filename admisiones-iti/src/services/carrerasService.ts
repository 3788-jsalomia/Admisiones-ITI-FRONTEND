// services/carrerasService.ts
import type { Carrera } from "../types/Carrera";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api/carreras";

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error ${res.status} en ${endpoint}: ${text || res.statusText}`);
  }

  return res.json();
}

/**
 * Listar todas las carreras
 */
export async function getCarreras(): Promise<Carrera[]> {
  return fetchApi<Carrera[]>("", { method: "GET" });
}

/**
 * Obtener carrera por ID
 */
export async function getCarreraById(id: number): Promise<Carrera> {
  return fetchApi<Carrera>(`/${id}`, { method: "GET" });
}

/**
 * Crear nueva carrera
 */
export async function crearCarrera(carrera: Carrera): Promise<Carrera> {
  return fetchApi<Carrera>("", {
    method: "POST",
    body: JSON.stringify(carrera),
  });
}

/**
 * Actualizar carrera existente
 */
export async function actualizarCarrera(id: number, carrera: Carrera): Promise<Carrera> {
  return fetchApi<Carrera>(`/${id}`, {
    method: "PUT",
    body: JSON.stringify(carrera),
  });
}

/**
 * Eliminar carrera por ID
 */
export async function eliminarCarrera(id: number): Promise<void> {
  await fetchApi<void>(`/${id}`, {
    method: "DELETE",
  });
}

/**
 * Crear carrera con estructura completa
 */
export async function crearCarreraConEstructura(carrera: Carrera): Promise<string> {
  return fetchApi<string>("/estructura-completa", {
    method: "POST",
    body: JSON.stringify(carrera),
  });
}
