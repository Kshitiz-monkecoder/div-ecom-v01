export type EngineActor = {
  id: string;
  role: "USER" | "ADMIN";
};

type EngineFetchInit = RequestInit & {
  actor?: EngineActor;
};

const timeoutMs = Number(process.env.DIVY_ENGINE_TIMEOUT_MS || "15000");

const required = (name: string): string => {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const getBaseUrl = (): string => required("DIVY_ENGINE_BASE_URL").replace(/\/+$/, "");
const getApiKey = (): string => required("DIVY_ENGINE_API_KEY");

export async function divyEngineFetch<T>(path: string, init: EngineFetchInit = {}): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const headers = new Headers(init.headers || {});
  const hasBody = init.body !== undefined && init.body !== null;
  const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData;
  if (hasBody && !isFormData) {
    headers.set("content-type", headers.get("content-type") || "application/json");
  }
  headers.set("x-api-key", getApiKey());

  if (init.actor) {
    headers.set("x-actor-id", init.actor.id);
    headers.set("x-actor-role", init.actor.role);
  }

  try {
    const response = await fetch(`${getBaseUrl()}${path}`, {
      ...init,
      headers,
      cache: "no-store",
      signal: controller.signal,
    });

    const payload = (await response.json()) as {
      success?: boolean;
      message?: string;
      error?: string;
      data?: T;
    };

    if (!response.ok || payload.success === false) {
      throw new Error(payload.message || payload.error || `DIVY ENGINE API failed (${response.status})`);
    }

    if (payload.data !== undefined) {
      return payload.data;
    }

    return payload as unknown as T;
  } finally {
    clearTimeout(timer);
  }
}
