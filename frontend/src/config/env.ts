const rawAllowedDomains = import.meta.env.VITE_ALLOWED_DOMAINS as string | undefined;

const allowedDomains =
  rawAllowedDomains && rawAllowedDomains.length > 0
    ? rawAllowedDomains.split(",").map((domain) => domain.trim()).filter(Boolean)
    : ["@canalco.com"];

const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api",
  allowedDomains,
};

export default env;
