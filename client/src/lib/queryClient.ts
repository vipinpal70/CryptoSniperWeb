import { QueryClient, QueryFunction } from "@tanstack/react-query";

// 1. Set API base URL from environment variable or fallback  "http://34.131.119.198:8000"
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// 2. Utility to handle errors
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// 3. Generic API request wrapper
export async function apiRequest<T = any>(
  method: string,
  url: string,
  data?: unknown | undefined
): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include", // Necessary if using cookies
  });

  await throwIfResNotOk(res);
  return await res.json();
}

// 4. Query Function Generator
type UnauthorizedBehavior = "returnNull" | "throw";

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = typeof queryKey[0] === "string" ? queryKey[0] : "";
    const res = await fetch(`${BASE_URL}${url}`, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null as any;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

// 5. React Query Client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});