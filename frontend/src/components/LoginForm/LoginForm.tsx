import { FormEvent, useMemo, useState } from "react";
import env from "../../config/env";
import { login, AuthenticatedUser } from "../../services/authService";
import { hasAllowedDomain, isValidEmail } from "../../utils/validators";
import styles from "./LoginForm.module.css";

export type LoginFormValues = {
  email: string;
  password: string;
};

type LoginFormProps = {
  onSuccess?: (args: { accessToken: string; user: AuthenticatedUser }) => void;
  allowedDomains?: string[];
};

function LoginForm({ onSuccess, allowedDomains = env.allowedDomains }: LoginFormProps) {
  const [values, setValues] = useState<LoginFormValues>({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const placeholderDomain = useMemo(
    () => (allowedDomains.length > 0 ? allowedDomains[0] : "tu-dominio.com"),
    [allowedDomains],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!isValidEmail(values.email)) {
      setError("Introduce un correo válido.");
      return;
    }

    if (!hasAllowedDomain(values.email, allowedDomains)) {
      setError(
        allowedDomains.length > 0
          ? `El correo debe terminar en alguno de los dominios autorizados: ${allowedDomains.join(
              ", ",
            )}.`
          : "El correo proporcionado no pertenece a un dominio autorizado.",
      );
      return;
    }

    if (!values.password) {
      setError("La contraseña es obligatoria.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await login({
        email: values.email,
        password: values.password,
      });

      onSuccess?.({
        accessToken: response.access_token,
        user: response.user,
      });
    } catch (loginError) {
      const message =
        loginError instanceof Error
          ? loginError.message
          : "Credenciales incorrectas o usuario no autorizado.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <div>
        <h2 className={styles.heading}>BIENVENIDO</h2>
        <p className={styles.subheading}>Accede con tu correo corporativo y contraseña asignada</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <label className={styles.label}>
          Correo corporativo
          <input
            className={styles.input}
            type="email"
            name="email"
            placeholder={`usuario${placeholderDomain}`}
            value={values.email}
            autoComplete="username"
            onChange={(event) => setValues((prev) => ({ ...prev, email: event.target.value }))}
          />
        </label>

        <label className={styles.label}>
          Contraseña
          <input
            className={styles.input}
            type="password"
            name="password"
            placeholder="Contraseña asignada"
            value={values.password}
            autoComplete="current-password"
            onChange={(event) => setValues((prev) => ({ ...prev, password: event.target.value }))}
          />
        </label>

        {error ? <p className={styles.errorMessage}>{error}</p> : null}

        <button className={styles.submitButton} type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Validando..." : "Login"}
        </button>
      </form>

      <p className={styles.helperText}>
        Si necesitas actualizar tu contraseña, contacta al equipo PMO.
      </p>
    </div>
  );
}

export default LoginForm;
