import type { PostulanteDto } from "../types/Postulante";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

//  Crear postulante
export const crearPostulante = async (postulante: PostulanteDto) => {
  const response = await fetch(`${API_URL}/postulantes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(postulante),
  });

  if (!response.ok) {
    throw new Error("Error al crear postulante");
  }
  return response;
};

//  Asignar carreras al postulante
export const asignarCarreras = async (postulanteId: number, carreras: string[]) => {
  const response = await fetch(`${API_URL}/postulante_carrera/${postulanteId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ carreras }),
  });

  if (!response.ok) {
    throw new Error("Error al asignar carreras");
  }
  return response;
};
