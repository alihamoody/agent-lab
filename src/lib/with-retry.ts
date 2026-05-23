/**
 * Exponential backoff for transient 429s from Groq/Gemini.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3
): Promise<T> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      return await fn();
    } catch (e: unknown) {
      const status =
        e && typeof e === "object" && "status" in e
          ? (e as { status?: number }).status
          : undefined;
      if (status === 429 && i < maxAttempts - 1) {
        const wait = 2 ** i * 1000;
        console.log(`[429] Rate limited. Retrying in ${wait}ms…`);
        await new Promise((r) => setTimeout(r, wait));
      } else {
        throw e;
      }
    }
  }
  throw new Error("Max retries exceeded");
}
