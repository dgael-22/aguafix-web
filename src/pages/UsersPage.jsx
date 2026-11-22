import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';

const dateFormat = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' });

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setUsers(await api.getUsers());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <section>
      <div className="page-header">
        <div>
          <h2>Usuarios registrados</h2>
          <p className="muted">{loading ? 'Cargando…' : `${users.length} usuarios`}</p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={load} disabled={loading}>
          Actualizar
        </button>
      </div>

      {error && (
        <div className="alert alert-error" role="alert">
          {error}{' '}
          <button type="button" className="link" onClick={load}>
            Reintentar
          </button>
        </div>
      )}

      {!error && (
        <div className="panel table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Correo</th>
                <th>Avisos</th>
                <th>Registro</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <span className="avatar" aria-hidden="true">
                      {user.name.trim().charAt(0).toUpperCase()}
                    </span>
                    {user.name}
                  </td>
                  <td>{user.email}</td>
                  <td>{user.isNotificationEnabled ? 'Activados' : 'Desactivados'}</td>
                  <td>{dateFormat.format(new Date(user.createdAt))}</td>
                </tr>
              ))}
              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={4} className="muted">
                    No hay usuarios.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
