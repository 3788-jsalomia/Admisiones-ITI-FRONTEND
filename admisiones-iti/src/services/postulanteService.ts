import type { PostulanteDto } from "../types/Postulante";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export const crearPostulante = async (postulante: PostulanteDto) => {
  const response = await fetch(`${API_URL}/postulantes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postulante),
  });

  if (!response.ok) {
    throw new Error("Error al crear postulante");
  }
  return response.json(); // ahora devuelve el postulante con ID
};

export const asignarCarreras = async (postulanteId: number, carreraIds: number[]) => {
  const requests = carreraIds.map((carreraId) =>
    fetch(`${API_URL}/carreras-postulantes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ postulanteId, carreraId }),
    })
  );

  const responses = await Promise.all(requests);

  if (responses.some((r) => !r.ok)) {
    throw new Error("Error al asignar carreras");
  }

  return responses;
};

