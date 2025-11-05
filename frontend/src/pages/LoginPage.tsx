import { useMemo } from "react";
import LogoHeader from "../components/LogoHeader";
import ImageCarousel, { CarouselItem } from "../components/ImageCarousel";
import LoginForm from "../components/LoginForm";
import type { AuthenticatedUser } from "../services/authService";
import styles from "./LoginPage.module.css";

const carouselItems: CarouselItem[] = [
  {
    id: "procurement",
    title: "Gestión Integral",
    description: "Centraliza requisiciones, cotizaciones y órdenes de compra en un mismo lugar.",
    imageUrl:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "visibility",
    title: "Visibilidad en Tiempo Real",
    description: "Monitorea el estado de tus procesos y toma decisiones con certeza.",
    imageUrl:
      "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "collaboration",
    title: "Colaboración Segura",
    description: "Roles y permisos definidos para mantener el control en cada etapa.",
    imageUrl:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
  },
];

type LoginPageProps = {
  onLoginSuccess: (payload: { accessToken: string; user: AuthenticatedUser }) => void;
};

function LoginPage({ onLoginSuccess }: LoginPageProps) {

  const logos = useMemo(
    () => ({
      leftLogo: undefined,
      rightLogo: undefined,
    }),
    [],
  );

  return (
    <div className={styles.page}>
      <LogoHeader {...logos} />
      <main className={styles.content}>
        <section className={styles.carouselWrapper} aria-label="Mensajes institucionales">
          <ImageCarousel items={carouselItems} />
        </section>
        <section className={styles.formWrapper}>
          <div style={{ width: "100%", maxWidth: "420px" }}>
            <LoginForm
              onSuccess={({ accessToken, user }) => {
                onLoginSuccess({ accessToken, user });
              }}
            />
          </div>
        </section>
      </main>
    </div>
  );
}

export default LoginPage;
