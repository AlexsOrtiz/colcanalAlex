export function isValidEmail(email: string): boolean {
  const emailPattern =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailPattern.test(email);
}

export function hasAllowedDomain(email: string, domains: string[]): boolean {
  if (domains.length === 0) {
    return true;
  }

  return domains.some((domain) => email.toLowerCase().endsWith(domain.toLowerCase()));
}
