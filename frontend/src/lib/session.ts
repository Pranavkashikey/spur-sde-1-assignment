const SESSION_KEY = 'spur_chat_session_id';

export function loadSessionId(): string | null {
	if (typeof localStorage === 'undefined') return null;
	return localStorage.getItem(SESSION_KEY);
}

export function saveSessionId(id: string): void {
	if (typeof localStorage === 'undefined') return;
	localStorage.setItem(SESSION_KEY, id);
}

export function clearSessionId(): void {
	if (typeof localStorage === 'undefined') return;
	localStorage.removeItem(SESSION_KEY);
}
