import { useEffect, useMemo, useState } from "react";
import styles from "./ImageCarousel.module.css";

export type CarouselItem = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
};

type ImageCarouselProps = {
  items: CarouselItem[];
  interval?: number;
};

const DEFAULT_INTERVAL = 5000;

function ImageCarousel({ items, interval = DEFAULT_INTERVAL }: ImageCarouselProps) {
  const slides = useMemo(() => (items.length > 0 ? items : fallbackItems), [items]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, Math.max(interval, 3000));

    return () => window.clearInterval(timer);
  }, [slides.length, interval]);

  return (
    <div className={styles.carousel}>
      {slides.map((slide, index) => (
        <article
          key={slide.id}
          className={`${styles.slide} ${index === current ? styles.slideActive : ""}`}
          style={{
            backgroundImage: `url('${slide.imageUrl}')`,
          }}
        >
          <div className={styles.overlay} />
          <div className={styles.content}>
            <h3 className={styles.title}>{slide.title}</h3>
            <p className={styles.description}>{slide.description}</p>
          </div>
        </article>
      ))}
      <div className={styles.bullets} role="tablist">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            aria-label={`Ver imagen ${index + 1}`}
            aria-selected={index === current}
            onClick={() => setCurrent(index)}
            className={`${styles.bullet} ${index === current ? styles.bulletActive : ""}`}
          />
        ))}
      </div>
    </div>
  );
}

const fallbackItems: CarouselItem[] = [
  {
    id: "vision",
    title: "Innovación Canalco",
    description: "Transformamos procesos de compras con tecnología y transparencia.",
    imageUrl:
      "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "team",
    title: "Equipo Colaborativo",
    description: "Conectamos áreas clave para acelerar decisiones estratégicas.",
    imageUrl:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "impact",
    title: "Impacto Medible",
    description: "Monitoreo en tiempo real para controlar requisiciones y proveedores.",
    imageUrl:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
  },
];

export default ImageCarousel;
