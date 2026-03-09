const AUTH_TOKEN_KEY = 'sss_auth_token';
const USER_DATA_KEY = 'sss_user_data';

export interface UserData {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
}

export function saveAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function removeAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function saveUserData(user: UserData): void {
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
}

export function getUserData(): UserData | null {
  try {
    const data = localStorage.getItem(USER_DATA_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function removeUserData(): void {
  localStorage.removeItem(USER_DATA_KEY);
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

export function logout(): void {
  removeAuthToken();
  removeUserData();
  clearAllCache();
}

function clearAllCache(): void {
  const keys = Object.keys(localStorage).filter(k => k.startsWith('sss_cache_'));
  keys.forEach(k => localStorage.removeItem(k));
}
