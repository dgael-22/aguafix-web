import { useCallback, useEffect, useState } from 'react';
import { API_URL, onUnauthorized, session } from './api.js';
import AuthPage from './pages/AuthPage.jsx';
import NewReportPage from './pages/NewReportPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import UsersPage from './pages/UsersPage.jsx';

const VIEWS = [
  { id: 'reports', label: 'Reportes' },
  { id: 'new', label: 'Reportar fuga' },
  { id: 'users', label: 'Usuarios' },
];

export default function App() {
  const [user, setUser] = useState(() => (session.token ? session.user : null));
  const [view, setView] = useState('reports');
  const [notice, setNotice] = useState(null);

  const logout = useCallback((message = null) => {
    session.clear();
    setUser(null);
    setView('reports');
    setNotice(message);
  }, []);

  useEffect(() => {
    onUnauthorized(() => logout('Tu sesión expiró. Inicia sesión de nuevo.'));
  }, [logout]);

  function handleAuthenticated(auth) {
    session.save(auth);
    setUser(auth.user);
    setNotice(null);
    setView('reports');
  }

  if (!API_URL) {
    return (
      <main className="center-page">
        <div className="alert alert-error">
          Falta configurar <code>VITE_API_URL</code> con la URL pública de la API.
        </div>
      </main>
    );
  }

  if (!user) {
    return <AuthPage onAuthenticated={handleAuthenticated} notice={notice} />;
  }

  return (
    <div className="layout">
      <header className="topbar">
        <div className="brand">
          <img src="./favicon.svg" alt="" width="28" height="28" />
          <span>AguaFix</span>
        </div>
        <nav className="tabs" aria-label="Secciones">
          {VIEWS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={view === item.id ? 'tab active' : 'tab'}
              aria-current={view === item.id ? 'page' : undefined}
              onClick={() => setView(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="session">
          <span className="session-name" title={user.email}>
            {user.name}
          </span>
          <button type="button" className="btn btn-ghost" onClick={() => logout()}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="content">
        {view === 'reports' && <ReportsPage onNew={() => setView('new')} />}
        {view === 'new' && <NewReportPage onCreated={() => setView('reports')} />}
        {view === 'users' && <UsersPage />}
      </main>

      <footer className="footer">API: {API_URL}</footer>
    </div>
  );
}
