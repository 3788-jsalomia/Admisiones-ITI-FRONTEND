import { useEffect, useState, useRef } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Card } from "primereact/card";
import { Checkbox } from "primereact/checkbox";
import { Toast } from "primereact/toast";

import { getCarreras } from "../services/carrerasService";
import { crearPostulante } from "../services/postulanteService";
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
    const [carrerasSeleccionadas, setCarrerasSeleccionadas] = useState<{ [modalidadId: string]: number[] }>({});

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
        } else {
            const filtradas = carreras.filter(c => c.modalidad === modalidadSeleccionada);
            setCarrerasFiltradas(filtradas);
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

    const validarTelefono = (telefono: string): boolean => {
        const regex = /^09\d{8}$/;
        return regex.test(telefono);
    };

    const separarNombresApellidos = (nombreCompleto: string) => {
        const partes = nombreCompleto.trim().split(" ");
        let nombres = "";
        let apellidos = "";
        if (partes.length >= 4) {
            nombres = `${partes[0]} ${partes[1]}`;
            apellidos = `${partes[2]} ${partes[3]}`;
        } else if (partes.length === 3) {
            nombres = `${partes[0]} ${partes[1]}`;
            apellidos = partes[2];
        } else if (partes.length === 2) {
            nombres = partes[0];
            apellidos = partes[1];
        } else {
            nombres = nombreCompleto;
        }
        return { nombres, apellidos };
    };

    const toggleCarrera = (modalidadId: string, carreraId: number) => {
        setCarrerasSeleccionadas((prev) => {
            const actuales = prev[modalidadId] || [];
            const nuevas = actuales.includes(carreraId)
                ? actuales.filter((id) => id !== carreraId)
                : [...actuales, carreraId];
            return { ...prev, [modalidadId]: nuevas };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const totalCarreras = Object.values(carrerasSeleccionadas).flat();

        if (!nombre || !cedula || !correo || !celular || totalCarreras.length === 0) {
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

        const payload = {
            nombres,
            apellidos,
            telefono: celular,
            cedula,
            correo,
            direccion: "N/A",
            carrerasId: totalCarreras,
            estado: "PENDIENTE" as const,
            intentosContacto: 0,
            fechaNacimiento: "2000-01-01",
            usuario_registro: "FrontendUser",
            periodoAcademicoId: 1
        };

        console.log("Payload a enviar:", payload);

        try {
            const resp = await crearPostulante(payload);
            console.log("Respuesta del backend:", resp);

            toast.current?.show({
                severity: "success",
                summary: "Postulante registrado",
                detail: `${nombres} ${apellidos}`,
                life: 4000,
            });

            setNombre("");
            setCedula("");
            setCorreo("");
            setCelular("");
            setModalidadSeleccionada(null);
            setCarrerasSeleccionadas({});
        } catch (err) {
            console.error("Error en crearPostulante:", err);
            toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: "No se pudo registrar el postulante.",
                life: 4000,
            });
        }
    };

    return (
        <div className="formulario-container">
            <Toast ref={toast} />
            <Card title="Formulario de Postulación" className="formulario-card shadow-4">
                <form onSubmit={handleSubmit} className="formulario-grid">
                    <div className="form-group">
                        <label htmlFor="nombre">Nombres Completos</label>
                        <InputText
                            id="nombre"
                            value={nombre}
                            onChange={(e) => {
                                const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/;
                                if (regex.test(e.target.value)) {
                                    setNombre(e.target.value);
                                }
                            }}
                            className="w-full"
                            placeholder="Dos nombres / Dos apellidos"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="cedula">Cédula</label>
                        <InputText id="cedula" value={cedula} onChange={(e) => setCedula(e.target.value)} className="w-full" placeholder="Ej: 1799999999" />
                    </div>

                    <div className="form-group">
                        <label htmlFor="correo">Correo Electrónico</label>
                        <InputText id="correo" type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} className="w-full" placeholder="Ej: correo@gmail.com" />
                    </div>

                    <div className="form-group">
                        <label htmlFor="telefono">Número de Celular</label>
                        <InputText id="telefono" value={celular} onChange={(e) => setCelular(e.target.value)} className="w-full" placeholder="Ej: 0999999999" />
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
                                    <div key={carrera.id} className="flex items-center gap-2">
                                        <Checkbox
                                            inputId={`carrera-${carrera.id}`}
                                            checked={(carrerasSeleccionadas[modalidadSeleccionada] || []).includes(carrera.id)}
                                            onChange={() => toggleCarrera(modalidadSeleccionada, carrera.id)}
                                        />
                                        <label htmlFor={`carrera-${carrera.id}`}>{carrera.nombre}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <h4>Carreras seleccionadas:</h4>
                        {Object.entries(carrerasSeleccionadas).map(([modalidad, ids]) => (
                            <div key={modalidad}>
                                <strong>{modalidad}:</strong>{" "}
                                {ids.map((id) => {
                                    const carrera = carreras.find((c) => c.id === id);
                                    return carrera ? carrera.nombre : id;
                                }).join(", ")}
                            </div>
                        ))}
                    </div>

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
                                setCarrerasSeleccionadas({});
                            }}
                        />
                    </div>
                </form>
            </Card>
        </div>
    );
}
