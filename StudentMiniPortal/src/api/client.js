// src/api/client.js
//
// ⚠️ CHANGE THIS to your computer's local network IP (the one running
// `npm run dev` for the backend). Find it with `ipconfig` (Windows) and
// look for IPv4 Address on your Wi-Fi adapter. Your backend's server.js
// already prints it on startup too.
//
// - Physical phone on same Wi-Fi as your PC → use PC's LAN IP (e.g. 192.168.x.x)
// - Android Emulator (Android Studio)        → use 10.0.2.2
// - iOS Simulator (Mac only)                 → localhost works fine
export const API_BASE_URL = 'http://192.168.100.62:3000/api';

/**
 * Low-level request helper used by every api/*.js file.
 * Throws an Error with a readable message on non-2xx responses,
 * so screens can just try/catch and show err.message.
 */
async function request(path, { method = 'GET', body, headers } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    let data = null;
    try {
      data = await res.json();
    } catch {
      // some endpoints (e.g. 204) may not return a body
    }

    if (!res.ok) {
      const message = (data && data.message) || `Request failed (${res.status})`;
      throw new Error(message);
    }

    return data;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Check that the backend server is running and reachable.');
    }
    if (err.message === 'Network request failed') {
      throw new Error(
        'Cannot reach the server. Check API_BASE_URL in src/api/client.js and make sure your phone/emulator is on the same network as the backend.'
      );
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

export const get = (path) => request(path, { method: 'GET' });
export const post = (path, body) => request(path, { method: 'POST', body });
export const put = (path, body) => request(path, { method: 'PUT', body });
export const del = (path) => request(path, { method: 'DELETE' });
