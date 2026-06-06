<script>
	export let message;

	$: isUser = message.sender === 'user';
	$: time = new Date(message.timestamp).toLocaleTimeString([], {
		hour: '2-digit',
		minute: '2-digit'
	});
</script>

<div class="bubble-wrap" class:user={isUser} class:ai={!isUser}>
	{#if !isUser}
		<div class="avatar">
			<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
				<path d="M12 2a4 4 0 0 1 4 4v1h1a3 3 0 0 1 3 3v2a3 3 0 0 1-3 3h-1v1a4 4 0 0 1-8 0v-1H7a3 3 0 0 1-3-3v-2a3 3 0 0 1 3-3h1V6a4 4 0 0 1 4-4z" fill="currentColor" opacity="0.9"/>
			</svg>
		</div>
	{/if}
	<div class="bubble">
		<p class="text">{message.text}</p>
		<span class="time">{time}</span>
	</div>
</div>

<style>
	.bubble-wrap {
		display: flex;
		align-items: flex-end;
		gap: 8px;
		max-width: 78%;
		animation: fadeUp 0.22s ease both;
	}
	.bubble-wrap.user {
		align-self: flex-end;
		flex-direction: row-reverse;
	}
	.bubble-wrap.ai { align-self: flex-start; }
	.avatar {
		width: 30px;
		height: 30px;
		border-radius: 50%;
		background: var(--accent-dim);
		color: var(--accent);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		border: 1px solid var(--accent-glow);
	}
	.bubble {
		padding: 10px 14px 8px;
		border-radius: var(--radius);
		position: relative;
		max-width: 100%;
	}
	.user .bubble {
		background: var(--user-bubble);
		border-bottom-right-radius: var(--radius-xs);
		color: var(--user-bubble-text);
	}
	.ai .bubble {
		background: var(--ai-bubble);
		border-bottom-left-radius: var(--radius-xs);
		border: 1px solid var(--border-subtle);
		color: var(--text-primary);
	}
	.text {
		font-size: 0.92rem;
		line-height: 1.55;
		white-space: pre-wrap;
		word-break: break-word;
	}
	.time {
		display: block;
		font-size: 0.68rem;
		margin-top: 4px;
		opacity: 0.5;
		text-align: right;
		font-family: var(--font-mono);
	}
	@keyframes fadeUp {
		from { opacity: 0; transform: translateY(6px); }
		to { opacity: 1; transform: translateY(0); }
	}
</style>