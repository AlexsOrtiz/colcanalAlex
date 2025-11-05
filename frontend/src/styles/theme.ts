export type Theme = {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    textPrimary: string;
    textSecondary: string;
    accent: string;
    danger: string;
  };
  spacing: (factor: number) => string;
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    pill: string;
  };
  shadow: {
    sm: string;
    md: string;
  };
};

const theme: Theme = {
  colors: {
    primary: "var(--color-primary)",
    secondary: "var(--color-secondary)",
    background: "var(--color-background)",
    surface: "var(--color-surface)",
    textPrimary: "var(--color-text-primary)",
    textSecondary: "var(--color-text-secondary)",
    accent: "var(--color-accent)",
    danger: "var(--color-danger)",
  },
  spacing: (factor: number) => `calc(${factor} * 0.5rem)`,
  borderRadius: {
    sm: "6px",
    md: "12px",
    lg: "20px",
    pill: "999px",
  },
  shadow: {
    sm: "0 8px 24px rgba(0, 0, 0, 0.08)",
    md: "0 16px 40px rgba(0, 0, 0, 0.12)",
  },
};

export default theme;
