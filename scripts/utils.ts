export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchWithRetry(
  url: string,
  options: { retries?: number; timeout?: number; delayMs?: number } = {}
): Promise<Response> {
  const { retries = 3, timeout = 10000, delayMs = 1000 } = options;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);

      if (response.status === 429 || response.status >= 500) {
        if (attempt < retries) {
          await delay(delayMs * Math.pow(2, attempt));
          continue;
        }
      }

      return response;
    } catch (error) {
      if (attempt < retries) {
        await delay(delayMs * Math.pow(2, attempt));
        continue;
      }
      throw error;
    }
  }

  throw new Error(`Failed to fetch ${url} after ${retries + 1} attempts`);
}

export function normalizeCompanyName(name: string): string {
  return name
    .toUpperCase()
    .replace(
      /,?\s*(INC|LLC|CORP|LTD|CO|COMPANY|INCORPORATED|CORPORATION|PBC)\.?\s*$/i,
      ""
    )
    .replace(/[^A-Z0-9\s]/g, "")
    .trim();
}
