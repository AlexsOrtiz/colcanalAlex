import env from "../config/env";

export type ModuleCard = {
  modulo_id: number;
  clave: string;
  nombre: string;
  descripcion?: string | null;
  icono?: string | null;
  has_access: boolean;
};

export async function fetchModules(token: string): Promise<ModuleCard[]> {
  const response = await fetch(`${env.apiBaseUrl}/modules`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("No se pudo obtener la lista de módulos.");
  }

  return (await response.json()) as ModuleCard[];
}
