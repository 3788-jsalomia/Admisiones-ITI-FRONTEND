import type { PostulanteDto } from "../types/Postulante";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

/**
 * Crea un postulante y devuelve la respuesta del backend como JSON.
 */
export const crearPostulante = async (postulante: PostulanteDto) => {
  const response = await fetch(`${API_URL}/postulantes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postulante),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Error al crear postulante: ${response.status} - ${text}`);
  }

  // Intentar parsear JSON, si falla devolver objeto vacío
  try {
    return await response.json();
  } catch {
    return {};
  }
};

/**
 * Asigna una lista de carreras a un postulante.
 */
export const asignarCarreras = async (postulanteId: number, carreraIds: number[]): Promise<void> => {
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

  const failed = responses.filter((r) => !r.ok);
  if (failed.length > 0) {
    const errors = await Promise.all(failed.map((r) => r.text()));
    throw new Error(`Error al asignar carreras: ${errors.join(", ")}`);
  }
};
