import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  BarChart3,
  Users,
  Building2,
  ShieldCheck,
  Bell,
  FileText,
  Settings,
} from "lucide-react";

import type { AuthenticatedUser } from "../services/authService";
import { fetchModules, ModuleCard as ModuleCardType } from "../services/moduleService";
import styles from "./DashboardPage.module.css";

type Feedback = {
  kind: "info" | "error";
  message: string;
};

type DashboardPageProps = {
  token: string;
  user: AuthenticatedUser;
  onLogout: () => void;
};

const iconMap: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  compras: ShoppingCart,
  ordenes_compra: FileText,
  inventarios: Boxes,
  reportes: BarChart3,
  usuarios: Users,
  proveedores: Building2,
  auditorias: ShieldCheck,
  notificaciones: Bell,
};

function DashboardPage({ token, user, onLogout }: DashboardPageProps) {
  const [modules, setModules] = useState<ModuleCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const greeting = useMemo(() => {
    const [firstName] = user.nombre.split(" ");
    return `Hola, ${firstName}!`;
  }, [user.nombre]);

  useEffect(() => {
    let isMounted = true;

    async function loadModules() {
      setLoading(true);
      try {
        const data = await fetchModules(token);
        if (isMounted) {
          setModules(data);
        }
      } catch (error) {
        if (isMounted) {
          setFeedback({
            kind: "error",
            message:
              error instanceof Error
                ? error.message
                : "No fue posible recuperar los módulos disponibles.",
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadModules();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleModuleClick = (module: ModuleCardType) => {
    if (!module.has_access) {
      setFeedback({
        kind: "error",
        message: `No tiene permisos para acceder al módulo ${module.nombre}.`,
      });
      return;
    }

    setFeedback({
      kind: "info",
      message: `Redirigiendo a ${module.nombre}... (próximamente)`,
    });
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>Panel de Gestión</h1>
          <p className={styles.subtitle}>
            {greeting} Selecciona un módulo para continuar con tus tareas diarias.
          </p>
        </div>
        <button type="button" className={styles.logoutButton} onClick={onLogout}>
          Cerrar sesión
        </button>
      </header>

      {feedback ? (
        <div
          className={`${styles.message} ${
            feedback.kind === "error" ? styles.messageError : ""
          }`}
        >
          {feedback.message}
        </div>
      ) : null}

      {loading ? (
        <div className={styles.message}>Cargando módulos...</div>
      ) : (
        <section className={styles.grid}>
          {modules.map((module) => (
            <article
              key={module.modulo_id}
              className={`${styles.card} ${
                module.has_access ? styles.cardEnabled : styles.cardDisabled
              }`}
              onClick={() => handleModuleClick(module)}
            >
              <div
                className={`${styles.statusTag} ${
                  module.has_access ? styles.statusEnabled : styles.statusDisabled
                }`}
              >
                {module.has_access ? "Disponible" : "Restringido"}
              </div>
              <div className={styles.iconWrapper}>
                <ModuleIcon module={module} />
              </div>
              <div>
                <h2 className={styles.cardTitle}>{module.nombre}</h2>
                <p className={styles.cardDescription}>
                  {module.descripcion ?? "Acceso a funcionalidades específicas del módulo."}
                </p>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

function ModuleIcon({ module }: { module: ModuleCardType }) {
  if (module.icono) {
    return (
      <span aria-hidden="true" title={module.icono}>
        {module.icono}
      </span>
    );
  }

  const IconComponent = iconMap[module.clave] ?? Settings;
  return <IconComponent size={28} strokeWidth={1.6} />;
}

export default DashboardPage;
