<script>
	import { onMount, tick } from 'svelte';
	import ChatBubble from '../components/ChatBubble.svelte';
	import TypingIndicator from '../components/TypingIndicator.svelte';
	import ErrorBanner from '../components/ErrorBanner.svelte';
	import { sendMessage, fetchHistory } from '$lib/api';
	import { loadSessionId, saveSessionId, clearSessionId } from '$lib/session';

	const SUGGESTED = [
		"What's your return policy?",
		'Do you ship internationally?',
		'What payment methods do you accept?',
		'How do I track my order?'
	];

	let messages = [];
	let sessionId = null;
	let inputValue = '';
	let isLoading = false;
	let isHistoryLoading = true;
	let error = null;
	let messagesEl;

	async function scrollToBottom(smooth = true) {
		await tick();
		if (messagesEl) {
			messagesEl.scrollTo({
				top: messagesEl.scrollHeight,
				behavior: smooth ? 'smooth' : 'instant'
			});
		}
	}

	onMount(async () => {
		const saved = loadSessionId();
		if (saved) {
			try {
				const hist = await fetchHistory(saved);
				sessionId = hist.sessionId;
				messages = hist.messages;
				await scrollToBottom(false);
			} catch {
				clearSessionId();
			}
		}
		isHistoryLoading = false;
	});

	async function send(text) {
		const msg = (text !== undefined ? text : inputValue).trim();
		if (!msg || isLoading) return;

		inputValue = '';
		error = null;

		const tempId = 'temp-' + Date.now();
		const optimisticMsg = {
			id: tempId,
			conversation_id: sessionId || '',
			sender: 'user',
			text: msg,
			timestamp: new Date().toISOString()
		};
		messages = [...messages, optimisticMsg];
		isLoading = true;
		await scrollToBottom();

		try {
			const res = await sendMessage(msg, sessionId || undefined);
			sessionId = res.sessionId;
			saveSessionId(res.sessionId);

			const confirmedUser = {
				...optimisticMsg,
				id: 'user-' + res.messageId,
				conversation_id: res.sessionId
			};
			const aiMsg = {
				id: res.messageId,
				conversation_id: res.sessionId,
				sender: 'ai',
				text: res.reply,
				timestamp: new Date().toISOString()
			};
			messages = [...messages.filter((m) => m.id !== tempId), confirmedUser, aiMsg];
		} catch (err) {
			messages = messages.filter((m) => m.id !== tempId);
			error = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
		} finally {
			isLoading = false;
			await scrollToBottom();
		}
	}

	function handleKeydown(e) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			send();
		}
	}

	function startNewChat() {
		clearSessionId();
		sessionId = null;
		messages = [];
		error = null;
	}
</script>

<div class="page">
	<div class="bg-glow" aria-hidden="true" />

	<div class="chat-container">
		<header class="chat-header">
			<div class="brand">
				<div class="brand-icon">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
						<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor"/>
					</svg>
				</div>
				<div>
					<h1>Spark & Co.</h1>
					<span class="status">
						<span class="status-dot" />
						Support Agent · Online
					</span>
				</div>
			</div>
			<button class="new-chat-btn" on:click={startNewChat} title="Start new conversation">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
					<path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
				</svg>
				New chat
			</button>
		</header>

		<div class="messages" bind:this={messagesEl}>
			{#if isHistoryLoading}
				<div class="center-state">
					<div class="spinner" />
				</div>
			{:else if messages.length === 0}
				<div class="empty-state">
					<div class="empty-icon">
						<svg width="32" height="32" viewBox="0 0 24 24" fill="none">
							<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</div>
					<h2>How can we help?</h2>
					<p>Ask anything about orders, shipping, returns, or our products.</p>
					<div class="suggestions">
						{#each SUGGESTED as s}
							<button class="suggestion-pill" on:click={() => send(s)}>{s}</button>
						{/each}
					</div>
				</div>
			{:else}
				<div class="message-list">
					{#each messages as msg (msg.id)}
						<ChatBubble message={msg} />
					{/each}
					{#if isLoading}
						<TypingIndicator />
					{/if}
				</div>
			{/if}
		</div>

		{#if error}
			<div class="error-wrap">
				<ErrorBanner message={error} onDismiss={() => (error = null)} />
			</div>
		{/if}

		<div class="input-area">
			<div class="input-box" class:disabled={isLoading}>
				<textarea
					placeholder="Type a message…"
					bind:value={inputValue}
					on:keydown={handleKeydown}
					disabled={isLoading}
					rows="1"
					maxlength="10000"
					aria-label="Message input"
				/>
				<button
					class="send-btn"
					on:click={() => send()}
					disabled={isLoading || !inputValue.trim()}
					aria-label="Send message"
				>
					{#if isLoading}
						<div class="send-spinner" />
					{:else}
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
							<path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					{/if}
				</button>
			</div>
			<p class="footer-note">Powered by Spur · AI responses may occasionally be inaccurate.</p>
		</div>
	</div>
</div>

<style>
	.page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 20px;
		position: relative;
		overflow: hidden;
	}
	.bg-glow {
		position: fixed;
		inset: 0;
		background:
			radial-gradient(ellipse 60% 50% at 30% 20%, rgba(108, 99, 255, 0.08) 0%, transparent 60%),
			radial-gradient(ellipse 50% 40% at 75% 80%, rgba(108, 99, 255, 0.05) 0%, transparent 60%);
		pointer-events: none;
	}
	.chat-container {
		width: 100%;
		max-width: 680px;
		height: min(700px, calc(100vh - 40px));
		display: flex;
		flex-direction: column;
		background: var(--bg-surface);
		border: 1px solid var(--border);
		border-radius: 20px;
		overflow: hidden;
		box-shadow: var(--shadow);
		position: relative;
	}
	.chat-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px 20px;
		border-bottom: 1px solid var(--border-subtle);
		background: var(--bg-card);
		flex-shrink: 0;
	}
	.brand {
		display: flex;
		align-items: center;
		gap: 12px;
	}
	.brand-icon {
		width: 38px;
		height: 38px;
		background: var(--accent);
		border-radius: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		box-shadow: 0 0 16px var(--accent-glow);
	}
	h1 {
		font-size: 1rem;
		font-weight: 600;
		letter-spacing: -0.01em;
		color: var(--text-primary);
	}
	.status {
		display: flex;
		align-items: center;
		gap: 5px;
		font-size: 0.75rem;
		color: var(--text-secondary);
		margin-top: 1px;
	}
	.status-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--success);
		box-shadow: 0 0 6px var(--success);
		animation: pulse 2.5s ease-in-out infinite;
	}
	.new-chat-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 7px 12px;
		background: var(--bg-input);
		border: 1px solid var(--border);
		border-radius: var(--radius-xs);
		color: var(--text-secondary);
		font-size: 0.8rem;
		font-family: var(--font);
		cursor: pointer;
		transition: all var(--transition);
	}
	.new-chat-btn:hover {
		color: var(--text-primary);
		border-color: var(--accent);
		background: var(--accent-dim);
	}
	.messages {
		flex: 1;
		overflow-y: auto;
		padding: 20px;
		display: flex;
		flex-direction: column;
	}
	.center-state {
		display: flex;
		align-items: center;
		justify-content: center;
		flex: 1;
	}
	.spinner {
		width: 28px;
		height: 28px;
		border: 2px solid var(--border);
		border-top-color: var(--accent);
		border-radius: 50%;
		animation: spin 0.7s linear infinite;
	}
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		flex: 1;
		text-align: center;
		padding: 24px;
		gap: 8px;
	}
	.empty-icon {
		width: 60px;
		height: 60px;
		background: var(--accent-dim);
		border: 1px solid var(--accent-glow);
		border-radius: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--accent);
		margin-bottom: 8px;
	}
	.empty-state h2 {
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--text-primary);
	}
	.empty-state p {
		font-size: 0.875rem;
		color: var(--text-secondary);
		line-height: 1.5;
		max-width: 300px;
	}
	.suggestions {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		justify-content: center;
		margin-top: 12px;
	}
	.suggestion-pill {
		background: var(--bg-card);
		border: 1px solid var(--border);
		color: var(--text-secondary);
		padding: 7px 13px;
		border-radius: 999px;
		font-size: 0.8rem;
		font-family: var(--font);
		cursor: pointer;
		transition: all var(--transition);
		text-align: left;
	}
	.suggestion-pill:hover {
		color: var(--text-primary);
		border-color: var(--accent);
		background: var(--accent-dim);
	}
	.message-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.error-wrap {
		padding: 0 16px 8px;
	}
	.input-area {
		padding: 12px 16px 14px;
		border-top: 1px solid var(--border-subtle);
		background: var(--bg-card);
		flex-shrink: 0;
	}
	.input-box {
		display: flex;
		align-items: flex-end;
		gap: 10px;
		background: var(--bg-input);
		border: 1px solid var(--border);
		border-radius: 14px;
		padding: 10px 10px 10px 16px;
		transition: border-color var(--transition);
	}
	.input-box:focus-within {
		border-color: var(--accent);
		box-shadow: 0 0 0 3px var(--accent-dim);
	}
	.input-box.disabled { opacity: 0.6; }
	textarea {
		flex: 1;
		background: none;
		border: none;
		outline: none;
		resize: none;
		color: var(--text-primary);
		font-size: 0.9rem;
		font-family: var(--font);
		line-height: 1.5;
		max-height: 120px;
		overflow-y: auto;
	}
	textarea::placeholder { color: var(--text-muted); }
	.send-btn {
		width: 36px;
		height: 36px;
		border-radius: 10px;
		border: none;
		background: var(--accent);
		color: white;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		transition: all var(--transition);
	}
	.send-btn:hover:not(:disabled) {
		background: var(--accent-hover);
		transform: scale(1.05);
	}
	.send-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
		transform: none;
	}
	.send-spinner {
		width: 16px;
		height: 16px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.7s linear infinite;
	}
	.footer-note {
		font-size: 0.7rem;
		color: var(--text-muted);
		text-align: center;
		margin-top: 8px;
	}
	@keyframes spin { to { transform: rotate(360deg); } }
	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.4; }
	}
	@media (max-width: 500px) {
		.page { padding: 0; }
		.chat-container {
			border-radius: 0;
			height: 100vh;
			max-width: 100%;
		}
	}
</style>