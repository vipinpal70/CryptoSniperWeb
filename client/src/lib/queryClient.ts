import { QueryClient, QueryFunction } from "@tanstack/react-query";

// 1. Set API base URL from environment variable or fallback
const BASE_URL = import.meta.env.VITE_API_URL;

function buildApiUrl(path: string): string {
  // Remove any leading slashes from the path to prevent double slashes
  const cleanPath = path.replace(/^\/+/, '');
  
  if (BASE_URL.startsWith('http')) {
    // If base URL is a full URL, ensure it ends with exactly one slash
    const base = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
    return `${base}/${cleanPath}`;
  }
  
  // For relative URLs, ensure BASE_URL starts with exactly one slash
  const base = BASE_URL.startsWith('/') ? BASE_URL : `/${BASE_URL}`;
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
  return `${window.location.origin}${cleanBase}/${cleanPath}`;
}

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
  const fullUrl = buildApiUrl(url);
  const res = await fetch(fullUrl, {
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
      const path = typeof queryKey[0] === "string" ? queryKey[0] : "";
      const fullUrl = buildApiUrl(path);
      const res = await fetch(fullUrl, {
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