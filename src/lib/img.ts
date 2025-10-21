// src/utils/img.ts
export function imgUrl(u?: string) {
  const API = import.meta.env.VITE_API_URL || "http://localhost:3001";
  if (!u) return "";
  return u.startsWith("http") ? u : `${API}${u.startsWith("/") ? "" : "/"}${u}`;
}
