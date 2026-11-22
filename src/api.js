// Cliente de la API de AguaFix.
// La URL base sale de VITE_API_URL (archivo .env.production o variable del workflow).
export const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');

const TOKEN_KEY = 'aguafix.token';
const USER_KEY = 'aguafix.user';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

function read(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key, value) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Sin almacenamiento (modo privado): la sesión dura mientras la pestaña esté abierta
  }
}

/** Sesión guardada en el navegador: token JWT y datos públicos del usuario. */
export const session = {
  get token() {
    return read(TOKEN_KEY);
  },
  get user() {
    try {
      return JSON.parse(read(USER_KEY) ?? 'null');
    } catch {
      return null;
    }
  },
  save({ token, user }) {
    write(TOKEN_KEY, token);
    write(USER_KEY, JSON.stringify(user));
  },
  clear() {
    write(TOKEN_KEY, null);
    write(USER_KEY, null);
  },
};

let unauthorizedHandler = () => {};

/** App.jsx registra aquí qué hacer cuando la sesión expira (401). */
export function onUnauthorized(handler) {
  unauthorizedHandler = handler;
}

function errorMessage(data, status) {
  const message = data?.message;
  if (Array.isArray(message)) return message.join('. ');
  if (typeof message === 'string') return message;
  if (status === 413) return 'La imagen es demasiado grande (máximo 5 MB).';
  return `Ocurrió un error (${status}).`;
}

async function request(path, { method = 'GET', body } = {}) {
  if (!API_URL) {
    throw new ApiError('El front no tiene configurada la URL de la API (VITE_API_URL).', 0);
  }

  const headers = { Accept: 'application/json' };
  let payload = body;
  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  const token = session.token;
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, { method, headers, body: payload });
  } catch {
    throw new ApiError('No se pudo conectar con la API. Revisa tu conexión e inténtalo de nuevo.', 0);
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401 && token) unauthorizedHandler();
    throw new ApiError(errorMessage(data, response.status), response.status);
  }
  return data;
}

export const api = {
  register: (data) => request('/auth/register', { method: 'POST', body: data }),
  login: (data) => request('/auth/login', { method: 'POST', body: data }),
  getReports: () => request('/reports'),
  createReport: (formData) => request('/reports', { method: 'POST', body: formData }),
  getUsers: () => request('/users'),
};
