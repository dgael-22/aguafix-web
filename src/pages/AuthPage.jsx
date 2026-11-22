import { useState } from 'react';
import { api } from '../api.js';

const EMPTY = { name: '', email: '', password: '', confirm: '', isNotificationEnabled: true };

export default function AuthPage({ onAuthenticated, notice }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isRegister = mode === 'register';

  function update(field) {
    return (event) => {
      const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
      setForm((current) => ({ ...current, [field]: value }));
    };
  }

  function switchMode(next) {
    setMode(next);
    setError(null);
    setForm((current) => ({ ...current, password: '', confirm: '' }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);

    if (isRegister && form.password !== form.confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      const auth = isRegister
        ? await api.register({
            name: form.name.trim(),
            email: form.email.trim(),
            password: form.password,
            isNotificationEnabled: form.isNotificationEnabled,
          })
        : await api.login({ email: form.email.trim(), password: form.password });
      onAuthenticated(auth);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-hero">
        <div className="brand brand-light">
          <img src="./favicon.svg" alt="" width="32" height="32" />
          <span>AguaFix</span>
        </div>
        <h1>Cada gota cuenta.</h1>
        <p>Reporta las fugas de agua de tu colonia con una foto y la cuadrilla del municipio recibe el aviso al instante.</p>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <div className="segmented" role="tablist">
            <button type="button" role="tab" aria-selected={!isRegister} className={!isRegister ? 'active' : ''} onClick={() => switchMode('login')}>
              Iniciar sesión
            </button>
            <button type="button" role="tab" aria-selected={isRegister} className={isRegister ? 'active' : ''} onClick={() => switchMode('register')}>
              Crear cuenta
            </button>
          </div>

          {notice && <div className="alert alert-info">{notice}</div>}

          <form onSubmit={handleSubmit} className="form" noValidate={false}>
            {isRegister && (
              <label className="field">
                <span>Nombre completo</span>
                <input type="text" value={form.name} onChange={update('name')} required maxLength={120} autoComplete="name" />
              </label>
            )}

            <label className="field">
              <span>Correo electrónico</span>
              <input type="email" value={form.email} onChange={update('email')} required autoComplete="email" />
            </label>

            <label className="field">
              <span>Contraseña</span>
              <input
                type="password"
                value={form.password}
                onChange={update('password')}
                required
                minLength={isRegister ? 6 : undefined}
                maxLength={72}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
              />
            </label>

            {isRegister && (
              <>
                <label className="field">
                  <span>Confirmar contraseña</span>
                  <input type="password" value={form.confirm} onChange={update('confirm')} required minLength={6} maxLength={72} autoComplete="new-password" />
                </label>
                <label className="checkbox">
                  <input type="checkbox" checked={form.isNotificationEnabled} onChange={update('isNotificationEnabled')} />
                  <span>Quiero recibir avisos del sistema</span>
                </label>
              </>
            )}

            {error && (
              <div className="alert alert-error" role="alert">
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? <span className="spinner" aria-hidden="true" /> : null}
              {loading ? 'Enviando…' : isRegister ? 'Crear cuenta' : 'Entrar'}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
