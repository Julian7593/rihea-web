const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").trim();

export const hasRemoteApi = Boolean(API_BASE_URL);

export async function apiRequest(contract, { body, signal } = {}) {
  if (!hasRemoteApi) {
    throw new Error("Remote API is not configured. Set VITE_API_BASE_URL.");
  }

  const response = await fetch(`${API_BASE_URL}${contract.path}`, {
    method: contract.method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload?.message || `API request failed: ${response.status}`;
    throw new Error(message);
  }

  return payload;
}
