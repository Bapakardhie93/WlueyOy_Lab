import type { CareQuote } from '@/types/api';

const API_URL = 'https://dummyjson.com/quotes/random';

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('The request took too long.')), timeoutMs);
    promise.then(
      (value) => { clearTimeout(timeout); resolve(value); },
      (error: unknown) => { clearTimeout(timeout); reject(error); },
    );
  });
}

export async function fetchCareQuote(): Promise<CareQuote> {
  const response = await withTimeout(fetch(API_URL, { headers: { Accept: 'application/json' } }), 8000);
  if (!response.ok) throw new Error(`Quote service returned ${response.status}.`);
  const result: unknown = await response.json();
  if (!result || typeof result !== 'object') throw new Error('Quote response was not valid.');
  const { id, quote, author } = result as Record<string, unknown>;
  if (typeof id !== 'number' || typeof quote !== 'string' || typeof author !== 'string') {
    throw new Error('Quote response was missing required fields.');
  }
  return { id, quote, author };
}
