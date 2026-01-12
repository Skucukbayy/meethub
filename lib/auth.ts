const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Get auth token from localStorage
 */
export function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
}

/**
 * Set auth token in localStorage
 */
export function setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('token', token);
}

/**
 * Remove auth token from localStorage
 */
export function removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('token');
}

/**
 * Get current user info
 */
export function getUser() {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

/**
 * Set user info in localStorage
 */
export function setUser(user: any): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('user', JSON.stringify(user));
}

/**
 * Remove user info from localStorage
 */
export function removeUser(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('user');
}

/**
 * Logout user
 */
export function logout(): void {
    removeToken();
    removeUser();
    if (typeof window !== 'undefined') {
        window.location.href = '/login';
    }
}

/**
 * Make authenticated API request
 */
export async function apiRequest(
    endpoint: string,
    options: RequestInit = {}
): Promise<any> {
    const token = getToken();

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        logout();
        throw new Error('Unauthorized');
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Request failed');
    }

    return data;
}

/**
 * Register new user
 */
export async function register(email: string, password: string, name: string) {
    const data = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
    });

    setToken(data.token);
    setUser(data.user);

    return data;
}

/**
 * Login user
 */
export async function login(email: string, password: string) {
    const data = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });

    setToken(data.token);
    setUser(data.user);

    return data;
}

/**
 * Get current user from API
 */
export async function getCurrentUser() {
    return apiRequest('/api/auth/me');
}

/**
 * Create new room
 */
export async function createRoom(name: string, maxParticipants: number = 20) {
    return apiRequest('/api/rooms', {
        method: 'POST',
        body: JSON.stringify({ name, maxParticipants }),
    });
}

/**
 * Get user's rooms
 */
export async function getRooms() {
    return apiRequest('/api/rooms');
}

/**
 * Get room details
 */
export async function getRoom(roomId: string) {
    return apiRequest(`/api/rooms/${roomId}`);
}
