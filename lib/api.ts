export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

const TOKEN_KEY = "oguz-admin-token";

export const getToken = () => (typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY));
export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: { path: string; message: string }[],
  ) {
    super(message);
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = getToken();
  const isForm = body instanceof FormData;
  const response = await fetch(`${API_URL}/api/admin${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body && !isForm ? { "Content-Type": "application/json" } : {}),
    },
    body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
  });

  if (response.status === 401 && !path.startsWith("/auth/login")) {
    clearToken();
    // Full reload on purpose: drops cached data of the expired session
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/login";
  }
  if (response.status === 204) return undefined as T;

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(response.status, data.error ?? "Ошибка сервера", data.details);
  }
  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  put: <T>(path: string, body?: unknown) => request<T>("PUT", path, body),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, body),
  delete: (path: string) => request<void>("DELETE", path),
};

/** Stored image paths ("/uploads/x.webp") → absolute URL for previews */
export const mediaUrl = (path?: string | null) =>
  !path ? "" : path.startsWith("/uploads/") ? `${API_URL}${path}` : path;

export async function uploadImage(file: File) {
  const form = new FormData();
  form.append("file", file);
  return api.post<{ path: string; url: string }>("/uploads", form);
}

/** Downloads a protected file (resumes) with the auth header */
export async function downloadFile(path: string, filename: string) {
  const response = await fetch(`${API_URL}/api/admin${path}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!response.ok) throw new ApiError(response.status, "Не удалось скачать файл");
  const url = URL.createObjectURL(await response.blob());
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export const errorMessage = (error: unknown) =>
  error instanceof ApiError
    ? [error.message, ...(error.details ?? []).map((d) => `${d.path}: ${d.message}`)].join("\n")
    : "Не удалось связаться с сервером";
