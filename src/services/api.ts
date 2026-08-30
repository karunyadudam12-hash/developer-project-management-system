const API_BASE_URL =
  typeof window === 'undefined'
    ? 'http://localhost:3000/api'
    : '/api';

export async function apiGet<T>(endpoint: string): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  const result = await response.json();

  return result.data;
}