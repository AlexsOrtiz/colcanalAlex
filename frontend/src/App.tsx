import { useEffect, useState } from "react";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import type { AuthenticatedUser } from "./services/authService";

const TOKEN_KEY = "canalco_token";
const USER_KEY = "canalco_user";

type Session = {
  token: string;
  user: AuthenticatedUser;
};

function loadSession(): Session | null {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);
    if (!token || !storedUser) {
      return null;
    }
    const user = JSON.parse(storedUser) as AuthenticatedUser;
    return { token, user };
  } catch {
    return null;
  }
}

function App() {
  const [session, setSession] = useState<Session | null>(() => loadSession());

  useEffect(() => {
    if (!session) {
      return;
    }
    localStorage.setItem(TOKEN_KEY, session.token);
    localStorage.setItem(USER_KEY, JSON.stringify(session.user));
  }, [session]);

  const handleLoginSuccess = ({ accessToken, user }: { accessToken: string; user: AuthenticatedUser }) => {
    setSession({ token: accessToken, user });
  };

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setSession(null);
  };

  if (!session) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return <DashboardPage token={session.token} user={session.user} onLogout={handleLogout} />;
}

export default App;
