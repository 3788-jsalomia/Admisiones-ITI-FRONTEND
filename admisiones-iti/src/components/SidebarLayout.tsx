import type { ReactNode } from "react";
import "../estilos/sidebar.css";

type SidebarLayoutProps = {
  logoSrc: string;
  appName?: string;
  children: ReactNode;
};

export default function SidebarLayout({ logoSrc, appName = "Admisiones", children }: SidebarLayoutProps) {
  return (
    <div className="layout-root">
      <aside className="sidebar">
        <div className="sidebar__brand">
          <img src={logoSrc} alt="Logo" className="sidebar__logo" />
          <div className="sidebar__title">{appName}</div>
        </div>

        <nav className="sidebar__nav">
          {/* Links de ejemplo: reemplaza por los tuyos */}
          <p>Por favor llena todos los campos disponibles y selecciona al menos una carrera.</p>
        </nav>

        <div className="sidebar__footer">
          <small>© {new Date().getFullYear()} ITI</small>
        </div>
      </aside>

      <main className="content">
        {children}
      </main>
    </div>
  );
}
