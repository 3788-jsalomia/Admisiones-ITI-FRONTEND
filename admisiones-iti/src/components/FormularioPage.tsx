import { useEffect, useState, useRef } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Card } from "primereact/card";
import { Checkbox } from "primereact/checkbox";
import { Toast } from "primereact/toast";

import { getCarreras } from "../services/carrerasService";
import { crearPostulante, asignarCarreras } from "../services/postulanteService";
import type { Carrera } from "../types/Carrera";
import "../estilos/formulario.css";

export default function FormularioPostulante() {
    const [nombre, setNombre] = useState("");
    const [cedula, setCedula] = useState("");
    const [correo, setCorreo] = useState("");
    const [celular, setCelular] = useState("");
    const [modalidadSeleccionada, setModalidadSeleccionada] = useState<string | null>(null);
    const [carreras, setCarreras] = useState<Carrera[]>([]);
    const [carrerasFiltradas, setCarrerasFiltradas] = useState<Carrera[]>([]);
    const [carrerasSeleccionadas, setCarrerasSeleccionadas] = useState<string[]>([]);

    const toast = useRef<Toast>(null);

    const modalidades = [
        { label: "Presencial", value: "PRESENCIAL" },
        { label: "Semipresencial", value: "SEMIPRESENCIAL" },
        { label: "Híbrida", value: "HIBRIDA" },
        { label: "En línea", value: "ON_LINE" },
    ];

    useEffect(() => {
        getCarreras()
            .then((data) => setCarreras(data))
            .catch((err) => {
                console.error("Error al cargar carreras:", err);
                setCarreras([]);
            });
    }, []);

    useEffect(() => {
        if (!modalidadSeleccionada) {
            setCarrerasFiltradas([]);
            setCarrerasSeleccionadas([]);
        } else {
            const filtradas = carreras.filter(c => c.modalidad === modalidadSeleccionada);
            setCarrerasFiltradas(filtradas);
            setCarrerasSeleccionadas([]);
        }
    }, [modalidadSeleccionada, carreras]);

    const validarCedula = (cedula: string): boolean => {
        if (!/^\d{10}$/.test(cedula)) return false;
        const digitos = cedula.split("").map(Number);
        const provincia = parseInt(cedula.substring(0, 2), 10);
        if (provincia < 1 || provincia > 24) return false;
        let total = 0;
        for (let i = 0; i < 9; i++) {
            let valor = digitos[i];
            if (i % 2 === 0) {
                valor *= 2;
                if (valor > 9) valor -= 9;
            }
            total += valor;
        }
        const digitoVerificador = (10 - (total % 10)) % 10;
        return digitoVerificador === digitos[9];
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!nombre || !cedula || !correo || !celular || !modalidadSeleccionada || carrerasSeleccionadas.length === 0) {
            toast.current?.show({
                severity: "warn",
                summary: "Campos incompletos",
                detail: "Complete todos los campos y seleccione al menos una carrera.",
                life: 3000,
            });
            return;
        }

        if (!validarCedula(cedula)) {
            toast.current?.show({
                severity: "error",
                summary: "Cédula inválida",
                detail: "Ingrese un número de cédula válido en Ecuador.",
                life: 3000,
            });
            return;
        }

        const validarTelefono = (telefono: string): boolean => {
            // Debe comenzar con 09 y tener 10 dígitos
            const regex = /^09\d{8}$/;
            return regex.test(telefono);
        };
        if (!validarTelefono(celular)) {
            toast.current?.show({
                severity: "error",
                summary: "Teléfono inválido",
                detail: "Ingrese un número de celular válido en Ecuador.",
                life: 3000,
            });
            return;
        }

        const { nombres, apellidos } = separarNombresApellidos(nombre);
        
        if (nombre.trim().split(" ").length < 2) {
            toast.current?.show({
                severity: "warn",
                summary: "Nombre incompleto",
                detail: "Ingrese al menos un nombre y un apellido.",
                life: 3000
            });
            return;
        }


        try {
            // 1️⃣ Crear postulante
            const resp = await crearPostulante({
                nombres,              // 👈 corregido
                apellidos,           // deberías pedirlo en el form
                telefono: celular,            // 👈 corregido
                cedula,
                correo,
                direccion: "N/A",             // puedes poner dummy si aún no lo pides
                carrerasId: carrerasFiltradas
                    .filter(c => carrerasSeleccionadas.includes(c.nombre))
                    .map(c => c.id), // 👈 number[]
                estado: "PENDIENTE",
                fechaUltimoContacto: new Date().toISOString().split("T")[0],
                intentosContacto: 0,
                fechaNacimiento: "2000-01-01", // agrega campo en el form si lo necesitas
                periodoAcademicoId: 1          // idem
            });

            const nuevoPostulante = await resp.json(); // backend debe devolver { id: ... }
            const postulanteId = nuevoPostulante.id;

            // 2️⃣ Asignar carreras
            await asignarCarreras(
                postulanteId,
                carrerasFiltradas
                    .filter(c => carrerasSeleccionadas.includes(c.nombre))
                    .map(c => c.id)
            );

            // 3️⃣ Notificación
            toast.current?.show({
                severity: "success",
                summary: "Postulante registrado",
                detail: `Nombre: ${nombre} | Cédula: ${cedula}`,
                life: 4000,
            });

            // Reset
            setNombre("");
            setCedula("");
            setCorreo("");
            setCelular("");
            setModalidadSeleccionada(null);
            setCarrerasSeleccionadas([]);
        } catch (err) {
            console.error(err);
            toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: "No se pudo registrar el postulante.",
                life: 4000,
            });
        }
    };




    //Separacion de apellidos y nombres
    const separarNombresApellidos = (nombreCompleto: string) => {
        const partes = nombreCompleto.trim().split(" ");

        let nombres = "";
        let apellidos = "";

        if (partes.length === 4) {
            // formato esperado: [Nombre1, Nombre2, Apellido1, Apellido2]
            nombres = `${partes[0]} ${partes[1]}`;
            apellidos = `${partes[2]} ${partes[3]}`;
        } else if (partes.length === 3) {
            // [Nombre1, Nombre2, Apellido1] -> asumimos primer apellido solo
            nombres = `${partes[0]} ${partes[1]}`;
            apellidos = partes[2];
        } else if (partes.length === 2) {
            // [Nombre, Apellido]
            nombres = partes[0];
            apellidos = partes[1];
        } else {
            // cualquier otro caso, todo va a nombres
            nombres = nombreCompleto;
        }

        return { nombres, apellidos };
    };

    return (
        <div className="formulario-container">
            <Toast ref={toast} />
            <Card title="Formulario de Postulación" className="formulario-card shadow-4">
                <form onSubmit={handleSubmit} className="formulario-grid">

                    <div className="form-group">
                        <label htmlFor="nombre">Nombres Completos</label>
                        <InputText id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full" placeholder="Dos nombres / Dos apellidos" />
                    </div>

                    <div className="form-group">
                        <label htmlFor="cedula">Cédula</label>
                        <InputText id="cedula" value={cedula} onChange={(e) => setCedula(e.target.value)} className="w-full" placeholder="Ej: 1799999999" />
                    </div>

                    <div className="form-group">
                        <label htmlFor="correo">Correo Electrónico</label>
                        <InputText id="correo" type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} className="w-full" placeholder="Ej: correo@gmai.com" />
                    </div>

                    <div className="form-group">
                        <label htmlFor="telefono">Número de Celular</label>
                        <InputText id="telefono" type="number" value={celular} onChange={(e) => setCelular(e.target.value)} className="w-full" placeholder="Ej: 0999999999" />
                    </div>

                    <div className="form-group form-group-dropdown">
                        <label htmlFor="modalidad">Modalidad</label>
                        <Dropdown
                            id="modalidad"
                            value={modalidadSeleccionada}
                            options={modalidades}
                            onChange={(e) => setModalidadSeleccionada(e.value)}
                            placeholder="Seleccione Modalidad"
                            className="w-full"
                            appendTo="self"
                        />
                    </div>

                    {modalidadSeleccionada && (
                        <div className="form-group">
                            <label className="form-label">Carreras Disponibles</label>
                            <div className="carreras-checklist">
                                {carrerasFiltradas.map((carrera) => (
                                    <div key={carrera.id} className="checkbox-item">
                                        <Checkbox
                                            inputId={`carrera_${carrera.id}`}
                                            value={carrera.nombre}
                                            onChange={(e) => {
                                                let seleccionadas = [...carrerasSeleccionadas];
                                                if (e.checked) {
                                                    seleccionadas.push(e.value);
                                                } else {
                                                    seleccionadas = seleccionadas.filter(c => c !== e.value);
                                                }
                                                setCarrerasSeleccionadas(seleccionadas);
                                            }}
                                            checked={carrerasSeleccionadas.includes(carrera.nombre)}
                                        />
                                        <label htmlFor={`carrera_${carrera.id}`} className="checkbox-label">
                                            {carrera.nombre}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="botones-form">
                        <Button
                            type="submit"
                            label="Generar Postulante"
                            icon="pi pi-user-plus"
                            className="p-button-rounded p-button-success boton-principal"
                        />
                        <Button
                            type="reset"
                            label="Limpiar"
                            icon="pi pi-refresh"
                            className="p-button-rounded p-button-secondary boton-secundario"
                            onClick={() => {
                                setNombre("");
                                setCedula("");
                                setCorreo("");
                                setCelular("");
                                setModalidadSeleccionada(null);
                                setCarrerasSeleccionadas([]);
                            }}
                        />
                    </div>

                </form>
            </Card>
        </div>
    );
}
