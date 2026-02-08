import { authClient } from "./auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchWithAuth(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const { data, error } = await authClient.token();

  if (error || !data?.token) {
    window.location.href = "/signin";
    throw new Error("Not authenticated");
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${data.token}`,
      ...options.headers,
    },
  });

  if (res.status === 401) {
    window.location.href = "/signin";
    throw new Error("Not authenticated");
  }

  return res;
}
