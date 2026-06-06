import { PUBLIC_API_BASE_URL } from '$env/static/public';

const BASE = PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

export interface Message {
	id: string;
	conversation_id: string;
	sender: 'user' | 'ai';
	text: string;
	timestamp: string;
}

export interface ChatResponse {
	reply: string;
	sessionId: string;
	messageId: string;
}

export interface HistoryResponse {
	sessionId: string;
	messages: Message[];
}

export class ApiError extends Error {
	constructor(
		public readonly status: number,
		message: string
	) {
		super(message);
		this.name = 'ApiError';
	}
}

async function handleResponse<T>(res: Response): Promise<T> {
	if (!res.ok) {
		let message = `Request failed (${res.status})`;
		try {
			const body = await res.json();
			if (body?.error) message = body.error;
		} catch {
			// ignore parse error
		}
		throw new ApiError(res.status, message);
	}
	return res.json() as Promise<T>;
}

/**
 * Send a chat message. Creates a new session if sessionId is omitted.
 */
export async function sendMessage(
	message: string,
	sessionId?: string
): Promise<ChatResponse> {
	const res = await fetch(`${BASE}/chat/message`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ message, sessionId })
	});
	return handleResponse<ChatResponse>(res);
}

/**
 * Fetch history for an existing session.
 */
export async function fetchHistory(sessionId: string): Promise<HistoryResponse> {
	const res = await fetch(`${BASE}/chat/history/${sessionId}`);
	return handleResponse<HistoryResponse>(res);
}
