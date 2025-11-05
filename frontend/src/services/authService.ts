import env from "../config/env";

export type LoginRequest = {
  email: string;
  password: string;
};

export type AuthenticatedUser = {
  user_id: number;
  email: string;
  nombre: string;
  rol_id: number;
  nombre_rol: string;
  default_module?: string | null;
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
  user: AuthenticatedUser;
};

const AUTH_ENDPOINT = `${env.apiBaseUrl}/auth/login`;

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(AUTH_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message =
      typeof errorData.detail === "string"
        ? errorData.detail
        : "Credenciales incorrectas o usuario no autorizado.";
    throw new Error(message);
  }

  return (await response.json()) as LoginResponse;
}
