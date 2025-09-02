// services/postulanteService.ts
import type { PostulanteDto } from "../types/Postulante";

export const crearPostulante = async (postulante: PostulanteDto) => {
  const response = await fetch("http://localhost:8080/postulantes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postulante),
  });

  if (!response.ok) {
    throw new Error("Error al crear postulante");
  }
  return response;
};

export const asignarCarreras = async (postulanteId: number, carreras: string[]) => {
  const response = await fetch(`http://localhost:8080/postulante_carrera/${postulanteId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ carreras }),
  });

  if (!response.ok) {
    throw new Error("Error al asignar carreras");
  }
  return response;
};
