React frontend integration notes — StoreItForMe (axios + cookie auth)

Save / Import into Notion
- Option A: Copy the contents of this file and paste into a Notion page.
- Option B: In Notion, create a page and use "Import" → choose "Markdown" and upload this file. Notion will render the headings/code blocks properly.

Summary
- Backend behavior (already in your repo):
  - Server issues two JWTs: accessToken and refreshToken (see `src/utils/jwt.util.ts`).
  - Both tokens are set as httpOnly cookies by the server via `setAuthCookies` (`src/utils/cookie.util.ts`).
  - `authenticate` middleware reads `accessToken` from cookie first, then falls back to `Authorization` header.
  - Server also returns `accessToken` in response bodies for convenience (you can ignore it).

Goals for the frontend (React):
- Use axios with cookie support (no localStorage for refresh tokens).
- Automatic token refresh on 401 responses, with queueing to avoid multiple refresh requests.
- Prefer cookies-only flow for simplicity and safety; optionally keep accessToken in-memory if you want Authorization header usage.

Why this approach
- httpOnly cookies protect tokens from JS access (XSS prevention).
- Cookies are sent automatically by the browser when `withCredentials: true` is set.
- CSRF must be considered; server already sets `SameSite` to `lax` in dev and `strict` in production (good mitigation).

Copy/paste-ready files (React)

1) `src/lib/api.ts` — Axios instance with refresh logic

```ts
// src/lib/api.ts
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = 'http://localhost:3000/api';

let isRefreshing = false;
let failedQueue: { resolve: (value?: any) => void; reject: (err: any) => void }[] = [];

const processQueue = (error: any, token = null) => {
  failedQueue.forEach(p => {
    if (error) p.reject(error);
    else p.resolve(token);
  });
  failedQueue = [];
};

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send/accept cookies
  headers: {
    'Content-Type': 'application/json'
  },
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => api(originalRequest))
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Server will read refresh cookie and set new cookies; no body is required
      await axios.post(`${BASE_URL}/auth/refresh`, {}, { withCredentials: true });

      processQueue(null, null);
      isRefreshing = false;

      // Retry original request; cookies will be sent automatically
      return api(originalRequest);
    } catch (refreshErr) {
      processQueue(refreshErr, null);
      isRefreshing = false;

      // Optional: redirect to login
      // window.location.href = '/login';
      return Promise.reject(refreshErr);
    }
  }
);

export default api;
```

2) `src/lib/auth.ts` — Auth helpers

```ts
// src/lib/auth.ts
import api from './api';

export const register = (payload: any) => api.post('/auth/register', payload);
export const login = (credentials: { email: string; password: string }) => api.post('/auth/login', credentials);
export const logout = () => api.post('/auth/logout');
export const getProfile = () => api.get('/auth/me');
export const refresh = () => api.post('/auth/refresh');
```

3) Example usage in React (App load / login flow)

```tsx
import React, { useEffect, useState } from 'react';
import { getProfile, login, logout, register } from './lib/auth';

function App() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile()
      .then(res => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const handleLogin = async () => {
    try {
      await login({ email: 'john.doe@example.com', password: 'yourSecurePassword' });
      const res = await getProfile();
      setUser(res.data.user);
    } catch (err) {
      console.error('Login failed', err);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  return (
    <div>
      {loading ? <div>Loading...</div> : user ? (
        <div>
          <h2>Welcome {user.name}</h2>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <div>
          <button onClick={handleLogin}>Login</button>
        </div>
      )}
    </div>
  );
}

export default App;
```

Behavior details & tips
- Axios default `withCredentials: true` ensures cookies are sent and accepted.
- The interceptor handles 401 -> `POST /api/auth/refresh` -> retry flow. The server sets new cookies.
- Keep tokens out of localStorage. If you do keep the accessToken in memory for attaching Authorization header, never persist it across refreshes (don't use localStorage for it).
- You can safely ignore the `accessToken` in JSON responses; rely on cookies and the interceptor.

CSRF notes
- Because cookies auto-send, there's CSRF risk. Mitigations:
  1. `SameSite` set to `lax`/`strict` is already applied by the backend (good).
  2. For stronger protection, have the server return a secondary non-httpOnly CSRF token that the client reads and sends in a header (e.g. `X-CSRF-Token`) for state-changing requests.
  3. Alternatively, keep access token in memory and send it in `Authorization` header for writes (attacker cannot set that header cross-origin).

Small backend improvements you might consider
- Remove accessToken from JSON responses (prevents accidental insecure storage).
- Keep `refreshToken` cookie path limited (already set to `/api/auth/refresh` in backend).
- Ensure in production: `secure: true` and `sameSite: 'strict'` if frontend/backend are same-site.

Importing this into Notion
- Open Notion, create a page, paste the contents of this file, or use Notion's Import → Markdown to upload this file.

Need me to also:
- Create a short README in your frontend repo with these snippets? (I can add files to this workspace if you want.)
- Remove the `accessToken` from the server response in `src/modules/auth/auth.controller.ts` to avoid accidental storage? I can make that change for you if you'd like.

Last step: file saved in the repository at `NOTION_Frontend_Integration_React.md`. You can import or copy it into Notion anytime.