export interface PostulanteDto {
    nombres: string;
    apellidos: string;
    cedula: string;
    correo: string;
    telefono: string;
    direccion: string;
    carrerasId: number[]; // IDs de las carreras seleccionadas
    estado?: 'PENDIENTE' | 'ACEPTADO' | 'RECHAZADO'; // Opcional, por defecto 'PENDIENTE'
    intentosContacto?: number; // Opcional, por defecto 0
    fechaNacimiento?: string; // Opcional, fecha en formato ISO
    periodoAcademicoId?: number; // Opcional, ID del periodo académico
}