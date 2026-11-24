import type { Issue } from "./model";

export class ApiError extends Error {
  constructor(
    message: string,
    public code = "CONNECTION_ERROR",
    public issues: Issue[] = [],
    public requestId?: string,
  ) {
    super(requestId ? `${message} Request ID: ${requestId}.` : message);
  }
}
export async function api<T>(path: string, body?: unknown): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(`/api/v1/${path}`, {
      method: body === undefined ? "GET" : "POST",
      headers: { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
    const data = await response.json();
    if (!response.ok)
      throw new ApiError(
        data.error?.message ?? "Request failed; retry.",
        data.error?.code,
        data.error?.issues,
        data.error?.requestId,
      );
    return data as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      "Cannot reach the local service. Start the API and retry; your draft is safe.",
    );
  } finally {
    clearTimeout(timer);
  }
}
